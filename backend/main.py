from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import resume, analysis, interview, chat, roadmap


app = FastAPI(title="Placementor AI API", version="1.0.0")


@app.on_event("startup")
async def startup_event():
    init_db()


import os
from dotenv import load_dotenv

load_dotenv()

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])


@app.get("/")
def root():
    return {"message": "Placementor AI API is running"}