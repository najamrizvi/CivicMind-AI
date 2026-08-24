# ============================================================
# CIVICMIND AI — COMPLAINT CLASSIFIER
# ============================================================
#
# Purpose:
#   Classify citizen complaints into civic service categories.
#
# Features:
#   - Weighted phrase matching
#   - Strong phrase prioritization
#   - Explainable predictions
#   - Confidence scoring
#   - Confidence threshold
#   - Deterministic and lightweight
#
# This service is intentionally isolated so that a trained
# NLP/ML model can replace the internal logic later without
# changing the complaint API.
# ============================================================

from typing import Dict


# ============================================================
# CIVIC CATEGORIES
# ============================================================

CIVIC_CATEGORIES = [
    "Waste Management",
    "Street Lighting",
    "Roads & Infrastructure",
    "Water & Sanitation",
    "Drainage & Sewerage",
    "Public Safety",
    "Parks & Environment",
    "Other",
]


# ============================================================
# CLASSIFICATION CONFIGURATION
# ============================================================

# Minimum confidence required for a confident prediction.
CONFIDENCE_THRESHOLD = 0.50


# ============================================================
# WEIGHTED CIVIC KNOWLEDGE BASE
# ============================================================
#
# Higher weight = stronger evidence for the category.
#
# Multi-word phrases receive higher weights because they carry
# more semantic information than generic individual words.
# ============================================================

