from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from .ai import analyze_email, settings_from_env
from .database import Base, SessionLocal, engine, get_db
from .mailer import fetch_imap
from .models import Event, Request, Setting, utcnow
from .parser import KIND_LABELS, parse_email, to_json_list
from .seed import DEMO_EMAILS

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

SECRET_KEYS = {"groq_api_key", "gemini_api_key", "openai_api_key", "imap_password"}
DEFAULT_SETTINGS = {
    "groq_api_key": "",
    "gemini_api_key": "",
    "openai_api_key": "",
    "openai_base_url": "",
    "ai_model": "llama-3.1-8b-instant",
    "imap_host": "",
    "imap_port": "993",
    "imap_user": "",
    "imap_password": "",
    "imap_folder": "INBOX",
    "imap_unseen_only": "1",
}


class IngestBody(BaseModel):
    raw: str = Field(..., min_length=3)
    source: str = "paste"


class PatchBody(BaseModel):
    status: str | None = None
    notes: str | None = None
    kind: str | None = None
    urgency: str | None = None
    title: str | None = None
    company: str | None = None
    action: str | None = None


class SettingsBody(BaseModel):
    values: dict[str, str]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        for key, value in DEFAULT_SETTINGS.items():
            if db.get(Setting, key) is None:
                db.add(Setting(key=key, value=value))
        db.commit()


app = FastAPI(title="Конспект — входящие КП", version="1.0.0")
init_db()


def load_settings(db: Session) -> dict[str, str]:
    rows = db.scalars(select(Setting)).all()
    return {row.key: row.value for row in rows}


def mask_settings(values: dict[str, str]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in values.items():
        if key in SECRET_KEYS:
            out[key] = {"set": bool(value), "preview": ("••••" + value[-4:]) if len(value) >= 8 else ("••••" if value else "")}
        else:
            out[key] = value
    return out


def serialize(row: Request) -> dict[str, Any]:
    try:
        products = json.loads(row.products or "[]")
    except Exception:
        products = []
    try:
        attachments = json.loads(row.attachments or "[]")
    except Exception:
        attachments = []
    return {
        "id": row.id,
        "kind": row.kind,
        "kind_label": KIND_LABELS.get(row.kind, row.kind),
        "status": row.status,
        "urgency": row.urgency,
        "title": row.title,
        "summary": row.summary,
        "action": row.action,
        "company": row.company,
        "contact_name": row.contact_name,
        "from_email": row.from_email,
        "from_name": row.from_name,
        "phone": row.phone,
        "products": products,
        "quantity": row.quantity,
        "deadline": row.deadline,
        "subject": row.subject,
        "body_text": row.body_text,
        "message_id": row.message_id,
        "received_at": row.received_at.isoformat() if row.received_at else None,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "ai_provider": row.ai_provider,
        "notes": row.notes,
        "source": row.source,
        "attachments": attachments,
    }


def add_event(db: Session, request_id: str, kind: str, text: str) -> None:
    db.add(Event(request_id=request_id, kind=kind, text=text))


def find_duplicate(db: Session, parsed: dict[str, Any]) -> Request | None:
    mid = (parsed.get("message_id") or "").strip()
    if mid:
        found = db.scalar(select(Request).where(Request.message_id == mid))
        if found:
            return found
    subject = (parsed.get("subject") or "").strip()
    email_addr = (parsed.get("from_email") or "").strip()
    if subject and email_addr:
        found = db.scalar(
            select(Request).where(Request.subject == subject, Request.from_email == email_addr)
        )
        if found:
            return found
    return None


async def ingest_parsed(db: Session, parsed: dict[str, Any], source: str) -> tuple[Request, bool]:
    existing = find_duplicate(db, parsed)
    if existing:
        return existing, False

    analysis = await analyze_email(parsed, load_settings(db))
    now = utcnow()
    row = Request(
        id=str(uuid.uuid4()),
        kind=analysis.get("kind") or "inquiry",
        status="new",
        urgency=analysis.get("urgency") or "normal",
        title=analysis.get("title") or parsed.get("subject") or "Письмо",
        summary=analysis.get("summary") or "",
        action=analysis.get("action") or "",
        company=analysis.get("company") or "",
        contact_name=analysis.get("contact_name") or parsed.get("from_name") or "",
        from_email=parsed.get("from_email") or "",
        from_name=parsed.get("from_name") or "",
        phone=analysis.get("phone") or "",
        products=to_json_list(analysis.get("products")),
        quantity=analysis.get("quantity") or "",
        deadline=analysis.get("deadline") or "",
        subject=parsed.get("subject") or "",
        body_text=parsed.get("body_text") or "",
        message_id=parsed.get("message_id") or "",
        received_at=parsed.get("received_at") or now,
        created_at=now,
        updated_at=now,
        ai_provider=analysis.get("provider") or "heuristic",
        source=source,
        attachments=to_json_list(parsed.get("attachments")),
    )
    db.add(row)
    add_event(
        db,
        row.id,
        "created",
        f"Создана карточка ({KIND_LABELS.get(row.kind, row.kind)}), ИИ: {row.ai_provider}",
    )
    db.commit()
    db.refresh(row)
    return row, True


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)) -> dict[str, Any]:
    total = db.scalar(select(func.count(Request.id))) or 0
    by_kind = {
        row[0]: row[1]
        for row in db.execute(select(Request.kind, func.count()).group_by(Request.kind)).all()
    }
    by_status = {
        row[0]: row[1]
        for row in db.execute(select(Request.status, func.count()).group_by(Request.status)).all()
    }
    high = db.scalar(select(func.count(Request.id)).where(Request.urgency == "high")) or 0
    return {
        "total": total,
        "by_kind": by_kind,
        "by_status": by_status,
        "high": high,
        "open": (by_status.get("new") or 0) + (by_status.get("in_progress") or 0),
    }


