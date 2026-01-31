from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date

from . import models, database, ai_service

# Initialize DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Job Tracker API")

# CORS Setup (Allow Frontend to communicate)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development, allow all. In prod, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class JobApplicationBase(BaseModel):
    company: str
    role: str
    status: str = "Applied"
    date_applied: Optional[date] = None
    notes: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplication(JobApplicationBase):
    id: int
    
    class Config:
        from_attributes = True # updated for Pydantic v2

class AnalysisRequest(BaseModel):
    resume_text: str
    jd_text: str

class AnalysisResponse(BaseModel):
    score: float
    missing_keywords: List[str]
    matched_keywords: List[str]

# --- Dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "Job Tracker API is running"}

# 1. List Applications
@app.get("/applications/", response_model=List[JobApplication])
def read_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    applications = db.query(models.JobApplication).offset(skip).limit(limit).all()
    return applications

# 2. Add Application
@app.post("/applications/", response_model=JobApplication)
def create_application(application: JobApplicationCreate, db: Session = Depends(get_db)):
    db_app = models.JobApplication(**application.model_dump()) # model_dump() for Pydantic v2
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

# 3. Delete Application
@app.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    db_app = db.query(models.JobApplication).filter(models.JobApplication.id == application_id).first()
    if db_app is None:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(db_app)
    db.commit()
    return {"ok": True}

# 4. Analyze Resume vs JD
@app.post("/analyze/", response_model=AnalysisResponse)
def analyze_resume(request: AnalysisRequest):
    result = ai_service.ai_service.match(request.resume_text, request.jd_text)
    return result
