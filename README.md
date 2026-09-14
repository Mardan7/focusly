# FOCUSLY

FOCUSLY is a local-first productivity workspace with Pomodoro focus sessions, tasks, statistics, Focus Mode, fullscreen mode, multilingual UI, and account synchronization.

## Frontend

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

`VITE_API_URL` points to the FastAPI service. It defaults to `http://localhost:8000` when no `.env.local` is present.

## Backend

Requirements: Python 3.12+ and PostgreSQL for production. SQLite is used automatically when `DATABASE_URL` is not configured, which is useful for local smoke tests.

```powershell
cd backend
Copy-Item .env.example .env
C:/path/to/python -m pip install -r requirements.txt
C:/path/to/python -m uvicorn app.main:app --reload
```

Create a PostgreSQL database and set these values in `backend/.env`:

- `DATABASE_URL=postgresql+psycopg://user:password@host:5432/focusly`
- `JWT_SECRET_KEY` to a long random secret
- `JWT_ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ORIGINS` as a comma-separated list of allowed frontend origins

The current backend creates tables on startup. For a production deployment, run a migration tool such as Alembic before switching schemas or deploying changes.

## API

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET/POST/PUT/DELETE /tasks`
- `GET/POST /sessions`
- `GET/PUT /settings`
- `GET /stats`
- `GET /health`

All user data endpoints require a JWT bearer token. Ownership is enforced from the authenticated token, never from a client-supplied `user_id`.

## Data migration

Anonymous local data is not silently deleted. Before the first account login, FOCUSLY keeps an anonymous snapshot of the existing local task/session/settings/language keys. Account data is loaded from the backend. Logging out restores the anonymous snapshot; logging back in hydrates the authenticated account again.

Passwords are never stored in localStorage or returned by the API. The frontend stores only the JWT and basic user profile required to restore the session.

## Checks

```powershell
npm run build
npm run lint
```

Backend smoke checks cover registration, login, JWT ownership isolation, task creation, session recording, statistics, and a new user's zero state.
