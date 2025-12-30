from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List
import os
from datetime import datetime
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

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


class ChatResponse(BaseModel):
    user_message: str
    ai_response: str
    timestamp: datetime


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


async def get_ai_response(message: str) -> str:
    provider = os.getenv("AI_PROVIDER", "mock").lower()
    
    if provider == "huggingface":
        return await call_huggingface(message)
    return f"Mock: {message}"


async def call_huggingface(message: str) -> str:
    try:
        token = os.getenv("HUGGINGFACE_API_KEY", "")
        if not token:
            return "HuggingFace token missing"
        
        client = InferenceClient(api_key=token)
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.1-70B-Instruct",
            messages=[{"role": "user", "content": message}],
            max_tokens=500
        )
        
        if response and response.choices:
            return response.choices[0].message.content
        return "No response"
    except Exception as e:
        return f"Error: {str(e)}"


@app.get("/")
def root():
    return {"message": "LLM Chatbot API", "docs": "/docs"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(req)
    ai_response = await get_ai_response(request.message)
    
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
        timestamp=record.timestamp
    )


@app.get("/history", response_model=List[ChatHistory], summary="Dohvati historiju", description="Dohvati historiju chat poruka")
def get_historija(req: Request, limit: int = 20, db: Session = Depends(get_db)):
    ip = get_client_ip(req)
    return db.query(ChatMessage)\
             .filter(ChatMessage.ip_address == ip)\
             .order_by(ChatMessage.timestamp.desc())\
             .limit(limit)\
             .all()


@app.delete("/history", summary="Obriši historiju", description="Obriši sve chat poruke iz historije")
def obrisi_historiju(req: Request, db: Session = Depends(get_db)):
    ip = get_client_ip(req)
    deleted = db.query(ChatMessage).filter(ChatMessage.ip_address == ip).delete()
    db.commit()
    return {"deleted": deleted}


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_messages": db.query(ChatMessage).count(),
        "unique_users": db.query(ChatMessage.ip_address).distinct().count(),
        "provider": os.getenv("AI_PROVIDER", "mock")
    }
