import os
from typing import Optional, Tuple
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from providers import (
    get_api_key, 
    select_model_for_query,
    GEMINI_MODELS,
    DEFAULT_MODEL
)


class LLMRouter:
    def __init__(self):
        self.api_key = get_api_key()
        self.models: dict[str, ChatGoogleGenerativeAI] = {}
        self._init_models()
    
    def _init_models(self):
        if not self.api_key:
            return
        
        for model_id in GEMINI_MODELS.keys():
            try:
                self.models[model_id] = ChatGoogleGenerativeAI(
                    model=model_id,
                    google_api_key=self.api_key,
                    temperature=0.7,
                    max_output_tokens=4096
                )
            except Exception as e:
                print(f"Failed to init {model_id}: {e}")
    
    def get_available_models(self) -> list[str]:
        return list(self.models.keys())
    
    async def invoke(self, message: str, model: str = "auto") -> Tuple[str, str]:
        if not self.models:
            return "No models available. Check GOOGLE_API_KEY.", "none"
        
        if model == "auto":
            selected_model = select_model_for_query(message)
        else:
            selected_model = model if model in self.models else DEFAULT_MODEL
        
        models_to_try = [selected_model] + [
            m for m in self.models.keys() if m != selected_model
        ]
        
        last_error = None
        for model_id in models_to_try:
            if model_id not in self.models:
                continue
            try:
                llm = self.models[model_id]
                response = await llm.ainvoke([HumanMessage(content=message)])
                return response.content, model_id
            except Exception as e:
                last_error = e
                print(f"Model {model_id} failed: {e}")
                continue
        
        return f"All models failed. Last error: {last_error}", "error"


_router: Optional[LLMRouter] = None


def get_llm_router() -> LLMRouter:
    global _router
    if _router is None:
        _router = LLMRouter()
    return _router
