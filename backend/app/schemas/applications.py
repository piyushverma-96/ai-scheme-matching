"""
Pydantic Schemas for Applications, Required Documents & Tracking Journey (Step 5)
================================================================================
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ApplicationDocumentItem(BaseModel):
    id: Optional[str] = None
    document_type: str = Field(description="e.g. caste_certificate, income_certificate, aadhaar_card, project_report")
    document_name: str
    description: Optional[str] = None
    is_mandatory: bool = True
    is_uploaded: bool = False
    file_url: Optional[str] = None
    is_verified_demo: bool = False
    verification_notes: Optional[str] = None
    uploaded_at: Optional[str] = None


class ApplicationStatusHistoryItem(BaseModel):
    id: Optional[str] = None
    from_status: Optional[str] = None
    to_status: str
    remarks: str
    updated_by: str = "System"
    created_at: str


class ApplicationCreateRequest(BaseModel):
    scheme_id: Optional[str] = None
    scheme_name: str = Field(..., description="Name of the selected NSFDC scheme")
    partner_id: Optional[str] = None
    partner_name: Optional[str] = None
    applicant_name: str = Field(..., description="Full Name of applicant")
    applicant_phone: str = Field(..., description="10-digit mobile number")
    applicant_email: Optional[str] = None
    annual_family_income: float = Field(..., ge=0)
    loan_amount: float = Field(..., gt=0)
    project_cost: float = Field(..., gt=0)
    purpose: str = Field(..., description="Purpose identifier (business, education, etc.)")
    sc_caste_declared: bool = Field(default=True)
    documents: List[ApplicationDocumentItem] = Field(default_factory=list)


class ApplicationOut(BaseModel):
    id: str
    application_number: str
    scheme_id: Optional[str] = None
    scheme_name: str
    partner_id: Optional[str] = None
    partner_name: Optional[str] = None
    applicant_name: str
    applicant_phone: str
    applicant_email: Optional[str] = None
    annual_family_income: float
    loan_amount: float
    project_cost: float
    purpose: str
    sc_caste_declared: bool
    status: str = Field(
        description="'Draft' | 'Submitted' | 'Under Review' | 'Documents Required' | 'Forwarded to Partner' | 'Processing' | 'Decision'"
    )
    decision_verdict: Optional[str] = None
    remarks: Optional[str] = None
    documents: List[ApplicationDocumentItem] = Field(default_factory=list)
    timeline: List[ApplicationStatusHistoryItem] = Field(default_factory=list)
    created_at: str
    updated_at: str
    demo_disclaimer: str = "Demo status simulation — not connected to NSFDC's live systems."

    model_config = {"from_attributes": True}


class StatusUpdateRequest(BaseModel):
    new_status: str = Field(
        ...,
        description="'Draft' | 'Submitted' | 'Under Review' | 'Documents Required' | 'Forwarded to Partner' | 'Processing' | 'Decision'",
    )
    remarks: str = Field(default="Status updated via administrative demonstration interface.")
    updated_by: str = Field(default="State Channelizing Agency Officer")


class SchemeDocumentChecklistResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    documents: List[ApplicationDocumentItem]
    issuing_authority_note: str = (
        "Documents must be verified by the local State Channelizing Agency (SCA) or Bank Branch. "
        "No original documents are retained on this platform."
    )
