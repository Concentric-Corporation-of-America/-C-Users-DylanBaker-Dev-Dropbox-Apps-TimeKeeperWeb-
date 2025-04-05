import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def setup_database():
    """Set up the PostgreSQL database for TimeKeeperWeb application."""
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url:
        print("Error: DATABASE_URL environment variable not found.")
        return False
    
    try:
        print(f"Connecting to PostgreSQL using: {db_url}")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        print(f'Successfully connected to PostgreSQL: {version[0]}')
        
        cursor.execute("""
        SELECT datname FROM pg_database WHERE datname = 'timekeeper';
        """)
        
        if cursor.fetchone() is None:
            print('Creating timekeeper database...')
            cursor.execute('CREATE DATABASE timekeeper;')
            print('Database timekeeper created successfully')
        else:
            print('Database timekeeper already exists')
        
        conn.close()
        
        timekeeper_db_url = db_url.replace('/defaultdb', '/timekeeper')
        
        conn = psycopg2.connect(timekeeper_db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            photo_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            color VARCHAR(50),
            user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS time_entries (
            id SERIAL PRIMARY KEY,
            description TEXT,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            duration INTEGER,
            user_id INTEGER REFERENCES users(id),
            project_id INTEGER REFERENCES projects(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        print("Database tables created successfully")
        conn.close()
        
        return True
    except Exception as e:
        print(f'Error setting up database: {e}')
        return False

if __name__ == "__main__":
    if setup_database():
        print("Database setup completed successfully")
    else:
        print("Database setup failed")
