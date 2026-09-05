import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file from current backend dir or parent dir
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "ArthSetu API"
    PROJECT_TAGLINE: str = "Right Scheme. Right Partner. Right Guidance."
    PROBLEM_STATEMENT_ID: str = "26092"
    ORGANIZATION: str = "Ministry of Social Justice and Empowerment"
    VERSION: str = "1.0.0"
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # AI & RAG Configuration (Step 3)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    
    # OpenRouteService & Geocoding Configuration (Step 5)
    # Free tier: 2,500 requests/day from https://openrouteservice.org
    ORS_API_KEY: str = os.getenv("ORS_API_KEY", "")
    NOMINATIM_USER_AGENT: str = os.getenv("NOMINATIM_USER_AGENT", "ArthSetu-SIH26092/1.0 (contact@arthsetu.gov.in)")

    # Security & Admin Configuration (Step 6)
    ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "arthsetu_admin_secret_2026")
    AI_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("AI_RATE_LIMIT_PER_MINUTE", 60))

    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        extra = "ignore"

settings = Settings()
