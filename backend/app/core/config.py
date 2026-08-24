import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    APP_NAME: str = os.getenv(
        "APP_NAME",
        "CivicMind AI",
    )

    APP_VERSION: str = os.getenv(
        "APP_VERSION",
        "1.0.0",
    )

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "",
    )

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "",
    )

    # ---------------------------------------------------------
    # AI Configuration
    # ---------------------------------------------------------

    AI_API_KEY: str = os.getenv(
        "AI_API_KEY",
        "",
    )

    AI_MODEL: str = os.getenv(
        "AI_MODEL",
        "",
    )

    AI_BASE_URL: str = os.getenv(
        "AI_BASE_URL",
        "",
    )


settings = Settings()