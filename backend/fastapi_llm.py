from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional
import os
from datetime import datetime
from dotenv import load_dotenv
from llm_router import get_llm_router
from providers import GEMINI_MODELS

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(45))
    session_id = Column(String(100), nullable=True)


class ChatRequest(BaseModel):
    message: str
    model: str = "auto"


class ChatResponse(BaseModel):
    user_message: str
    ai_response: str
    timestamp: datetime
    model_used: Optional[str] = None


class ChatHistory(BaseModel):
    id: int
    user_message: str
    ai_response: str
    timestamp: datetime
    
    class Config:
        from_attributes = True


app = FastAPI(title="LLM Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.get("/")
def root():
    return {"message": "LLM Chatbot API", "docs": "/docs"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(req)
    
    router = get_llm_router()
    ai_response, model_used = await router.invoke(request.message, request.model)
    
    record = ChatMessage(
        user_message=request.message,
        ai_response=ai_response,
        ip_address=ip
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return ChatResponse(
        user_message=request.message,
        ai_response=ai_response,
        timestamp=record.timestamp,
        model_used=model_used
    )


@app.get("/history", response_model=List[ChatHistory])
def get_history(req: Request, limit: int = 20, db: Session = Depends(get_db)):
    ip = get_client_ip(req)
    return db.query(ChatMessage)\
             .filter(ChatMessage.ip_address == ip)\
             .order_by(ChatMessage.timestamp.desc())\
             .limit(limit)\
             .all()


@app.delete("/history")
def delete_history(req: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(req)
    deleted = db.query(ChatMessage).filter(ChatMessage.ip_address == ip).delete()
    db.commit()
    return {"deleted": deleted}


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    router = get_llm_router()
    return {
        "total_messages": db.query(ChatMessage).count(),
        "unique_users": db.query(ChatMessage.ip_address).distinct().count(),
        "provider": "gemini",
        "available_models": router.get_available_models()
    }


@app.get("/models")
def get_models():
    router = get_llm_router()
    available = router.get_available_models()
    
    models = [
        {
            "id": "auto",
            "name": "Auto (Smart Selection)",
            "description": "Automatically selects best model based on query",
            "available": len(available) > 0
        }
    ]
    
    for model_id, config in GEMINI_MODELS.items():
        models.append({
            "id": model_id,
            "name": config.name,
            "description": config.description,
            "best_for": config.best_for,
            "available": model_id in available
        })
    
    return {
        "default": "auto",
        "models": models
    }