CATEGORY_KEYWORDS: Dict[str, Dict[str, float]] = {

    # --------------------------------------------------------
    # WASTE MANAGEMENT
    # --------------------------------------------------------

    "Waste Management": {
        "garbage collection": 4.0,
        "waste collection": 4.0,
        "garbage": 2.5,
        "waste": 2.0,
        "trash": 2.0,
        "rubbish": 2.0,
        "litter": 2.0,
        "dustbin": 2.0,
        "dump": 1.5,
        "dumping": 1.5,
        "cleaning": 1.0,
    },

    # --------------------------------------------------------
    # STREET LIGHTING
    # --------------------------------------------------------

    "Street Lighting": {
        "street lights": 5.0,
        "street light": 5.0,
        "streetlights": 5.0,
        "streetlight": 5.0,
        "light pole": 4.0,
        "light poles": 4.0,
        "street lamp": 4.0,
        "street lamps": 4.0,
        "dark street": 4.0,
        "dark road": 3.5,
        "lights are broken": 4.0,
        "lights are not working": 4.0,
        "lights not working": 4.0,
        "lamp": 2.0,
        "lights": 1.5,
    },

    # --------------------------------------------------------
    # ROADS & INFRASTRUCTURE
    # --------------------------------------------------------

    "Roads & Infrastructure": {
        "road damage": 5.0,
        "broken road": 5.0,
        "damaged road": 5.0,
        "road construction": 4.0,
        "pothole": 4.5,
        "potholes": 4.5,
        "broken pavement": 4.0,
        "damaged pavement": 4.0,
        "footpath": 3.0,
        "sidewalk": 3.0,
        "bridge": 3.0,
        "road": 1.0,
        "street": 0.75,
    },

    # --------------------------------------------------------
    # WATER & SANITATION
    # --------------------------------------------------------

    "Water & Sanitation": {
        "water supply": 5.0,
        "water shortage": 5.0,
        "no water": 5.0,
        "drinking water": 4.0,
        "water pipeline": 4.0,
        "water pipe": 3.5,
        "tap water": 3.5,
        "water leakage": 3.5,
        "water leak": 3.5,
        "water": 1.5,
        "pipeline": 2.0,
    },

    # --------------------------------------------------------
    # DRAINAGE & SEWERAGE
    # --------------------------------------------------------

    "Drainage & Sewerage": {
        "sewage overflow": 5.0,
        "sewer overflow": 5.0,
        "drainage problem": 5.0,
        "drainage issue": 5.0,
        "blocked drain": 5.0,
        "blocked sewer": 5.0,
        "sewage": 3.5,
        "sewerage": 3.5,
        "sewer": 3.0,
        "drainage": 3.0,
        "drain": 2.5,
        "overflow": 2.5,
        "wastewater": 3.0,
    },

    # --------------------------------------------------------
    # PUBLIC SAFETY
    # --------------------------------------------------------

    "Public Safety": {
        "public safety": 5.0,
        "safety issue": 4.5,
        "unsafe area": 4.5,
        "crime": 4.0,
        "criminal activity": 4.5,
        "security issue": 4.0,
        "accident": 3.5,
        "dangerous area": 4.0,
        "emergency": 4.0,
        "harassment": 4.0,
        "unsafe": 2.5,
        "danger": 2.5,
        "security": 2.0,
    },

    # --------------------------------------------------------
    # PARKS & ENVIRONMENT
    # --------------------------------------------------------

    "Parks & Environment": {
        "public park": 5.0,
        "park maintenance": 5.0,
        "green space": 4.5,
        "environmental pollution": 5.0,
        "air pollution": 5.0,
        "water pollution": 4.5,
        "pollution": 3.5,
        "playground": 3.5,
        "tree": 2.5,
        "trees": 2.5,
        "park": 2.5,
        "environment": 2.0,
    },
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize complaint text before classification.
    """

    return " ".join(
        text.lower()
        .strip()
        .split()
    )


# ============================================================
# CLASSIFY COMPLAINT
# ============================================================

def classify_complaint(
    complaint_text: str,
) -> dict:
    """
    Classify a citizen complaint.

    Returns:
        {
            "category": str,
            "confidence": float,
            "matched_keywords": list[str],
            "explanation": str,
            "scores": dict[str, float]
        }
    """

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if not complaint_text or not complaint_text.strip():

        return {
            "category": "Other",
            "confidence": 0.0,
            "matched_keywords": [],
            "explanation": (
                "No complaint text was provided."
            ),
            "scores": {},
        }

    # --------------------------------------------------------
    # Normalize
    # --------------------------------------------------------

    text = normalize_text(
        complaint_text
    )

    # --------------------------------------------------------
    # Initialize scores
    # --------------------------------------------------------

    category_scores: Dict[str, float] = {
        category: 0.0
        for category in CIVIC_CATEGORIES
    }

    matched_keywords: Dict[str, list[str]] = {
        category: []
        for category in CIVIC_CATEGORIES
    }

    # --------------------------------------------------------
    # Weighted matching
    # --------------------------------------------------------

    for category, keywords in CATEGORY_KEYWORDS.items():

        for keyword, weight in keywords.items():

            if keyword in text:

                category_scores[category] += weight

                matched_keywords[
                    category
                ].append(keyword)

    # --------------------------------------------------------
    # No evidence found
    # --------------------------------------------------------

    total_score = sum(
        category_scores.values()
    )

    if total_score == 0:

        return {
            "category": "Other",
            "confidence": 0.20,
            "matched_keywords": [],
            "explanation": (
                "The complaint did not contain enough "
                "civic service indicators for a confident "
                "classification."
            ),
            "scores": {
                category: 0.0
                for category in CIVIC_CATEGORIES
            },
        }

    # --------------------------------------------------------
    # Find strongest category
    # --------------------------------------------------------

    ranked_categories = sorted(
        category_scores.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    best_category, best_score = (
        ranked_categories[0]
    )

    second_score = (
        ranked_categories[1][1]
        if len(ranked_categories) > 1
        else 0.0
    )

    # --------------------------------------------------------
    # Confidence calculation
    # --------------------------------------------------------
    #
    # We combine:
    #
    # 1. Score dominance
    # 2. Difference from second-best category
    #
    # This prevents generic words from producing overly
    # confident predictions.
    # --------------------------------------------------------

    score_share = (
        best_score / total_score
        if total_score > 0
        else 0.0
    )

    if best_score > 0:

        separation = (
            (best_score - second_score)
            / best_score
        )

    else:
        separation = 0.0

    confidence = (
        (score_share * 0.70)
        + (separation * 0.30)
    )

    confidence = min(
        max(confidence, 0.0),
        1.0,
    )

    confidence = round(
        confidence,
        2,
    )

    # --------------------------------------------------------
    # Confidence decision
    # --------------------------------------------------------

    if confidence < CONFIDENCE_THRESHOLD:

        final_category = "Other"

        explanation = (
            "The complaint contains civic indicators, "
            "but the classification confidence is too "
            "low for an automatic decision."
        )

    else:

        final_category = best_category

        matched = matched_keywords[
            best_category
        ]

        explanation = (
            f"The complaint was classified as "
            f"{best_category} based on the detected "
            f"civic indicators: "
            f"{', '.join(matched)}."
        )

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "category": final_category,
        "confidence": confidence,
        "matched_keywords": matched_keywords[
            best_category
        ],
        "explanation": explanation,
        "scores": {
            category: round(
                score,
                2,
            )
            for category, score
            in category_scores.items()
        },
    }