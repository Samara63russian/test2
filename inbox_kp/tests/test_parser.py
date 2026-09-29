from __future__ import annotations

from app.ai import classify_kind, heuristic_analyze
from app.parser import parse_email
from app.seed import DEMO_EMAILS


def test_parse_russian_headers():
    raw = """От: Иван Петров <ivan@firma.ru>
Тема: Запрос КП на насосы

Прошу коммерческое предложение на насос ЦНС 180-85 — 2 шт.
"""
    parsed = parse_email(raw)
    assert parsed["from_email"] == "ivan@firma.ru"
    assert "насос" in parsed["subject"].lower() or "кп" in parsed["subject"].lower()
    assert "ЦНС" in parsed["body_text"]


def test_parse_rfc822_encoded_subject():
    raw = DEMO_EMAILS[0]
    parsed = parse_email(raw)
    assert parsed["from_email"] == "ivanov@vostok-prom.ru"
    assert "насос" in parsed["body_text"].lower()
    assert parsed["message_id"]


def test_classify_demo_kinds():
    expected = ["kp", "catalog", "inquiry", "kp", "catalog", "other"]
    for raw, kind in zip(DEMO_EMAILS, expected, strict=True):
        parsed = parse_email(raw)
        got = classify_kind(parsed["subject"], parsed["body_text"])
        assert got == kind, (parsed["subject"], got)


def test_heuristic_extracts_company_and_phone():
    parsed = parse_email(DEMO_EMAILS[0])
    analysis = heuristic_analyze(parsed)
    assert analysis["kind"] == "kp"
    assert "Восток" in analysis["company"]
    assert analysis["phone"].startswith("+7")
    assert analysis["summary"]
