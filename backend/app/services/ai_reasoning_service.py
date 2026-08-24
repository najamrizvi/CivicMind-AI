from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings


class AIReasoningService:
    """
    AI reasoning service for CivicMind AI.

    Receives trusted structured civic analytics and uses
    Gemini to generate structured administrative reasoning.
    """

    def __init__(self) -> None:
        if not settings.AI_API_KEY:
            raise RuntimeError(
                "AI_API_KEY is not configured."
            )

        if not settings.AI_MODEL:
            raise RuntimeError(
                "AI_MODEL is not configured."
            )

        self.client = genai.Client(
            api_key=settings.AI_API_KEY,
        )

        self.model = settings.AI_MODEL

    def generate_reasoning(
        self,
        analytics: dict[str, Any],
    ) -> dict[str, str]:
        """
        Generate structured administrative reasoning
        from trusted civic analytics.
        """

        prompt = f"""
You are CivicMind AI, an intelligent civic administration
reasoning assistant.

Analyze the structured civic complaint analytics provided
below.

IMPORTANT RULES:
- Use only the provided information.
- Do not invent statistics.
- Do not invent complaints.
- Do not invent departments.
- Do not invent citizens or personal information.
- Do not claim that an action has already occurred unless
  the provided data confirms it.
- Perform only reasonable calculations that can be directly
  derived from the provided numbers.
- Focus on administrative decision-making.
- Keep each response concise and professional.

Civic complaint analytics:

{analytics}

Return exactly these three fields:

overall_assessment:
A concise assessment of the current civic complaint situation.

key_concern:
The most important administrative concern identified
from the provided analytics.

recommended_action:
One practical and actionable recommendation for
administrative teams.

Return the result as valid JSON only.
Do not use Markdown.
Do not include code fences.
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                automatic_function_calling=(
                    types.AutomaticFunctionCallingConfig(
                        disable=True,
                    )
                ),
                response_mime_type="application/json",
            ),
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        try:
            result = response.parsed

            if result is None:
                import json

                result = json.loads(response.text)

        except Exception as exc:
            raise RuntimeError(
                "Gemini returned an invalid structured response."
            ) from exc

        required_fields = (
            "overall_assessment",
            "key_concern",
            "recommended_action",
        )

        for field in required_fields:
            if not isinstance(result.get(field), str):
                raise RuntimeError(
                    f"Gemini response is missing valid "
                    f"'{field}' field."
                )

        return {
            "overall_assessment": result[
                "overall_assessment"
            ].strip(),
            "key_concern": result[
                "key_concern"
            ].strip(),
            "recommended_action": result[
                "recommended_action"
            ].strip(),
        }


ai_reasoning_service = AIReasoningService()