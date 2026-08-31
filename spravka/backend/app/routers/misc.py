from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AppSetting, DictionaryItem, Institution, Question, QuestionCategory, Report, User
from ..schemas import SettingIn, SyncIn
from ..security import get_current_user, require_admin
from ..services.helpers import load_report, report_to_out, upsert_answers

router = APIRouter(prefix="/api", tags=["misc"])


@router.get("/settings")
def get_settings(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return {s.key: s.value for s in db.query(AppSetting).all()}


@router.put("/settings")
def put_settings(items: list[SettingIn], db: Session = Depends(get_db), _: User = Depends(require_admin)):
    for item in items:
        row = db.get(AppSetting, item.key)
        if row:
            row.value = item.value
        else:
            db.add(AppSetting(key=item.key, value=item.value))
    db.commit()
    return {s.key: s.value for s in db.query(AppSetting).all()}


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Report)
    if user.role != "admin" and user.institution_id:
        q = q.filter(Report.institution_id == user.institution_id)
    reports = q.all()
    total = len(reports)
    submitted = sum(1 for r in reports if r.status == "submitted")
    drafts = total - submitted

    by_inst_map: dict[int, dict] = {}
    by_month: dict[str, int] = {}
    for r in reports:
        rec = by_inst_map.setdefault(r.institution_id, {"institution_id": r.institution_id, "name": "", "count": 0, "submitted": 0})
        rec["count"] += 1
        if r.status == "submitted":
            rec["submitted"] += 1
        key = r.report_date.strftime("%Y-%m")
        by_month[key] = by_month.get(key, 0) + 1

    names = {i.id: i.name for i in db.query(Institution).all()}
    by_institution = []
    for rec in by_inst_map.values():
        rec["name"] = names.get(rec["institution_id"], "—")
        by_institution.append(rec)
    by_institution.sort(key=lambda x: x["count"], reverse=True)

    month_rows = [{"month": k, "count": v} for k, v in sorted(by_month.items())]
    users_count = db.query(func.count(User.id)).scalar() or 0
    inst_count = db.query(func.count(Institution.id)).scalar() or 0
    questions_count = db.query(func.count(Question.id)).scalar() or 0

    return {
        "total_reports": total,
        "submitted": submitted,
        "drafts": drafts,
        "users": users_count,
        "institutions": inst_count,
        "questions": questions_count,
        "by_institution": by_institution,
        "by_month": month_rows,
    }


@router.get("/bootstrap")
def bootstrap(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inst_q = db.query(Institution).filter(Institution.is_active.is_(True)).order_by(Institution.name)
    if user.role != "admin" and user.institution_id:
        inst_q = inst_q.filter(Institution.id == user.institution_id)
    categories = (
        db.query(QuestionCategory)
        .filter(QuestionCategory.is_active.is_(True))
        .order_by(QuestionCategory.sort_order)
        .all()
    )
    questions = (
        db.query(Question).filter(Question.is_active.is_(True)).order_by(Question.sort_order, Question.id).all()
    )
    dictionary = (
        db.query(DictionaryItem)
        .filter(DictionaryItem.is_active.is_(True))
        .order_by(DictionaryItem.group_code, DictionaryItem.sort_order)
        .all()
    )
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "institution_id": user.institution_id,
        },
        "settings": {s.key: s.value for s in db.query(AppSetting).all()},
        "institutions": [
            {
                "id": i.id,
                "name": i.name,
                "code": i.code,
                "type_code": i.type_code,
                "district": i.district,
                "address": i.address,
                "phone": i.phone,
                "head_name": i.head_name,
            }
            for i in inst_q.all()
        ],
        "categories": [{"id": c.id, "name": c.name, "sort_order": c.sort_order} for c in categories],
        "questions": [
            {
                "id": q.id,
                "category_id": q.category_id,
                "text": q.text,
                "hint": q.hint,
                "answer_type": q.answer_type,
                "options": q.options,
                "required": q.required,
                "sort_order": q.sort_order,
            }
            for q in questions
        ],
        "dictionary": [
            {"id": d.id, "group_code": d.group_code, "name": d.name, "code": d.code, "sort_order": d.sort_order}
            for d in dictionary
        ],
    }


@router.post("/sync")
def sync_reports(payload: SyncIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    saved = []
    for item in payload.reports:
        if user.role != "admin" and user.institution_id and item.institution_id != user.institution_id:
            raise HTTPException(status_code=403, detail="Нельзя выгрузить справку чужого учреждения")
        report = db.query(Report).filter(Report.client_uuid == item.client_uuid).first()
        status = item.status if item.status in ("draft", "submitted") else "submitted"
        if report:
            if not (user.role == "admin" or report.user_id == user.id or report.institution_id == user.institution_id):
                raise HTTPException(status_code=403, detail="Нет доступа к справке")
            report.institution_id = item.institution_id
            report.report_date = item.report_date
            report.status = status
            if status == "submitted":
                report.submitted_at = datetime.utcnow()
            upsert_answers(db, report, item.answers)
        else:
            report = Report(
                institution_id=item.institution_id,
                user_id=user.id,
                report_date=item.report_date,
                status=status,
                client_uuid=item.client_uuid,
                submitted_at=datetime.utcnow() if status == "submitted" else None,
            )
            db.add(report)
            db.flush()
            upsert_answers(db, report, item.answers)
        db.flush()
        saved.append(report_to_out(load_report(db, report.id)))
    db.commit()
    return {"saved": saved, "count": len(saved)}
