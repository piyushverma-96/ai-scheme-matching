from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="UdyamNex API")
    version: str = Field(..., example="1.0.0")
    tagline: str = Field(..., example="Right Scheme. Real Support.")
    problem_statement_id: str = Field(..., example="26092")
    organization: str = Field(..., example="Ministry of Social Justice and Empowerment")
    database_connected: bool = Field(..., example=True)
    database_message: str = Field(..., example="Connected to Supabase PostgreSQL successfully")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    environment: str = Field(..., example="development")
