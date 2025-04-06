import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="TimeKeeperWeb API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    created_at: datetime

class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    user_id: str

class TimeEntry(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

users_db = {
    "demo@example.com": {
        "id": "1",
        "email": "demo@example.com",
        "name": "Demo User",
        "hashed_password": pwd_context.hash("password"),
        "created_at": datetime.now()
    }
}

projects_db = [
    {
        "id": "1",
        "name": "Website Redesign",
        "description": "Redesign company website with new branding",
        "color": "#3b82f6",
        "is_archived": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "user_id": "1"
    },
    {
        "id": "2",
        "name": "Mobile App Development",
        "description": "Develop iOS and Android mobile applications",
        "color": "#10b981",
        "is_archived": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "user_id": "1"
    }
]

time_entries_db = [
    {
        "id": "1",
        "user_id": "1",
        "project_id": "1",
        "description": "Working on homepage design",
        "start_time": datetime.now() - timedelta(hours=1),
        "end_time": datetime.now(),
        "duration": 3600,
        "tags": ["design", "frontend"],
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
]

current_timer = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(email: str):
    if email in users_db:
        user_dict = users_db[email]
        return user_dict
    return None

def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(token_data.email)
    if user is None:
        raise credentials_exception
    return user

@app.post("/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    }

@app.post("/auth/register", response_model=User)
async def register_user(user_data: UserRegister):
    if user_data.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(len(users_db) + 1)
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "hashed_password": hashed_password,
        "created_at": datetime.now()
    }
    
    users_db[user_data.email] = new_user
    
    return User(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        created_at=new_user["created_at"]
    )

@app.get("/projects/", response_model=List[Project])
async def get_projects(current_user: dict = Depends(get_current_user)):
    user_projects = [
        Project(**project) for project in projects_db 
        if project["user_id"] == current_user["id"]
    ]
    return user_projects

@app.post("/projects/", response_model=Project)
async def create_project(project_data: dict, current_user: dict = Depends(get_current_user)):
    project_id = str(len(projects_db) + 1)
    now = datetime.now()
    
    new_project = {
        "id": project_id,
        "name": project_data.get("name"),
        "description": project_data.get("description", ""),
        "color": project_data.get("color", "#3b82f6"),
        "is_archived": False,
        "created_at": now,
        "updated_at": now,
        "user_id": current_user["id"]
    }
    
    projects_db.append(new_project)
    
    return Project(**new_project)

@app.get("/timer/current", response_model=Optional[TimeEntry])
async def get_current_timer(current_user: dict = Depends(get_current_user)):
    global current_timer
    if current_timer and current_timer["user_id"] == current_user["id"]:
        return TimeEntry(**current_timer)
    return None

@app.post("/timer/start", response_model=TimeEntry)
async def start_timer(timer_data: dict, current_user: dict = Depends(get_current_user)):
    global current_timer
    
    if current_timer and current_timer["user_id"] == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timer already running"
        )
    
    timer_id = str(len(time_entries_db) + 1)
    now = datetime.now()
    
    new_timer = {
        "id": timer_id,
        "user_id": current_user["id"],
        "project_id": timer_data.get("project_id"),
        "description": timer_data.get("description", ""),
        "start_time": now,
        "tags": timer_data.get("tags", []),
        "created_at": now,
        "updated_at": now
    }
    
    current_timer = new_timer
    
    return TimeEntry(**new_timer)

@app.post("/timer/stop", response_model=TimeEntry)
async def stop_timer(current_user: dict = Depends(get_current_user)):
    global current_timer
    
    if not current_timer or current_timer["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No timer running"
        )
    
    now = datetime.now()
    start_time = current_timer["start_time"]
    duration = int((now - start_time).total_seconds())
    
    completed_timer = {
        **current_timer,
        "end_time": now,
        "duration": duration,
        "updated_at": now
    }
    
    time_entries_db.append(completed_timer)
    current_timer = None
    
    return TimeEntry(**completed_timer)

@app.get("/timer/recent", response_model=List[TimeEntry])
async def get_recent_entries(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    user_entries = [
        TimeEntry(**entry) for entry in time_entries_db 
        if entry["user_id"] == current_user["id"]
    ]
    return user_entries[:limit]

@app.get("/")
async def root():
    return {"message": "TimeKeeperWeb API is running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
