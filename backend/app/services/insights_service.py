from collections import Counter

from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.schemas.insights import InsightItem


def generate_insights(db: Session) -> list[InsightItem]:
    complaints = db.query(Complaint).all()

    if not complaints:
        return [
            InsightItem(
                type="SYSTEM",
                severity="INFO",
                title="No Complaint Data",
                message=(
                    "There are currently no complaints available "
                    "for analysis."
                ),
                reason="The complaint database currently contains no records.",
                recommendation=(
                    "Continue monitoring the system as complaints "
                    "are submitted."
                ),
            )
        ]

    total_complaints = len(complaints)

    priority_counts = Counter(
        complaint.priority.upper()
        for complaint in complaints
        if complaint.priority
    )

    category_counts = Counter(
        complaint.category
        for complaint in complaints
        if complaint.category
    )

    department_counts = Counter(
        complaint.department
        for complaint in complaints
        if complaint.department
    )

    status_counts = Counter(
        complaint.status.upper()
        for complaint in complaints
        if complaint.status
    )

    insights: list[InsightItem] = []

    # ---------------------------------------------------------
    # Priority Insight
    # ---------------------------------------------------------

    if priority_counts:
        priority_name, priority_count = (
            priority_counts.most_common(1)[0]
        )

        if priority_name == "HIGH":
            severity = "HIGH"

            if priority_count == total_complaints:
                message = (
                    f"All {total_complaints} recorded complaints "
                    "are classified as high priority."
                )
                reason = (
                    f"{priority_count} of {total_complaints} complaints "
                    "have a HIGH priority classification, representing "
                    "100% of the current complaint volume."
                )
            else:
                message = (
                    f"{priority_count} of {total_complaints} "
                    "complaints are classified as high priority."
                )
                reason = (
                    f"High-priority complaints represent "
                    f"{priority_count / total_complaints:.0%} "
                    "of the current complaint volume."
                )

            insights.append(
                InsightItem(
                    type="PRIORITY",
                    severity=severity,
                    title="High Priority Concentration",
                    message=message,
                    reason=reason,
                    recommendation=(
                        "Administrative teams should prioritize rapid "
                        "review, departmental assignment, and resolution "
                        "of high-priority complaints."
                    ),
                )
            )

    # ---------------------------------------------------------
    # Category Insight
    # ---------------------------------------------------------

    if category_counts:
        category_name, category_count = (
            category_counts.most_common(1)[0]
        )

        category_ratio = category_count / total_complaints

        if category_count == total_complaints:
            severity = "HIGH"
        elif category_ratio >= 0.5:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        insights.append(
            InsightItem(
                type="CATEGORY",
                severity=severity,
                title="Dominant Complaint Category",
                message=(
                    f"{category_name} is currently the most reported "
                    f"complaint category with {category_count} "
                    f"complaint(s)."
                ),
                reason=(
                    f"{category_name} accounts for "
                    f"{category_ratio:.0%} of all recorded complaints."
                ),
                recommendation=(
                    f"Monitor {category_name} complaints closely and "
                    "consider targeted preventive action if the pattern "
                    "continues."
                ),
            )
        )

    # ---------------------------------------------------------
    # Department Insight
    # ---------------------------------------------------------

    if department_counts:
        department_name, department_count = (
            department_counts.most_common(1)[0]
        )

        department_ratio = department_count / total_complaints

        if department_count == total_complaints:
            severity = "HIGH"
        elif department_ratio >= 0.5:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        insights.append(
            InsightItem(
                type="DEPARTMENT",
                severity=severity,
                title="Department Workload",
                message=(
                    f"{department_name} is currently associated with "
                    f"{department_count} complaint(s)."
                ),
                reason=(
                    f"{department_name} is associated with "
                    f"{department_ratio:.0%} of all recorded complaints."
                ),
                recommendation=(
                    f"Review the workload of {department_name} and "
                    "ensure sufficient resources are available to "
                    "handle the current complaint volume."
                ),
            )
        )

    # ---------------------------------------------------------
    # Status Insight
    # ---------------------------------------------------------

    open_statuses = {
        "SUBMITTED",
        "UNDER_REVIEW",
        "IN_PROGRESS",
    }

    open_complaints = sum(
        count
        for status_name, count in status_counts.items()
        if status_name in open_statuses
    )

    if open_complaints > 0:
        open_ratio = open_complaints / total_complaints

        if open_ratio >= 0.75:
            severity = "HIGH"
        elif open_ratio >= 0.5:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        insights.append(
            InsightItem(
                type="STATUS",
                severity=severity,
                title="Open Complaints",
                message=(
                    f"{open_complaints} of {total_complaints} "
                    "complaints are currently open and require "
                    "attention."
                ),
                reason=(
                    f"Open complaints represent "
                    f"{open_ratio:.0%} of the current complaint volume."
                ),
                recommendation=(
                    "Prioritize unresolved complaints and monitor "
                    "their progress through the administrative "
                    "status workflow."
                ),
            )
        )

    # ---------------------------------------------------------
    # Resolution Insight
    # ---------------------------------------------------------

    resolved_complaints = (
        status_counts.get("RESOLVED", 0)
        + status_counts.get("CLOSED", 0)
    )

    if resolved_complaints > 0:
        resolution_ratio = (
            resolved_complaints / total_complaints
        )

        if resolution_ratio < 0.25:
            severity = "HIGH"
        elif resolution_ratio < 0.5:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        insights.append(
            InsightItem(
                type="RESOLUTION",
                severity=severity,
                title="Resolution Activity",
                message=(
                    f"{resolved_complaints} of {total_complaints} "
                    "complaints have reached a resolved or closed "
                    "status."
                ),
                reason=(
                    f"Only {resolution_ratio:.0%} of recorded complaints "
                    "have reached a resolved or closed status."
                ),
                recommendation=(
                    "Review unresolved complaints and identify "
                    "bottlenecks that may be delaying resolution."
                ),
            )
        )

    return insights