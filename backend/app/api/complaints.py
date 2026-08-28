# ============================================================
# CIVICMIND AI — COMPLAINT API
# ============================================================
#
# File:
#   backend/app/api/complaints.py
#
# Endpoints:
#
#   POST /complaints/
#       Submit a new authenticated citizen complaint
#
#   GET /complaints/my
#       Get all complaints belonging to current citizen
#
#   GET /complaints/track/{receipt_number}
#       Track one complaint using its public receipt number
#
#   GET /complaints/{complaint_id}
#       Get one complaint using its database ID
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
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintResponse,
)
from app.services.complaint_service import (
    process_and_save_complaint,
)


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(__name__)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)


# ============================================================
# SUBMIT COMPLAINT
# ============================================================

@router.post(
    "/",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_complaint(
    complaint_data: ComplaintCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Submit a new complaint for the authenticated citizen.

    The frontend only provides complaint_text.

    The backend automatically obtains:

        • user_id
        • citizen name
        • citizen email

    from the authenticated JWT/user.

    The complaint service then performs:

        • AI classification
        • Priority prediction
        • Department routing
        • Receipt generation
        • PostgreSQL persistence
    """

    try:

        # ----------------------------------------------------
        # PROCESS COMPLAINT
        # ----------------------------------------------------

        result = process_and_save_complaint(
            db=db,
            user_id=current_user.id,
            citizen_name=current_user.full_name,
            citizen_email=current_user.email,
            complaint_text=complaint_data.complaint_text,
        )

        # ----------------------------------------------------
        # EXTRACT SAVED COMPLAINT
        # ----------------------------------------------------

        complaint_data_response = result.get(
            "complaint"
        )

        if not complaint_data_response:

            logger.error(
                "Complaint service returned no complaint "
                "for user_id=%s",
                current_user.id,
            )

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Complaint was processed but no "
                    "complaint record was returned."
                ),
            )

        # ----------------------------------------------------
        # RETURN DATABASE COMPLAINT
        # ----------------------------------------------------

        return complaint_data_response

    # --------------------------------------------------------
    # VALIDATION ERRORS FROM SERVICE
    # --------------------------------------------------------

    except ValueError as exc:

        db.rollback()

        logger.warning(
            "Complaint validation failed for user_id=%s: %s",
            current_user.id,
            str(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    # --------------------------------------------------------
    # DATABASE ERRORS
    # --------------------------------------------------------

    except SQLAlchemyError as exc:

        db.rollback()

        logger.exception(
            "Database error while submitting complaint "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "A database error occurred while "
                "saving the complaint."
            ),
        ) from exc

    # --------------------------------------------------------
    # HTTP ERRORS
    # --------------------------------------------------------

    except HTTPException:
        raise

    # --------------------------------------------------------
    # UNEXPECTED ERRORS
    # --------------------------------------------------------

    except Exception as exc:

        db.rollback()

        logger.exception(
            "Unexpected error while submitting complaint "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to process the complaint "
                "at this time."
            ),
        ) from exc


# ============================================================
# GET MY COMPLAINTS
# ============================================================

@router.get(
    "/my",
    response_model=list[ComplaintResponse],
)
def get_my_complaints(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Return all complaints submitted by the
    currently authenticated citizen.
    """

    try:

        complaints = (
            db.query(Complaint)
            .filter(
                Complaint.user_id
                == current_user.id
            )
            .order_by(
                Complaint.created_at.desc()
            )
            .all()
        )

        return complaints

    except SQLAlchemyError as exc:

        logger.exception(
            "Database error while retrieving complaints "
            "for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to retrieve complaints "
                "at this time."
            ),
        ) from exc


# ============================================================
# TRACK COMPLAINT BY RECEIPT NUMBER
# ============================================================

@router.get(
    "/track/{receipt_number}",
    response_model=ComplaintResponse,
)
def track_complaint(
    receipt_number: str,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Track one complaint using its receipt number.

    Example:

        GET /complaints/track/CM-2026-0001

    The complaint must belong to the currently
    authenticated citizen.
    """

    try:

        # ----------------------------------------------------
        # CLEAN RECEIPT NUMBER
        # ----------------------------------------------------

        cleaned_receipt_number = (
            receipt_number.strip()
        )

        if not cleaned_receipt_number:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complaint ID cannot be empty.",
            )

        # ----------------------------------------------------
        # FIND COMPLAINT
        # ----------------------------------------------------

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.receipt_number
                == cleaned_receipt_number,
                Complaint.user_id
                == current_user.id,
            )
            .first()
        )

        # ----------------------------------------------------
        # NOT FOUND
        # ----------------------------------------------------

        if not complaint:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Complaint not found. "
                    "Please check your complaint ID."
                ),
            )

        # ----------------------------------------------------
        # RETURN COMPLAINT
        # ----------------------------------------------------

        return complaint

    except HTTPException:
        raise

    except SQLAlchemyError as exc:

        logger.exception(
            "Database error while tracking complaint "
            "receipt=%s for user_id=%s",
            receipt_number,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to track the complaint "
                "at this time."
            ),
        ) from exc


# ============================================================
# GET SINGLE COMPLAINT BY DATABASE ID
# ============================================================

@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
def get_complaint(
    complaint_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    """
    Return one complaint using its database ID.

    Citizens can only access their own complaints.
    """

    try:

        # ----------------------------------------------------
        # FIND COMPLAINT
        # ----------------------------------------------------

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.id
                == complaint_id,
                Complaint.user_id
                == current_user.id,
            )
            .first()
        )

        # ----------------------------------------------------
        # NOT FOUND
        # ----------------------------------------------------

        if not complaint:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        # ----------------------------------------------------
        # RETURN COMPLAINT
        # ----------------------------------------------------

        return complaint

    except HTTPException:
        raise

    except SQLAlchemyError as exc:

        logger.exception(
            "Database error while retrieving complaint "
            "id=%s for user_id=%s",
            complaint_id,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to retrieve the complaint "
                "at this time."
            ),
        ) from exc