from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# ============================================================
# REGISTER
# ============================================================

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


# ============================================================
# LOGIN
# ============================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ============================================================
# PROFILE UPDATE
# ============================================================

class UserProfileUpdate(BaseModel):
    full_name: str


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    profile_picture: str | None
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )