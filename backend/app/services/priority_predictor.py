# ============================================================
# CIVICMIND AI — PRIORITY PREDICTOR
# ============================================================
#
# Purpose:
#   Determine the urgency of a citizen complaint.
#
# Priority levels:
#   LOW
#   MEDIUM
#   HIGH
#   CRITICAL
#
# Design principles:
#   - Severity-aware
#   - Safety-aware
#   - Health-aware
#   - Community-impact aware
#   - Service-interruption aware
#   - Duration-aware
#   - Explainable
#   - Deterministic
#   - Easy to replace with an ML model later
#
# ============================================================

from typing import Dict


# ============================================================
# PRIORITY LEVELS
# ============================================================

PRIORITY_LEVELS = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]


# ============================================================
# PRIORITY THRESHOLDS
# ============================================================

PRIORITY_THRESHOLDS = {
    "LOW": 0,
    "MEDIUM": 25,
    "HIGH": 50,
    "CRITICAL": 75,
}


# ============================================================
# PRIORITY SIGNALS
# ============================================================
#
# Each signal contributes its score only once, even if
# multiple keywords belonging to that signal are detected.
#
# This prevents keyword duplication from artificially
# inflating the urgency score.
# ============================================================

PRIORITY_SIGNALS: Dict[str, Dict[str, object]] = {

    # --------------------------------------------------------
    # IMMEDIATE LIFE / SAFETY THREATS
    # --------------------------------------------------------

    "critical_safety": {
        "score": 40,
        "keywords": [
            "emergency",
            "life threatening",
            "life-threatening",
            "danger to life",
            "danger to residents",
            "people trapped",
            "building collapse",
            "collapsed building",
            "fire",
            "major accident",
            "electrocution",
            "gas leak",
        ],
        "reason": (
            "The complaint contains a potential immediate "
            "threat to life or serious public safety."
        ),
    },

    # --------------------------------------------------------
    # PUBLIC HEALTH
    # --------------------------------------------------------

    "health": {
        "score": 30,
        "keywords": [
            "sewage overflow",
            "sewage is overflowing",
            "sewage overflowing",
            "sewer overflow",
            "sewer is overflowing",
            "contaminated water",
            "dirty drinking water",
            "polluted water",
            "disease",
            "infectious",
            "health risk",
            "serious health risk",
            "health hazard",
            "public health",
        ],
        "reason": (
            "The complaint may create a public health "
            "or sanitation hazard."
        ),
    },

    # --------------------------------------------------------
    # RESIDENTIAL IMPACT
    # --------------------------------------------------------

    "residential_impact": {
        "score": 25,
        "keywords": [
            "into homes",
            "inside homes",
            "inside houses",
            "into houses",
            "homes are flooded",
            "houses are flooded",
            "flooded homes",
            "residents affected",
            "residents are affected",
            "people affected",
        ],
        "reason": (
            "The problem directly affects residents or "
            "residential property."
        ),
    },

    # --------------------------------------------------------
    # COMMUNITY IMPACT
    # --------------------------------------------------------

    "community_impact": {
        "score": 20,
        "keywords": [
            "entire neighborhood",
            "whole neighborhood",
            "entire area",
            "whole area",
            "entire community",
            "whole community",
            "multiple streets",
            "many residents",
            "many people",
            "hundreds of people",
            "thousands of people",
        ],
        "reason": (
            "The issue appears to affect a large number "
            "of residents or a wide geographic area."
        ),
    },

    # --------------------------------------------------------
    # SERIOUS INFRASTRUCTURE
    # --------------------------------------------------------

    "infrastructure": {
        "score": 25,
        "keywords": [
            "road completely blocked",
            "road is completely blocked",
            "completely blocked",
            "bridge collapsed",
            "bridge is damaged",
            "major road damage",
            "major infrastructure damage",
            "building damaged",
            "building is damaged",
        ],
        "reason": (
            "The complaint indicates serious infrastructure "
            "damage or restricted public access."
        ),
    },

    # --------------------------------------------------------
    # PUBLIC SAFETY
    # --------------------------------------------------------

    "safety": {
        "score": 20,
        "keywords": [
            "dangerous",
            "danger",
            "unsafe",
            "accident risk",
            "accident hazard",
            "risk of accident",
            "dark street",
            "dark road",
            "no street lights",
            "street lights are broken",
            "street lights are not working",
            "lights are not working",
        ],
        "reason": (
            "The complaint contains a potential public "
            "safety concern."
        ),
    },

    # --------------------------------------------------------
    # SERVICE INTERRUPTION
    # --------------------------------------------------------

    "service": {
        "score": 15,
        "keywords": [
            "not working",
            "stopped working",
            "not available",
            "unavailable",
            "has stopped",
            "not functioning",
            "broken",
            "no service",
            "service stopped",
        ],
        "reason": (
            "A public service or infrastructure component "
            "appears to be unavailable or malfunctioning."
        ),
    },

    # --------------------------------------------------------
    # LONG DURATION
    # --------------------------------------------------------

    "duration": {
        "score": 10,
        "keywords": [
            "for days",
            "for several days",
            "for weeks",
            "for several weeks",
            "for months",
            "since yesterday",
            "since last week",
            "since last month",
            "three days",
            "four days",
            "five days",
            "one week",
            "two weeks",
            "several months",
        ],
        "reason": (
            "The issue appears to have remained unresolved "
            "for an extended period."
        ),
    },

    # --------------------------------------------------------
    # GENERAL CIVIC PROBLEM
    # --------------------------------------------------------

    "general": {
        "score": 5,
        "keywords": [
            "problem",
            "issue",
            "complaint",
            "broken",
            "damaged",
            "repair",
            "needs repair",
        ],
        "reason": (
            "The complaint describes a civic service "
            "or infrastructure problem."
        ),
    },
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize complaint text.
    """

    return " ".join(
        text.lower()
        .strip()
        .split()
    )


# ============================================================
# SCORE → PRIORITY
# ============================================================

def get_priority_level(
    score: float,
) -> str:
    """
    Convert a numerical urgency score into a priority level.
    """

    if score >= PRIORITY_THRESHOLDS["CRITICAL"]:
        return "CRITICAL"

    if score >= PRIORITY_THRESHOLDS["HIGH"]:
        return "HIGH"

    if score >= PRIORITY_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"

    return "LOW"


# ============================================================
# ESCALATION ENGINE
# ============================================================

def apply_escalation_rules(
    text: str,
    matched_categories: set[str],
) -> tuple[str | None, str | None]:
    """
    Apply high-level civic urgency rules.

    Returns:
        (
            priority_override,
            escalation_reason
        )
    """

    # --------------------------------------------------------
    # RULE 1
    # Immediate threat to life
    # --------------------------------------------------------

    critical_life_keywords = [
        "life threatening",
        "life-threatening",
        "danger to life",
        "people trapped",
        "building collapse",
        "collapsed building",
        "electrocution",
        "gas leak",
    ]

    if any(
        keyword in text
        for keyword in critical_life_keywords
    ):
        return (
            "CRITICAL",
            "The complaint indicates a potential immediate "
            "threat to life or severe safety risk.",
        )

    # --------------------------------------------------------
    # RULE 2
    # Public health + residential impact
    # --------------------------------------------------------

    if (
        "health" in matched_categories
        and "residential_impact" in matched_categories
    ):
        return (
            "CRITICAL",
            "A public health or sanitation hazard is "
            "directly affecting residential areas.",
        )

    # --------------------------------------------------------
    # RULE 3
    # Public health + large-scale impact
    # --------------------------------------------------------

    if (
        "health" in matched_categories
        and "community_impact" in matched_categories
    ):
        return (
            "CRITICAL",
            "A public health hazard is affecting a broad "
            "community area.",
        )

    # --------------------------------------------------------
    # RULE 4
    # Public health + serious infrastructure impact
    # --------------------------------------------------------

    if (
        "health" in matched_categories
        and "infrastructure" in matched_categories
    ):
        return (
            "CRITICAL",
            "A public health hazard is combined with "
            "serious infrastructure impact.",
        )

    # --------------------------------------------------------
    # RULE 5
    # Safety + service failure
    # --------------------------------------------------------
    #
    # Example:
    #
    # Broken street lights + dark road
    #
    # This should be HIGH even when the complaint doesn't
    # explicitly mention a large community.
    # --------------------------------------------------------

    if (
        "safety" in matched_categories
        and "service" in matched_categories
    ):
        return (
            "HIGH",
            "A public safety concern is combined with "
            "a public service or infrastructure failure.",
        )

    # --------------------------------------------------------
    # RULE 6
    # Safety + community impact
    # --------------------------------------------------------

    if (
        "safety" in matched_categories
        and "community_impact" in matched_categories
    ):
        return (
            "HIGH",
            "A public safety concern affects a broad "
            "community area.",
        )

    # --------------------------------------------------------
    # RULE 7
    # Serious infrastructure damage
    # --------------------------------------------------------

    if "infrastructure" in matched_categories:
        return (
            "HIGH",
            "The complaint indicates serious infrastructure "
            "damage or restricted public access.",
        )

    return None, None


# ============================================================
# PRIORITY PREDICTION
# ============================================================

def predict_priority(
    complaint_text: str,
) -> dict:
    """
    Predict the urgency of a civic complaint.

    Returns:

        {
            "priority": str,
            "score": float,
            "confidence": float,
            "matched_signals": list[str],
            "reasons": list[str],
            "escalated": bool
        }
    """

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if not complaint_text or not complaint_text.strip():

        return {
            "priority": "LOW",
            "score": 0.0,
            "confidence": 0.0,
            "matched_signals": [],
            "reasons": [
                "No complaint text was provided."
            ],
            "escalated": False,
        }

    # --------------------------------------------------------
    # Normalize text
    # --------------------------------------------------------

    text = normalize_text(
        complaint_text
    )

    total_score = 0.0

    matched_signals = []

    reasons = []

    matched_categories = set()

    # --------------------------------------------------------
    # Detect priority signals
    # --------------------------------------------------------

    for signal_name, signal_data in PRIORITY_SIGNALS.items():

        score = float(
            signal_data["score"]
        )

        keywords = signal_data["keywords"]

        reason = str(
            signal_data["reason"]
        )

        matched = []

        for keyword in keywords:

            if keyword in text:

                matched.append(
                    keyword
                )

        if matched:

            # Count the signal category once.
            total_score += score

            matched_categories.add(
                signal_name
            )

            matched_signals.extend(
                matched
            )

            reasons.append(
                reason
            )

    # --------------------------------------------------------
    # Cap normal score
    # --------------------------------------------------------

    total_score = min(
        total_score,
        100.0,
    )

    # --------------------------------------------------------
    # Apply escalation rules
    # --------------------------------------------------------

    override_priority, override_reason = (
        apply_escalation_rules(
            text,
            matched_categories,
        )
    )

    calculated_priority = get_priority_level(
        total_score
    )

    final_priority = (
        override_priority
        if override_priority
        else calculated_priority
    )

    escalated = (
        override_priority is not None
    )

    # --------------------------------------------------------
    # Add escalation explanation only when it provides
    # information not already present in the normal reasons.
    # --------------------------------------------------------

    if override_reason:

        if override_reason not in reasons:

            reasons.append(
                override_reason
            )

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    signal_count = len(
        matched_categories
    )

    confidence = min(
        0.50
        + (signal_count * 0.08),
        0.90,
    )

    if escalated:

        confidence += 0.05

    if total_score == 0:

        confidence = 0.20

    confidence = min(
        confidence,
        0.95,
    )

    confidence = round(
        confidence,
        2,
    )

    # --------------------------------------------------------
    # Remove duplicate matched signals while preserving
    # their original order.
    # --------------------------------------------------------

    matched_signals = list(
        dict.fromkeys(
            matched_signals
        )
    )

    # --------------------------------------------------------
    # Remove duplicate reasons while preserving order.
    # --------------------------------------------------------

    reasons = list(
        dict.fromkeys(
            reasons
        )
    )

    # --------------------------------------------------------
    # No urgency indicators
    # --------------------------------------------------------

    if not reasons:

        reasons.append(
            "No significant urgency indicators were detected."
        )

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    return {
        "priority": final_priority,
        "score": round(
            total_score,
            2,
        ),
        "confidence": confidence,
        "matched_signals": matched_signals,
        "reasons": reasons,
        "escalated": escalated,
    }