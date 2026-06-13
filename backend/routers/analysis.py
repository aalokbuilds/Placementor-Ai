from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, ResumeRecord
from services.gemini_service import detect_skill_gap, compute_readiness_score
import json

router = APIRouter()


class SkillGapRequest(BaseModel):
    resume_id: int
    target_role: str


@router.post("/skill-gap")
async def skill_gap(req: SkillGapRequest, db: Session = Depends(get_db)):
    record = db.query(ResumeRecord).filter(ResumeRecord.id == req.resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")

    analysis = json.loads(record.analysis_json) if record.analysis_json else {}
    current_skills = analysis.get("technical_skills", []) + analysis.get("soft_skills", [])

    result = detect_skill_gap(record.raw_text, req.target_role, current_skills)
    return result


@router.post("/readiness")
async def readiness_score(req: SkillGapRequest, db: Session = Depends(get_db)):
    record = db.query(ResumeRecord).filter(ResumeRecord.id == req.resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")

    analysis = json.loads(record.analysis_json) if record.analysis_json else {}
    current_skills = analysis.get("technical_skills", []) + analysis.get("soft_skills", [])

    gap_result = detect_skill_gap(record.raw_text, req.target_role, current_skills)
    skill_match = gap_result.get("skill_match_percentage", 0)

    readiness = compute_readiness_score(
        record.resume_score or 0,
        record.ats_score or 0,
        skill_match,
    )
    return {
        **readiness,
        "resume_score": record.resume_score,
        "ats_score": record.ats_score,
        "skill_match": skill_match,
        "breakdown": {
            "resume_weight": "35%",
            "ats_weight": "25%",
            "skill_weight": "40%",
        },
    }
