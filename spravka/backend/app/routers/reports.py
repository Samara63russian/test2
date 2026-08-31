from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Institution, Report, User
from ..schemas import ReportCreate, ReportUpdate
from ..security import get_current_user
from ..services.documents import build_docx, build_pdf
from ..services.helpers import can_access_report, load_report, report_to_out, upsert_answers

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("")
def list_reports(
    institution_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = (
        db.query(Report)
        .options(joinedload(Report.institution), joinedload(Report.user), joinedload(Report.answers))
        .order_by(Report.report_date.desc(), Report.id.desc())
    )
    if user.role != "admin" and user.institution_id:
        q = q.filter(Report.institution_id == user.institution_id)
    if institution_id:
        q = q.filter(Report.institution_id == institution_id)
    if date_from:
        q = q.filter(Report.report_date >= date_from)
    if date_to:
        q = q.filter(Report.report_date <= date_to)
    if status:
        q = q.filter(Report.status == status)
    return [report_to_out(r) for r in q.all()]


@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    if not can_access_report(user, report):
        raise HTTPException(status_code=403, detail="Нет доступа")
    return report_to_out(report)


@router.post("")
def create_report(payload: ReportCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "admin" and user.institution_id and payload.institution_id != user.institution_id:
        raise HTTPException(status_code=403, detail="Можно создавать справки только по своему учреждению")
    if not db.get(Institution, payload.institution_id):
        raise HTTPException(status_code=400, detail="Учреждение не найдено")
    if payload.client_uuid:
        existing = db.query(Report).filter(Report.client_uuid == payload.client_uuid).first()
        if existing:
            return report_to_out(load_report(db, existing.id))
    status = payload.status if payload.status in ("draft", "submitted") else "draft"
    report = Report(
        institution_id=payload.institution_id,
        user_id=user.id,
        report_date=payload.report_date,
        status=status,
        client_uuid=payload.client_uuid,
        submitted_at=datetime.utcnow() if status == "submitted" else None,
    )
    db.add(report)
    db.flush()
    upsert_answers(db, report, payload.answers)
    db.commit()
    return report_to_out(load_report(db, report.id))


@router.put("/{report_id}")
def update_report(
    report_id: int, payload: ReportUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    report = load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    if not can_access_report(user, report):
        raise HTTPException(status_code=403, detail="Нет доступа")
    if payload.report_date:
        report.report_date = payload.report_date
    if payload.answers is not None:
        upsert_answers(db, report, payload.answers)
    if payload.status in ("draft", "submitted"):
        report.status = payload.status
        report.submitted_at = datetime.utcnow() if payload.status == "submitted" else report.submitted_at
    db.commit()
    return report_to_out(load_report(db, report.id))


@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    if not can_access_report(user, report):
        raise HTTPException(status_code=403, detail="Нет доступа")
    db.delete(report)
    db.commit()
    return {"ok": True}


@router.get("/{report_id}/document.docx")
def download_docx(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    if not can_access_report(user, report):
        raise HTTPException(status_code=403, detail="Нет доступа")
    data = build_docx(db, report)
    name = f"spravka_{report.id}_{report.report_date.isoformat()}.docx"
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


@router.get("/{report_id}/document.pdf")
def download_pdf(report_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = load_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    if not can_access_report(user, report):
        raise HTTPException(status_code=403, detail="Нет доступа")
    data = build_pdf(db, report)
    name = f"spravka_{report.id}_{report.report_date.isoformat()}.pdf"
    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )
