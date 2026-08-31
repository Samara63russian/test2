from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import Institution, Report, User
from app.schemas import AnalyticsSummary, ReportOut

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _enrich_report(report: Report, db: Session) -> ReportOut:
    institution = db.query(Institution).filter(Institution.id == report.institution_id).first()
    author = db.query(User).filter(User.id == report.author_id).first()
    data = ReportOut.model_validate(report)
    data.institution_name = institution.name if institution else None
    data.author_name = (author.full_name or author.username) if author else None
    return data


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total = db.query(func.count(Report.id)).scalar() or 0

    by_institution = (
        db.query(Institution.name, func.count(Report.id))
        .join(Report, Report.institution_id == Institution.id, isouter=True)
        .group_by(Institution.id, Institution.name)
        .order_by(func.count(Report.id).desc())
        .all()
    )

    by_month = (
        db.query(func.strftime("%Y-%m", Report.report_date), func.count(Report.id))
        .group_by(func.strftime("%Y-%m", Report.report_date))
        .order_by(func.strftime("%Y-%m", Report.report_date))
        .all()
    )

    by_status = (
        db.query(Report.status, func.count(Report.id))
        .group_by(Report.status)
        .all()
    )

    recent = (
        db.query(Report)
        .options(joinedload(Report.answers))
        .order_by(Report.created_at.desc())
        .limit(10)
        .all()
    )

    return AnalyticsSummary(
        total_reports=total,
        reports_by_institution=[{"name": n, "count": c} for n, c in by_institution],
        reports_by_month=[{"month": m, "count": c} for m, c in by_month],
        reports_by_status=[{"status": s, "count": c} for s, c in by_status],
        recent_reports=[_enrich_report(r, db) for r in recent],
    )
