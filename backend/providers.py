from dataclasses import dataclass
from typing import Optional
import os


@dataclass
class ModelConfig:
    id: str
    name: str
    description: str
    max_tokens: int = 8192
    best_for: str = "general"


GEMINI_MODELS = {
    "gemini-2.5-flash": ModelConfig(
        id="gemini-2.5-flash",
        name="Gemini 2.5 Flash",
        description="Balanced speed and quality",
        max_tokens=8192,
        best_for="general"
    ),
    "gemini-2.5-flash-lite": ModelConfig(
        id="gemini-2.5-flash-lite",
        name="Gemini 2.5 Flash Lite",
        description="Fastest responses, good for simple queries",
        max_tokens=4096,
        best_for="fast"
    ),
    "gemma-3-4b": ModelConfig(
        id="gemma-3-4b",
        name="Gemma 3 4B",
        description="Lightweight model for quick responses",
        max_tokens=4096,
        best_for="fast"
    ),
    "gemma-3-1b": ModelConfig(
        id="gemma-3-1b",
        name="Gemma 3 1B",
        description="Ultra-lightweight, fastest option",
        max_tokens=2048,
        best_for="fast"
    ),
}

DEFAULT_MODEL = "gemini-2.5-flash"

MODEL_ROUTING = {
    "fast": "gemini-2.5-flash-lite",
    "general": "gemini-2.5-flash",
    "code": "gemini-2.5-flash",
    "creative": "gemini-2.5-flash",
}


def get_api_key() -> Optional[str]:
    return os.getenv("GOOGLE_API_KEY")


def is_gemini_available() -> bool:
    return bool(get_api_key())


def get_available_models() -> list[ModelConfig]:
    if not is_gemini_available():
        return []
    return list(GEMINI_MODELS.values())


def get_model_config(model_id: str) -> Optional[ModelConfig]:
    return GEMINI_MODELS.get(model_id)


def select_model_for_query(query: str) -> str:
    query_lower = query.lower()
    query_len = len(query)
    
    if query_len < 50:
        return MODEL_ROUTING["fast"]
    
    code_keywords = ["code", "function", "class", "def ", "const ", "var ", 
                     "import", "error", "bug", "debug", "python", "javascript"]
    if any(kw in query_lower for kw in code_keywords):
        return MODEL_ROUTING["code"]
    
    return MODEL_ROUTING["general"]
