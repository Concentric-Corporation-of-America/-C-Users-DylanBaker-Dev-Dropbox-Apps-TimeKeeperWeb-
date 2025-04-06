from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
import psycopg
import os
from dotenv import load_dotenv

from .database import engine, Base
from .routes import auth, projects, timer, reports

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TimeKeeperWeb API",
    description="API for time tracking and project management",
    version="1.0.0"
)

# Define allowed origins
allowed_origins = [
    "https://time-keeper-app-tsck8yj9.devinapps.com",  # Production frontend
    "http://localhost:5173",  # Local development frontend
    "http://localhost:3000"   # Alternative local development port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Specific allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin", "")
    
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = allowed_origins[0]  # Default to production
        
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(timer.router)
app.include_router(reports.router)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to TimeKeeperWeb API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.options("/{rest_of_path:path}")
async def options_route(rest_of_path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        },
    )
