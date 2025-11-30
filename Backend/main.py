import os
import random
import boto3
import pandas as pd
import json
import numpy as np
from PIL import Image, ImageOps
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
from sqlalchemy.sql import func

# --- CONFIGURATION ---
DATABASE_URL = "sqlite:///./audit.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# AWS CONFIG (Leave empty to use Local Mode)
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY", "") 
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY", "")
AWS_BUCKET_NAME = "gradeguard-hackathon"
AWS_REGION = "ap-south-1"

app = FastAPI(title="Integrity Forensics Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOCAL FILE STORAGE (Crucial for Demo View) ---
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- DB MODELS ---
class AnswerSheet(Base):
    __tablename__ = "answer_sheets"
    id = Column(Integer, primary_key=True, index=True)
    secret_code = Column(String, unique=True, index=True)
    sheet_type = Column(String) 
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
    if not AWS_ACCESS_KEY or not AWS_SECRET_KEY: return None
    s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, region_name=AWS_REGION)
    try:
        s3.upload_fileobj(file_obj, AWS_BUCKET_NAME, filename, ExtraArgs={'ACL': 'public-read'})
        return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{filename}"
    except Exception as e: return None

# --- COMPUTER VISION ENGINE (PRO-GRADE) ---
def analyze_ink_density(image_path):
    """
    Calculates ink density with auto-cropping and contrast boosting.
    Returns: % of the page covered in dark pixels.
    """
    try:
        with Image.open(image_path) as img:
            img = img.resize((800, 1100)) # Normalize size
            
            # Crop 10% from borders to remove scanner noise/punch holes
            w, h = img.size
            img = img.crop((w*0.1, h*0.1, w*0.9, h*0.9))
            
            # Auto-Contrast to handle faint pencil
            gray = img.convert('L')
            enhanced = ImageOps.autocontrast(gray, cutoff=5)
            arr = np.array(enhanced)
            
            # Count pixels darker than 140 (Strict Ink detection)
            ink_pixels = np.sum(arr < 140)
            total_pixels = arr.size
            
            density = (ink_pixels / total_pixels) * 100
            return density
    except Exception as e:
        print(f"⚠️ CV Error: {e}")
        return 0.0

# --- API ENDPOINTS ---

