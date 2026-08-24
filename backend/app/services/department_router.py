# ============================================================
# CIVICMIND AI — DEPARTMENT ROUTER
# ============================================================
#
# Purpose:
#   Route a classified civic complaint to the most appropriate
#   municipal department.
#
# Input:
#   - Complaint category
#   - Optional complaint text for additional routing context
#
# Output:
#   - Department
#   - Confidence
#   - Matched indicators
#   - Explanation
#
# Design principles:
#   - Deterministic
#   - Explainable
#   - Category-driven
#   - Easy to extend
#   - Independent from API and database layers
#
# ============================================================

from typing import Dict


# ============================================================
# DEPARTMENT DEFINITIONS
# ============================================================

DEPARTMENTS: Dict[str, str] = {

    "Waste Management":
        "Waste Management Department",

    "Street Lighting":
        "Municipal Electrical Services",

    "Roads & Infrastructure":
        "Roads & Infrastructure Department",

    "Water & Sanitation":
        "Water & Sanitation Department",

    "Drainage & Sewerage":
        "Drainage & Sewerage Department",

    "Public Safety":
        "Public Safety Department",

    "Parks & Environment":
        "Parks & Environment Department",

    "Other":
        "General Civic Services",
}


# ============================================================
# ROUTING RULES
# ============================================================
#
# These indicators provide additional context and make the
# routing decision explainable.
#
# The primary routing decision is category-based.
# Text indicators can increase confidence.
# ============================================================