@app.get("/api/requests")
def list_requests(
    kind: str | None = None,
    status: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    stmt = select(Request).order_by(Request.received_at.desc())
    if kind and kind != "all":
        stmt = stmt.where(Request.kind == kind)
    if status and status != "all":
        stmt = stmt.where(Request.status == status)
    rows = db.scalars(stmt).all()
    items = [serialize(row) for row in rows]
    if q:
        needle = q.lower().strip()
        items = [
            item
            for item in items
            if needle in " ".join(
                [
                    item.get("title") or "",
                    item.get("summary") or "",
                    item.get("company") or "",
                    item.get("subject") or "",
                    item.get("from_email") or "",
                    item.get("body_text") or "",
                ]
            ).lower()
        ]
    return {"items": items, "count": len(items)}


@app.get("/api/requests/{request_id}")
def get_request(request_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    row = db.get(Request, request_id)
    if not row:
        raise HTTPException(404, "Карточка не найдена")
    events = db.scalars(
        select(Event).where(Event.request_id == request_id).order_by(Event.created_at.asc())
    ).all()
    data = serialize(row)
    data["events"] = [
        {
            "id": ev.id,
            "kind": ev.kind,
            "text": ev.text,
            "created_at": ev.created_at.isoformat() if ev.created_at else None,
        }
        for ev in events
    ]
    return data


@app.post("/api/requests/ingest")
async def ingest(body: IngestBody, db: Session = Depends(get_db)) -> dict[str, Any]:
    parsed = parse_email(body.raw)
    row, created = await ingest_parsed(db, parsed, body.source or "paste")
    return {"item": serialize(row), "created": created}


@app.post("/api/requests/upload")
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db)) -> dict[str, Any]:
    raw = await file.read()
    if len(raw) > 5_000_000:
        raise HTTPException(400, "Файл слишком большой")
    parsed = parse_email(raw)
    row, created = await ingest_parsed(db, parsed, "upload")
    return {"item": serialize(row), "created": created}


@app.patch("/api/requests/{request_id}")
def patch_request(request_id: str, body: PatchBody, db: Session = Depends(get_db)) -> dict[str, Any]:
    row = db.get(Request, request_id)
    if not row:
        raise HTTPException(404, "Карточка не найдена")
    data = body.model_dump(exclude_unset=True)
    allowed_status = {"new", "in_progress", "quoted", "closed", "ignored"}
    allowed_kind = {"kp", "catalog", "inquiry", "other"}
    allowed_urgency = {"low", "normal", "high"}
    if "status" in data and data["status"] is not None:
        if data["status"] not in allowed_status:
            raise HTTPException(400, "Неизвестный статус")
        if data["status"] != row.status:
            add_event(db, row.id, "status", f"{row.status} → {data['status']}")
            row.status = data["status"]
    for field in ("notes", "title", "company", "action"):
        if field in data and data[field] is not None:
            setattr(row, field, data[field])
    if data.get("kind"):
        if data["kind"] not in allowed_kind:
            raise HTTPException(400, "Неизвестный тип")
        row.kind = data["kind"]
    if data.get("urgency"):
        if data["urgency"] not in allowed_urgency:
            raise HTTPException(400, "Неизвестная срочность")
        row.urgency = data["urgency"]
    row.updated_at = utcnow()
    db.commit()
    db.refresh(row)
    return serialize(row)


