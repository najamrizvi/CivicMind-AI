from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db
from app.models.complaint import Complaint
from app.models.user import User
from app.services.status_service import (
    get_allowed_next_statuses,
    validate_status,
)


router = APIRouter(
    prefix="/status",
    tags=["Complaint Status"],
)


@router.get("/{complaint_id}")
def get_complaint_status(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the current status of an authenticated user's complaint.
    """

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id,
        )
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found.",
        )

    try:
        current_status = validate_status(
            complaint.status
        )
    except ValueError:
        raise HTTPException(
            status_code=500,
            detail="Complaint contains an invalid status.",
        )

    return {
        "complaint_id": complaint.id,
        "tracking_number": complaint.receipt_number,
        "status": current_status,
        "allowed_next_statuses": (
            get_allowed_next_statuses(
                current_status
            )
        ),
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }