from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.document import generate_report_docx
from app.models import Institution, Report, ReportAnswer, User
from app.schemas import (
    AnalyticsSummary,
    ReportCreate,
    ReportOut,
    ReportUpdate,
    SyncReportPayload,
)

router = APIRouter(prefix="/reports", tags=["reports"])


def _enrich_report(report: Report, db: Session) -> ReportOut:
    institution = db.query(Institution).filter(Institution.id == report.institution_id).first()
    author = db.query(User).filter(User.id == report.author_id).first()
    data = ReportOut.model_validate(report)
    data.institution_name = institution.name if institution else None
    data.author_name = (author.full_name or author.username) if author else None
    return data


@router.get("/", response_model=list[ReportOut])
def list_reports(
    institution_id: int | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Report).options(joinedload(Report.answers))
    if institution_id:
        query = query.filter(Report.institution_id == institution_id)
    if date_from:
        query = query.filter(Report.report_date >= date_from)
    if date_to:
        query = query.filter(Report.report_date <= date_to)
    if status:
        query = query.filter(Report.status == status)
    reports = query.order_by(Report.report_date.desc()).all()
    return [_enrich_report(r, db) for r in reports]


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    report = db.query(Report).options(joinedload(Report.answers)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    return _enrich_report(report, db)


@router.post("/", response_model=ReportOut)
def create_report(
    body: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.client_uuid:
        existing = db.query(Report).filter(Report.client_uuid == body.client_uuid).first()
        if existing:
            return _enrich_report(existing, db)

    report = Report(
        institution_id=body.institution_id,
        author_id=current_user.id,
        report_date=body.report_date,
        status=body.status,
        notes=body.notes,
        client_uuid=body.client_uuid,
    )
    db.add(report)
    db.flush()
    for ans in body.answers:
        db.add(ReportAnswer(report_id=report.id, question_id=ans.question_id, answer_text=ans.answer_text))
    db.commit()
    db.refresh(report)
    return _enrich_report(report, db)


@router.put("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: int,
    body: ReportUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    report = db.query(Report).options(joinedload(Report.answers)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    data = body.model_dump(exclude_unset=True)
    answers = data.pop("answers", None)
    for key, value in data.items():
        setattr(report, key, value)
    if answers is not None:
        db.query(ReportAnswer).filter(ReportAnswer.report_id == report_id).delete()
        for ans in answers:
            db.add(
                ReportAnswer(
                    report_id=report_id,
                    question_id=ans["question_id"] if isinstance(ans, dict) else ans.question_id,
                    answer_text=ans.get("answer_text", "") if isinstance(ans, dict) else ans.answer_text,
                )
            )
    report.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(report)
    return _enrich_report(report, db)


@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    db.delete(report)
    db.commit()
    return {"ok": True}


@router.get("/{report_id}/export")
def export_report(report_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    report = db.query(Report).options(joinedload(Report.answers)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    buffer = generate_report_docx(db, report)
    filename = f"spravka_{report_id}_{report.report_date.strftime('%Y%m%d')}.docx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/sync", response_model=list[ReportOut])
def sync_reports(
    payloads: list[SyncReportPayload],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []
    for payload in payloads:
        existing = db.query(Report).filter(Report.client_uuid == payload.client_uuid).first()
        if existing:
            existing.institution_id = payload.institution_id
            existing.report_date = payload.report_date
            existing.status = payload.status
            existing.notes = payload.notes
            existing.updated_at = datetime.utcnow()
            db.query(ReportAnswer).filter(ReportAnswer.report_id == existing.id).delete()
            for ans in payload.answers:
                db.add(
                    ReportAnswer(
                        report_id=existing.id,
                        question_id=ans.question_id,
                        answer_text=ans.answer_text,
                    )
                )
            db.commit()
            db.refresh(existing)
            results.append(_enrich_report(existing, db))
            continue

        report = Report(
            institution_id=payload.institution_id,
            author_id=current_user.id,
            report_date=payload.report_date,
            status=payload.status,
            notes=payload.notes,
            client_uuid=payload.client_uuid,
        )
        db.add(report)
        db.flush()
        for ans in payload.answers:
            db.add(ReportAnswer(report_id=report.id, question_id=ans.question_id, answer_text=ans.answer_text))
        db.commit()
        db.refresh(report)
        results.append(_enrich_report(report, db))
    return results
