# ============================================================
# CIVICMIND AI — COMPLAINT CLASSIFIER
# ============================================================
#
# Purpose:
#   Classify citizen complaints into civic service categories.
#
# Features:
#   - Weighted phrase matching
#   - Primary issue prioritization
#   - Context-aware scoring
#   - Explainable predictions
#   - Confidence scoring
#   - Confidence threshold
#   - Deterministic and lightweight
#
# Design:
#   Specific civic-service indicators are treated as PRIMARY
#   evidence, while contextual/consequence words such as
#   "accident", "danger", and "water" receive lower influence
#   when they describe the consequences of another issue.
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

CONFIDENCE_THRESHOLD = 0.50


# ============================================================
# PRIMARY CIVIC INDICATORS
# ============================================================
#
# These phrases describe the actual civic service/problem.
#
# Strong primary indicators receive additional scoring weight.
# ============================================================

PRIMARY_KEYWORDS: Dict[str, Dict[str, float]] = {

    # --------------------------------------------------------
    # WASTE MANAGEMENT
    # --------------------------------------------------------

    "Waste Management": {
        "garbage collection": 6.0,
        "waste collection": 6.0,
        "garbage": 4.0,
        "waste": 3.5,
        "trash": 3.5,
        "rubbish": 3.5,
        "litter": 3.5,
        "dustbin": 3.5,
        "dumping": 3.0,
        "dump": 2.5,
        "garbage bags": 4.0,
        "uncollected garbage": 6.0,
    },

    # --------------------------------------------------------
    # STREET LIGHTING
    # --------------------------------------------------------

    "Street Lighting": {
        "street lights": 7.0,
        "street light": 7.0,
        "streetlights": 7.0,
        "streetlight": 7.0,
        "light pole": 6.0,
        "light poles": 6.0,
        "street lamp": 6.0,
        "street lamps": 6.0,
        "dark street": 6.0,
        "dark road": 5.0,
        "lights are broken": 6.0,
        "lights are not working": 6.0,
        "lights not working": 6.0,
        "broken lights": 6.0,
        "broken street lights": 7.0,
    },

    # --------------------------------------------------------
    # ROADS & INFRASTRUCTURE
    # --------------------------------------------------------

    "Roads & Infrastructure": {
        "road damage": 7.0,
        "broken road": 7.0,
        "damaged road": 7.0,
        "road construction": 6.0,
        "pothole": 7.0,
        "potholes": 7.0,
        "large pothole": 8.0,
        "deep pothole": 8.0,
        "broken pavement": 6.0,
        "damaged pavement": 6.0,
        "footpath": 5.0,
        "sidewalk": 5.0,
        "broken sidewalk": 6.0,
        "damaged sidewalk": 6.0,
        "bridge": 5.0,
        "road": 2.0,
        "street": 1.0,
    },

    # --------------------------------------------------------
    # WATER & SANITATION
    # --------------------------------------------------------

    "Water & Sanitation": {
        "water supply": 7.0,
        "water shortage": 7.0,
        "no water": 7.0,
        "drinking water": 6.0,
        "water pipeline": 6.0,
        "water pipe": 5.0,
        "tap water": 5.0,
        "water leakage": 6.0,
        "water leak": 6.0,
        "water connection": 5.0,
        "water pressure": 5.0,
        "water supply problem": 7.0,
    },

    # --------------------------------------------------------
    # DRAINAGE & SEWERAGE
    # --------------------------------------------------------

    "Drainage & Sewerage": {
        "sewage overflow": 7.0,
        "sewer overflow": 7.0,
        "drainage problem": 7.0,
        "drainage issue": 7.0,
        "blocked drain": 7.0,
        "blocked sewer": 7.0,
        "sewage": 5.0,
        "sewerage": 5.0,
        "sewer": 4.5,
        "drainage": 4.5,
        "drain": 4.0,
        "overflow": 3.5,
        "wastewater": 5.0,
        "blocked drainage": 7.0,
        "drain blockage": 7.0,
    },

    # --------------------------------------------------------
    # PUBLIC SAFETY
    # --------------------------------------------------------

    "Public Safety": {
        "public safety": 7.0,
        "safety issue": 6.0,
        "unsafe area": 6.0,
        "crime": 6.0,
        "criminal activity": 7.0,
        "security issue": 6.0,
        "dangerous area": 6.0,
        "emergency": 6.0,
        "harassment": 6.0,
        "security threat": 7.0,
        "theft": 6.0,
        "robbery": 7.0,
        "assault": 7.0,
    },

    # --------------------------------------------------------
    # PARKS & ENVIRONMENT
    # --------------------------------------------------------

    "Parks & Environment": {
        "public park": 7.0,
        "park maintenance": 7.0,
        "green space": 6.0,
        "environmental pollution": 7.0,
        "air pollution": 7.0,
        "water pollution": 6.0,
        "pollution": 5.0,
        "playground": 5.0,
        "tree cutting": 6.0,
        "fallen tree": 6.0,
        "park": 4.0,
        "environment": 3.0,
    },
}


# ============================================================
# CONTEXTUAL INDICATORS
# ============================================================
#
# These words often describe consequences or surrounding
# circumstances rather than the actual civic service involved.
#
# They therefore receive lower weights.
# ============================================================

