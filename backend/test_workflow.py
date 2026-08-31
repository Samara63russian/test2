import pytest
from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_full_application_workflow():
    # 1. Login with admin
    login_resp = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Me
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "admin"

    # 3. Create a new Institution in directory
    u_suffix = str(uuid.uuid4())[:6]
    inst_name = f"ГБУЗ Городская поликлиника №{u_suffix}"
    inst_resp = client.post("/api/institutions", json={
        "name": inst_name,
        "category": "Здравоохранение",
        "code": f"ГП-{u_suffix}",
        "address": "г. Москва, ул. Медиков, д. 10",
        "head_name": "Докторов Петр Сергеевич",
        "phone": "+7 (495) 123-45-67",
        "email": "gp@zdrav.mos.ru"
    }, headers=headers)
    assert inst_resp.status_code == 200
    inst_id = inst_resp.json()["id"]

    # 4. Create a new Question in directory
    q_resp = client.post("/api/questions", json={
        "category_id": 1,
        "code": f"ТЕСТ-{u_suffix}",
        "text": "Соответствие температурного режима хранения медикаментов нормам СанПиН?",
        "description": "Проверка журнала термометрии и холодильного оборудования",
        "question_type": "boolean",
        "weight": 1.5,
        "is_required": True,
        "is_active": True
    }, headers=headers)
    assert q_resp.status_code == 200
    q_id = q_resp.json()["id"]

    # 5. Fill and Submit Inspection Questionnaire (Report)
    rep_resp = client.post("/api/reports", json={
        "institution_id": inst_id,
        "title": f"Комплексная проверка условий хранения ЛС в {inst_name}",
        "status": "completed",
        "summary_text": "Температурный режим соблюдается полностью. Все поверочные сертификаты в наличии.",
        "recommendations": "Продолжить плановое ведение журналов.",
        "answers": [
            {
                "question_id": q_id,
                "value": "Да",
                "is_compliant": True,
                "comment": "Журналы ведутся в электронном и бумажном виде"
            }
        ]
    }, headers=headers)
    assert rep_resp.status_code == 200
    rep_data = rep_resp.json()
    rep_id = rep_data["id"]
    assert rep_data["score"] == 100.0

    # 6. Check report appears in list & filter by institution
    list_resp = client.get(f"/api/reports?institution_id={inst_id}")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
    assert list_resp.json()[0]["id"] == rep_id

    # 7. Download PDF
    pdf_resp = client.get(f"/api/reports/{rep_id}/download/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000

    # 8. Download DOCX
    docx_resp = client.get(f"/api/reports/{rep_id}/download/docx")
    assert docx_resp.status_code == 200
    assert len(docx_resp.content) > 1000

    # 9. Download Excel Summary
    excel_resp = client.get("/api/reports/download/excel")
    assert excel_resp.status_code == 200
    assert len(excel_resp.content) > 1000

    # 10. Test Analytics Overview has updated stats
    an_resp = client.get("/api/analytics/overview")
    assert an_resp.status_code == 200
    an_data = an_resp.json()
    assert an_data["total_institutions"] >= 1
    assert an_data["total_reports"] >= 1
    assert an_data["average_score"] > 0

    # 11. Test Mobile Offline Sync batch endpoint
    sync_resp = client.post("/api/sync/batch", json={
        "reports": [
            {
                "institution_id": inst_id,
                "title": "Офлайн-акт обследования с планшета",
                "client_uuid": f"offline-uuid-{uuid.uuid4()}",
                "summary_text": "Заполнено на объекте в офлайн-приложении",
                "answers": [
                    {
                        "question_id": q_id,
                        "value": "Да",
                        "is_compliant": True,
                        "comment": "Синхронизировано при подключении"
                    }
                ]
            }
        ]
    }, headers=headers)
    assert sync_resp.status_code == 200
    assert sync_resp.json()["synced_count"] == 1

    # 12. Create & Delete User test
    new_user_resp = client.post("/api/users", json={
        "username": f"insp_{u_suffix}",
        "password": "Password123!",
        "full_name": "Тестовый Инспектор",
        "role": "inspector",
        "position": "Младший инспектор"
    }, headers=headers)
    assert new_user_resp.status_code == 200
    new_user_id = new_user_resp.json()["id"]

    del_user_resp = client.delete(f"/api/users/{new_user_id}", headers=headers)
    assert del_user_resp.status_code == 200
