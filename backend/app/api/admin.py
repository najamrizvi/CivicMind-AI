from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.database import get_db

from app.models.complaint import Complaint
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.user import User

from app.schemas.admin import ComplaintStatusUpdate
from app.schemas.analytics import (
    AnalyticsOverview,
    AnalyticsResponse,
)
from app.schemas.status_history import (
    ComplaintHistoryResponse,
    StatusHistoryResponse,
)
from app.schemas.insights import InsightsResponse
from app.services.insights_service import generate_insights
from app.services.ai_reasoning_service import (
    AIReasoningError,
    ai_reasoning_service,
)

from app.services.status_service import validate_transition


router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
)


def require_admin(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )

    return current_user


@router.get("/test")
def admin_test(
    admin_user: User = Depends(require_admin),
):
    return {
        "message": "Admin authentication successful.",
        "admin_id": admin_user.id,
        "admin_email": admin_user.email,
    }


@router.get("/complaints")
def get_all_complaints(
    status: Optional[str] = Query(
        default=None,
        description="Filter complaints by status.",
    ),
    priority: Optional[str] = Query(
        default=None,
        description="Filter complaints by priority.",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter complaints by category.",
    ),
    department: Optional[str] = Query(
        default=None,
        description="Filter complaints by department.",
    ),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)

    if status:
        query = query.filter(
            Complaint.status
            == status.strip()
        )

    if priority:
        query = query.filter(
            Complaint.priority
            == priority.strip()
        )

    if category:
        query = query.filter(
            Complaint.category
            == category.strip()
        )

    if department:
        query = query.filter(
            Complaint.department
            == department.strip()
        )

    complaints = (
        query
        .order_by(
            Complaint.created_at.desc()
        )
        .all()
    )

    return {
        "total": len(complaints),
        "complaints": [
            {
                "id": complaint.id,
                "user_id": complaint.user_id,
                "complaint_text": (
                    complaint.complaint_text
                ),
                "category": complaint.category,
                "priority": complaint.priority,
                "department": complaint.department,
                "status": complaint.status,
                "receipt_number": (
                    complaint.receipt_number
                ),
                "created_at": (
                    complaint.created_at
                ),
                "updated_at": (
                    complaint.updated_at
                ),
            }
            for complaint in complaints
        ],
    }

@router.get("/analytics", response_model=AnalyticsResponse)
def get_admin_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )

    complaints = db.query(Complaint).all()

    total_complaints = len(complaints)

    by_status = {}
    by_priority = {}
    by_category = {}
    by_department = {}

    for complaint in complaints:
        status_value = complaint.status.upper() if complaint.status else "UNKNOWN"
        priority_value = complaint.priority.upper() if complaint.priority else "UNKNOWN"
        category_value = complaint.category or "Unknown"
        department_value = complaint.department or "Unknown"

        by_status[status_value] = by_status.get(status_value, 0) + 1
        by_priority[priority_value] = by_priority.get(priority_value, 0) + 1
        by_category[category_value] = by_category.get(category_value, 0) + 1
        by_department[department_value] = (
            by_department.get(department_value, 0) + 1
        )

    resolved_complaints = by_status.get("RESOLVED", 0)
    closed_complaints = by_status.get("CLOSED", 0)

    open_complaints = (
        total_complaints
        - resolved_complaints
        - closed_complaints
    )

    high_priority_complaints = by_priority.get("HIGH", 0)

    return AnalyticsResponse(
        overview=AnalyticsOverview(
            total_complaints=total_complaints,
            open_complaints=open_complaints,
            resolved_complaints=resolved_complaints,
            closed_complaints=closed_complaints,
            high_priority_complaints=high_priority_complaints,
        ),
        by_status=by_status,
        by_priority=by_priority,
        by_category=by_category,
        by_department=by_department,
    )

