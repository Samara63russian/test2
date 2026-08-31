from __future__ import annotations

from datetime import date

from fastapi.testclient import TestClient


def complete_answers(client: TestClient, headers: dict[str, str]) -> dict[str, object]:
    questions = client.get("/api/questions", headers=headers).json()
    values: dict[str, object] = {}
    for question in questions:
        if question["answer_type"] == "number":
            value: object = 10
        elif question["answer_type"] == "boolean":
            value = False
        elif question["answer_type"] == "select":
            value = question["options"][0]
        else:
            value = "Тестовый ответ"
        values[str(question["id"])] = value
    return values


def test_login_rejects_invalid_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "incorrect"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Неверный логин или пароль"


def test_admin_can_load_bootstrap_data(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    institutions = client.get("/api/institutions", headers=admin_headers)
    questions = client.get("/api/questions", headers=admin_headers)
    reports = client.get("/api/reports", headers=admin_headers)

    assert institutions.status_code == 200
    assert len(institutions.json()) == 4
    assert questions.status_code == 200
    assert len(questions.json()) == 8
    assert reports.status_code == 200
    assert len(reports.json()) >= 6


def test_report_creation_and_document_download(
    client: TestClient,
    operator_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/reports",
        headers=operator_headers,
        json={
            "institution_id": 1,
            "report_date": date.today().isoformat(),
            "status": "submitted",
            "comment": "Проверка итогового документа",
            "client_id": "api-test-report",
            "answers": complete_answers(client, operator_headers),
        },
    )
    assert response.status_code == 201
    report = response.json()
    assert report["institution_short_name"] == "ГКБ № 1"
    assert len(report["answer_details"]) == 8

    document = client.get(
        f"/api/reports/{report['id']}/document",
        headers=operator_headers,
    )
    assert document.status_code == 200
    assert document.headers["content-type"].startswith("application/msword")
    assert "СВОДНАЯ СПРАВКА" in document.content.decode("utf-8")


def test_sync_is_idempotent(
    client: TestClient,
    operator_headers: dict[str, str],
) -> None:
    payload = {
        "reports": [
            {
                "institution_id": 1,
                "report_date": date.today().isoformat(),
                "status": "submitted",
                "comment": "",
                "client_id": "offline-device-42",
                "answers": complete_answers(client, operator_headers),
            }
        ]
    }
    first = client.post("/api/sync", headers=operator_headers, json=payload)
    second = client.post("/api/sync", headers=operator_headers, json=payload)

    assert first.status_code == 200
    assert first.json()["results"][0]["status"] == "synced"
    assert second.status_code == 200
    assert second.json()["results"][0]["status"] == "already_synced"
    assert first.json()["results"][0]["report_id"] == second.json()["results"][0]["report_id"]


def test_operator_cannot_change_settings(
    client: TestClient,
    operator_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/institutions",
        headers=operator_headers,
        json={
            "name": "Недоступное учреждение",
            "short_name": "НУ",
            "address": "",
            "is_active": True,
        },
    )
    assert response.status_code == 403


def test_admin_can_create_and_update_user(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created = client.post(
        "/api/users",
        headers=admin_headers,
        json={
            "username": "viewer.test",
            "full_name": "Тестовый наблюдатель",
            "password": "testpass123",
            "role": "viewer",
            "institution_id": None,
            "is_active": True,
        },
    )
    assert created.status_code == 201
    user = created.json()
    assert "password_hash" not in user

    updated = client.put(
        f"/api/users/{user['id']}",
        headers=admin_headers,
        json={
            "username": "viewer.test",
            "full_name": "Обновлённый наблюдатель",
            "password": "",
            "role": "viewer",
            "institution_id": 2,
            "is_active": True,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["institution_id"] == 2


def test_analytics_returns_dashboard_series(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.get("/api/analytics?days=30", headers=admin_headers)
    assert response.status_code == 200
    payload = response.json()
    assert set(payload) == {"summary", "daily", "institutions", "levels"}
    assert len(payload["daily"]) == 14
    assert payload["summary"]["total_reports"] >= 6
