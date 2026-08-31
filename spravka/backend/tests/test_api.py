from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_login_and_report_flow():
    bad = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert bad.status_code == 401

    login = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me = client.get("/api/auth/me", headers=headers)
    assert me.json()["role"] == "admin"

    inst = client.get("/api/institutions", headers=headers)
    assert inst.status_code == 200
    assert len(inst.json()) >= 1
    institution_id = inst.json()[0]["id"]

    questions = client.get("/api/questions", headers=headers).json()
    answers = [{"question_id": q["id"], "value": "1" if q["answer_type"] == "number" else "Да"} for q in questions]
    created = client.post(
        "/api/reports",
        headers=headers,
        json={
            "institution_id": institution_id,
            "report_date": "2026-08-31",
            "status": "submitted",
            "client_uuid": "test-uuid-1",
            "answers": answers,
        },
    )
    assert created.status_code == 200, created.text
    report_id = created.json()["id"]

    pdf = client.get(f"/api/reports/{report_id}/document.pdf", headers=headers)
    assert pdf.status_code == 200
    assert pdf.content[:4] == b"%PDF"

    docx = client.get(f"/api/reports/{report_id}/document.docx", headers=headers)
    assert docx.status_code == 200
    assert len(docx.content) > 1000

    sync = client.post(
        "/api/sync",
        headers=headers,
        json={
            "reports": [
                {
                    "client_uuid": "offline-1",
                    "institution_id": institution_id,
                    "report_date": "2026-08-30",
                    "status": "submitted",
                    "answers": answers[:3],
                }
            ]
        },
    )
    assert sync.status_code == 200
    assert sync.json()["count"] == 1

    analytics = client.get("/api/analytics", headers=headers)
    assert analytics.status_code == 200
    assert analytics.json()["total_reports"] >= 1
