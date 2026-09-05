from fastapi import APIRouter
from app.config import settings
from app.database import check_database_connection
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service & Database Health Check",
    description="Returns backend service operational status and Supabase PostgreSQL connectivity.",
)
@router.get(
    f"{settings.API_V1_PREFIX}/health",
    response_model=HealthResponse,
    include_in_schema=False,
)
async def health_check():
    db_connected, db_message = check_database_connection()
    return HealthResponse(
        status="healthy" if db_connected else "degraded",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        tagline=settings.PROJECT_TAGLINE,
        problem_statement_id=settings.PROBLEM_STATEMENT_ID,
        organization=settings.ORGANIZATION,
        database_connected=db_connected,
        database_message=db_message,
        environment=settings.ENVIRONMENT,
    )