CONTEXTUAL_KEYWORDS: Dict[str, Dict[str, float]] = {

    "Waste Management": {
        "dirty": 1.0,
        "smell": 1.0,
        "bad smell": 1.5,
        "unclean": 1.0,
    },

    "Street Lighting": {
        "dark": 1.0,
        "night": 0.5,
        "visibility": 1.0,
        "poor visibility": 1.5,
    },

    "Roads & Infrastructure": {
        "accident": 1.5,
        "accidents": 1.5,
        "traffic": 1.0,
        "vehicle": 0.5,
        "vehicles": 0.5,
        "motorcycle": 0.5,
        "motorcycles": 0.5,
        "car": 0.5,
        "cars": 0.5,
        "rain": 0.5,
        "rainy": 0.5,
    },

    "Water & Sanitation": {
        "water": 1.5,
        "thirst": 1.0,
        "drinking": 0.5,
    },

    "Drainage & Sewerage": {
        "flooding": 2.0,
        "flood": 1.5,
        "rain": 0.5,
        "rainwater": 1.0,
    },

    "Public Safety": {
        "unsafe": 2.0,
        "danger": 2.0,
        "dangerous": 2.0,
        "accident": 1.5,
        "accidents": 1.5,
        "risk": 1.5,
        "fear": 1.5,
    },

    "Parks & Environment": {
        "dirty": 1.0,
        "dust": 1.0,
        "smoke": 1.5,
        "heat": 0.5,
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
# KEYWORD MATCHING
# ============================================================

def _match_keywords(
    text: str,
    keyword_map: Dict[str, Dict[str, float]],
) -> tuple[
    Dict[str, float],
    Dict[str, list[str]],
]:
    """
    Match configured keywords against normalized text.

    Returns:
        category scores
        matched keywords
    """

    scores: Dict[str, float] = {
        category: 0.0
        for category in CIVIC_CATEGORIES
    }

    matches: Dict[str, list[str]] = {
        category: []
        for category in CIVIC_CATEGORIES
    }

    for category, keywords in keyword_map.items():

        for keyword, weight in keywords.items():

            if keyword in text:

                scores[category] += weight

                matches[category].append(
                    keyword
                )

    return scores, matches


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
            "scores": {
                category: 0.0
                for category in CIVIC_CATEGORIES
            },
        }

    # --------------------------------------------------------
    # Normalize
    # --------------------------------------------------------

    text = normalize_text(
        complaint_text
    )

    # --------------------------------------------------------
    # Match PRIMARY indicators
    # --------------------------------------------------------

    primary_scores, primary_matches = (
        _match_keywords(
            text,
            PRIMARY_KEYWORDS,
        )
    )

    # --------------------------------------------------------
    # Match CONTEXTUAL indicators
    # --------------------------------------------------------

    contextual_scores, contextual_matches = (
        _match_keywords(
            text,
            CONTEXTUAL_KEYWORDS,
        )
    )

    # --------------------------------------------------------
    # Combine scores
    # --------------------------------------------------------
    #
    # Primary indicators are intentionally dominant.
    #
    # Contextual indicators provide supporting evidence
    # without overpowering a clear primary issue.
    # --------------------------------------------------------

    category_scores: Dict[str, float] = {}

    for category in CIVIC_CATEGORIES:

        category_scores[category] = (
            primary_scores.get(
                category,
                0.0,
            )
            + contextual_scores.get(
                category,
                0.0,
            )
        )

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
    # Determine whether a PRIMARY indicator exists
    # --------------------------------------------------------

    best_primary_score = primary_scores.get(
        best_category,
        0.0,
    )

    # --------------------------------------------------------
    # Confidence calculation
    # --------------------------------------------------------
    #
    # Primary evidence is trusted more than contextual
    # evidence.
    #
    # When a strong primary indicator exists, confidence
    # receives a stability bonus.
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
        (score_share * 0.55)
        + (separation * 0.25)
        + (
            min(
                best_primary_score / 10.0,
                1.0,
            )
            * 0.20
        )
    )

    # --------------------------------------------------------
    # Primary issue protection
    # --------------------------------------------------------
    #
    # A strong service-specific indicator should not be
    # overturned by weaker contextual evidence.
    # --------------------------------------------------------

    if best_primary_score >= 6.0:

        confidence = max(
            confidence,
            0.60,
        )

    confidence = min(
        max(
            confidence,
            0.0,
        ),
        1.0,
    )

    confidence = round(
        confidence,
        2,
    )

    # --------------------------------------------------------
    # Final category decision
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

        all_matches = (
            primary_matches.get(
                best_category,
                [],
            )
            + contextual_matches.get(
                best_category,
                [],
            )
        )

        explanation = (
            f"The complaint was classified as "
            f"{best_category} based on the detected "
            f"civic indicators: "
            f"{', '.join(all_matches)}."
        )

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "category": final_category,
        "confidence": confidence,
        "matched_keywords": (
            primary_matches.get(
                best_category,
                [],
            )
            + contextual_matches.get(
                best_category,
                [],
            )
        ),
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