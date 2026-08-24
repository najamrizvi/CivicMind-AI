from fastapi import FastAPI

app = FastAPI(
    title="CivicMind AI",
    description="AI-powered civic intelligence and complaint management platform.",
    version="1.0.0",
)


@app.get("/")
def health_check():
    return {
        "message": "CivicMind AI backend is running successfully."
    }