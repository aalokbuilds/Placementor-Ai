from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import get_db, ResumeRecord
from services.gemini_service import generate_roadmap
import json

router = APIRouter()


class RoadmapRequest(BaseModel):
    resume_id: int
    target_role: str
    missing_skills: List[str] = []


@router.post("/generate")
async def generate(req: RoadmapRequest, db: Session = Depends(get_db)):
    record = db.query(ResumeRecord).filter(ResumeRecord.id == req.resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")

    result = generate_roadmap(record.raw_text, req.target_role, req.missing_skills)
    return result
