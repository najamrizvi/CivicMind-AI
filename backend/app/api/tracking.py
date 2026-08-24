# ============================================================
# CIVICMIND AI — COMPLAINT TRACKING API
# ============================================================
#
# Location:
#   backend/app/api/tracking.py
#
# Responsibilities:
#
#   1. Track a complaint using its tracking number
#   2. Ensure citizens can only track their own complaints
#   3. Return complaint status and AI routing information
#   4. Provide a clean tracking response
#
# ============================================================

import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.models.complaint import Complaint
from app.models.user import User


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(__name__)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/tracking",
    tags=["Complaint Tracking"],
)


# ============================================================
# TRACK COMPLAINT
# ============================================================

@router.get(
    "/{tracking_number}",
)
def track_complaint(
    tracking_number: str,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Track an authenticated citizen's complaint
    using its CivicMind AI tracking number.

    Example:

        GET /tracking/CMA-20260823-FC0CB6

    Citizens can only access complaints that belong
    to their own account.
    """

    # --------------------------------------------------------
    # VALIDATE TRACKING NUMBER
    # --------------------------------------------------------

    tracking_number = tracking_number.strip()

    if not tracking_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tracking number is required.",
        )

    # --------------------------------------------------------
    # DATABASE LOOKUP
    # --------------------------------------------------------

    try:

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.receipt_number
                == tracking_number,
                Complaint.user_id
                == current_user.id,
            )
            .first()
        )

    except SQLAlchemyError as exc:

        logger.exception(
            "Database error while tracking complaint "
            "tracking_number=%s user_id=%s",
            tracking_number,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to retrieve complaint "
                "tracking information."
            ),
        ) from exc

    # --------------------------------------------------------
    # COMPLAINT NOT FOUND
    # --------------------------------------------------------

    if not complaint:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Complaint not found for the "
                "provided tracking number."
            ),
        )

    # --------------------------------------------------------
    # TRACKING RESPONSE
    # --------------------------------------------------------

    return {
        "tracking_number": (
            complaint.receipt_number
        ),

        "complaint_id": (
            complaint.id
        ),

        "status": (
            complaint.status
        ),

        "complaint_text": (
            complaint.complaint_text
        ),

        "category": (
            complaint.category
        ),

        "priority": (
            complaint.priority
        ),

        "department": (
            complaint.department
        ),

        "submitted_at": (
            complaint.created_at
        ),

        "last_updated": (
            complaint.updated_at
        ),

        "user_id": (
            complaint.user_id
        ),
    }