from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy import TypeDecorator
import json
import datetime
from .database import Base

class ArrayType(TypeDecorator):
    impl = Text
    
    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None
        
    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return []

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    time_entries = relationship("TimeEntry", back_populates="user")
    projects = relationship("Project", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    color = Column(String, nullable=True)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    user_id = Column(String, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="projects")
    time_entries = relationship("TimeEntry", back_populates="project")

class TimeEntry(Base):
    __tablename__ = "time_entries"
    
    id = Column(String, primary_key=True, index=True)
    description = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)
    tags = Column(ArrayType, default=[])
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    user_id = Column(String, ForeignKey("users.id"))
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    
    user = relationship("User", back_populates="time_entries")
    project = relationship("Project", back_populates="time_entries")
