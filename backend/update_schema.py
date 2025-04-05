import os
from dotenv import load_dotenv
import psycopg2
from app.database import Base, engine
from app.models import User, Project, TimeEntry

def update_database_schema():
    """Update the PostgreSQL database schema for TimeKeeperWeb application."""
    load_dotenv()
    
    db_url = os.getenv("DATABASE_URL")
    
    if db_url and 'defaultdb' in db_url:
        db_url = db_url.replace('/defaultdb', '/timekeeper')
    
    if not db_url:
        print("Error: DATABASE_URL environment variable not found.")
        return False
    
    try:
        print(f"Connecting to PostgreSQL using: {db_url}")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Dropping existing tables...")
        cursor.execute("DROP TABLE IF EXISTS time_entries CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS projects CASCADE;")
        cursor.execute("DROP TABLE IF EXISTS users CASCADE;")
        
        print("Creating tables with updated schema...")
        
        cursor.execute("""
        CREATE TABLE users (
            id VARCHAR(255) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            photo_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        cursor.execute("""
        CREATE TABLE projects (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            color VARCHAR(50),
            is_archived BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id VARCHAR(255) REFERENCES users(id)
        );
        """)
        
        cursor.execute("""
        CREATE TABLE time_entries (
            id VARCHAR(255) PRIMARY KEY,
            description TEXT,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            duration FLOAT,
            tags TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id VARCHAR(255) REFERENCES users(id),
            project_id VARCHAR(255) REFERENCES projects(id)
        );
        """)
        
        print("Database tables created successfully")
        conn.close()
        
        return True
    except Exception as e:
        print(f'Error updating database schema: {e}')
        return False

if __name__ == "__main__":
    if update_database_schema():
        print("Database schema update completed successfully")
    else:
        print("Database schema update failed")
