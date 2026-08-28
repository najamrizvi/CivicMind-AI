from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings

from app.database.database import Base, engine

from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.api.tracking import router as tracking_router
from app.api.status import router as status_router
from app.api.admin import router as admin_router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered civic intelligence and "
        "complaint management platform."
    ),
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# STATIC FILES
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=str(UPLOAD_DIR)
    ),
    name="uploads",
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(tracking_router)
app.include_router(status_router)
app.include_router(admin_router)


# ============================================================
# DATABASE STARTUP
# ============================================================

@app.on_event("startup")
def startup():
    Base.metadata.create_all(
        bind=engine
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def health_check():
    return {
        "message": (
            "CivicMind AI backend is "
            "running successfully."
        ),
        "version": settings.APP_VERSION,
    }