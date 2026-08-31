from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from ..models import Answer, Question, Report, User


def report_to_out(report: Report) -> dict:
    answers = []
    for a in report.answers:
        q = a.question
        answers.append(
            {
                "question_id": a.question_id,
                "value": a.value,
                "question_text": q.text if q else "",
                "answer_type": q.answer_type if q else "text",
            }
        )
    return {
        "id": report.id,
        "institution_id": report.institution_id,
        "institution_name": report.institution.name if report.institution else "",
        "user_id": report.user_id,
        "user_name": report.user.full_name or report.user.username if report.user else "",
        "report_date": report.report_date,
        "status": report.status,
        "client_uuid": report.client_uuid,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "submitted_at": report.submitted_at,
        "answers": answers,
    }


def load_report(db: Session, report_id: int) -> Report | None:
    return (
        db.query(Report)
        .options(
            joinedload(Report.answers).joinedload(Answer.question),
            joinedload(Report.institution),
            joinedload(Report.user),
        )
        .filter(Report.id == report_id)
        .first()
    )


def upsert_answers(db: Session, report: Report, items: list) -> None:
    existing = {a.question_id: a for a in report.answers}
    for item in items:
        qid = item.question_id if hasattr(item, "question_id") else item["question_id"]
        value = item.value if hasattr(item, "value") else item.get("value", "")
        if qid in existing:
            existing[qid].value = value
        else:
            db.add(Answer(report_id=report.id, question_id=qid, value=value))
    report.updated_at = datetime.utcnow()


def can_access_report(user: User, report: Report) -> bool:
    if user.role == "admin":
        return True
    if user.institution_id and report.institution_id != user.institution_id:
        return False
    return True


def question_map(db: Session) -> dict[int, Question]:
    return {q.id: q for q in db.query(Question).all()}
