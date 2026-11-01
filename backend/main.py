"""
main.py - SikshaSetu AI FastAPI Application
Backend server providing API endpoints for translation, lessons, worksheets,
and serving the frontend application.
"""

import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from backend.database import (
    get_all_vocabulary,
    get_all_lessons,
    get_all_worksheets,
)
from backend.translator import translate_hindi_to_santhali, get_available_suggestions
from backend.speech import get_speech_capabilities, get_audio_status_for_word

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
AUDIO_DIR = os.path.join(BASE_DIR, "audio")
IMAGES_DIR = os.path.join(BASE_DIR, "images")

# FastAPI App setup
app = FastAPI(
    title="SikshaSetu AI - शिक्षासेतु",
    description="Mother-tongue learning assistant for primary school children bridging Hindi & Santhali (Ol Chiki).",
    version="1.0.0"
)

# Enable CORS for local development and browser frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request / Response Models -----------------

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Hindi phrase or word to translate into Santhali")


# ----------------- API Endpoints -----------------

@app.get("/api/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    """
    Health check endpoint returning server status, dataset counts, and version.
    """
    vocab = get_all_vocabulary()
    lessons = get_all_lessons()
    worksheets = get_all_worksheets()
    verified_vocab_count = len([v for v in vocab if v.get("verified") is True])

    return {
        "status": "healthy",
        "app_name": "SikshaSetu AI",
        "subtitle": "Hindi to Santhali (Ol Chiki) Primary Learning Assistant",
        "version": "1.0.0",
        "verified_vocabulary_count": verified_vocab_count,
        "total_lessons": len(lessons),
        "total_worksheets": len(worksheets),
        "speech_capabilities": get_speech_capabilities()
    }


@app.post("/api/translate", tags=["Translation"])
def translate(payload: TranslationRequest) -> Dict[str, Any]:
    """
    Translate Hindi text to Santhali (Ol Chiki + Roman pronunciation).
    Supports single-line and multi-line inputs.
    Strictly displays only verified vocabulary items.
    If unavailable, returns: 'Verified translation unavailable'
    """
    try:
        result = translate_hindi_to_santhali(payload.text)
        # Attach audio file availability if matched
        if result.get("is_verified") and result.get("audio_file"):
            audio_info = get_audio_status_for_word(result["audio_file"])
            result["audio_info"] = audio_info
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(exc)}")


@app.get("/api/lessons", tags=["Curriculum"])
def get_lessons() -> Dict[str, Any]:
    """
    Retrieve all structured classroom lessons bridging Hindi and Santhali.
    """
    lessons = get_all_lessons()
    return {
        "count": len(lessons),
        "lessons": lessons
    }


@app.get("/api/worksheets", tags=["Curriculum"])
def get_worksheets() -> Dict[str, Any]:
    """
    Retrieve all interactive worksheets (matching, quizzes, counting).
    """
    worksheets = get_all_worksheets()
    return {
        "count": len(worksheets),
        "worksheets": worksheets
    }


@app.get("/api/vocabulary", tags=["Curriculum"])
def get_vocabulary(category: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieve all verified vocabulary items with optional category filtering.
    Used for flashcards and quick classroom phrases.
    """
    vocab = get_all_vocabulary()
    if category and category != "all":
        vocab = [v for v in vocab if category.lower() in v.get("category", "").lower()]
    return {
        "count": len(vocab),
        "vocabulary": vocab,
        "suggestions": get_available_suggestions()
    }


# ----------------- Static Files & Frontend Serving -----------------

# Mount media directories if they exist
if os.path.exists(AUDIO_DIR):
    app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

if os.path.exists(IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

# Serve frontend files
if os.path.exists(FRONTEND_DIR):
    # Route for root to serve index.html
    @app.get("/", include_in_schema=False)
    def serve_index():
        index_file = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse({"message": "Frontend index.html not found"})

    # Mount static assets (css, js, manifest, service worker)
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
