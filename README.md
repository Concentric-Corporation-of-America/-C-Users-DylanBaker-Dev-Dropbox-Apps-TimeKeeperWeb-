# TimeKeeperWeb

A web-based time tracking application with frontend and backend components.

## Overview

- Frontend: React with TypeScript, deployed at https://time-keeper-app-tsck8yj9.devinapps.com
- Backend: FastAPI with PostgreSQL, deployed at https://app-fsjkvaxr.fly.dev

## Deployment Instructions

### Backend Deployment (Fly.io)

1. Install the Fly.io CLI
2. Log in to Fly.io: `fly auth login`
3. Navigate to the backend directory: `cd backend`
4. Deploy the application: `fly deploy`

### Frontend Deployment

The frontend is currently deployed at https://time-keeper-app-tsck8yj9.devinapps.com.

## Environment Configuration

### Frontend

Create a `.env` file in the `frontend` directory with:

```
VITE_API_URL=https://app-fsjkvaxr.fly.dev
```

### Backend

Environment variables are configured in `fly.toml` and `.env` files.

## Local Development

### Backend

1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload`

### Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Database

The application uses a PostgreSQL database hosted on DigitalOcean.

Connection string: `postgresql://doadmin:AVNS_ifzweLn1iD8jj3kBsZf@bauen-db-do-user-20046124-0.d.db.ondigitalocean.com:25060/timekeeper`
