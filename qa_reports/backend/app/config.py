from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "qa-reports-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "sqlite:///./qa_reports.db"
    cors_origins: str = "*"

    class Config:
        env_file = ".env"


settings = Settings()
