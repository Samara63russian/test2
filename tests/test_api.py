from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from reporting_app import database
from reporting_app.main import app


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(database, "DB_PATH", tmp_path / "test.db")
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def admin(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "Admin123!"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}


def test_full_reporting_workflow(client: TestClient, admin: dict[str, str]):
    bootstrap = client.get("/api/bootstrap", headers=admin)
    assert bootstrap.status_code == 200
    assert bootstrap.json()["questions"]

    institution = client.post(
        "/api/institutions",
        headers=admin,
        json={
            "name": "Городская поликлиника № 1",
            "short_name": "ГП № 1",
            "address": "г. Самара, ул. Примерная, 1",
            "contact_name": "Иванова И.И.",
            "phone": "+7 846 000-00-01",
            "email": "gp1@example.ru",
        },
    )
    assert institution.status_code == 201
    institution_id = institution.json()["id"]

    user = client.post(
        "/api/users",
        headers=admin,
        json={
            "username": "operator1",
            "password": "Secure123!",
            "full_name": "Оператор учреждения",
            "role": "operator",
            "institution_id": institution_id,
        },
    )
    assert user.status_code == 201
    assert "password_hash" not in user.json()

    login = client.post(
        "/api/auth/login",
        json={"username": "operator1", "password": "Secure123!"},
    )
    operator = {"Authorization": f"Bearer {login.json()['token']}"}

    questions = client.get("/api/questions", headers=operator).json()
    answers = {}
    for question in questions:
        value = "Тестовый ответ"
        if question["answer_type"] == "number":
            value = "42"
        elif question["answer_type"] == "yes_no":
            value = "Нет"
        elif question["answer_type"] == "select":
            value = question["options"][0]
        elif question["answer_type"] == "date":
            value = "2026-08-31"
        answers[str(question["id"])] = value

    payload = {
        "institution_id": institution_id,
        "report_date": "2026-08-31",
        "status": "submitted",
        "notes": "Работа в штатном режиме",
        "client_uid": "android-device-report-1",
        "answers": answers,
    }
    report = client.post("/api/reports", headers=operator, json=payload)
    assert report.status_code == 201
    report_id = report.json()["id"]
    assert report.json()["institution_name"] == "Городская поликлиника № 1"

    duplicate = client.post("/api/reports", headers=operator, json=payload)
    assert duplicate.status_code == 201
    assert duplicate.json()["id"] == report_id

    reports = client.get(
        "/api/reports?date_from=2026-08-01&date_to=2026-08-31",
        headers=operator,
    )
    assert reports.status_code == 200
    assert len(reports.json()) == 1

    analytics = client.get("/api/analytics", headers=admin)
    assert analytics.status_code == 200
    assert analytics.json()["summary"]["total_reports"] == 1

    document = client.get(f"/api/reports/{report_id}/document", headers=operator)
    assert document.status_code == 200
    assert document.content[:2] == b"PK"
    assert "wordprocessingml" in document.headers["content-type"]


def test_required_answers_are_validated(client: TestClient, admin: dict[str, str]):
    bootstrap = client.get("/api/bootstrap", headers=admin).json()
    institution_id = bootstrap["institutions"][0]["id"]
    response = client.post(
        "/api/reports",
        headers=admin,
        json={
            "institution_id": institution_id,
            "report_date": "2026-08-31",
            "status": "submitted",
            "answers": {},
        },
    )
    assert response.status_code == 422
    assert "обязательный вопрос" in response.json()["detail"]


def test_non_admin_cannot_manage_settings(client: TestClient, admin: dict[str, str]):
    institution_id = client.get("/api/bootstrap", headers=admin).json()["institutions"][0]["id"]
    client.post(
        "/api/users",
        headers=admin,
        json={
            "username": "viewer",
            "password": "Viewer123!",
            "full_name": "Наблюдатель",
            "role": "viewer",
            "institution_id": institution_id,
        },
    )
    login = client.post(
        "/api/auth/login",
        json={"username": "viewer", "password": "Viewer123!"},
    )
    viewer = {"Authorization": f"Bearer {login.json()['token']}"}
    response = client.post(
        "/api/institutions",
        headers=viewer,
        json={"name": "Недоступное учреждение"},
    )
    assert response.status_code == 403
