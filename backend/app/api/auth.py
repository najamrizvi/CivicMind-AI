import logging
import os
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserProfileUpdate,
    UserResponse,
)


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(__name__)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# PROFILE IMAGE CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

PROFILE_UPLOAD_DIR = (
    BASE_DIR
    / "uploads"
    / "profile_pictures"
)

PROFILE_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new CivicMind AI citizen.
    """

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An account with this email "
                "already exists."
            ),
        )

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(
            user_data.password
        ),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate a CivicMind AI citizen.
    """

    user = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        user_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
        },
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return the currently authenticated citizen.
    """

    return current_user


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put(
    "/profile",
    response_model=UserResponse,
)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Update the authenticated citizen's profile.
    """

    full_name = profile_data.full_name.strip()

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name cannot be empty.",
        )

    if len(full_name) > 150:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Full name cannot exceed "
                "150 characters."
            ),
        )

    current_user.full_name = full_name

    db.commit()
    db.refresh(current_user)

    return current_user


# ============================================================
# UPLOAD PROFILE PICTURE
# ============================================================

@router.post(
    "/profile-picture",
    response_model=UserResponse,
)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Upload or replace the authenticated
    citizen's profile picture.
    """

    # --------------------------------------------------------
    # VALIDATE CONTENT TYPE
    # --------------------------------------------------------

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid image format. "
                "Please upload a JPG, PNG, "
                "or WEBP image."
            ),
        )

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    file_data = await file.read()

    if not file_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty.",
        )

    # --------------------------------------------------------
    # VALIDATE SIZE
    # --------------------------------------------------------

    if len(file_data) > MAX_PROFILE_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "Profile picture must be "
                "5 MB or smaller."
            ),
        )

    # --------------------------------------------------------
    # CREATE UNIQUE FILENAME
    # --------------------------------------------------------

    extension = ALLOWED_IMAGE_TYPES[
        file.content_type
    ]

    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    destination = (
        PROFILE_UPLOAD_DIR
        / unique_filename
    )

    # --------------------------------------------------------
    # DELETE OLD PROFILE PICTURE
    # --------------------------------------------------------

    if current_user.profile_picture:

        old_filename = (
            Path(
                current_user.profile_picture
            ).name
        )

        old_file = (
            PROFILE_UPLOAD_DIR
            / old_filename
        )

        try:

            if old_file.exists():
                old_file.unlink()

        except OSError:
            logger.warning(
                "Unable to delete old profile picture "
                "for user_id=%s",
                current_user.id,
            )

    # --------------------------------------------------------
    # SAVE NEW IMAGE
    # --------------------------------------------------------

    try:

        destination.write_bytes(
            file_data
        )

    except OSError as exc:

        logger.exception(
            "Unable to save profile picture "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to save the profile picture."
            ),
        ) from exc

    # --------------------------------------------------------
    # SAVE DATABASE PATH
    # --------------------------------------------------------

    current_user.profile_picture = (
        f"/uploads/profile_pictures/"
        f"{unique_filename}"
    )

    db.commit()
    db.refresh(current_user)

    return current_user


# ============================================================
# DELETE PROFILE PICTURE
# ============================================================

@router.delete(
    "/profile-picture",
    response_model=UserResponse,
)
def delete_profile_picture(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Remove the authenticated citizen's
    profile picture.
    """

    if not current_user.profile_picture:
        return current_user

    filename = (
        Path(
            current_user.profile_picture
        ).name
    )

    image_path = (
        PROFILE_UPLOAD_DIR
        / filename
    )

    try:

        if image_path.exists():
            image_path.unlink()

    except OSError:
        logger.warning(
            "Unable to delete profile picture "
            "for user_id=%s",
            current_user.id,
        )

    current_user.profile_picture = None

    db.commit()
    db.refresh(current_user)

    return current_user