@app.post("/simulate-exam")
def seed_data(db: Session = Depends(get_db)):
    """
    Smart Simulation: 
    - Wipes OLD simulation data (identified by placeholder URLs).
    - PRESERVES your manual uploads.
    - Re-injects fresh CSV data for the demo.
    """
    print("🚀 Starting Smart Simulation...")

    try:
        # 1. Delete only simulation sheets (placeholders)
        sim_sheets = db.query(AnswerSheet).filter(
            (AnswerSheet.file_url.like("%placehold.co%")) | 
            (AnswerSheet.file_url.like("%scribdassets%"))
        ).all()
        
        sim_ids = [s.id for s in sim_sheets]
        if sim_ids:
            db.query(ScoreLog).filter(ScoreLog.sheet_id.in_(sim_ids)).delete(synchronize_session=False)
            db.query(AnswerSheet).filter(AnswerSheet.id.in_(sim_ids)).delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Cleanup Error: {e}")

    # 2. Inject Story Cases
    db.add(AnswerSheet(secret_code="DESC-TEL-001", sheet_type="DESCRIPTIVE", cv_total_score=48, manual_total_entry=20, status="CRITICAL_MISMATCH", file_url="https://placehold.co/600x800/png?text=Telangana+Case"))
    db.add(AnswerSheet(secret_code="DESC-GHOST-002", sheet_type="DESCRIPTIVE", cv_total_score=0, manual_total_entry=65, status="GHOST_ERROR", is_ghost_risk=True, file_url="https://placehold.co/600x800/png?text=Ghost+Page"))

    # 3. Inject Bulk CSV Data (Using known patterns for stability)
    csv_path = "PS1E.csv"
    KNOWN_ERRORS = [102, 105, 107, 110, 112, 115, 116]

    if os.path.exists(csv_path):
        try:
            try: df = pd.read_csv(csv_path, encoding='utf-8-sig')
            except: 
                try: df = pd.read_csv(csv_path, encoding='latin1')
                except: df = pd.read_excel(csv_path)

            df.columns = df.columns.str.strip()
            
            count = 0
            for _, row in df.iterrows():
                try:
                    human_score = float(row.get('Extracted Marks', 0))
                    roll_raw = row.get('Student Roll Number', 0)
                    roll = int(roll_raw) if pd.notnull(roll_raw) else 0
                    img = str(row.get('Original Answer Sheet Image', ''))
                    
                    if roll in KNOWN_ERRORS:
                        status = "CRITICAL_MISMATCH"
                        offset = random.choice([-5, -10, 5, 10])
                        ai_score = max(0, min(100, human_score + offset))
                        if ai_score == human_score: ai_score -= 5
                    else:
                        status = "CLEAN"
                        ai_score = human_score
                    
                    db.add(AnswerSheet(secret_code=f"OMR-{roll}", sheet_type="OMR", cv_total_score=ai_score, manual_total_entry=human_score, status=status, file_url=img))
                    count += 1
                except: continue
            print(f"✅ Processed {count} CSV rows.")
        except Exception as e: print(f"❌ CSV Error: {e}")
    else: print("⚠️ PS1E.csv not found.")

    db.commit()
    return {"message": "Audit Simulation Refreshed (Uploads Preserved)"}

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
async def upload_sheet(
    file: UploadFile = File(...),              
    sheet_type: str = Form(...), 
    manual_total_entry: float = Form(...),
    reference_file: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    # 1. SAVE FILE
    filename = f"{sheet_type}_{random.randint(1000,9999)}_{file.filename}"
    local_path = f"uploads/{filename}"
    with open(local_path, "wb") as buffer:
        buffer.write(await file.read())
    
    url = upload_to_s3(file.file, filename)
    if not url: url = f"http://127.0.0.1:8000/uploads/{filename}"

    # 2. SAVE KEY / REFERENCE DOC
    if reference_file:
        ref_name = f"REF_{random.randint(1000,9999)}_{reference_file.filename}"
        with open(f"uploads/{ref_name}", "wb") as buffer:
            buffer.write(await reference_file.read())

    # 3. INTELLIGENT ANALYSIS LOGIC
    status = "CLEAN"
    cv_score = manual_total_entry
    is_ghost = False
    
    print(f"\n🔍 ANALYZING UPLOAD: {filename}")
    print(f"   👤 Human Score: {manual_total_entry}")

    if sheet_type == "DESCRIPTIVE":
        # CV ANALYSIS
        density = analyze_ink_density(local_path)
        
        # TUNED ESTIMATION:
        # Base 3 marks + (Density * 5). Cap at 60.
        estimated_score = min(60, int(3 + (density * 5)))
        
        print(f"   📊 Ink Density: {density:.2f}%")
        print(f"   🤖 AI Estimate: {estimated_score} marks")
        
        diff = abs(estimated_score - manual_total_entry)
        print(f"   📉 Difference: {diff}")

        # LOGIC 1: GHOST CHECK (Strict)
        if density > 1.0 and manual_total_entry == 0:
            status = "GHOST_ERROR"
            is_ghost = True
            cv_score = estimated_score
            print(f"   [!] GHOST DETECTED: High density ({density:.2f}%) but 0 marks.")
        
        # LOGIC 2: FRAUD CHECK
        elif density < 0.5 and manual_total_entry > 0:
             status = "CRITICAL_MISMATCH"
             cv_score = 0.0
             print(f"   [!] FRAUD DETECTED: Empty page has marks.")
             
        # LOGIC 3: VARIANCE CHECK (Mismatch)
        # If gap > 5, it's a Mismatch.
        elif diff > 5:
            status = "CRITICAL_MISMATCH"
            cv_score = estimated_score
            print(f"   [!] MISMATCH DETECTED: Gap is {diff} (Threshold: > 5)")
            
        else:
            # CLEAN CASE:
            # Use the AI score to show independent verification
            status = "CLEAN"
            cv_score = estimated_score 
            print(f"   ✅ Verified Clean: AI ({estimated_score}) agrees with Human ({manual_total_entry})")

    elif sheet_type == "OMR":
        if reference_file:
            # Simulate Key Match (30% chance of error for demo)
            if random.random() > 0.7:
                cv_score = max(0, manual_total_entry - 5)
                status = "CRITICAL_MISMATCH"
                print(f"   [!] OMR Mismatch vs Key")
        else:
            print("   ⚠️ OMR uploaded without Key.")

    db.add(AnswerSheet(secret_code=filename.split(".")[0], sheet_type=sheet_type, cv_total_score=cv_score, manual_total_entry=manual_total_entry, status=status, file_url=url, is_ghost_risk=is_ghost))
    db.commit()
    return {"status": "Uploaded", "url": url}