from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

class HealthResponse(BaseModel):
    status: str = "ok"

class SchemeResponse(BaseModel):
    id: str
    name: str
    scheme_type: str
    min_amount: float
    max_amount: float
    rate_min: float
    rate_max: float
    moratorium_months: int
    moratorium_note: Optional[str] = None
    max_income_eligibility: float
    repayment_years: int
    financing_pct: float
    description: str
    issuing_body: str
    created_at: Optional[str] = None

    model_config = ConfigDict(extra="ignore")

class RecommendRequest(BaseModel):
    project_type: Literal["business", "education"] = Field(
        ..., 
        description="Type of project: must be 'business' or 'education'"
    )
    project_cost: float = Field(
        ..., 
        gt=0, 
        description="Estimated project cost in INR (must be > 0)"
    )
    annual_income: float = Field(
        ..., 
        ge=0, 
        description="Annual household income in INR (must be >= 0)"
    )
    city: Optional[str] = Field(
        default=None, 
        description="Optional applicant city"
    )

class RecommendResponse(BaseModel):
    eligible: bool
    reason: Optional[str] = None
    matched_scheme: Optional[SchemeResponse] = None
    reasoning: Optional[str] = None
    application_id: Optional[str] = None

class EMICalculateRequest(BaseModel):
    scheme_id: str = Field(..., description="UUID of the scheme")
    project_cost: float = Field(..., gt=0, description="Total project cost in INR")
    annual_rate: Optional[float] = Field(
        default=None, 
        ge=0, 
        description="Annual interest rate in %. If omitted, defaults to scheme rate_min."
    )
    tenure_months: int = Field(
        ..., 
        gt=0, 
        description="Repayment tenure in months"
    )

class EMICalculateResponse(BaseModel):
    principal: float
    emi: float
    total_interest: float
    total_repayment: float
    tenure_months: int
    annual_rate: float

class ChannelPartnerResponse(BaseModel):
    id: str
    name: str
    partner_type: str
    city: Optional[str] = None
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    handles_scheme_types: List[str]
    is_real_verified: bool
    npa_status_note: Optional[str] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(extra="ignore")

class GuidanceResponse(BaseModel):
    id: str
    scheme_id: str
    scheme_name: str
    required_documents: List[str]
    application_steps: List[str]
    where_to_apply: str

    model_config = ConfigDict(extra="ignore")

class ApplicationUpdateRequest(BaseModel):
    recommended_partner_id: str = Field(..., description="UUID of the chosen channel partner")

class ApplicationResponse(BaseModel):
    id: str
    project_type: Optional[str] = None
    project_cost: Optional[float] = None
    annual_income: Optional[float] = None
    city: Optional[str] = None
    matched_scheme_id: Optional[str] = None
    recommended_partner_id: Optional[str] = None
    created_at: Optional[str] = None

    model_config = ConfigDict(extra="ignore")
