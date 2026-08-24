from datetime import datetime, timedelta, timezone

import jwt

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from pwdlib import PasswordHash

from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.database import get_db
from app.models.user import User


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Securely hash a user's password before storing it.
    """
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain password against its stored hash.
    """
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


# ============================================================
# JWT CONFIGURATION
# ============================================================

JWT_SECRET_KEY = settings.JWT_SECRET_KEY

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# HTTP BEARER AUTHENTICATION
# ============================================================

security = HTTPBearer()


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a signed JWT access token.
    """

    to_encode = data.copy()

    if expires_delta:
        expire = (
            datetime.now(timezone.utc)
            + expires_delta
        )
    else:
        expire = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    to_encode.update(
        {
            "exp": expire,
        }
    )

    return jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.
    """

    return jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM],
    )


# ============================================================
# GET CURRENT AUTHENTICATED USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate the JWT access token and return
    the authenticated CivicMind user.
    """

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        # ------------------------------------------------------
        # Decode JWT
        # ------------------------------------------------------

        payload = decode_access_token(token)

        # ------------------------------------------------------
        # Extract user ID
        # ------------------------------------------------------

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_exception

        user_id = int(user_id)

    except (
        jwt.ExpiredSignatureError,
        jwt.InvalidTokenError,
        ValueError,
        TypeError,
    ):
        raise credentials_exception

    # ----------------------------------------------------------
    # Find user in PostgreSQL
    # ----------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise credentials_exception

    # ----------------------------------------------------------
    # Check account status
    # ----------------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user