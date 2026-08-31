from __future__ import annotations

import html
import json
import secrets
import sqlite3
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal
from urllib.parse import quote

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .database import (
    connection,
    hash_password,
    initialize_database,
    row_to_dict,
    utc_now,
    verify_password,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Сводка — API",
    description="API системы сбора ежедневных справок учреждений",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "capacitor://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class LoginRequest(BaseModel):
    username: str
    password: str


class InstitutionInput(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    short_name: str = Field(min_length=1, max_length=80)
    address: str = Field(default="", max_length=300)
    is_active: bool = True


class QuestionInput(BaseModel):
    text: str = Field(min_length=3, max_length=500)
    description: str = Field(default="", max_length=1000)
    answer_type: Literal["text", "textarea", "number", "select", "boolean"]
    options: list[str] = []
    is_required: bool = False
    is_active: bool = True
    order_index: int = Field(default=0, ge=0)

    @field_validator("options")
    @classmethod
    def clean_options(cls, options: list[str]) -> list[str]:
        return [option.strip() for option in options if option.strip()]


class UserInput(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r"^[a-zA-Z0-9_.-]+$")
    full_name: str = Field(min_length=2, max_length=160)
    password: str = Field(default="", max_length=200)
    role: Literal["admin", "operator", "viewer"]
    institution_id: int | None = None
    is_active: bool = True


class ReportInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    institution_id: int
    report_date: date
    status: Literal["draft", "submitted"] = "submitted"
    comment: str = Field(default="", max_length=3000)
    answers: dict[str, Any]
    client_id: str | None = Field(default=None, max_length=120)


class SyncInput(BaseModel):
    reports: list[ReportInput] = Field(max_length=100)


def public_user(row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
    user = dict(row)
    user.pop("password_hash", None)
    user.pop("password_salt", None)
    user["is_active"] = bool(user["is_active"])
    return user


def institution_dict(row: sqlite3.Row) -> dict[str, Any]:
    result = dict(row)
    result["is_active"] = bool(result["is_active"])
    return result


def question_dict(row: sqlite3.Row) -> dict[str, Any]:
    result = dict(row)
    result["options"] = json.loads(result.pop("options_json"))
    result["is_required"] = bool(result["is_required"])
    result["is_active"] = bool(result["is_active"])
    return result


def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется авторизация")
    token = authorization.removeprefix("Bearer ").strip()
    with connection() as db:
        row = db.execute(
            """
            SELECT users.*, institutions.short_name AS institution_name
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            LEFT JOIN institutions ON institutions.id = users.institution_id
            WHERE sessions.token = ? AND sessions.expires_at > ?
              AND users.is_active = 1
            """,
            (token, utc_now()),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Сессия истекла")
    return public_user(row)


def require_admin(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")
    return user


def ensure_institution_access(user: dict[str, Any], institution_id: int) -> None:
    if user["role"] == "operator" and user["institution_id"] != institution_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Оператор может работать только со своим учреждением",
        )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/login")
def login(payload: LoginRequest) -> dict[str, Any]:
    with connection() as db:
        row = db.execute(
            """
            SELECT users.*, institutions.short_name AS institution_name
            FROM users
            LEFT JOIN institutions ON institutions.id = users.institution_id
            WHERE lower(users.username) = lower(?) AND users.is_active = 1
            """,
            (payload.username.strip(),),
        ).fetchone()
        if not row or not verify_password(
            payload.password, row["password_hash"], row["password_salt"]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный логин или пароль",
            )
        token = secrets.token_urlsafe(36)
        expires = (datetime.now(timezone.utc) + timedelta(days=30)).replace(
            microsecond=0
        ).isoformat()
        db.execute("DELETE FROM sessions WHERE expires_at <= ?", (utc_now(),))
        db.execute(
            "INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, row["id"], expires),
        )
    return {"token": token, "user": public_user(row)}


@app.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    authorization: str | None = Header(default=None),
    _: dict[str, Any] = Depends(get_current_user),
) -> Response:
    token = (authorization or "").removeprefix("Bearer ").strip()
    with connection() as db:
        db.execute("DELETE FROM sessions WHERE token = ?", (token,))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/auth/me")
def me(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return user


@app.get("/api/institutions")
def list_institutions(
    include_inactive: bool = False,
    _: dict[str, Any] = Depends(get_current_user),
) -> list[dict[str, Any]]:
    query = "SELECT * FROM institutions"
    if not include_inactive:
        query += " WHERE is_active = 1"
    query += " ORDER BY name"
    with connection() as db:
        return [institution_dict(row) for row in db.execute(query).fetchall()]


@app.post("/api/institutions", status_code=status.HTTP_201_CREATED)
def create_institution(
    payload: InstitutionInput,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    with connection() as db:
        cursor = db.execute(
            """
            INSERT INTO institutions(name, short_name, address, is_active, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                payload.name.strip(),
                payload.short_name.strip(),
                payload.address.strip(),
                int(payload.is_active),
                utc_now(),
            ),
        )
        row = db.execute("SELECT * FROM institutions WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return institution_dict(row)


@app.put("/api/institutions/{institution_id}")
def update_institution(
    institution_id: int,
    payload: InstitutionInput,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    with connection() as db:
        cursor = db.execute(
            """
            UPDATE institutions
            SET name = ?, short_name = ?, address = ?, is_active = ?
            WHERE id = ?
            """,
            (
                payload.name.strip(),
                payload.short_name.strip(),
                payload.address.strip(),
                int(payload.is_active),
                institution_id,
            ),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Учреждение не найдено")
        row = db.execute("SELECT * FROM institutions WHERE id = ?", (institution_id,)).fetchone()
    return institution_dict(row)


@app.delete("/api/institutions/{institution_id}")
def delete_institution(
    institution_id: int,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, str]:
    with connection() as db:
        row = db.execute("SELECT id FROM institutions WHERE id = ?", (institution_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Учреждение не найдено")
        has_history = db.execute(
            "SELECT EXISTS(SELECT 1 FROM reports WHERE institution_id = ?)",
            (institution_id,),
        ).fetchone()[0]
        if has_history:
            db.execute("UPDATE institutions SET is_active = 0 WHERE id = ?", (institution_id,))
            return {"result": "archived"}
        db.execute("DELETE FROM institutions WHERE id = ?", (institution_id,))
    return {"result": "deleted"}


@app.get("/api/questions")
def list_questions(
    include_inactive: bool = False,
    _: dict[str, Any] = Depends(get_current_user),
) -> list[dict[str, Any]]:
    query = "SELECT * FROM questions"
    if not include_inactive:
        query += " WHERE is_active = 1"
    query += " ORDER BY order_index, id"
    with connection() as db:
        return [question_dict(row) for row in db.execute(query).fetchall()]


@app.post("/api/questions", status_code=status.HTTP_201_CREATED)
def create_question(
    payload: QuestionInput,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    with connection() as db:
        order_index = payload.order_index or (
            db.execute("SELECT COALESCE(MAX(order_index), 0) + 1 FROM questions").fetchone()[0]
        )
        cursor = db.execute(
            """
            INSERT INTO questions(
                text, description, answer_type, options_json,
                is_required, is_active, order_index, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.text.strip(),
                payload.description.strip(),
                payload.answer_type,
                json.dumps(payload.options, ensure_ascii=False),
                int(payload.is_required),
                int(payload.is_active),
                order_index,
                utc_now(),
            ),
        )
        row = db.execute("SELECT * FROM questions WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return question_dict(row)


@app.put("/api/questions/{question_id}")
def update_question(
    question_id: int,
    payload: QuestionInput,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    with connection() as db:
        cursor = db.execute(
            """
            UPDATE questions
            SET text = ?, description = ?, answer_type = ?, options_json = ?,
                is_required = ?, is_active = ?, order_index = ?
            WHERE id = ?
            """,
            (
                payload.text.strip(),
                payload.description.strip(),
                payload.answer_type,
                json.dumps(payload.options, ensure_ascii=False),
                int(payload.is_required),
                int(payload.is_active),
                payload.order_index,
                question_id,
            ),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Вопрос не найден")
        row = db.execute("SELECT * FROM questions WHERE id = ?", (question_id,)).fetchone()
    return question_dict(row)


@app.delete("/api/questions/{question_id}")
def delete_question(
    question_id: int,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, str]:
    with connection() as db:
        row = db.execute("SELECT id FROM questions WHERE id = ?", (question_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Вопрос не найден")
        has_answers = db.execute(
            "SELECT EXISTS(SELECT 1 FROM answers WHERE question_id = ?)",
            (question_id,),
        ).fetchone()[0]
        if has_answers:
            db.execute("UPDATE questions SET is_active = 0 WHERE id = ?", (question_id,))
            return {"result": "archived"}
        db.execute("DELETE FROM questions WHERE id = ?", (question_id,))
    return {"result": "deleted"}


@app.get("/api/users")
def list_users(_: dict[str, Any] = Depends(require_admin)) -> list[dict[str, Any]]:
    with connection() as db:
        rows = db.execute(
            """
            SELECT users.*, institutions.short_name AS institution_name
            FROM users
            LEFT JOIN institutions ON institutions.id = users.institution_id
            ORDER BY users.full_name
            """
        ).fetchall()
    return [public_user(row) for row in rows]


@app.post("/api/users", status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserInput,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Пароль должен содержать не менее 8 символов")
    password_hash, password_salt = hash_password(payload.password)
    try:
        with connection() as db:
            cursor = db.execute(
                """
                INSERT INTO users(
                    username, full_name, password_hash, password_salt,
                    role, institution_id, is_active, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.username.strip(),
                    payload.full_name.strip(),
                    password_hash,
                    password_salt,
                    payload.role,
                    payload.institution_id,
                    int(payload.is_active),
                    utc_now(),
                ),
            )
            row = db.execute(
                """
                SELECT users.*, institutions.short_name AS institution_name
                FROM users
                LEFT JOIN institutions ON institutions.id = users.institution_id
                WHERE users.id = ?
                """,
                (cursor.lastrowid,),
            ).fetchone()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Такой логин уже используется") from exc
    return public_user(row)


@app.put("/api/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserInput,
    current_user: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    if payload.password and len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Пароль должен содержать не менее 8 символов")
    if user_id == current_user["id"] and not payload.is_active:
        raise HTTPException(status_code=422, detail="Нельзя отключить собственную учётную запись")
    try:
        with connection() as db:
            existing = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Пользователь не найден")
            password_hash, password_salt = (
                hash_password(payload.password)
                if payload.password
                else (existing["password_hash"], existing["password_salt"])
            )
            db.execute(
                """
                UPDATE users
                SET username = ?, full_name = ?, password_hash = ?, password_salt = ?,
                    role = ?, institution_id = ?, is_active = ?
                WHERE id = ?
                """,
                (
                    payload.username.strip(),
                    payload.full_name.strip(),
                    password_hash,
                    password_salt,
                    payload.role,
                    payload.institution_id,
                    int(payload.is_active),
                    user_id,
                ),
            )
            row = db.execute(
                """
                SELECT users.*, institutions.short_name AS institution_name
                FROM users
                LEFT JOIN institutions ON institutions.id = users.institution_id
                WHERE users.id = ?
                """,
                (user_id,),
            ).fetchone()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Такой логин уже используется") from exc
    return public_user(row)


def fetch_report(db: sqlite3.Connection, report_id: int) -> dict[str, Any] | None:
    row = db.execute(
        """
        SELECT reports.*, institutions.name AS institution_name,
               institutions.short_name AS institution_short_name,
               users.full_name AS author_name
        FROM reports
        JOIN institutions ON institutions.id = reports.institution_id
        JOIN users ON users.id = reports.author_id
        WHERE reports.id = ?
        """,
        (report_id,),
    ).fetchone()
    if not row:
        return None
    report = dict(row)
    answer_rows = db.execute(
        """
        SELECT answers.question_id, answers.value_json, questions.text,
               questions.answer_type, questions.order_index
        FROM answers
        JOIN questions ON questions.id = answers.question_id
        WHERE answers.report_id = ?
        ORDER BY questions.order_index, questions.id
        """,
        (report_id,),
    ).fetchall()
    report["answers"] = {
        str(answer["question_id"]): json.loads(answer["value_json"]) for answer in answer_rows
    }
    report["answer_details"] = [
        {
            "question_id": answer["question_id"],
            "question": answer["text"],
            "answer_type": answer["answer_type"],
            "value": json.loads(answer["value_json"]),
        }
        for answer in answer_rows
    ]
    return report


def validate_report(db: sqlite3.Connection, payload: ReportInput) -> None:
    institution = db.execute(
        "SELECT id FROM institutions WHERE id = ? AND is_active = 1",
        (payload.institution_id,),
    ).fetchone()
    if not institution:
        raise HTTPException(status_code=422, detail="Выберите действующее учреждение")
    if payload.status != "submitted":
        return
    required = db.execute(
        "SELECT id, text FROM questions WHERE is_active = 1 AND is_required = 1"
    ).fetchall()
    missing = []
    for question in required:
        value = payload.answers.get(str(question["id"]))
        if value is None or value == "":
            missing.append(question["text"])
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Заполните обязательные поля: {', '.join(missing[:3])}",
        )


def save_report(
    db: sqlite3.Connection,
    payload: ReportInput,
    user: dict[str, Any],
) -> tuple[dict[str, Any], bool]:
    if payload.client_id:
        existing = db.execute(
            "SELECT id FROM reports WHERE client_id = ?", (payload.client_id,)
        ).fetchone()
        if existing:
            return fetch_report(db, existing["id"]), False
    ensure_institution_access(user, payload.institution_id)
    validate_report(db, payload)
    timestamp = utc_now()
    cursor = db.execute(
        """
        INSERT INTO reports(
            institution_id, report_date, status, author_id,
            comment, client_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.institution_id,
            payload.report_date.isoformat(),
            payload.status,
            user["id"],
            payload.comment.strip(),
            payload.client_id,
            timestamp,
            timestamp,
        ),
    )
    active_question_ids = {
        row["id"] for row in db.execute("SELECT id FROM questions WHERE is_active = 1").fetchall()
    }
    db.executemany(
        "INSERT INTO answers(report_id, question_id, value_json) VALUES (?, ?, ?)",
        [
            (cursor.lastrowid, question_id, json.dumps(value, ensure_ascii=False))
            for key, value in payload.answers.items()
            if str(key).isdigit() and (question_id := int(key)) in active_question_ids
        ],
    )
    return fetch_report(db, cursor.lastrowid), True


@app.get("/api/reports")
def list_reports(
    institution_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    report_status: Literal["draft", "submitted"] | None = Query(default=None, alias="status"),
    limit: int = Query(default=100, ge=1, le=500),
    user: dict[str, Any] = Depends(get_current_user),
) -> list[dict[str, Any]]:
    conditions: list[str] = []
    params: list[Any] = []
    if user["role"] == "operator":
        conditions.append("reports.institution_id = ?")
        params.append(user["institution_id"])
    elif institution_id:
        conditions.append("reports.institution_id = ?")
        params.append(institution_id)
    if date_from:
        conditions.append("reports.report_date >= ?")
        params.append(date_from.isoformat())
    if date_to:
        conditions.append("reports.report_date <= ?")
        params.append(date_to.isoformat())
    if report_status:
        conditions.append("reports.status = ?")
        params.append(report_status)
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    with connection() as db:
        rows = db.execute(
            f"""
            SELECT reports.id, reports.institution_id, reports.report_date,
                   reports.status, reports.comment, reports.created_at, reports.updated_at,
                   institutions.name AS institution_name,
                   institutions.short_name AS institution_short_name,
                   users.full_name AS author_name,
                   COUNT(answers.id) AS answer_count
            FROM reports
            JOIN institutions ON institutions.id = reports.institution_id
            JOIN users ON users.id = reports.author_id
            LEFT JOIN answers ON answers.report_id = reports.id
            {where}
            GROUP BY reports.id
            ORDER BY reports.report_date DESC, reports.created_at DESC
            LIMIT ?
            """,
            (*params, limit),
        ).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/reports/{report_id}")
def get_report(
    report_id: int,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    with connection() as db:
        report = fetch_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    ensure_institution_access(user, report["institution_id"])
    return report


@app.post("/api/reports", status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportInput,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if user["role"] == "viewer":
        raise HTTPException(status_code=403, detail="Наблюдатель не может заполнять справки")
    with connection() as db:
        report, _ = save_report(db, payload, user)
    return report


@app.post("/api/sync")
def sync_reports(
    payload: SyncInput,
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if user["role"] == "viewer":
        raise HTTPException(status_code=403, detail="Наблюдатель не может заполнять справки")
    results = []
    with connection() as db:
        for report_payload in payload.reports:
            try:
                report, created = save_report(db, report_payload, user)
                results.append(
                    {
                        "client_id": report_payload.client_id,
                        "report_id": report["id"],
                        "status": "synced" if created else "already_synced",
                    }
                )
            except HTTPException as exc:
                results.append(
                    {
                        "client_id": report_payload.client_id,
                        "status": "error",
                        "message": exc.detail,
                    }
                )
    return {
        "synced": sum(result["status"] != "error" for result in results),
        "failed": sum(result["status"] == "error" for result in results),
        "results": results,
    }


@app.get("/api/analytics")
def analytics(
    institution_id: int | None = None,
    days: int = Query(default=30, ge=7, le=365),
    user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    if user["role"] == "operator":
        institution_id = user["institution_id"]
    start_date = (date.today() - timedelta(days=days - 1)).isoformat()
    conditions = ["reports.report_date >= ?", "reports.status = 'submitted'"]
    params: list[Any] = [start_date]
    if institution_id:
        conditions.append("reports.institution_id = ?")
        params.append(institution_id)
    where = " AND ".join(conditions)
    with connection() as db:
        total = db.execute(
            f"SELECT COUNT(*) FROM reports WHERE {where}", params
        ).fetchone()[0]
        active_institutions = db.execute(
            "SELECT COUNT(*) FROM institutions WHERE is_active = 1"
        ).fetchone()[0]
        today_count = db.execute(
            f"SELECT COUNT(DISTINCT reports.institution_id) FROM reports WHERE {where} AND report_date = ?",
            (*params, date.today().isoformat()),
        ).fetchone()[0]
        daily_rows = db.execute(
            f"""
            SELECT report_date AS date, COUNT(*) AS reports
            FROM reports
            WHERE {where}
            GROUP BY report_date
            ORDER BY report_date
            """,
            params,
        ).fetchall()
        institution_rows = db.execute(
            f"""
            SELECT institutions.short_name AS name, COUNT(reports.id) AS reports,
                   MAX(reports.report_date) AS last_report
            FROM reports
            JOIN institutions ON institutions.id = reports.institution_id
            WHERE {where}
            GROUP BY institutions.id
            ORDER BY reports DESC
            """,
            params,
        ).fetchall()
        level_rows = db.execute(
            f"""
            SELECT json_extract(answers.value_json, '$') AS level, COUNT(*) AS value
            FROM reports
            JOIN answers ON answers.report_id = reports.id
            JOIN questions ON questions.id = answers.question_id
            WHERE {where} AND questions.answer_type = 'select'
              AND lower(questions.text) LIKE '%загрузк%'
            GROUP BY answers.value_json
            ORDER BY value DESC
            """,
            params,
        ).fetchall()
        incident_count = db.execute(
            f"""
            SELECT COUNT(DISTINCT reports.id)
            FROM reports
            JOIN answers ON answers.report_id = reports.id
            JOIN questions ON questions.id = answers.question_id
            WHERE {where} AND (
                (questions.answer_type = 'boolean' AND answers.value_json = 'true')
                OR (lower(questions.text) LIKE '%происшеств%' AND answers.value_json NOT IN ('""', 'null'))
            )
            """,
            params,
        ).fetchone()[0]
    daily_map = {row["date"]: row["reports"] for row in daily_rows}
    daily = [
        {
            "date": (date.today() - timedelta(days=offset)).isoformat(),
            "reports": daily_map.get(
                (date.today() - timedelta(days=offset)).isoformat(), 0
            ),
        }
        for offset in reversed(range(min(days, 14)))
    ]
    denominator = 1 if institution_id else max(active_institutions, 1)
    return {
        "summary": {
            "total_reports": total,
            "today_reports": today_count,
            "coverage": round(today_count / denominator * 100),
            "incidents": incident_count,
        },
        "daily": daily,
        "institutions": [dict(row) for row in institution_rows],
        "levels": [dict(row) for row in level_rows],
    }


@app.get("/api/knowledge")
def knowledge(_: dict[str, Any] = Depends(get_current_user)) -> list[dict[str, Any]]:
    with connection() as db:
        rows = db.execute(
            "SELECT * FROM knowledge_articles ORDER BY category, title"
        ).fetchall()
    return [dict(row) for row in rows]


def format_answer(value: Any, answer_type: str) -> str:
    if answer_type == "boolean":
        return "Да" if value else "Нет"
    if value is None or value == "":
        return "Не указано"
    return str(value)


@app.get("/api/reports/{report_id}/document")
def report_document(
    report_id: int,
    user: dict[str, Any] = Depends(get_current_user),
) -> Response:
    with connection() as db:
        report = fetch_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Справка не найдена")
    ensure_institution_access(user, report["institution_id"])
    answer_rows = "\n".join(
        f"""
        <tr>
          <td>{html.escape(detail["question"])}</td>
          <td>{html.escape(format_answer(detail["value"], detail["answer_type"]))}</td>
        </tr>
        """
        for detail in report["answer_details"]
    )
    comment = (
        f"<h2>Комментарий</h2><p>{html.escape(report['comment'])}</p>"
        if report["comment"]
        else ""
    )
    document = f"""<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: Arial, sans-serif; margin: 40px; color: #18212f; }}
    h1 {{ font-size: 22px; text-align: center; margin-bottom: 28px; }}
    h2 {{ font-size: 16px; margin-top: 24px; }}
    .meta {{ margin-bottom: 24px; line-height: 1.7; }}
    table {{ border-collapse: collapse; width: 100%; }}
    td, th {{ border: 1px solid #aeb7c4; padding: 9px; vertical-align: top; }}
    th {{ background: #eef2f6; text-align: left; }}
    td:first-child {{ width: 58%; }}
    .sign {{ margin-top: 48px; }}
  </style>
</head>
<body>
  <h1>СВОДНАЯ СПРАВКА</h1>
  <div class="meta">
    <strong>Учреждение:</strong> {html.escape(report["institution_name"])}<br>
    <strong>Дата справки:</strong> {html.escape(report["report_date"])}<br>
    <strong>Подготовил:</strong> {html.escape(report["author_name"])}
  </div>
  <table>
    <thead><tr><th>Показатель</th><th>Значение</th></tr></thead>
    <tbody>{answer_rows}</tbody>
  </table>
  {comment}
  <p class="sign">Ответственный: _____________________ / _____________________</p>
</body>
</html>"""
    filename = f"spravka-{report['report_date']}-{report['institution_short_name']}.doc"
    headers = {
        "Content-Disposition": (
            f"attachment; filename=report-{report_id}.doc; filename*=UTF-8''{quote(filename)}"
        )
    }
    return Response(
        content=document.encode("utf-8"),
        media_type="application/msword; charset=utf-8",
        headers=headers,
    )


FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")


@app.get("/{full_path:path}", include_in_schema=False)
def frontend(full_path: str) -> Response:
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Маршрут не найден")
    candidate = FRONTEND_DIST / full_path
    if full_path and candidate.is_file():
        return FileResponse(candidate)
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return FileResponse(index)
    return HTMLResponse(
        "<h1>Фронтенд не собран</h1><p>Выполните <code>npm run build</code> в каталоге frontend.</p>",
        status_code=503,
    )
