# Cheap GPT

FastAPI chatbot sa HuggingFace LLM i Supabase bazom.

## Struktura

```
/backend  - FastAPI API
/frontend - React/Next.js UI (coming soon)
```

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn fastapi_llm:app --reload
```

## Endpointi

- `POST /chat` - posalji poruku AI-ju
- `GET /history` - chat historija
- `DELETE /history` - obrisi istoriju
- `GET /stats` - statistike
