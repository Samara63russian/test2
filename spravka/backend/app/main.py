from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine, SessionLocal
from .routers import auth, dictionary, institutions, misc, questions, reports, users
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_if_empty(db)

app = FastAPI(title="Система сводных справок", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(institutions.router)
app.include_router(dictionary.router)
app.include_router(questions.router)
app.include_router(reports.router)
app.include_router(misc.router)

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend" / "dist"
APK_PATH = Path(__file__).resolve().parents[2] / "android" / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/apk")
def download_apk():
    if APK_PATH.exists():
        return FileResponse(APK_PATH, filename="spravka.apk", media_type="application/vnd.android.package-archive")
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="APK ещё не собран. См. spravka/android.")


if FRONTEND_DIR.exists():
    assets = FRONTEND_DIR / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        file_path = FRONTEND_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")
