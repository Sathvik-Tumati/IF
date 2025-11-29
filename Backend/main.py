import os
import random
import boto3
import pandas as pd
import numpy as np
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
from sqlalchemy.sql import func

# --- CONFIG ---
DATABASE_URL = "sqlite:///./audit.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# AWS CONFIG (If empty, it mocks it)
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY", "") 
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY", "")
AWS_BUCKET_NAME = "gradeguard-hackathon"
AWS_REGION = "ap-south-1"

app = FastAPI(title="GradeGuard Integrity Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB MODELS ---
class AnswerSheet(Base):
    __tablename__ = "answer_sheets"
    id = Column(Integer, primary_key=True, index=True)
    secret_code = Column(String, unique=True, index=True)
    sheet_type = Column(String) # "OMR" or "DESCRIPTIVE"
    
    cv_total_score = Column(Float, default=0.0)
    manual_total_entry = Column(Float, default=0.0)
    
    is_ghost_risk = Column(Boolean, default=False)
    status = Column(String) 
    file_url = Column(String, nullable=True)
    
    logs = relationship("ScoreLog", back_populates="sheet")

class ScoreLog(Base):
    __tablename__ = "score_logs"
    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(Integer, ForeignKey("answer_sheets.id"))
    action = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    sheet = relationship("AnswerSheet", back_populates="logs")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def upload_to_s3(file_obj, filename):
    if not AWS_ACCESS_KEY or not AWS_SECRET_KEY:
        # Mocking for Datathon safety
        return f"https://mock-s3-bucket.com/{filename}"
    
    s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, 
                      aws_secret_access_key=AWS_SECRET_KEY, region_name=AWS_REGION)
    try:
        s3.upload_fileobj(file_obj, AWS_BUCKET_NAME, filename, ExtraArgs={'ACL': 'public-read'})
        return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{filename}"
    except Exception as e:
        print(f"AWS Error: {e}")
        return f"https://mock-s3-bucket.com/{filename}"

# --- API ---

@app.post("/simulate-exam")
def seed_data(db: Session = Depends(get_db)):
    """Wipes DB and fills it with Story Cases + CSV Data (Robust Pandas Version)"""
    db.query(AnswerSheet).delete()
    db.query(ScoreLog).delete()
    
    print("🚀 Starting Ingestion...")

    # 1. Story Cases
    db.add(AnswerSheet(
        secret_code="DESC-TEL-001", sheet_type="DESCRIPTIVE",
        cv_total_score=48, manual_total_entry=20, status="CRITICAL_MISMATCH",
        file_url="https://placehold.co/600x800/png?text=Telangana+Case"
    ))
    db.add(AnswerSheet(
        secret_code="DESC-GHOST-002", sheet_type="DESCRIPTIVE",
        cv_total_score=0, manual_total_entry=65, status="GHOST_ERROR", is_ghost_risk=True,
        file_url="https://placehold.co/600x800/png?text=Ghost+Page"
    ))

    # 2. Bulk Data from CSV (Robust)
    csv_path = "PS1E.csv"
    if os.path.exists(csv_path):
        try:
            # Try permissive encoding
            try:
                df = pd.read_csv(csv_path, encoding='latin1')
            except:
                df = pd.read_excel(csv_path) # Fallback to Excel if renamed

            # Iterate safely
            count = 0
            for _, row in df.iterrows():
                # Clean Data
                matched = str(row.get('Marks Matched', '')).strip().lower()
                status = "CRITICAL_MISMATCH" if matched == 'no' else "CLEAN"
                
                # Handle NaNs
                try:
                    ai = float(row.get('Auto Calculated Marks', 0)) if pd.notnull(row.get('Auto Calculated Marks')) else 0
                    human = float(row.get('Extracted Marks', 0)) if pd.notnull(row.get('Extracted Marks')) else 0
                    roll = str(row.get('Student Roll Number', 'UNKNOWN'))
                    img = str(row.get('Original Answer Sheet Image', ''))
                except: continue

                db.add(AnswerSheet(
                    secret_code=f"OMR-{roll}",
                    sheet_type="OMR",
                    cv_total_score=ai,
                    manual_total_entry=human,
                    status=status,
                    file_url=img
                ))
                count += 1
            print(f"✅ Ingested {count} rows.")
        except Exception as e:
            print(f"❌ File Read Error: {e}")
    else:
        print("⚠️ PS1E.csv not found.")

    db.commit()
    return {"message": "Simulation Complete"}

@app.get("/audit-queue")
def get_audit_queue(db: Session = Depends(get_db)):
    return db.query(AnswerSheet).all()

@app.post("/resolve/{sheet_id}")
def resolve_anomaly(sheet_id: int, db: Session = Depends(get_db)):
    sheet = db.query(AnswerSheet).filter(AnswerSheet.id == sheet_id).first()
    if sheet:
        sheet.status = "RESOLVED"
        db.add(ScoreLog(sheet_id=sheet.id, action="USER_VERIFIED_FIX"))
        db.commit()
    return {"status": "Resolved"}

@app.post("/upload-sheet")
async def upload_sheet(file: UploadFile = File(...), sheet_type: str = Form(...), db: Session = Depends(get_db)):
    filename = f"{sheet_type}_{random.randint(1000,9999)}_{file.filename}"
    url = upload_to_s3(file.file, filename)
    
    # Mock AI Processing
    status = "CLEAN"
    cv = random.randint(30,90)
    manual = cv
    if random.random() > 0.7: 
        status = "CRITICAL_MISMATCH"
        manual += 5

    db.add(AnswerSheet(
        secret_code=filename.split(".")[0], sheet_type=sheet_type,
        cv_total_score=cv, manual_total_entry=manual, status=status, file_url=url
    ))
    db.commit()
    return {"status": "Uploaded", "url": url}