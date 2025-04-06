from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Default to the provided connection string if DATABASE_URL is not set
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://doadmin:AVNS_ifzweLn1iD8jj3kBsZf@bauen-db-do-user-20046124-0.d.db.ondigitalocean.com:25060/timekeeper")

# Ensure we're using the timekeeper database
if DATABASE_URL and ('defaultdb' in DATABASE_URL or DATABASE_URL.endswith('postgres')):
    DATABASE_URL = DATABASE_URL.replace('/defaultdb', '/timekeeper').replace('/postgres', '/timekeeper')

print(f"Connecting to database: {DATABASE_URL.split('@')[1]}")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
