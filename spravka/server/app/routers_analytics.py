from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from . import schemas
from .auth import get_current_user
from .database import get_db
from .models import Institution, Question, Report, User
from .serializers import serialize_report

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def analytics_summary(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = db.query(Report).count()
    submitted = db.query(Report).filter(Report.status == "submitted").count()
    drafts = db.query(Report).filter(Report.status == "draft").count()
    institutions_count = db.query(Institution).filter(Institution.is_active.is_(True)).count()
    questions_count = db.query(Question).filter(Question.is_active.is_(True)).count()

    by_inst_rows = (
        db.query(Institution.name, func.count(Report.id))
        .outerjoin(Report, Report.institution_id == Institution.id)
        .filter(Institution.is_active.is_(True))
        .group_by(Institution.id)
        .order_by(func.count(Report.id).desc())
        .all()
    )
    by_institution = [{"name": name, "count": count} for name, count in by_inst_rows]

    month_map: dict[str, int] = defaultdict(int)
    for report_date, in db.query(Report.report_date).all():
        key = report_date.strftime("%Y-%m")
        month_map[key] += 1
    by_month = [{"month": k, "count": month_map[k]} for k in sorted(month_map)]

    recent = (
        db.query(Report)
        .options(
            joinedload(Report.institution),
            joinedload(Report.author),
            joinedload(Report.answers),
        )
        .order_by(Report.updated_at.desc())
        .limit(10)
        .all()
    )

    return schemas.AnalyticsSummary(
        total_reports=total,
        submitted_reports=submitted,
        draft_reports=drafts,
        institutions_count=institutions_count,
        questions_count=questions_count,
        by_institution=by_institution,
        by_month=by_month,
        recent_reports=[serialize_report(r) for r in recent],
    )
