"""
ArthSetu AI — Application Submission, Document Checklists & Tracking (Step 5)
=============================================================================
Endpoints:
  GET  /schemes/{scheme_id}/documents  – Scheme-specific required document checklist
  POST /applications                   – Submit scheme application
  GET  /applications/{app_id}          – Track application status with audit timeline
  POST /applications/{app_id}/status   – Demo status simulation transition (Hackathon tester)
"""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.applications import (
    ApplicationCreateRequest,
    ApplicationOut,
    SchemeDocumentChecklistResponse,
    StatusUpdateRequest,
)
from app.services.application_service import ApplicationService

logger = logging.getLogger("arthsetu.routes.applications")

router = APIRouter(prefix="/applications", tags=["Applications & Tracking Journey (Step 5)"])
documents_router = APIRouter(tags=["Applications & Tracking Journey (Step 5)"])


@documents_router.get(
    "/schemes/{scheme_id}/documents",
    response_model=SchemeDocumentChecklistResponse,
    summary="Get scheme-specific required documents checklist",
)
async def get_scheme_documents(
    scheme_id: str,
    scheme_name: Optional[str] = Query(None, description="Optional scheme name string"),
):
    try:
        checklist = ApplicationService.get_scheme_document_checklist(
            scheme_id=scheme_id, scheme_name=scheme_name
        )
        return checklist
    except Exception as exc:
        logger.error(f"Error fetching document checklist: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate document checklist: {str(exc)}",
        )


@router.post(
    "/",
    response_model=ApplicationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new scheme application packet",
    description="Registers beneficiary application and creates initial 'Submitted' status audit entry.",
)
async def create_application(body: ApplicationCreateRequest):
    try:
        app = ApplicationService.create_application(body)
        return app
    except Exception as exc:
        logger.error(f"Error creating application: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(exc)}",
        )


@router.get(
    "/{app_id_or_number}",
    response_model=ApplicationOut,
    summary="Track application status and view full audit timeline",
    description="Fetches live progress stages: Submitted -> Under Review -> Documents Required -> Forwarded to Partner -> Processing -> Decision.",
)
async def track_application(app_id_or_number: str):
    app = ApplicationService.get_application(app_id_or_number)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{app_id_or_number}' not found. Please verify your Application ID.",
        )
    return app


@router.post(
    "/{app_id_or_number}/status",
    response_model=ApplicationOut,
    summary="Simulate application status transition (Hackathon Demo)",
    description=(
        "Allows demonstration users and evaluators to advance the application "
        "through official stages with custom officer remarks."
    ),
)
async def update_application_status(app_id_or_number: str, body: StatusUpdateRequest):
    app = ApplicationService.update_application_status(
        app_id_or_number=app_id_or_number,
        new_status=body.new_status,
        remarks=body.remarks,
        updated_by=body.updated_by,
    )
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{app_id_or_number}' not found.",
        )
    return app
