from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Dict, Any
from datetime import datetime, timedelta
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/time-entries", response_model=List[schemas.TimeEntry])
async def get_filtered_time_entries(
    filters: schemas.TimeEntryFilters,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    query = db.query(models.TimeEntry).filter(models.TimeEntry.user_id == current_user.id)
    
    if filters.start_date:
        query = query.filter(models.TimeEntry.start_time >= filters.start_date)
    
    if filters.end_date:
        query = query.filter(models.TimeEntry.start_time <= filters.end_date)
    
    if filters.project_id:
        query = query.filter(models.TimeEntry.project_id == filters.project_id)
    
    if filters.search_term:
        search = f"%{filters.search_term}%"
        query = query.filter(models.TimeEntry.description.ilike(search))
    
    if filters.tags and len(filters.tags) > 0:
        entries = query.all()
        filtered_entries = []
        for entry in entries:
            if any(tag in entry.tags for tag in filters.tags):
                filtered_entries.append(entry)
        return filtered_entries
    
    entries = query.order_by(models.TimeEntry.start_time.desc()).all()
    return entries

@router.get("/summary/daily", response_model=List[Dict[str, Any]])
async def get_daily_summary(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=7)
    
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id,
        models.TimeEntry.start_time >= start_date,
        models.TimeEntry.start_time <= end_date,
        models.TimeEntry.duration != None  # Only completed entries
    ).all()
    
    daily_summary = {}
    for entry in entries:
        day = entry.start_time.date().isoformat()
        if day not in daily_summary:
            daily_summary[day] = {
                "date": day,
                "total_duration": 0,
                "entry_count": 0
            }
        
        daily_summary[day]["total_duration"] += entry.duration
        daily_summary[day]["entry_count"] += 1
    
    result = list(daily_summary.values())
    result.sort(key=lambda x: x["date"])
    
    return result

@router.get("/summary/project", response_model=List[Dict[str, Any]])
async def get_project_summary(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id,
        models.TimeEntry.start_time >= start_date,
        models.TimeEntry.start_time <= end_date,
        models.TimeEntry.duration != None  # Only completed entries
    ).all()
    
    projects = {p.id: p.name for p in db.query(models.Project).filter(
        models.Project.user_id == current_user.id
    ).all()}
    
    project_summary = {}
    for entry in entries:
        project_id = entry.project_id or "no_project"
        project_name = projects.get(project_id, "No Project")
        
        if project_id not in project_summary:
            project_summary[project_id] = {
                "project_id": project_id if project_id != "no_project" else None,
                "project_name": project_name,
                "total_duration": 0,
                "entry_count": 0
            }
        
        project_summary[project_id]["total_duration"] += entry.duration
        project_summary[project_id]["entry_count"] += 1
    
    result = list(project_summary.values())
    result.sort(key=lambda x: x["total_duration"], reverse=True)
    
    return result

@router.get("/summary/tags", response_model=List[Dict[str, Any]])
async def get_tags_summary(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id,
        models.TimeEntry.start_time >= start_date,
        models.TimeEntry.start_time <= end_date,
        models.TimeEntry.duration != None  # Only completed entries
    ).all()
    
    tag_summary = {}
    for entry in entries:
        for tag in entry.tags:
            if tag not in tag_summary:
                tag_summary[tag] = {
                    "tag": tag,
                    "total_duration": 0,
                    "entry_count": 0
                }
            
            tag_summary[tag]["total_duration"] += entry.duration
            tag_summary[tag]["entry_count"] += 1
    
    result = list(tag_summary.values())
    result.sort(key=lambda x: x["total_duration"], reverse=True)
    
    return result
