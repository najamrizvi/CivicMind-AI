# ============================================================
# CIVICMIND AI — COMPLAINT SERVICE
# ============================================================
#
# Location:
#   backend/app/services/complaint_service.py
#
# Responsibilities:
#
#   1. Validate complaint input
#   2. Classify complaint
#   3. Predict priority
#   4. Route department
#   5. Create receipt
#   6. Save complaint to PostgreSQL
#   7. Return complete complaint result
#
# ============================================================

from sqlalchemy.orm import Session

from app.models.complaint import Complaint

from app.services.ai_classifier import (
    classify_complaint,
)

from app.services.priority_predictor import (
    predict_priority,
)

from app.services.department_router import (
    route_department,
)

from app.services.receipt_service import (
    create_receipt,
)


# ============================================================
# INPUT VALIDATION
# ============================================================

def _validate_complaint_text(
    complaint_text: str,
) -> str:
    """
    Validate and normalize complaint text.
    """

    if not isinstance(
        complaint_text,
        str,
    ):
        raise ValueError(
            "Complaint text must be a string."
        )

    complaint_text = " ".join(
        complaint_text.strip().split()
    )

    if not complaint_text:
        raise ValueError(
            "Complaint text cannot be empty."
        )

    if len(complaint_text) < 5:
        raise ValueError(
            "Complaint text is too short."
        )

    return complaint_text


# ============================================================
# CONFIDENCE EXTRACTION
# ============================================================

def _extract_confidence(
    result: dict,
) -> float:
    """
    Safely extract and normalize AI confidence.
    """

    try:
        confidence = float(
            result.get(
                "confidence",
                0.0,
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        confidence = 0.0

    return round(
        max(
            0.0,
            min(
                confidence,
                1.0,
            ),
        ),
        2,
    )


# ============================================================
# PROCESS AND SAVE COMPLAINT
# ============================================================

def process_and_save_complaint(
    db: Session,
    user_id: int,
    citizen_name: str,
    citizen_email: str,
    complaint_text: str,
) -> dict:
    """
    Process and persist a CivicMind AI complaint.

    Pipeline:

        Citizen Complaint
              ↓
        AI Classification
              ↓
        Priority Prediction
              ↓
        Department Routing
              ↓
        Database Record
              ↓
        Receipt Generation
              ↓
        Tracking Number
              ↓
        PostgreSQL Commit
              ↓
        Structured Result
    """

    # ========================================================
    # DATABASE VALIDATION
    # ========================================================

    if db is None:
        raise ValueError(
            "Database session is required."
        )

    # ========================================================
    # USER VALIDATION
    # ========================================================

    if not user_id:
        raise ValueError(
            "Authenticated user ID is required."
        )

    # ========================================================
    # CITIZEN VALIDATION
    # ========================================================

    if not isinstance(
        citizen_name,
        str,
    ):
        raise ValueError(
            "Citizen name must be a string."
        )

    if not isinstance(
        citizen_email,
        str,
    ):
        raise ValueError(
            "Citizen email must be a string."
        )

    citizen_name = " ".join(
        citizen_name.strip().split()
    )

    citizen_email = citizen_email.strip()

    if not citizen_name:
        raise ValueError(
            "Citizen name cannot be empty."
        )

    if not citizen_email:
        raise ValueError(
            "Citizen email cannot be empty."
        )

    # ========================================================
    # COMPLAINT VALIDATION
    # ========================================================

    complaint_text = _validate_complaint_text(
        complaint_text
    )

    # ========================================================
    # STEP 1 — AI CLASSIFICATION
    # ========================================================

    classification_result = classify_complaint(
        complaint_text
    )

    category = classification_result.get(
        "category",
        "Other",
    )

    classification_confidence = (
        _extract_confidence(
            classification_result
        )
    )

    # ========================================================
    # STEP 2 — PRIORITY PREDICTION
    # ========================================================

    priority_result = predict_priority(
        complaint_text
    )

    priority = priority_result.get(
        "priority",
        "LOW",
    )

    priority_confidence = (
        _extract_confidence(
            priority_result
        )
    )

    # ========================================================
    # STEP 3 — DEPARTMENT ROUTING
    # ========================================================

    department_result = route_department(
        category,
        complaint_text,
    )

    department = department_result.get(
        "department",
        "General Civic Services",
    )

    department_confidence = (
        _extract_confidence(
            department_result
        )
    )

    # ========================================================
    # STEP 4 — CREATE DATABASE RECORD
    # ========================================================
    #
    # The real complaint ID is generated by PostgreSQL.
    # Therefore, receipt_number temporarily uses PENDING.
    #
    # ========================================================

    complaint = Complaint(
        complaint_text=complaint_text,
        category=category,
        priority=priority,
        department=department,
        status="submitted",
        receipt_number="PENDING",
        user_id=user_id,
    )

    db.add(
        complaint
    )

    # ========================================================
    # STEP 5 — FLUSH
    # ========================================================
    #
    # Flush sends the INSERT to PostgreSQL and assigns
    # complaint.id without committing the transaction.
    #
    # ========================================================

    db.flush()

    # ========================================================
    # STEP 6 — CREATE RECEIPT
    # ========================================================

    receipt = create_receipt(
        complaint_id=complaint.id,
        citizen_name=citizen_name,
        citizen_email=citizen_email,
        complaint_text=complaint_text,
        category=category,
        priority=priority,
        department=department,
        classification_confidence=(
            classification_confidence
        ),
        priority_confidence=(
            priority_confidence
        ),
        department_confidence=(
            department_confidence
        ),
    )

    # ========================================================
    # STEP 7 — STORE TRACKING NUMBER
    # ========================================================

    tracking_number = receipt.get(
        "tracking_number"
    )

    if not tracking_number:
        db.rollback()

        raise ValueError(
            "Receipt generation failed: "
            "tracking number was not created."
        )

    complaint.receipt_number = (
        tracking_number
    )

    # ========================================================
    # STEP 8 — COMMIT
    # ========================================================

    try:
        db.commit()

    except Exception:
        db.rollback()
        raise

    # ========================================================
    # STEP 9 — REFRESH
    # ========================================================

    db.refresh(
        complaint
    )

    # ========================================================
    # STEP 10 — RETURN RESULT
    # ========================================================
    #
    # IMPORTANT:
    #
    # The API schema uses:
    #
    #     complaint_text
    #
    # Therefore we MUST return complaint_text here.
    #
    # Do NOT change this back to "description".
    #
    # ========================================================

    return {
        "complaint": {
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
        },

        "ai_analysis": {
            "classification": (
                classification_result
            ),
            "priority": (
                priority_result
            ),
            "department": (
                department_result
            ),
        },

        "receipt": receipt,
    }