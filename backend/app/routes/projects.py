from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/", response_model=schemas.Project)
async def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    db_project = models.Project(
        id=utils.generate_id(),
        name=project.name,
        description=project.description,
        color=project.color,
        user_id=current_user.id
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project

@router.get("/", response_model=List[schemas.Project])
async def get_projects(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    projects = db.query(models.Project).filter(
        models.Project.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return projects

@router.get("/{project_id}", response_model=schemas.Project)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project

@router.put("/{project_id}", response_model=schemas.Project)
async def update_project(
    project_id: str,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    db_project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    
    return db_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    db_project = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    
    return None