@app.post("/api/requests/{request_id}/reanalyze")
async def reanalyze(request_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    row = db.get(Request, request_id)
    if not row:
        raise HTTPException(404, "Карточка не найдена")
    parsed = {
        "subject": row.subject,
        "from_name": row.from_name,
        "from_email": row.from_email,
        "from_raw": f"{row.from_name} <{row.from_email}>".strip(),
        "body_text": row.body_text,
        "received_at": row.received_at,
        "attachments": json.loads(row.attachments or "[]"),
        "message_id": row.message_id,
    }
    analysis = await analyze_email(parsed, load_settings(db))
    row.kind = analysis.get("kind") or row.kind
    row.urgency = analysis.get("urgency") or row.urgency
    row.title = analysis.get("title") or row.title
    row.summary = analysis.get("summary") or row.summary
    row.action = analysis.get("action") or row.action
    row.company = analysis.get("company") or row.company
    row.contact_name = analysis.get("contact_name") or row.contact_name
    row.phone = analysis.get("phone") or row.phone
    row.products = to_json_list(analysis.get("products"))
    row.quantity = analysis.get("quantity") or row.quantity
    row.deadline = analysis.get("deadline") or row.deadline
    row.ai_provider = analysis.get("provider") or row.ai_provider
    row.updated_at = utcnow()
    add_event(db, row.id, "reanalyzed", f"Пересобран конспект ({row.ai_provider})")
    db.commit()
    db.refresh(row)
    return serialize(row)


@app.delete("/api/requests/{request_id}")
def delete_request(request_id: str, db: Session = Depends(get_db)) -> dict[str, bool]:
    row = db.get(Request, request_id)
    if not row:
        raise HTTPException(404, "Карточка не найдена")
    db.execute(delete(Event).where(Event.request_id == request_id))
    db.delete(row)
    db.commit()
    return {"ok": True}


@app.post("/api/demo")
async def load_demo(db: Session = Depends(get_db)) -> dict[str, Any]:
    created_ids = []
    skipped = 0
    for raw in DEMO_EMAILS:
        parsed = parse_email(raw)
        row, created = await ingest_parsed(db, parsed, "demo")
        if created:
            created_ids.append(row.id)
        else:
            skipped += 1
    return {"created": len(created_ids), "skipped": skipped, "ids": created_ids}


@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)) -> dict[str, Any]:
    values = settings_from_env(load_settings(db))
    return {"values": mask_settings(values), "providers": _provider_status(values)}


def _provider_status(values: dict[str, str]) -> dict[str, bool]:
    return {
        "groq": bool(values.get("groq_api_key")),
        "gemini": bool(values.get("gemini_api_key")),
        "openai_compatible": bool(values.get("openai_base_url")),
        "heuristic": True,
        "imap": bool(values.get("imap_host") and values.get("imap_user") and values.get("imap_password")),
    }


@app.put("/api/settings")
def put_settings(body: SettingsBody, db: Session = Depends(get_db)) -> dict[str, Any]:
    current = load_settings(db)
    for key, value in body.values.items():
        if key not in DEFAULT_SETTINGS:
            continue
        if key in SECRET_KEYS and (not value or set(value) <= {"•", "*"} or value.startswith("••••")):
            continue
        row = db.get(Setting, key)
        if row is None:
            db.add(Setting(key=key, value=value))
        else:
            row.value = value
        current[key] = value
    db.commit()
    values = settings_from_env(load_settings(db))
    return {"values": mask_settings(values), "providers": _provider_status(values)}


@app.post("/api/mail/fetch")
async def mail_fetch(db: Session = Depends(get_db)) -> dict[str, Any]:
    values = settings_from_env(load_settings(db))
    try:
        raws = fetch_imap(
            host=values.get("imap_host") or "",
            username=values.get("imap_user") or "",
            password=values.get("imap_password") or "",
            folder=values.get("imap_folder") or "INBOX",
            port=int(values.get("imap_port") or 993),
            unseen_only=(values.get("imap_unseen_only") or "1") != "0",
        )
    except Exception as exc:
        raise HTTPException(400, f"Почта: {exc}") from exc

    created = 0
    skipped = 0
    ids = []
    for raw in raws:
        parsed = parse_email(raw)
        row, is_new = await ingest_parsed(db, parsed, "imap")
        if is_new:
            created += 1
            ids.append(row.id)
        else:
            skipped += 1
    return {"fetched": len(raws), "created": created, "skipped": skipped, "ids": ids}


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")