@router.get(
    "/insights",
    response_model=InsightsResponse,
)
def get_admin_insights(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    insights = generate_insights(db)

    total_complaints = (
        db.query(Complaint)
        .count()
    )

    if total_complaints == 0:
        summary = "There are currently no complaints available for analysis."
    else:
        summary = (
            f"CivicMind AI analyzed {total_complaints} "
            "complaint(s) and generated actionable administrative insights."
        )

    return InsightsResponse(
        summary=summary,
        insights=insights,
    )

@router.get("/ai-analysis")
def get_admin_ai_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )

    complaints = db.query(Complaint).all()

    total_complaints = len(complaints)

    by_status = {}
    by_priority = {}
    by_category = {}
    by_department = {}

    for complaint in complaints:
        status_value = (
            complaint.status.upper()
            if complaint.status
            else "UNKNOWN"
        )

        priority_value = (
            complaint.priority.upper()
            if complaint.priority
            else "UNKNOWN"
        )

        category_value = (
            complaint.category
            or "Unknown"
        )

        department_value = (
            complaint.department
            or "Unknown"
        )

        by_status[status_value] = (
            by_status.get(status_value, 0) + 1
        )

        by_priority[priority_value] = (
            by_priority.get(priority_value, 0) + 1
        )

        by_category[category_value] = (
            by_category.get(category_value, 0) + 1
        )

        by_department[department_value] = (
            by_department.get(department_value, 0) + 1
        )

    resolved_complaints = by_status.get(
        "RESOLVED",
        0,
    )

    closed_complaints = by_status.get(
        "CLOSED",
        0,
    )

    open_complaints = (
        total_complaints
        - resolved_complaints
        - closed_complaints
    )

    high_priority_complaints = by_priority.get(
        "HIGH",
        0,
    )

    dominant_category = (
        max(
            by_category,
            key=by_category.get,
        )
        if by_category
        else "None"
    )

    dominant_department = (
        max(
            by_department,
            key=by_department.get,
        )
        if by_department
        else "None"
    )

    analytics = {
        "total_complaints": total_complaints,
        "open_complaints": open_complaints,
        "resolved_complaints": resolved_complaints,
        "closed_complaints": closed_complaints,
        "high_priority_complaints": high_priority_complaints,
        "dominant_category": dominant_category,
        "dominant_department": dominant_department,
    }

    try:
        ai_reasoning = (
            ai_reasoning_service.generate_reasoning(
                analytics
            )
        )

    except AIReasoningError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return {
        "summary": (
            "CivicMind AI generated administrative "
            "reasoning from current complaint analytics."
        ),
        "analytics": analytics,
        "ai_reasoning": ai_reasoning,
    }

@router.get("/complaints/{complaint_id}")
def get_admin_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found.",
        )

    return {
        "id": complaint.id,
        "user_id": complaint.user_id,
        "complaint_text": complaint.complaint_text,
        "category": complaint.category,
        "priority": complaint.priority,
        "department": complaint.department,
        "status": complaint.status,
        "receipt_number": complaint.receipt_number,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
    }

@router.get(
    "/complaints/{complaint_id}/history",
    response_model=ComplaintHistoryResponse,
)
def get_complaint_status_history(
    complaint_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found.",
        )

    history_records = (
        db.query(ComplaintStatusHistory)
        .filter(
            ComplaintStatusHistory.complaint_id == complaint_id
        )
        .order_by(
            ComplaintStatusHistory.created_at.asc(),
            ComplaintStatusHistory.id.asc(),
        )
        .all()
    )

    return ComplaintHistoryResponse(
        complaint_id=complaint_id,
        history=history_records,
    )

@router.get("/statistics")
def get_admin_statistics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_complaints = (
        db.query(Complaint)
        .count()
    )

    submitted = (
        db.query(Complaint)
        .filter(
            Complaint.status == "submitted"
        )
        .count()
    )

    under_review = (
        db.query(Complaint)
        .filter(
            Complaint.status == "UNDER_REVIEW"
        )
        .count()
    )

    in_progress = (
        db.query(Complaint)
        .filter(
            Complaint.status == "IN_PROGRESS"
        )
        .count()
    )

    resolved = (
        db.query(Complaint)
        .filter(
            Complaint.status == "RESOLVED"
        )
        .count()
    )

    closed = (
        db.query(Complaint)
        .filter(
            Complaint.status == "CLOSED"
        )
        .count()
    )

    high_priority = (
        db.query(Complaint)
        .filter(
            Complaint.priority == "HIGH"
        )
        .count()
    )

    medium_priority = (
        db.query(Complaint)
        .filter(
            Complaint.priority == "MEDIUM"
        )
        .count()
    )

    low_priority = (
        db.query(Complaint)
        .filter(
            Complaint.priority == "LOW"
        )
        .count()
    )

    return {
        "total_complaints": total_complaints,
        "status": {
            "submitted": submitted,
            "under_review": under_review,
            "in_progress": in_progress,
            "resolved": resolved,
            "closed": closed,
        },
        "priority": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority,
        },
    }


@router.patch("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found.",
        )

    try:
        current_status, new_status = validate_transition(
            complaint.status,
            status_data.status,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    complaint.status = new_status

    history_record = ComplaintStatusHistory(
        complaint_id=complaint.id,
        previous_status=current_status,
        new_status=new_status,
        changed_by=admin_user.id,
        note=status_data.note,
    )

    db.add(history_record)

    try:
        db.commit()
        db.refresh(complaint)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update complaint status.",
        )

    return {
        "message": "Complaint status updated successfully.",
        "complaint_id": complaint.id,
        "tracking_number": complaint.receipt_number,
        "previous_status": current_status,
        "new_status": complaint.status,
        "updated_at": complaint.updated_at,
    }