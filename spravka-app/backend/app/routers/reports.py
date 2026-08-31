from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user
from ..database import get_db
from ..models import AnswerOption, Institution, Report, ReportAnswer, User, UserInstitution
from ..schemas import (
    ReportCreate,
    ReportOut,
    ReportUpdate,
    SyncPayload,
    SyncResult,
)
from ..services.document import build_report_docx, build_report_xlsx

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _allowed_institution_ids(db: Session, user: User) -> list[int] | None:
    if user.role == "admin":
        return None
    return [
        ui.institution_id
        for ui in db.query(UserInstitution).filter(UserInstitution.user_id == user.id)
    ]


def _ensure_access(db: Session, user: User, institution_id: int) -> None:
    allowed = _allowed_institution_ids(db, user)
    if allowed is not None and institution_id not in allowed:
        raise HTTPException(status_code=403, detail="Нет доступа к учреждению")


def _report_out(report: Report) -> ReportOut:
    answers = []
    for a in report.answers:
        answers.append(
            {
                "id": a.id,
                "question_id": a.question_id,
                "answer_option_id": a.answer_option_id,
                "text_value": a.text_value,
                "question_text": a.question.text if a.question else None,
                "answer_text": (
                    a.answer_option.text
                    if a.answer_option
                    else (a.text_value or None)
                ),
            }
        )
    return ReportOut(
        id=report.id,
        institution_id=report.institution_id,
        institution_name=report.institution.name if report.institution else None,
        report_date=report.report_date,
        title=report.title,
        status=report.status,
        client_uuid=report.client_uuid,
        created_by=report.created_by,
        notes=report.notes,
        created_at=report.created_at,
        updated_at=report.updated_at,
        synced_at=report.synced_at,
        answers=answers,
    )


def _save_answers(db: Session, report: Report, answers: list) -> None:
    db.query(ReportAnswer).filter(ReportAnswer.report_id == report.id).delete()
    for item in answers:
        if item.answer_option_id:
            opt = db.query(AnswerOption).filter(AnswerOption.id == item.answer_option_id).first()
            if not opt or opt.question_id != item.question_id:
                raise HTTPException(status_code=400, detail="Некорректный вариант ответа")
        db.add(
            ReportAnswer(
                report_id=report.id,
                question_id=item.question_id,
                answer_option_id=item.answer_option_id,
                text_value=item.text_value or "",
            )
        )


@router.get("", response_model=list[ReportOut])
def list_reports(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    institution_id: int | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    status: str | None = None,
):
    q = (
        db.query(Report)
        .options(
            joinedload(Report.institution),
            joinedload(Report.answers).joinedload(ReportAnswer.question),
            joinedload(Report.answers).joinedload(ReportAnswer.answer_option),
        )
        .order_by(Report.report_date.desc(), Report.id.desc())
    )
    allowed = _allowed_institution_ids(db, user)
    if allowed is not None:
        q = q.filter(Report.institution_id.in_(allowed or [-1]))
    if institution_id is not None:
        _ensure_access(db, user, institution_id)
        q = q.filter(Report.institution_id == institution_id)
    if date_from:
        q = q.filter(Report.report_date >= date_from)
    if date_to:
        q = q.filter(Report.report_date <= date_to)
    if status:
        q = q.filter(Report.status == status)
    return [_report_out(r) for r in q.all()]


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .options(
            joinedload(Report.institution),
            joinedload(Report.answers).joinedload(ReportAnswer.question),
            joinedload(Report.answers).joinedload(ReportAnswer.answer_option),
        )
        .filter(Report.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    _ensure_access(db, user, report.institution_id)
    return _report_out(report)


@router.post("", response_model=ReportOut)
def create_report(
    payload: ReportCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not db.query(Institution).filter(Institution.id == payload.institution_id).first():
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    _ensure_access(db, user, payload.institution_id)

    if payload.client_uuid:
        existing = db.query(Report).filter(Report.client_uuid == payload.client_uuid).first()
        if existing:
            existing.title = payload.title
            existing.notes = payload.notes
            existing.status = payload.status
            existing.report_date = payload.report_date
            existing.synced_at = datetime.utcnow()
            _save_answers(db, existing, payload.answers)
            db.commit()
            return get_report(existing.id, user, db)

    report = Report(
        institution_id=payload.institution_id,
        report_date=payload.report_date,
        title=payload.title,
        notes=payload.notes,
        status=payload.status,
        client_uuid=payload.client_uuid,
        created_by=user.id,
        synced_at=datetime.utcnow() if payload.client_uuid else None,
    )
    db.add(report)
    db.flush()
    _save_answers(db, report, payload.answers)
    db.commit()
    return get_report(report.id, user, db)


@router.put("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: int,
    payload: ReportUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    _ensure_access(db, user, report.institution_id)
    if payload.title is not None:
        report.title = payload.title
    if payload.notes is not None:
        report.notes = payload.notes
    if payload.status is not None:
        report.status = payload.status
    if payload.answers is not None:
        _save_answers(db, report, payload.answers)
    report.updated_at = datetime.utcnow()
    db.commit()
    return get_report(report_id, user, db)


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    _ensure_access(db, user, report.institution_id)
    db.delete(report)
    db.commit()
    return {"ok": True}


@router.post("/sync", response_model=SyncResult)
def sync_reports(
    payload: SyncPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    created, updated, skipped = [], [], []
    for item in payload.reports:
        try:
            _ensure_access(db, user, item.institution_id)
        except HTTPException:
            skipped.append(item.client_uuid or "unknown")
            continue
        if item.client_uuid:
            existing = db.query(Report).filter(Report.client_uuid == item.client_uuid).first()
            if existing:
                existing.title = item.title
                existing.notes = item.notes
                existing.status = "synced"
                existing.report_date = item.report_date
                existing.synced_at = datetime.utcnow()
                _save_answers(db, existing, item.answers)
                updated.append(existing.id)
                continue
        report = Report(
            institution_id=item.institution_id,
            report_date=item.report_date,
            title=item.title,
            notes=item.notes,
            status="synced",
            client_uuid=item.client_uuid,
            created_by=user.id,
            synced_at=datetime.utcnow(),
        )
        db.add(report)
        db.flush()
        _save_answers(db, report, item.answers)
        created.append(report.id)
    db.commit()
    return SyncResult(created=created, updated=updated, skipped=skipped)


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    format: str = Query(default="docx", pattern="^(docx|xlsx)$"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(Report)
        .options(
            joinedload(Report.institution),
            joinedload(Report.answers).joinedload(ReportAnswer.question),
            joinedload(Report.answers).joinedload(ReportAnswer.answer_option),
        )
        .filter(Report.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    _ensure_access(db, user, report.institution_id)

    if format == "xlsx":
        buf = build_report_xlsx(db, report)
        media = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"spravka_{report.report_date}_{report.id}.xlsx"
    else:
        buf = build_report_docx(db, report)
        media = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"spravka_{report.report_date}_{report.id}.docx"

    return StreamingResponse(
        buf,
        media_type=media,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
