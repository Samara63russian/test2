from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.seed import DEMO_EMAILS


client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_ingest_creates_card_and_dedupes():
    raw = DEMO_EMAILS[0]
    first = client.post("/api/requests/ingest", json={"raw": raw, "source": "paste"})
    assert first.status_code == 200
    body = first.json()
    assert body["created"] is True
    assert body["item"]["kind"] == "kp"
    assert body["item"]["summary"]
    assert body["item"]["company"]

    second = client.post("/api/requests/ingest", json={"raw": raw, "source": "paste"})
    assert second.json()["created"] is False
    assert second.json()["item"]["id"] == body["item"]["id"]


def test_plain_inquiry_and_status_patch():
    raw = """Тема: Подскажите по отгрузке
От: client@mail.ru

Подскажите, когда будет отгрузка оплаченного счёта?
"""
    res = client.post("/api/requests/ingest", json={"raw": raw})
    assert res.status_code == 200
    item = res.json()["item"]
    assert item["kind"] == "inquiry"
    patched = client.patch(f"/api/requests/{item['id']}", json={"status": "in_progress", "notes": "перезвонил"})
    assert patched.status_code == 200
    assert patched.json()["status"] == "in_progress"
    assert patched.json()["notes"] == "перезвонил"


def test_stats_and_filters():
    client.post("/api/demo")
    stats = client.get("/api/stats").json()
    assert stats["total"] >= 3
    catalog = client.get("/api/requests", params={"kind": "catalog"}).json()
    assert catalog["count"] >= 1
    assert all(item["kind"] == "catalog" for item in catalog["items"])


def test_upload_eml():
    raw = DEMO_EMAILS[1].encode("utf-8")
    res = client.post("/api/requests/upload", files={"file": ("mail.eml", raw, "message/rfc822")})
    assert res.status_code == 200
    assert res.json()["item"]["kind"] == "catalog"


def test_ui_served():
    res = client.get("/")
    assert res.status_code == 200
    assert "Конспект" in res.text
