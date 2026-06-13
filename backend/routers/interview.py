from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, ResumeRecord, InterviewSession
from services.gemini_service import generate_interview_question, evaluate_interview_answer
import json

router = APIRouter()


class QuestionRequest(BaseModel):
    resume_id: int
    target_role: str
    question_type: str = "technical"  # technical | hr | behavioral


class EvaluateRequest(BaseModel):
    session_id: int
    answer: str
    target_role: str


@router.post("/question")
async def get_question(req: QuestionRequest, db: Session = Depends(get_db)):
    record = db.query(ResumeRecord).filter(ResumeRecord.id == req.resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")

    result = generate_interview_question(req.target_role, req.question_type, record.raw_text)

    session = InterviewSession(
        resume_id=req.resume_id,
        question=result.get("question", ""),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {"session_id": session.id, **result}


@router.post("/evaluate")
async def evaluate(req: EvaluateRequest, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    result = evaluate_interview_answer(session.question, req.answer, req.target_role)

    session.answer = req.answer
    session.feedback_json = json.dumps(result)
    db.commit()

    return result
