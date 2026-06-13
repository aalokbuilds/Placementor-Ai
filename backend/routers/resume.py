from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import PyPDF2
import io
from database import get_db, ResumeRecord, init_db
from services.gemini_service import analyze_resume
import json

router = APIRouter()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    raw_text = extract_text_from_pdf(contents)
    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    record = ResumeRecord(filename=file.filename, raw_text=raw_text)
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"resume_id": record.id, "filename": file.filename, "text_preview": raw_text[:300]}


@router.post("/{resume_id}/analyze")
async def analyze(resume_id: int, db: Session = Depends(get_db)):
    record = db.query(ResumeRecord).filter(ResumeRecord.id == resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")

    result = analyze_resume(record.raw_text)

    record.resume_score = result.get("resume_score", 0)
    record.ats_score = result.get("ats_score", 0)
    record.analysis_json = json.dumps(result)
    db.commit()

    return {"resume_id": resume_id, **result}


@router.get("/{resume_id}")
async def get_resume(resume_id: int, db: Session = Depends(get_db)):
    record = db.query(ResumeRecord).filter(ResumeRecord.id == resume_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Resume not found.")

    analysis = json.loads(record.analysis_json) if record.analysis_json else {}
    return {
        "resume_id": record.id,
        "filename": record.filename,
        "resume_score": record.resume_score,
        "ats_score": record.ats_score,
        **analysis,
    }
