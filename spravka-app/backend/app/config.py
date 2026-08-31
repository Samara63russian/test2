from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Сводные справки"
    secret_key: str = "spravka-dev-secret-change-in-production-7de6"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = f"sqlite:///{Path(__file__).resolve().parent.parent / 'data' / 'spravka.db'}"
    cors_origins: list[str] = ["*"]
    admin_username: str = "admin"
    admin_password: str = "admin123"


settings = Settings()
