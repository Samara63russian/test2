from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from . import schemas
from .auth import get_current_user
from .database import get_db
from .documents import build_docx, build_xlsx
from .models import Institution, Report, User
from .serializers import apply_answers, serialize_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _load_report(db: Session, report_id: int) -> Report | None:
    return (
        db.query(Report)
        .options(
            joinedload(Report.institution),
            joinedload(Report.author),
            joinedload(Report.answers),
        )
        .filter(Report.id == report_id)
        .first()
    )


@router.get("", response_model=list[schemas.ReportOut])
def list_reports(
    institution_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    status: str | None = None,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Report).options(
        joinedload(Report.institution),
        joinedload(Report.author),
        joinedload(Report.answers),
    )
    if institution_id:
        q = q.filter(Report.institution_id == institution_id)
    if date_from:
        q = q.filter(Report.report_date >= date_from)
    if date_to:
        q = q.filter(Report.report_date <= date_to)
    if status:
        q = q.filter(Report.status == status)
    reports = q.order_by(Report.report_date.desc(), Report.id.desc()).all()
    return [serialize_report(r) for r in reports]


@router.get("/export/bulk")
def export_bulk(
    institution_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Report).options(
        joinedload(Report.institution),
        joinedload(Report.author),
        joinedload(Report.answers),
    )
    if institution_id:
        q = q.filter(Report.institution_id == institution_id)
    if date_from:
        q = q.filter(Report.report_date >= date_from)
    if date_to:
        q = q.filter(Report.report_date <= date_to)
    reports = q.order_by(Report.report_date.desc()).all()
    content = build_xlsx(db, reports)
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="spravki_export.xlsx"'},
    )


@router.post("/sync", response_model=schemas.SyncResult)
def sync_reports(
    payload: schemas.SyncPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    created: list[schemas.ReportOut] = []
    updated: list[schemas.ReportOut] = []
    conflicts: list[str] = []

    for item in payload.reports:
        if item.client_uuid:
            existing = (
                db.query(Report)
                .filter(Report.client_uuid == item.client_uuid)
                .first()
            )
            if existing:
                apply_answers(existing, item.answers)
                existing.notes = item.notes
                existing.status = item.status
                existing.updated_at = datetime.utcnow()
                db.commit()
                updated.append(serialize_report(_load_report(db, existing.id)))  # type: ignore[arg-type]
                continue

        conflict = (
            db.query(Report)
            .filter(
                Report.institution_id == item.institution_id,
                Report.report_date == item.report_date,
            )
            .first()
        )
        if conflict:
            apply_answers(conflict, item.answers)
            conflict.notes = item.notes
            conflict.status = item.status
            if item.client_uuid and not conflict.client_uuid:
                conflict.client_uuid = item.client_uuid
            conflict.updated_at = datetime.utcnow()
            db.commit()
            updated.append(serialize_report(_load_report(db, conflict.id)))  # type: ignore[arg-type]
            conflicts.append(
                f"Обновлена существующая справка за {item.report_date} "
                f"(учреждение #{item.institution_id})"
            )
            continue

        institution = (
            db.query(Institution).filter(Institution.id == item.institution_id).first()
        )
        if not institution:
            conflicts.append(f"Учреждение #{item.institution_id} не найдено")
            continue

        report = Report(
            institution_id=item.institution_id,
            author_id=user.id,
            report_date=item.report_date,
            status=item.status,
            notes=item.notes,
            client_uuid=item.client_uuid,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        apply_answers(report, item.answers)
        db.add(report)
        db.commit()
        created.append(serialize_report(_load_report(db, report.id)))  # type: ignore[arg-type]

    return schemas.SyncResult(created=created, updated=updated, conflicts=conflicts)


@router.get("/{report_id}", response_model=schemas.ReportOut)
def get_report(
    report_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = _load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    return serialize_report(report)


@router.post("", response_model=schemas.ReportOut)
def create_report(
    payload: schemas.ReportCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    institution = (
        db.query(Institution).filter(Institution.id == payload.institution_id).first()
    )
    if not institution or not institution.is_active:
        raise HTTPException(status_code=400, detail="Учреждение не найдено")

    if payload.client_uuid:
        existing = (
            db.query(Report).filter(Report.client_uuid == payload.client_uuid).first()
        )
        if existing:
            apply_answers(existing, payload.answers)
            existing.notes = payload.notes
            existing.status = payload.status
            existing.updated_at = datetime.utcnow()
            db.commit()
            return serialize_report(_load_report(db, existing.id))  # type: ignore[arg-type]

    conflict = (
        db.query(Report)
        .filter(
            Report.institution_id == payload.institution_id,
            Report.report_date == payload.report_date,
        )
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=400,
            detail="Справка для этого учреждения и даты уже существует",
        )

    report = Report(
        institution_id=payload.institution_id,
        author_id=user.id,
        report_date=payload.report_date,
        status=payload.status,
        notes=payload.notes,
        client_uuid=payload.client_uuid,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    apply_answers(report, payload.answers)
    db.add(report)
    db.commit()
    return serialize_report(_load_report(db, report.id))  # type: ignore[arg-type]


@router.put("/{report_id}", response_model=schemas.ReportOut)
def update_report(
    report_id: int,
    payload: schemas.ReportUpdate,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = _load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    data = payload.model_dump(exclude_unset=True)
    answers = data.pop("answers", None)
    for key, value in data.items():
        setattr(report, key, value)
    if answers is not None:
        apply_answers(report, [schemas.AnswerIn(**a) for a in answers])
    report.updated_at = datetime.utcnow()
    db.commit()
    return serialize_report(_load_report(db, report_id))  # type: ignore[arg-type]


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    db.delete(report)
    db.commit()
    return {"ok": True}


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    format: str = Query(default="docx", pattern="^(docx|xlsx)$"),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = _load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")

    if format == "docx":
        content = build_docx(db, report)
        media = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"spravka_{report.id}.docx"
    else:
        content = build_xlsx(db, [report])
        media = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"spravka_{report.id}.xlsx"

    return Response(
        content=content,
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
