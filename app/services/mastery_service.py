from sqlalchemy.orm import Session
from app.database.models import QuizAttempt

def calculate_mastery(db: Session, user_id: int, topic: str):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id,
        QuizAttempt.topic == topic
    ).all()

    if not attempts:
        return 0

    total = len(attempts)
    # Counts an attempt as 'mastered' if the score reflects success (e.g. 1)
    correct = sum(1 for a in attempts if a.score == 1)

    return round((correct / total) * 100, 2)