ROUTING_RULES: Dict[str, Dict[str, object]] = {

    "Waste Management": {

        "department":
            "Waste Management Department",

        "indicators": [
            "garbage",
            "waste",
            "trash",
            "litter",
            "garbage collection",
            "waste collection",
            "dumping",
            "dump site",
            "solid waste",
        ],

        "explanation":
            "The complaint concerns waste collection, "
            "garbage, litter, or solid waste management.",
    },

    "Street Lighting": {

        "department":
            "Municipal Electrical Services",

        "indicators": [
            "street light",
            "street lights",
            "street lighting",
            "lights are broken",
            "lights are not working",
            "dark road",
            "dark street",
            "lamp post",
            "lamp",
            "electric light",
        ],

        "explanation":
            "The complaint concerns public street lighting "
            "or municipal lighting infrastructure.",
    },

    "Roads & Infrastructure": {

        "department":
            "Roads & Infrastructure Department",

        "indicators": [
            "road",
            "pothole",
            "potholes",
            "road damage",
            "damaged road",
            "broken road",
            "bridge",
            "footpath",
            "sidewalk",
            "infrastructure",
        ],

        "explanation":
            "The complaint concerns roads, potholes, bridges, "
            "footpaths, or public infrastructure.",
    },

    "Water & Sanitation": {

        "department":
            "Water & Sanitation Department",

        "indicators": [
            "water supply",
            "water shortage",
            "no water",
            "water connection",
            "drinking water",
            "tap water",
            "water leakage",
            "dirty water",
            "contaminated water",
            "sanitation",
        ],

        "explanation":
            "The complaint concerns public water supply, "
            "water quality, or sanitation services.",
    },

    "Drainage & Sewerage": {

        "department":
            "Drainage & Sewerage Department",

        "indicators": [
            "drainage",
            "drain",
            "drains",
            "sewage",
            "sewer",
            "sewerage",
            "sewage overflow",
            "sewer overflow",
            "blocked drain",
            "blocked drainage",
            "wastewater",
        ],

        "explanation":
            "The complaint concerns drainage systems, "
            "sewers, sewage, or wastewater management.",
    },

    "Public Safety": {

        "department":
            "Public Safety Department",

        "indicators": [
            "danger",
            "dangerous",
            "unsafe",
            "accident",
            "crime",
            "security",
            "emergency",
            "threat",
            "public safety",
        ],

        "explanation":
            "The complaint contains a public safety, "
            "security, or emergency-related concern.",
    },

    "Parks & Environment": {

        "department":
            "Parks & Environment Department",

        "indicators": [
            "park",
            "playground",
            "tree",
            "trees",
            "green space",
            "environment",
            "pollution",
            "plant",
            "garden",
            "public park",
        ],

        "explanation":
            "The complaint concerns public parks, green spaces, "
            "trees, or environmental conditions.",
    },

    "Other": {

        "department":
            "General Civic Services",

        "indicators": [],

        "explanation":
            "The complaint could not be confidently associated "
            "with a specialized municipal department.",
    },
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(
    text: str,
) -> str:
    """
    Normalize complaint text for indicator matching.
    """

    return " ".join(
        text.lower()
        .strip()
        .split()
    )


# ============================================================
# CATEGORY NORMALIZATION
# ============================================================

def normalize_category(
    category: str,
) -> str:
    """
    Normalize category names.

    Handles minor formatting differences while preserving
    the canonical category names used by CivicMind.
    """

    category = (
        category
        .strip()
        .lower()
    )

    category_aliases = {

        "waste management":
            "Waste Management",

        "street lighting":
            "Street Lighting",

        "roads and infrastructure":
            "Roads & Infrastructure",

        "roads & infrastructure":
            "Roads & Infrastructure",

        "water and sanitation":
            "Water & Sanitation",

        "water & sanitation":
            "Water & Sanitation",

        "drainage and sewerage":
            "Drainage & Sewerage",

        "drainage & sewerage":
            "Drainage & Sewerage",

        "public safety":
            "Public Safety",

        "parks and environment":
            "Parks & Environment",

        "parks & environment":
            "Parks & Environment",

        "other":
            "Other",
    }

    return category_aliases.get(
        category,
        category.title(),
    )


# ============================================================
# DEPARTMENT ROUTING
# ============================================================

def route_department(
    category: str,
    complaint_text: str = "",
) -> dict:
    """
    Route a classified complaint to the appropriate department.

    Parameters:
        category:
            Category produced by ai_classifier.py.

        complaint_text:
            Original complaint text. Optional but useful for
            additional indicator matching.

    Returns:
        {
            "department": str,
            "confidence": float,
            "matched_indicators": list[str],
            "explanation": str,
            "category": str
        }
    """

    # --------------------------------------------------------
    # Validate category
    # --------------------------------------------------------

    if not category or not category.strip():

        return {
            "department":
                DEPARTMENTS["Other"],

            "confidence":
                0.20,

            "matched_indicators":
                [],

            "explanation":
                "No complaint category was provided, so the "
                "complaint was routed to General Civic Services.",

            "category":
                "Other",
        }

    # --------------------------------------------------------
    # Normalize category and text
    # --------------------------------------------------------

    normalized_category = normalize_category(
        category
    )

    normalized_text = normalize_text(
        complaint_text
    )

    # --------------------------------------------------------
    # Unknown category
    # --------------------------------------------------------

    if normalized_category not in DEPARTMENTS:

        return {
            "department":
                DEPARTMENTS["Other"],

            "confidence":
                0.25,

            "matched_indicators":
                [],

            "explanation":
                (
                    f"The category '{category}' is not "
                    "recognized by the routing engine, so the "
                    "complaint was routed to General Civic Services."
                ),

            "category":
                "Other",
        }

    # --------------------------------------------------------
    # Retrieve routing rule
    # --------------------------------------------------------

    rule = ROUTING_RULES[
        normalized_category
    ]

    department = str(
        rule["department"]
    )

    indicators = rule["indicators"]

    base_explanation = str(
        rule["explanation"]
    )

    # --------------------------------------------------------
    # Find matching indicators
    # --------------------------------------------------------

    matched_indicators = []

    for indicator in indicators:

        if indicator in normalized_text:

            matched_indicators.append(
                indicator
            )

    # --------------------------------------------------------
    # Calculate confidence
    # --------------------------------------------------------
    #
    # Category itself gives us a strong routing foundation.
    #
    # Text indicators provide additional confidence.
    #
    # This is NOT a probability from a trained ML model.
    # It is an explainable routing confidence.
    # --------------------------------------------------------

    if normalized_category == "Other":

        confidence = 0.30

    elif matched_indicators:

        confidence = min(
            0.85
            + (
                min(
                    len(matched_indicators),
                    3,
                )
                * 0.04
            ),
            0.95,
        )

    else:

        confidence = 0.75

    confidence = round(
        confidence,
        2,
    )

    # --------------------------------------------------------
    # Build explanation
    # --------------------------------------------------------

    if matched_indicators:

        indicator_text = ", ".join(
            matched_indicators
        )

        explanation = (
            f"{base_explanation} "
            f"Routing was supported by the detected "
            f"indicators: {indicator_text}."
        )

    else:

        explanation = (
            f"{base_explanation} "
            "The routing decision was primarily based on "
            "the complaint category."
        )

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    return {
        "department":
            department,

        "confidence":
            confidence,

        "matched_indicators":
            matched_indicators,

        "explanation":
            explanation,

        "category":
            normalized_category,
    }


# ============================================================
# CONVENIENCE FUNCTION
# ============================================================

def get_department(
    category: str,
) -> str:
    """
    Return only the department name.

    Useful when another service needs only the department
    without the complete routing explanation.
    """

    normalized_category = normalize_category(
        category
    )

    return DEPARTMENTS.get(
        normalized_category,
        DEPARTMENTS["Other"],
    )