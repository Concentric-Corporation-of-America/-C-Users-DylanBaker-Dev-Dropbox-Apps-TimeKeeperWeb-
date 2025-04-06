from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    photo_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    is_archived: Optional[bool] = None

class Project(ProjectBase):
    id: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    user_id: str
    
    class Config:
        from_attributes = True

class TimeEntryBase(BaseModel):
    description: str
    start_time: datetime
    project_id: Optional[str] = None
    tags: List[str] = []

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(BaseModel):
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    project_id: Optional[str] = None
    tags: Optional[List[str]] = None

class TimeEntry(TimeEntryBase):
    id: str
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    user_id: str
    
    class Config:
        from_attributes = True

class TimerStart(BaseModel):
    description: str
    project_id: Optional[str] = None
    tags: List[str] = []

class TimerStop(BaseModel):
    pass

class TimeEntryFilters(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    project_id: Optional[str] = None
    search_term: Optional[str] = None
    tags: Optional[List[str]] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
