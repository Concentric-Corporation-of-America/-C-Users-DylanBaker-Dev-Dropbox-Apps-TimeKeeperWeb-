from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/timer",
    tags=["timer"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/start", response_model=schemas.TimeEntry)
async def start_timer(
    timer_data: schemas.TimerStart,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    running_timer = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id,
        models.TimeEntry.end_time == None
    ).first()
    
    if running_timer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a running timer"
        )
    
    time_entry = models.TimeEntry(
        id=utils.generate_id(),
        description=timer_data.description,
        start_time=datetime.utcnow(),
        project_id=timer_data.project_id,
        tags=timer_data.tags,
        user_id=current_user.id
    )
    
    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)
    
    return time_entry

@router.post("/stop", response_model=schemas.TimeEntry)
async def stop_timer(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    running_timer = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id,
        models.TimeEntry.end_time == None
    ).first()
    
    if not running_timer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No running timer found"
        )
    
    now = datetime.utcnow()
    running_timer.end_time = now
    
    start_time = running_timer.start_time
    duration = (now - start_time).total_seconds()
    running_timer.duration = duration
    
    db.commit()
    db.refresh(running_timer)
    
    return running_timer

@router.get("/current", response_model=schemas.TimeEntry)
async def get_current_timer(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    running_timer = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id,
        models.TimeEntry.end_time == None
    ).first()
    
    if not running_timer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No running timer found"
        )
    
    return running_timer

@router.get("/entries", response_model=List[schemas.TimeEntry])
async def get_time_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    entries = db.query(models.TimeEntry).filter(
        models.TimeEntry.user_id == current_user.id
    ).order_by(models.TimeEntry.start_time.desc()).offset(skip).limit(limit).all()
    
    return entries

@router.get("/entries/{entry_id}", response_model=schemas.TimeEntry)
async def get_time_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    entry = db.query(models.TimeEntry).filter(
        models.TimeEntry.id == entry_id,
        models.TimeEntry.user_id == current_user.id
    ).first()
    
    if entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    return entry

@router.put("/entries/{entry_id}", response_model=schemas.TimeEntry)
async def update_time_entry(
    entry_id: str,
    entry_update: schemas.TimeEntryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    db_entry = db.query(models.TimeEntry).filter(
        models.TimeEntry.id == entry_id,
        models.TimeEntry.user_id == current_user.id
    ).first()
    
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    update_data = entry_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)
    
    if db_entry.start_time and db_entry.end_time:
        db_entry.duration = (db_entry.end_time - db_entry.start_time).total_seconds()
    
    db.commit()
    db.refresh(db_entry)
    
    return db_entry

@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    db_entry = db.query(models.TimeEntry).filter(
        models.TimeEntry.id == entry_id,
        models.TimeEntry.user_id == current_user.id
    ).first()
    
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    db.delete(db_entry)
    db.commit()
    
    return None
