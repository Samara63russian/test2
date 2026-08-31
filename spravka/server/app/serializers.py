from __future__ import annotations

from . import schemas
from .documents import parse_option_ids
from .models import Report, ReportAnswer


def serialize_answer(answer: ReportAnswer) -> schemas.AnswerOut:
    return schemas.AnswerOut(
        id=answer.id,
        question_id=answer.question_id,
        value_text=answer.value_text,
        option_ids=parse_option_ids(answer.option_ids),
    )


def serialize_report(report: Report) -> schemas.ReportOut:
    return schemas.ReportOut(
        id=report.id,
        institution_id=report.institution_id,
        institution_name=report.institution.name if report.institution else "",
        author_id=report.author_id,
        author_name=(
            (report.author.full_name or report.author.username) if report.author else ""
        ),
        report_date=report.report_date,
        status=report.status,  # type: ignore[arg-type]
        notes=report.notes,
        client_uuid=report.client_uuid,
        created_at=report.created_at,
        updated_at=report.updated_at,
        answers=[serialize_answer(a) for a in report.answers],
    )


def apply_answers(report: Report, answers: list[schemas.AnswerIn]) -> None:
    existing = {a.question_id: a for a in report.answers}
    for item in answers:
        option_raw = ",".join(str(i) for i in item.option_ids)
        if item.question_id in existing:
            ans = existing[item.question_id]
            ans.value_text = item.value_text
            ans.option_ids = option_raw
        else:
            report.answers.append(
                ReportAnswer(
                    question_id=item.question_id,
                    value_text=item.value_text,
                    option_ids=option_raw,
                )
            )
