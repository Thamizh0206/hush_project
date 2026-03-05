from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    documents = relationship("Document", back_populates="owner")
    attempts = relationship("QuizAttempt", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    content = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="documents")
    topics = relationship("Topic", back_populates="document")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    document_id = Column(Integer, ForeignKey("documents.id"))

    document = relationship("Document", back_populates="topics")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    score = Column(Integer)
    topic = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="attempts")
