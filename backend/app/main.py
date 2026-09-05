import logging
import time
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.schemes import router as schemes_router, eligibility_router
from app.routes.ai import router as ai_router
from app.routes.partners import router as partners_router
from app.routes.applications import router as applications_router, documents_router
from app.routes.admin import router as admin_router
from app.middleware.rate_limit import SlidingWindowRateLimiter

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("arthsetu.main")

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        f"**{settings.PROJECT_TAGLINE}**\n\n"
        f"Backend API for **Problem Statement {settings.PROBLEM_STATEMENT_ID}** "
        f"({settings.ORGANIZATION}).\n\n"
        "Provides authentication, health monitoring, deterministic eligibility rule engine, "
        "AI requirement understanding, channel partner geocoding/routing, and administrative oversight."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── Rate Limiting Middleware ───────────────────────────────────────────────
app.add_middleware(
    SlidingWindowRateLimiter,
    limit_per_minute=60,
    ai_limit_per_minute=settings.AI_RATE_LIMIT_PER_MINUTE,
)

# ── CORS Middleware ────────────────────────────────────────────────────────
# Supports React Native with Expo (Web, iOS, Android), local web clients, and production URLs
cors_origins = settings.cors_origins_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── Request Timing & Logging Middleware ────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        response.headers["X-Service"] = "ArthSetu-Core"
        return response
    except Exception as e:
        logger.error(f"Unhandled server error on {request.method} {request.url.path}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "message": "An unexpected server error occurred. Please try again later.",
                "path": request.url.path,
            },
        )

# ── Custom Exception Handlers ──────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTPException",
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join([str(l) for l in err.get("loc", [])])
        msg = err.get("msg", "Invalid value")
        errors.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "message": "Invalid request parameters or payload",
            "detail": errors,
            "path": request.url.path,
        },
    )

# ── Register Routers ───────────────────────────────────────────────────────
# Health routes: /health and /api/v1/health
app.include_router(health_router)

# Auth routes: /api/v1/auth
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)

# Scheme routes: /schemes and /api/v1/schemes
app.include_router(schemes_router)
app.include_router(schemes_router, prefix=settings.API_V1_PREFIX)

# Eligibility routes: /eligibility and /api/v1/eligibility
app.include_router(eligibility_router)
app.include_router(eligibility_router, prefix=settings.API_V1_PREFIX)

# AI routes: /ai and /api/v1/ai
app.include_router(ai_router)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)

# Partner & Map routes: /partners and /api/v1/partners
app.include_router(partners_router)
app.include_router(partners_router, prefix=settings.API_V1_PREFIX)

# Application & Document routes: /applications, /schemes/{id}/documents, etc.
app.include_router(applications_router)
app.include_router(applications_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)

# Admin & Governance routes: /admin and /api/v1/admin
app.include_router(admin_router)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)

# ── Root Welcome Endpoint ──────────────────────────────────────────────────
@app.get("/", tags=["General"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "problem_statement_id": settings.PROBLEM_STATEMENT_ID,
        "organization": settings.ORGANIZATION,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "documentation": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
    }
