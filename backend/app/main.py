from fastapi import FastAPI

from app.core.config import settings
from app.database.database import Base, engine
from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.api.tracking import router as tracking_router
from app.api.status import router as status_router
from app.api.admin import router as admin_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered civic intelligence and "
        "complaint management platform."
    ),
)

app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(tracking_router)
app.include_router(status_router)
app.include_router(admin_router)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {
        "message": "CivicMind AI backend is running successfully.",
        "version": settings.APP_VERSION,
    }