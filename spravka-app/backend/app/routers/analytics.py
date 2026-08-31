from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import (
    AnswerOption,
    Institution,
    Question,
    Report,
    ReportAnswer,
    User,
    UserInstitution,
)
from ..schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report_q = db.query(Report)
    if user.role != "admin":
        allowed = [
            ui.institution_id
            for ui in db.query(UserInstitution).filter(UserInstitution.user_id == user.id)
        ]
        report_q = report_q.filter(Report.institution_id.in_(allowed or [-1]))

    reports = report_q.all()
    total = len(reports)
    submitted = sum(1 for r in reports if r.status in ("submitted", "synced"))
    drafts = sum(1 for r in reports if r.status == "draft")

    by_inst: dict[int, dict] = {}
    by_date: dict[str, int] = {}
    by_status: dict[str, int] = {}
    for r in reports:
        name = r.institution.name if r.institution else str(r.institution_id)
        entry = by_inst.setdefault(
            r.institution_id, {"institution_id": r.institution_id, "name": name, "count": 0}
        )
        entry["count"] += 1
        by_date[r.report_date] = by_date.get(r.report_date, 0) + 1
        by_status[r.status] = by_status.get(r.status, 0) + 1

    answer_stats = []
    rows = (
        db.query(
            Question.id,
            Question.text,
            AnswerOption.text,
            func.count(ReportAnswer.id),
        )
        .join(ReportAnswer, ReportAnswer.question_id == Question.id)
        .outerjoin(AnswerOption, ReportAnswer.answer_option_id == AnswerOption.id)
        .join(Report, Report.id == ReportAnswer.report_id)
    )
    if user.role != "admin":
        allowed = [
            ui.institution_id
            for ui in db.query(UserInstitution).filter(UserInstitution.user_id == user.id)
        ]
        rows = rows.filter(Report.institution_id.in_(allowed or [-1]))
    rows = rows.group_by(Question.id, Question.text, AnswerOption.text).all()
    for qid, qtext, atext, cnt in rows:
        answer_stats.append(
            {
                "question_id": qid,
                "question": qtext,
                "answer": atext or "(текстовый ответ)",
                "count": cnt,
            }
        )

    institutions_count = db.query(Institution).filter(Institution.is_active.is_(True)).count()
    questions_count = db.query(Question).filter(Question.is_active.is_(True)).count()

    return AnalyticsSummary(
        total_reports=total,
        submitted_reports=submitted,
        draft_reports=drafts,
        institutions_count=institutions_count,
        questions_count=questions_count,
        by_institution=sorted(by_inst.values(), key=lambda x: -x["count"]),
        by_date=[
            {"date": d, "count": c}
            for d, c in sorted(by_date.items(), reverse=True)[:30]
        ],
        by_status=[{"status": s, "count": c} for s, c in by_status.items()],
        answer_stats=answer_stats[:50],
    )
