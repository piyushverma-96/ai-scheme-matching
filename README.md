# ArthSetu (अर्थसेतु)

> **"Right Scheme. Right Partner. Right Guidance."**  
> *AI-Driven Scheme Matching for Marginalized Entrepreneurs*  
> **Smart India Hackathon Problem Statement ID:** `26092`  
> **Theme:** Smart Automation | **Organization:** Ministry of Social Justice and Empowerment (MoSJE)

---

## 🏛️ 1. Recommended Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Frontend Client Layer                       │
│    React Native with Expo (Android / iOS / Web)          │
│    - Supabase Auth Client (Public Anon Key ONLY)         │
│    - Axios API Client for Backend Services               │
└────────────────────────────┬─────────────────────────────┘
                             │  HTTP / REST (JWT Bearer Token)
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Backend Service Layer                       │
│    Python + FastAPI (Uvicorn ASGI)                       │
│    - CORS Middleware & Centralized Error Handlers        │
│    - Supabase Admin Client (Protected Service-Role Key) │
│    - JWT Token Verification & Auth Dependency            │
│    - Health Check Monitoring (/api/v1/health)            │
└────────────────────────────┬─────────────────────────────┘
                             │  PostgreSQL Protocol / PostgREST
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Data & Storage Layer                        │
│    Supabase PostgreSQL Database                          │
│    - Schemes, Channel Partners, Applications             │
│    - Row Level Security (RLS) Policies                   │
│    - Supabase Auth (User Identity Management)            │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 2. Monorepo Folder Structure

```
arth-setu/
├── backend/                       # Python FastAPI Backend Service
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI entrypoint, CORS, exception handlers
│   │   ├── config.py              # Pydantic Settings & environment loader
│   │   ├── database.py            # Supabase admin client & connection health check
│   │   ├── middleware/            # Auth dependencies & token verification
│   │   │   ├── __init__.py
│   │   │   └── auth.py
│   │   ├── routes/                # API Routers
│   │   │   ├── __init__.py
│   │   │   ├── health.py          # /health & /api/v1/health endpoints
│   │   │   └── auth.py            # /api/v1/auth (signup, login, me, logout)
│   │   └── schemas/               # Pydantic validation models
│   │       ├── __init__.py
│   │       ├── health.py
│   │       └── auth.py
│   ├── .env.example               # Backend environment template
│   ├── requirements.txt           # Python package dependencies
│   └── test_foundation.py         # Automated verification test suite
│
├── mobile/                        # React Native with Expo Mobile App
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js             # Client environment access
│   │   │   └── supabase.js        # Supabase client (Anon key ONLY)
│   │   ├── context/
│   │   │   └── AuthContext.js     # React Auth context & session listener
│   │   ├── services/
│   │   │   ├── api.js             # Axios client & health check caller
│   │   │   └── auth.js            # Supabase Auth wrappers
│   │   ├── screens/
│   │   │   ├── HomeScreen.js      # Backend connectivity test & profile status
│   │   │   ├── LoginScreen.js     # Supabase sign-in screen
│   │   │   └── SignupScreen.js    # Supabase registration screen
│   │   ├── components/
│   │   │   ├── Button.js          # Reusable styled touchable button
│   │   │   ├── Input.js           # Styled text/password input with validation
│   │   │   └── StatusCard.js      # Health status display card
│   │   └── theme/
│   │       └── colors.js          # Unified design tokens (Navy, Teal, Amber)
│   ├── app.json                   # Expo configuration
│   ├── package.json               # JavaScript dependencies
│   ├── index.js                   # Expo root registration
│   ├── App.js                     # Root component with AuthProvider
│   └── .env.example               # Mobile environment template
│
├── database/                      # Database Scripts & Schema
│   └── schema.sql                 # PostgreSQL tables, indexes, RLS & seed data
│
├── .env.example                   # Monorepo root environment template
└── README.md                      # Technical setup & verification guide
```

---

## 🔐 3. Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Security Level |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime environment (`development` / `production`) | Safe |
| `API_V1_PREFIX` | Prefix for API routes (`/api/v1`) | Safe |
| `PORT` | Local server port (`8000`) | Safe |
| `SUPABASE_URL` | Supabase project endpoint | Safe |
| `SUPABASE_ANON_KEY` | Public client anonymous key | Safe (Public) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Admin secret key** for backend operations | **SECRET — NEVER EXPOSE** |
| `DATABASE_URL` | Direct PostgreSQL connection string | **SECRET** |
| `CORS_ORIGINS` | Comma-separated allowed origins | Safe |

### Mobile (`mobile/.env`)
| Variable | Description | Security Level |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | FastAPI backend address (`http://localhost:8000`) | Safe (Public) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project endpoint | Safe (Public) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Safe (Public) |

> ⚠️ **CRITICAL SECURITY RULE:** The secret `SUPABASE_SERVICE_ROLE_KEY` is **never** included in `mobile/.env` or client code. The mobile app interacts with Supabase using the public anonymous key protected by Row Level Security (RLS) and JWT tokens.

---

## 🚀 4. How to Start the Project

### Prerequisites
* **Python 3.10+** (Python 3.12 recommended)
* **Node.js 18+** & **npm**

---

### Step 4A: Start the FastAPI Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure `backend/.env` is configured with your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. Run the automated foundation test suite:
   ```bash
   python test_foundation.py
   ```

5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. Open interactive API docs:
   * **Swagger UI:** `http://127.0.0.1:8000/docs`
   * **Health Check:** `http://127.0.0.1:8000/api/v1/health`

---

### Step 4B: Start the React Native (Expo) Frontend

1. Open a new terminal and navigate to the `mobile/` directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm.cmd install
   ```

3. Start the Expo development server:
   * **For Web browser preview:**
     ```bash
     npm.cmd run web
     # or: npx.cmd expo start --web
     ```
   * **For Android / iOS Expo Go:**
     ```bash
     npm.cmd start
     # or: npx.cmd expo start
     ```

---

## 🧪 5. How to Verify Backend & Auth Connectivity

### 1. Backend Health Check Verification
* Visit `http://127.0.0.1:8000/api/v1/health` in your browser or run:
  ```bash
  curl http://127.0.0.1:8000/api/v1/health
  ```
* Expected response:
  ```json
  {
    "status": "healthy",
    "service": "ArthSetu API",
    "version": "1.0.0",
    "tagline": "Right Scheme. Right Partner. Right Guidance.",
    "problem_statement_id": "26092",
    "organization": "Ministry of Social Justice and Empowerment",
    "database_connected": true,
    "database_message": "Connected to Supabase PostgreSQL successfully",
    "environment": "development"
  }
  ```

### 2. Frontend Screen Verification
1. Open the mobile app on Web or Expo Go.
2. The **HomeScreen** will automatically query the backend `/api/v1/health` endpoint and display:
   * **System Status:** `ONLINE` (Green badge)
   * **Supabase Database:** `Connected`
   * **Problem Statement:** `PS 26092`
3. Tap **"Re-test Backend Connectivity"** to confirm dynamic polling.

### 3. Supabase Authentication Verification
1. Tap **"Create Account"** on the HomeScreen.
2. Enter a test email and password (e.g., `applicant@test.gov.in` / `Pass@123456`).
3. Tap **"Create Account with Supabase"**.
4. Upon successful registration, navigate to **Sign In** and authenticate.
5. The **HomeScreen** will immediately update to show:
   * Logged in user email and unique Supabase User ID (`UUID`).
   * Active session token persisted in context.
6. Tap **"Sign Out"** to clear the session and return to guest state.
