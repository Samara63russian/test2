from __future__ import annotations

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


TEST_DATABASE = Path(__file__).parent / "test-reports.db"
os.environ["DATABASE_PATH"] = str(TEST_DATABASE)

from backend.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def clean_database() -> None:
    TEST_DATABASE.unlink(missing_ok=True)
    yield
    TEST_DATABASE.unlink(missing_ok=True)


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def admin_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}


@pytest.fixture()
def operator_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": "operator", "password": "operator123"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}
