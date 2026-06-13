from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini_service import chat_with_mentor

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    context: str = ""


@router.post("/message")
async def send_message(req: ChatRequest):
    reply = chat_with_mentor(req.message, req.context)
    return {"reply": reply}
