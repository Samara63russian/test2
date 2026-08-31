import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker

client = TestClient(app)

def test_health_and_institutions():
    response = client.get("/api/institutions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_questions_list():
    response = client.get("/api/questions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_institutions" in data
    assert "total_reports" in data
    assert "average_score" in data

def test_auth_login():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"

def test_create_institution_and_report():
    import uuid
    uid = str(uuid.uuid4())[:8]
    # 1. Create Institution
    inst_resp = client.post("/api/institutions", json={
        "name": f"Тестовая Средняя Школа № {uid}",
        "category": "Образование",
        "code": f"ШК-{uid}",
        "address": "г. Тестовый, ул. Знаний, 1",
        "head_name": "Тестов Тест Тестович",
        "phone": "+7 (999) 000-00-00",
        "email": "test999@example.com"
    })
    assert inst_resp.status_code == 200
    inst_id = inst_resp.json()["id"]

    # 2. Get a question
    q_resp = client.get("/api/questions")
    q_id = q_resp.json()[0]["id"]

    # 3. Create Report
    rep_resp = client.post("/api/reports", json={
        "institution_id": inst_id,
        "title": "Справка комплексной проверки Школы №999",
        "status": "completed",
        "summary_text": "Тестовая сводка обследования.",
        "recommendations": "Рекомендации выполнены.",
        "answers": [
            {
                "question_id": q_id,
                "value": "Да",
                "is_compliant": True,
                "comment": "Без нареканий"
            }
        ]
    })
    assert rep_resp.status_code == 200
    rep_id = rep_resp.json()["id"]
    assert rep_resp.json()["score"] == 100.0

    # 4. Test PDF download
    pdf_resp = client.get(f"/api/reports/{rep_id}/download/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 100

    # 5. Test DOCX download
    docx_resp = client.get(f"/api/reports/{rep_id}/download/docx")
    assert docx_resp.status_code == 200
    assert len(docx_resp.content) > 100

    # 6. Test Excel download
    excel_resp = client.get("/api/reports/download/excel")
    assert excel_resp.status_code == 200
    assert len(excel_resp.content) > 100

def test_sync_batch():
    # Sync from Android client simulation
    inst_resp = client.get("/api/institutions")
    inst_id = inst_resp.json()[0]["id"]
    q_resp = client.get("/api/questions")
    q_id = q_resp.json()[0]["id"]

    batch_payload = {
        "reports": [
            {
                "institution_id": inst_id,
                "title": "Офлайн-проверка с планшета инспектора",
                "status": "completed",
                "summary_text": "Заполнено в мобильном приложении без сети.",
                "client_uuid": "android-uuid-test-12345",
                "answers": [
                    {
                        "question_id": q_id,
                        "value": "Да",
                        "is_compliant": True,
                        "comment": "Синхронизировано при подключении к WiFi"
                    }
                ]
            }
        ]
    }
    sync_resp = client.post("/api/sync/batch", json=batch_payload)
    assert sync_resp.status_code == 200
    assert sync_resp.json()["synced_count"] == 1
