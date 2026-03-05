from app.database.db import get_doc_hash, get_cached_response, save_cache
from fastapi import Request, APIRouter, UploadFile, File, BackgroundTasks, Depends, Form
from app.services.summary_service import generate_rag_summary_and_quiz
from app.services.topic_service import extract_topics
from app.services.mastery_service import calculate_mastery
from app.database.session import SessionLocal
from app.database import models
from sqlalchemy.orm import Session
import fitz  # PyMuPDF
import io
import traceback

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
processing_tasks = set()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def process_document(text: str, doc_hash: str, user_id: int):
    db = SessionLocal()
    try:
        # 1. Extract Topics
        topics = extract_topics(text)
        
        # 2. Calculate average mastery across extracted topics to determine difficulty
        # For a new document, we might just use 0, but if topics exist, we check progress
        total_mastery = 0
        if topics:
            for t in topics:
                total_mastery += calculate_mastery(db, user_id, t)
            avg_mastery = total_mastery / len(topics)
        else:
            avg_mastery = 0

        # 3. Generate Summary & Quiz with adaptive difficulty
        result = generate_rag_summary_and_quiz(text, mastery=avg_mastery)
        result["extracted_topics"] = topics
        
        # 4. Save Cache
        save_cache(doc_hash, result)

        # 5. Save Document and Topics to SQLAlchemy DB
        doc_record = db.query(models.Document).filter(models.Document.filename == doc_hash).first()
        if not doc_record:
            doc_record = models.Document(
                filename=doc_hash,
                content=text,
                user_id=user_id
            )
            db.add(doc_record)
            db.flush() # Get ID
            
            for t_name in topics:
                topic_record = models.Topic(name=t_name, document_id=doc_record.id)
                db.add(topic_record)
            
            db.commit()

    except Exception as e:
        traceback.print_exc()
        save_cache(doc_hash, {"error": f"Processing failed: {str(e)}"})
    finally:
        processing_tasks.discard(doc_hash)
        db.close()

@router.post("/upload")
async def upload_notes(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: int = Form(1)
):
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        return {"error": "File too large. Max 5MB allowed."}

    text = ""
    if file.filename.endswith(".pdf"):
        pdf_stream = io.BytesIO(content)
        with fitz.open(stream=pdf_stream, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text() + "\n"
    elif file.filename.endswith(".txt"):
        text = content.decode("utf-8", errors="ignore")
    else:
        return {"error": "Unsupported file format. Please upload .txt or .pdf files."}
    
    if not text.strip():
        return {"error": "Could not extract text from the uploaded file."}

    doc_hash = get_doc_hash(text)
    cached = get_cached_response(doc_hash)

    if cached:
        return {"status": "ready", "data": cached}

    if doc_hash in processing_tasks:
        return {"status": "processing", "doc_hash": doc_hash}

    processing_tasks.add(doc_hash)
    background_tasks.add_task(process_document, text, doc_hash, user_id)

    return {"status": "processing", "doc_hash": doc_hash}

@router.get("/status/{doc_hash}")
def check_status(doc_hash: str):
    cached = get_cached_response(doc_hash)
    if cached:
        return {"status": "ready", "data": cached}
    if doc_hash in processing_tasks:
        return {"status": "processing"}
    return {"status": "error", "error": "Task failed or disappeared."}
