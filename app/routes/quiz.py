from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.evaluation_service import evaluate_answer, generate_followup_question
from app.database.db import update_progress
from app.database.session import SessionLocal
from app.database import models
from app.services.summary_service import generate_topic_focused_quiz
from app.services.mastery_service import calculate_mastery

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AnswerRequest(BaseModel):
    user_id: int
    topic: str
    question: str
    correct_answer: str
    user_answer: str
    context: str

@router.post("/submit-answer")
def submit_answer(data: AnswerRequest, db: Session = Depends(get_db)):
    is_correct = evaluate_answer(
        data.question,
        data.correct_answer,
        data.user_answer
    )

    # 1. Update legacy progress (optional, but keeping for backward compatibility)
    update_progress(str(data.user_id), data.topic, is_correct)

    # 2. Save attempt to SQLAlchemy DB for analytics
    new_attempt = models.QuizAttempt(
        user_id=data.user_id,
        topic=data.topic,
        score=1 if is_correct else 0
    )
    db.add(new_attempt)
    db.commit()

    if is_correct:
        return {"result": "correct"}

    followup = generate_followup_question(
        data.context,
        data.question
    )

    return {
        "result": "wrong",
        "followup": followup
    }

@router.get("/retest/{topic_name}")
def retest_topic(topic_name: str, db: Session = Depends(get_db)):
    # 1. Find the topic in the database to get the associated document
    topic_record = db.query(models.Topic).filter(models.Topic.name == topic_name).first()
    
    if not topic_record:
        raise HTTPException(status_code=404, detail="Topic not found. Please upload a document first.")

    document = topic_record.document
    if not document:
        raise HTTPException(status_code=404, detail="Associated document not found.")

    # 2. Generate new focused questions using RAG on the document content
    try:
        result = generate_topic_focused_quiz(topic_name, document.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress")
def get_progress(user_id: int, db: Session = Depends(get_db)):
    # Retrieve all unique topics from the database
    topics = db.query(models.Topic).all()

    progress = {}
    
    # Calculate mastery for each topic for the specific user
    for topic in topics:
        mastery = calculate_mastery(db, user_id, topic.name)
        progress[topic.name] = mastery

    return progress