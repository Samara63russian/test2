from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai_service import analyze_email
from app.database import get_db
from app.email_service import fetch_imap_messages
from app.models import EmailRequest, RequestCategory, RequestStatus
from app.schemas import (
    EmailInput,
    EmailRequestOut,
    ImapFetchResult,
    SettingsOut,
    StatsOut,
    StatusUpdate,
)
from app.config import settings

router = APIRouter(prefix="/api")


@router.get("/settings", response_model=SettingsOut)
def get_settings() -> SettingsOut:
    groq_configured = bool(settings.groq_api_key)
    imap_configured = bool(settings.imap_host and settings.imap_username and settings.imap_password)
    provider = "groq" if groq_configured else "local"
    return SettingsOut(groq_configured=groq_configured, imap_configured=imap_configured, ai_provider=provider)


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)) -> StatsOut:
    total = db.scalar(select(func.count()).select_from(EmailRequest)) or 0
    new = db.scalar(select(func.count()).where(EmailRequest.status == RequestStatus.NEW)) or 0
    in_progress = (
        db.scalar(select(func.count()).where(EmailRequest.status == RequestStatus.IN_PROGRESS)) or 0
    )
    completed = (
        db.scalar(select(func.count()).where(EmailRequest.status == RequestStatus.COMPLETED)) or 0
    )
    commercial = (
        db.scalar(
            select(func.count()).where(EmailRequest.category == RequestCategory.COMMERCIAL_PROPOSAL)
        )
        or 0
    )
    catalog = (
        db.scalar(select(func.count()).where(EmailRequest.category == RequestCategory.CATALOG)) or 0
    )
    general = (
        db.scalar(select(func.count()).where(EmailRequest.category == RequestCategory.GENERAL)) or 0
    )
    return StatsOut(
        total=total,
        new=new,
        in_progress=in_progress,
        completed=completed,
        commercial_proposal=commercial,
        catalog=catalog,
        general=general,
    )


@router.get("/requests", response_model=list[EmailRequestOut])
def list_requests(
    status: RequestStatus | None = Query(default=None),
    category: RequestCategory | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[EmailRequest]:
    query = select(EmailRequest).order_by(EmailRequest.created_at.desc())
    if status:
        query = query.where(EmailRequest.status == status)
    if category:
        query = query.where(EmailRequest.category == category)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            EmailRequest.subject.ilike(pattern)
            | EmailRequest.sender.ilike(pattern)
            | EmailRequest.summary.ilike(pattern)
            | EmailRequest.body.ilike(pattern)
        )
    return list(db.scalars(query).all())


@router.get("/requests/{request_id}", response_model=EmailRequestOut)
def get_request(request_id: int, db: Session = Depends(get_db)) -> EmailRequest:
    record = db.get(EmailRequest, request_id)
    if not record:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return record


@router.post("/requests", response_model=EmailRequestOut, status_code=201)
async def create_request(payload: EmailInput, db: Session = Depends(get_db)) -> EmailRequest:
    analysis = await analyze_email(payload.subject, payload.body)
    record = EmailRequest(
        subject=payload.subject.strip(),
        sender=payload.sender.strip(),
        body=payload.body.strip(),
        category=analysis.category,
        summary=analysis.summary,
        ai_provider=analysis.provider,
        source="manual",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/requests/{request_id}/status", response_model=EmailRequestOut)
def update_status(
    request_id: int, payload: StatusUpdate, db: Session = Depends(get_db)
) -> EmailRequest:
    record = db.get(EmailRequest, request_id)
    if not record:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    record.status = payload.status
    db.commit()
    db.refresh(record)
    return record


@router.delete("/requests/{request_id}", status_code=204)
def delete_request(request_id: int, db: Session = Depends(get_db)) -> None:
    record = db.get(EmailRequest, request_id)
    if not record:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    db.delete(record)
    db.commit()


@router.post("/imap/fetch", response_model=ImapFetchResult)
async def fetch_from_imap(
    limit: int = Query(default=20, ge=1, le=100), db: Session = Depends(get_db)
) -> ImapFetchResult:
    try:
        messages = fetch_imap_messages(limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ошибка IMAP: {exc}") from exc

    created = 0
    skipped = 0
    for message in messages:
        if message.message_id:
            existing = db.scalar(
                select(EmailRequest).where(EmailRequest.message_id == message.message_id)
            )
            if existing:
                skipped += 1
                continue

        analysis = await analyze_email(message.subject, message.body)
        record = EmailRequest(
            subject=message.subject,
            sender=message.sender,
            body=message.body,
            category=analysis.category,
            summary=analysis.summary,
            ai_provider=analysis.provider,
            source="imap",
            message_id=message.message_id,
        )
        db.add(record)
        created += 1

    db.commit()
    return ImapFetchResult(fetched=len(messages), created=created, skipped=skipped)
