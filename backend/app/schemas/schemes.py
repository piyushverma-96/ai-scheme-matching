"""
Pydantic schemas for Scheme and Eligibility endpoints — ArthSetu Step 2.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Scheme output schemas
# ---------------------------------------------------------------------------

class SchemeOut(BaseModel):
    """Full scheme record as returned from the DB."""
    id: str
    name: str
    scheme_type: str
    short_description: str
    full_description: Optional[str] = None
    issuing_body: str

    project_cost_min: float
    project_cost_max: Optional[float] = None
    max_loan_amount: float
    financing_pct: float

    rate_beneficiary_min: float
    rate_beneficiary_max: float
    rate_to_sca: float
    rate_note: Optional[str] = None

    repayment_years_max: int
    repayment_note: Optional[str] = None
    moratorium_months: int
    moratorium_note: Optional[str] = None

    max_income_eligibility: float
    eligible_purposes: List[str]

    benefit_type: str = "loan"
    benefit_summary: Optional[str] = None
    has_financial_calculation: bool = True
    support_type_display: Optional[str] = None
    benefit_amount_display: Optional[str] = None

    application_channel_type: str = "channel_partner"
    application_channel_details: Optional[Dict[str, Any]] = None

    ministry: str = "Ministry of Social Justice and Empowerment"
    department: str = "Department of Social Justice and Empowerment"
    scheme_category: Optional[str] = None
    target_beneficiary: Optional[str] = None
    purpose: Optional[str] = None
    sectors: List[str] = Field(default_factory=lambda: ["Trade", "Services", "Agriculture", "Transport", "Education"])
    applicable_states: List[str] = Field(default_factory=lambda: ["All States and UTs"])
    financial_benefit: Optional[Dict[str, Any]] = None
    application_mode: str = "channel_agency"
    required_documents: List[str] = Field(default_factory=list)
    official_application_url: str = "https://nsfdc.nic.in/scheme"
    status: str = "active"

    source_name: str
    source_url: str
    last_verified_at: str
    needs_manual_verification: bool
    verification_note: Optional[str] = None

    is_active: bool = True
    data_source: str = Field(default="supabase", alias="_data_source")

    model_config = {"populate_by_name": True, "from_attributes": True}

    @model_validator(mode="before")
    @classmethod

    def map_db_columns(cls, data: Any) -> Any:
        if isinstance(data, dict):
            d = dict(data)
            # Map legacy/PostgreSQL columns if direct fields are missing
            if "description" in d and "short_description" not in d:
                d["short_description"] = d["description"]
            if "description" in d and "full_description" not in d:
                d["full_description"] = d["description"]
            if "min_amount" in d and "project_cost_min" not in d:
                d["project_cost_min"] = float(d["min_amount"] or 0)
            if "max_amount" in d and "max_loan_amount" not in d:
                d["max_loan_amount"] = float(d["max_amount"] or 0)
            if "max_amount" in d and "project_cost_max" not in d:
                d["project_cost_max"] = float(d["max_amount"] or 0)
            if "rate_min" in d and "rate_beneficiary_min" not in d:
                d["rate_beneficiary_min"] = float(d["rate_min"] or 0)
            if "rate_max" in d and "rate_beneficiary_max" not in d:
                d["rate_beneficiary_max"] = float(d["rate_max"] or 0)
            if "repayment_years" in d and "repayment_years_max" not in d:
                d["repayment_years_max"] = int(d["repayment_years"] or 3)
            if "benefit_type" not in d:
                d["benefit_type"] = "loan"
            if "has_financial_calculation" not in d:
                d["has_financial_calculation"] = True
            if "application_channel_type" not in d:
                d["application_channel_type"] = "channel_partner"
            if "application_channel_details" not in d:
                d["application_channel_details"] = None
            if "rate_to_sca" not in d:
                d["rate_to_sca"] = 2.5

            if "eligible_purposes" not in d:
                d["eligible_purposes"] = (
                    ["education", "studies", "higher_education"]
                    if d.get("scheme_type") == "education_loan"
                    else ["business", "entrepreneurship", "micro_business"]
                )
            if "source_name" not in d:
                d["source_name"] = "NSFDC Official Portal"
            if "source_url" not in d:
                d["source_url"] = "https://nsfdc.nic.in/scheme"
            if "last_verified_at" not in d:
                d["last_verified_at"] = "2026-09-05"
            if "needs_manual_verification" not in d:
                d["needs_manual_verification"] = False
            if "is_active" not in d:
                d["is_active"] = True
            return d
        return data


class SchemesListOut(BaseModel):
    count: int
    data_source: str = Field(default="supabase", alias="_data_source")
    schemes: List[SchemeOut]

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# Eligibility request
# ---------------------------------------------------------------------------

PURPOSE_ALIASES = {
    "entrepreneurship": "business",
    "business": "business",
    "micro_business": "micro_business",
    "micro_credit": "micro_business",
    "startup": "business",
    "trade": "trade",
    "services": "services",
    "handicraft": "handicraft",
    "agriculture": "agriculture",
    "farming": "agriculture",
    "industry": "industry",
    "transport": "transport",
    "plantation": "plantation",
    "construction": "construction",
    "education": "education",
    "studies": "education",
    "higher_education": "education",
}

VALID_PURPOSES = set(PURPOSE_ALIASES.keys()) | {
    "business", "micro_business", "agriculture", "services",
    "trade", "handicraft", "industry", "transport",
    "plantation", "construction", "education",
}

VALID_STUDY_LOCATIONS = {"india", "abroad", "not_specified"}


class EligibilityCheckRequest(BaseModel):
    purpose: str = Field(
        ...,
        description=(
            "Purpose of the loan. e.g. entrepreneurship, business, micro_business, "
            "education, agriculture, services, trade, handicraft, industry, transport, etc."
        ),
        json_schema_extra={"example": "entrepreneurship"},
    )
    annual_family_income: Optional[float] = Field(
        default=None,
        ge=0,
        description="Total annual family income in INR (e.g. 300000). If omitted, scheme eligibility evaluates to Partially Eligible.",
        json_schema_extra={"example": 300000},
    )
    loan_amount: Optional[float] = Field(
        default=None,
        gt=0,
        description="Desired loan amount in INR (e.g. 300000).",
        json_schema_extra={"example": 300000},
    )
    project_cost: Optional[float] = Field(
        default=None,
        gt=0,
        description="Total project cost or course fee in INR (e.g. 333333).",
        json_schema_extra={"example": 333333},
    )
    sc_caste_declared: Optional[bool] = Field(
        default=True,
        description=(
            "Whether the applicant self-declares as belonging to a Scheduled Caste (SC). "
            "All NSFDC schemes require SC status."
        ),
    )
    caste_category: Optional[str] = Field(
        default=None,
        description="Social category/community (e.g. 'SC', 'OBC', 'ST', 'General').",
    )
    education_status: Optional[str] = Field(
        default="not_applicable",
        description="Education status of applicant (e.g., 'not_applicable', '12th_pass', 'graduate', 'professional').",
    )
    study_location: Optional[str] = Field(
        default=None,
        description="For education loans: 'india', 'abroad', or 'not_specified'.",
    )
    gender: Optional[str] = Field(
        default=None,
        description="Applicant gender ('female', 'male', 'other'). Female beneficiaries get a 0.5% rebate on education loans.",
    )
    age: Optional[int] = Field(
        default=None,
        ge=14,
        le=100,
        description="Applicant age in years (used for age-restricted schemes).",
    )
    state: Optional[str] = Field(
        default=None,
        description="Applicant state / union territory (used for state-channelizing jurisdiction).",
    )
    district: Optional[str] = Field(
        default=None,
        description="Applicant district.",
    )
    city: Optional[str] = Field(
        default=None,
        description="Applicant city, town, or village.",
    )
    business_type: Optional[str] = Field(
        default=None,
        description="Type or sector of business enterprise (e.g., 'Retail', 'Manufacturing', 'Services').",
    )
    business_status: Optional[str] = Field(
        default=None,
        description="Status of business ('new' or 'existing').",
    )
    occupation: Optional[str] = Field(
        default=None,
        description="Current occupation of the applicant.",
    )
    language: Optional[str] = Field(
        default="english",
        description="Preferred language for matching explanations ('english' | 'hindi').",
    )

    @field_validator("purpose")
    @classmethod
    def validate_purpose(cls, v: str) -> str:
        normalised = v.lower().strip().replace(" ", "_").replace("-", "_")
        if normalised in PURPOSE_ALIASES:
            return normalised
        if normalised not in VALID_PURPOSES:
            raise ValueError(
                f"purpose must be one of: {', '.join(sorted(VALID_PURPOSES))}. Got: '{v}'"
            )
        return normalised

    @field_validator("study_location")
    @classmethod
    def validate_study_location(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        normalised = v.lower().strip()
        if normalised not in VALID_STUDY_LOCATIONS:
            raise ValueError(
                f"study_location must be one of: {', '.join(sorted(VALID_STUDY_LOCATIONS))}. Got: '{v}'"
            )
        return normalised

    @model_validator(mode="after")
    def populate_project_cost_or_loan_amount(self) -> EligibilityCheckRequest:
        if self.project_cost is None and self.loan_amount is None:
            raise ValueError("Either 'project_cost' or 'loan_amount' must be provided.")
        if self.project_cost is None and self.loan_amount is not None:
            # Assume 90% financing by default so project cost ~ loan_amount / 0.9
            self.project_cost = round(self.loan_amount / 0.9, 2)
        elif self.loan_amount is None and self.project_cost is not None:
            self.loan_amount = round(self.project_cost * 0.9, 2)
        return self


# ---------------------------------------------------------------------------
# Eligibility result schema
# ---------------------------------------------------------------------------

class SchemeMatchResult(BaseModel):
    scheme_id: str
    scheme_name: str
    scheme_type: str
    verdict: str = Field(
        description="Official evaluation verdict: 'Potentially Eligible', 'Partially Eligible', or 'Does Not Match Current Criteria'"
    )
    status: str = Field(default="eligible", description="'eligible', 'partially_eligible', or 'ineligible'")
    eligible: bool = Field(description="True if potentially eligible, False otherwise")
    partially_eligible: bool = Field(default=False, description="True if partially eligible (missing required data or soft conditions)")
    matched: bool = Field(description="True if eligible or partially eligible")
    match_score: int = Field(description="Deterministic match score between 0 and 100")
    matching_factors: List[str] = Field(default_factory=list, description="Rules and criteria successfully satisfied")
    reasons: List[str] = Field(default_factory=list, description="Alias for matching_factors")
    failed_factors: List[str] = Field(default_factory=list, description="Criteria that disqualified or failed")
    disqualifiers: List[str] = Field(default_factory=list, description="Alias for failed_factors")
    missing_information: List[str] = Field(
        default_factory=list,
        description="Optional or required fields missing that affect the outcome."
    )
    explanation: str = Field(description="Deterministic structured explanation of the eligibility decision")
    recommended_loan_amount: Optional[float] = None
    interest_rate_display: str
    repayment_years: int
    moratorium_note: str
    benefit_type: str = Field(default="loan", description="Benefit category: loan, subsidy, grant, credit_linked_subsidy, etc.")
    benefit_summary: Optional[str] = Field(default=None, description="Plain-language description of received benefit")
    has_financial_calculation: bool = Field(default=True, description="Whether EMI / financial calculation is applicable")
    support_type_display: Optional[str] = None
    benefit_amount_display: Optional[str] = None
    application_channel_type: str = Field(default="channel_partner", description="Enum: 'channel_partner', 'government_portal', 'department_office', 'district_authority', 'other_official_channel'")
    application_channel_details: Optional[Dict[str, Any]] = None
    application_mode: str = Field(default="channel_agency")
    official_application_url: str = Field(default="https://nsfdc.nic.in/scheme")
    required_documents: List[str] = Field(default_factory=list)
    ministry: str = Field(default="Ministry of Social Justice and Empowerment")
    target_beneficiary: Optional[str] = None
    source_url: str
    source_name: str
    last_verified_at: str
    needs_manual_verification: bool
    verification_note: str



class EligibilityCheckResponse(BaseModel):
    disclaimer: str = (
        "This system provides DETERMINISTIC INDICATIVE ELIGIBILITY only. "
        "Verdict is 'Potentially Eligible' or 'Does Not Match Current Criteria' — "
        "it is NOT a loan approval. Final sanction is subject to document verification "
        "by the State Channelizing Agency / Partner Bank and NSFDC."
    )
    input_summary: Dict[str, Any]
    total_schemes_evaluated: int
    matched_count: int
    results: List[SchemeMatchResult]


class BestMatchResponse(BaseModel):
    disclaimer: str = (
        "This system provides DETERMINISTIC INDICATIVE ELIGIBILITY only. "
        "Verdict is 'Potentially Eligible' or 'Does Not Match Current Criteria' — "
        "it is NOT a loan approval. Final sanction is subject to document verification "
        "by the State Channelizing Agency / Partner Bank and NSFDC."
    )
    input_summary: Dict[str, Any]
    matched: bool
    best_match: Optional[SchemeMatchResult] = None
    message: str
