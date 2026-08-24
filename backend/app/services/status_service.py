VALID_STATUSES = {
    "SUBMITTED",
    "UNDER_REVIEW",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
}


ALLOWED_TRANSITIONS = {
    "SUBMITTED": [
        "UNDER_REVIEW",
    ],
    "UNDER_REVIEW": [
        "IN_PROGRESS",
    ],
    "IN_PROGRESS": [
        "RESOLVED",
    ],
    "RESOLVED": [
        "CLOSED",
    ],
    "CLOSED": [],
}


def validate_status(status: str) -> str:
    if not isinstance(status, str):
        raise ValueError("Status must be a string.")

    normalized_status = status.strip().upper()

    if normalized_status not in VALID_STATUSES:
        raise ValueError(
            f"Invalid status: {status}."
        )

    return normalized_status


def is_valid_transition(
    current_status: str,
    new_status: str,
) -> bool:
    current_status = validate_status(current_status)
    new_status = validate_status(new_status)

    return new_status in ALLOWED_TRANSITIONS.get(
        current_status,
        [],
    )


def validate_transition(
    current_status: str,
    new_status: str,
) -> tuple[str, str]:
    current_status = validate_status(current_status)
    new_status = validate_status(new_status)

    if not is_valid_transition(
        current_status,
        new_status,
    ):
        raise ValueError(
            f"Invalid status transition: "
            f"{current_status} -> {new_status}."
        )

    return current_status, new_status


def get_allowed_next_statuses(
    current_status: str,
) -> list[str]:
    current_status = validate_status(current_status)

    return ALLOWED_TRANSITIONS.get(
        current_status,
        [],
    )