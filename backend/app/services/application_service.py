"""
ArthSetu AI — Application & Document Journey Service (Step 5)
============================================================
Handles:
  - Scheme-specific required document checklists
  - Application submission and unique ID generation (ARTH-2024-XXXXX)
  - Application status timeline & audit history
  - Prototype / Demo status transition simulations with transparent disclaimers
"""

from __future__ import annotations

import datetime
import logging
import random
import uuid
from typing import Any, Dict, List, Optional

from app.database import get_supabase_client
from app.schemas.applications import (
    ApplicationCreateRequest,
    ApplicationDocumentItem,
    ApplicationOut,
    ApplicationStatusHistoryItem,
    SchemeDocumentChecklistResponse,
)

logger = logging.getLogger("arthsetu.application_service")

# In-memory store for fallback & prototype state
_APPLICATIONS_DB: Dict[str, ApplicationOut] = {}


class ApplicationService:
    """Manages Beneficiary Applications, Document Checklists & Status Timelines."""

    @classmethod
    def get_scheme_document_checklist(
        cls, scheme_id: Optional[str] = None, scheme_name: Optional[str] = None
    ) -> SchemeDocumentChecklistResponse:
        """Returns verified scheme-specific document requirements."""
        s_name = scheme_name or "NSFDC Loan Scheme"

        # Core mandatory documents required for all NSFDC schemes
        docs: List[ApplicationDocumentItem] = [
            ApplicationDocumentItem(
                id=str(uuid.uuid4()),
                document_type="caste_certificate",
                document_name="Scheduled Caste (SC) Certificate",
                description="Issued by Sub-Divisional Magistrate (SDM) / Tahsildar / Revenue Authority.",
                is_mandatory=True,
                is_uploaded=False,
            ),
            ApplicationDocumentItem(
                id=str(uuid.uuid4()),
                document_type="income_certificate",
                document_name="Annual Family Income Certificate",
                description="Issued by competent Revenue Authority certifying annual income <= ₹3.00 Lakh.",
                is_mandatory=True,
                is_uploaded=False,
            ),
            ApplicationDocumentItem(
                id=str(uuid.uuid4()),
                document_type="aadhaar_card",
                document_name="Aadhaar Card (Identity & Address Proof)",
                description="Government of India UIDAI Aadhaar Card with linked mobile.",
                is_mandatory=True,
                is_uploaded=False,
            ),
            ApplicationDocumentItem(
                id=str(uuid.uuid4()),
                document_type="bank_passbook",
                document_name="Bank Account Passbook / Cancelled Cheque",
                description="DBT-enabled Savings Account details in applicant's name.",
                is_mandatory=True,
                is_uploaded=False,
            ),
            ApplicationDocumentItem(
                id=str(uuid.uuid4()),
                document_type="photographs",
                document_name="Passport-Size Photographs (2 Copies)",
                description="Recent color passport photographs.",
                is_mandatory=True,
                is_uploaded=False,
            ),
        ]

        # Scheme-specific additional documents
        lower_name = s_name.lower()
        if "education" in lower_name or "els" in lower_name:
            docs.extend([
                ApplicationDocumentItem(
                    id=str(uuid.uuid4()),
                    document_type="admission_letter",
                    document_name="Confirmed Admission Letter",
                    description="Letter from recognized University / College in India or Abroad.",
                    is_mandatory=True,
                    is_uploaded=False,
                ),
                ApplicationDocumentItem(
                    id=str(uuid.uuid4()),
                    document_type="fee_structure",
                    document_name="Official Fee Structure Schedule",
                    description="Official breakup of tuition fees, books, and hostel charges from institution.",
                    is_mandatory=True,
                    is_uploaded=False,
                ),
                ApplicationDocumentItem(
                    id=str(uuid.uuid4()),
                    document_type="academic_marksheets",
                    document_name="10th, 12th & Graduation Marksheets",
                    description="Certified academic records of qualifying examination.",
                    is_mandatory=True,
                    is_uploaded=False,
                ),
            ])
        else:
            docs.extend([
                ApplicationDocumentItem(
                    id=str(uuid.uuid4()),
                    document_type="project_report",
                    document_name="Project Proposal / Detailed Project Report (DPR)",
                    description="Summary of business activity, machinery cost, working capital & revenue forecast.",
                    is_mandatory=True,
                    is_uploaded=False,
                ),
                ApplicationDocumentItem(
                    id=str(uuid.uuid4()),
                    document_type="quotation_machinery",
                    document_name="Vendor Quotation for Machinery / Equipment",
                    description="Proforma invoice or price quotation from authorized machinery vendor.",
                    is_mandatory=False,
                    is_uploaded=False,
                ),
            ])

        return SchemeDocumentChecklistResponse(
            scheme_id=scheme_id or "nsfdc-scheme",
            scheme_name=s_name,
            documents=docs,
        )

    @classmethod
    def create_application(cls, req: ApplicationCreateRequest) -> ApplicationOut:
        """Creates a new scheme application packet and records initial submission audit stage."""
        app_id = str(uuid.uuid4())
        random_digits = random.randint(10000, 99999)
        app_num = f"ARTH-2024-{random_digits}"
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Prepare default document checklist if not supplied
        docs = req.documents
        if not docs:
            checklist = cls.get_scheme_document_checklist(req.scheme_id, req.scheme_name)
            docs = checklist.documents

        # Initial submission timeline entry
        timeline = [
            ApplicationStatusHistoryItem(
                id=str(uuid.uuid4()),
                from_status=None,
                to_status="Submitted",
                remarks="Application packet registered and submitted by applicant on UdyamNex.",
                updated_by="Applicant",
                created_at=now_str,
            )
        ]

        app_obj = ApplicationOut(
            id=app_id,
            application_number=app_num,
            scheme_id=req.scheme_id,
            scheme_name=req.scheme_name,
            partner_id=req.partner_id,
            partner_name=req.partner_name or "State Channelizing Agency (SCA)",
            applicant_name=req.applicant_name,
            applicant_phone=req.applicant_phone,
            applicant_email=req.applicant_email,
            annual_family_income=req.annual_family_income,
            loan_amount=req.loan_amount,
            project_cost=req.project_cost,
            purpose=req.purpose,
            sc_caste_declared=req.sc_caste_declared,
            status="Submitted",
            remarks="Application submitted successfully. Awaiting document verification at Channelizing Agency.",
            documents=docs,
            timeline=timeline,
            created_at=now_str,
            updated_at=now_str,
            demo_disclaimer="Demo status simulation — not connected to NSFDC's live systems.",
        )

        # Save to memory and try saving to Supabase
        _APPLICATIONS_DB[app_num] = app_obj
        _APPLICATIONS_DB[app_id] = app_obj

        try:
            supabase = get_supabase_client()
            db_payload = {
                "id": app_id,
                "application_number": app_num,
                "scheme_name": req.scheme_name,
                "partner_name": req.partner_name,
                "applicant_name": req.applicant_name,
                "applicant_phone": req.applicant_phone,
                "applicant_email": req.applicant_email,
                "annual_family_income": req.annual_family_income,
                "loan_amount": req.loan_amount,
                "project_cost": req.project_cost,
                "purpose": req.purpose,
                "sc_caste_declared": req.sc_caste_declared,
                "status": "Submitted",
            }
            supabase.table("applications").insert(db_payload).execute()
        except Exception as exc:
            logger.warning(f"Supabase application insert skipped (using in-memory fallback): {exc}")

        return app_obj

    @classmethod
    def get_application(cls, identifier: str) -> Optional[ApplicationOut]:
        """Retrieves application by Application Number or UUID."""
        # 1. Check in-memory store first
        if identifier in _APPLICATIONS_DB:
            return _APPLICATIONS_DB[identifier]

        # 2. Try querying Supabase
        try:
            supabase = get_supabase_client()
            resp = (
                supabase.table("applications")
                .select("*")
                .or_(f"application_number.eq.{identifier},id.eq.{identifier},applicant_phone.eq.{identifier}")
                .maybe_single()
                .execute()
            )
            if resp.data:
                app_data = resp.data
                now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
                checklist = cls.get_scheme_document_checklist(scheme_name=app_data.get("scheme_name"))
                return ApplicationOut(
                    id=app_data["id"],
                    application_number=app_data["application_number"],
                    scheme_id=app_data.get("scheme_id"),
                    scheme_name=app_data["scheme_name"],
                    partner_id=app_data.get("partner_id"),
                    partner_name=app_data.get("partner_name", "State Channelizing Agency"),
                    applicant_name=app_data["applicant_name"],
                    applicant_phone=app_data["applicant_phone"],
                    applicant_email=app_data.get("applicant_email"),
                    annual_family_income=float(app_data.get("annual_family_income", 200000)),
                    loan_amount=float(app_data.get("loan_amount", 100000)),
                    project_cost=float(app_data.get("project_cost", 111111)),
                    purpose=app_data.get("purpose", "business"),
                    sc_caste_declared=app_data.get("sc_caste_declared", True),
                    status=app_data.get("status", "Submitted"),
                    documents=checklist.documents,
                    timeline=[
                        ApplicationStatusHistoryItem(
                            from_status=None,
                            to_status="Submitted",
                            remarks="Application received on UdyamNex Portal.",
                            updated_by="Applicant",
                            created_at=app_data.get("created_at", now_str),
                        )
                    ],
                    created_at=app_data.get("created_at", now_str),
                    updated_at=app_data.get("updated_at", now_str),
                )
        except Exception as exc:
            logger.warning(f"Supabase application query fallback: {exc}")

        # 3. If demo lookup for default hackathon code e.g. ARTH-2024-88421
        if "88421" in identifier or "demo" in identifier.lower():
            demo_app = cls.create_application(
                ApplicationCreateRequest(
                    scheme_name="Micro Credit Finance",
                    partner_name="M.P. Rajya Sahakari Anusuchit Jati Vitta Evam Vikas Nigam Maryadit",
                    applicant_name="Ramesh Kumar",
                    applicant_phone="9876543210",
                    annual_family_income=180000,
                    loan_amount=125000,
                    project_cost=140000,
                    purpose="micro_business",
                    sc_caste_declared=True,
                )
            )
            # Advance to Under Review for demo richness
            demo_app.status = "Under Review"
            demo_app.timeline.append(
                ApplicationStatusHistoryItem(
                    from_status="Submitted",
                    to_status="Under Review",
                    remarks="Document scrutiny in progress at District SCA Bhopal Office.",
                    updated_by="SCA Verification Officer",
                    created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                )
            )
            _APPLICATIONS_DB[identifier] = demo_app
            return demo_app

        return None

    @classmethod
    def update_application_status(
        cls, app_id_or_number: str, new_status: str, remarks: str, updated_by: str = "Agency Officer"
    ) -> Optional[ApplicationOut]:
        """Transitions application status and appends timeline audit event (Demo Simulation)."""
        app = cls.get_application(app_id_or_number)
        if not app:
            return None

        old_status = app.status
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        app.status = new_status
        app.updated_at = now_str
        app.remarks = remarks

        if new_status == "Decision":
            app.decision_verdict = "Potentially Recommended for Sanction"

        history_item = ApplicationStatusHistoryItem(
            id=str(uuid.uuid4()),
            from_status=old_status,
            to_status=new_status,
            remarks=remarks,
            updated_by=updated_by,
            created_at=now_str,
        )
        app.timeline.append(history_item)

        _APPLICATIONS_DB[app.id] = app
        _APPLICATIONS_DB[app.application_number] = app
        return app

    @classmethod
    def list_all_applications(
        cls, status: Optional[str] = None, search: Optional[str] = None
    ) -> List[ApplicationOut]:
        """Lists all registered applications with optional status and search filtering (Admin/Dashboard)."""
        cls.ensure_demo_applications_seeded()

        # Deduplicate memory records (indexed by both id and app_number)
        seen_ids = set()
        unique_apps: List[ApplicationOut] = []
        for app in _APPLICATIONS_DB.values():
            if app.id not in seen_ids:
                seen_ids.add(app.id)
                unique_apps.append(app)

        # Try fetching from Supabase if connected
        try:
            supabase = get_supabase_client()
            resp = supabase.table("applications").select("*").order("created_at", desc=True).limit(50).execute()
            if resp.data:
                for row in resp.data:
                    if row["id"] not in seen_ids:
                        seen_ids.add(row["id"])
                        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
                        checklist = cls.get_scheme_document_checklist(scheme_name=row.get("scheme_name"))
                        app_obj = ApplicationOut(
                            id=row["id"],
                            application_number=row["application_number"],
                            scheme_id=row.get("scheme_id"),
                            scheme_name=row["scheme_name"],
                            partner_id=row.get("partner_id"),
                            partner_name=row.get("partner_name") or "State Channelizing Agency",
                            applicant_name=row["applicant_name"],
                            applicant_phone=row["applicant_phone"],
                            applicant_email=row.get("applicant_email"),
                            annual_family_income=float(row.get("annual_family_income", 200000)),
                            loan_amount=float(row.get("loan_amount", 100000)),
                            project_cost=float(row.get("project_cost", 111111)),
                            purpose=row.get("purpose", "business"),
                            sc_caste_declared=row.get("sc_caste_declared", True),
                            status=row.get("status", "Submitted"),
                            documents=checklist.documents,
                            timeline=[
                                ApplicationStatusHistoryItem(
                                    to_status=row.get("status", "Submitted"),
                                    remarks="Application loaded from database.",
                                    created_at=row.get("created_at", now_str),
                                )
                            ],
                            created_at=row.get("created_at", now_str),
                            updated_at=row.get("updated_at", now_str),
                        )
                        unique_apps.append(app_obj)
        except Exception as exc:
            logger.debug(f"Supabase list applications query fallback: {exc}")

        # Apply filters
        filtered = unique_apps
        if status and status != "all":
            filtered = [a for a in filtered if a.status.lower() == status.lower()]

        if search and search.strip():
            q = search.strip().lower()
            filtered = [
                a for a in filtered
                if q in a.application_number.lower()
                or q in a.applicant_name.lower()
                or q in a.applicant_phone.lower()
                or q in a.scheme_name.lower()
            ]

        # Sort newest first
        filtered.sort(key=lambda a: a.created_at, reverse=True)
        return filtered

    @classmethod
    def ensure_demo_applications_seeded(cls):
        """Pre-populates realistic applications for Admin demonstration."""
        if len(_APPLICATIONS_DB) >= 4:
            return

        now = datetime.datetime.now(datetime.timezone.utc)
        now_str = now.isoformat()
        yesterday_str = (now - datetime.timedelta(days=1)).isoformat()
        two_days_ago_str = (now - datetime.timedelta(days=2)).isoformat()

        demo_records = [
            {
                "id": "d1000001-0000-0000-0000-000000000001",
                "app_num": "ARTH-2024-88421",
                "scheme": "Micro Credit Finance",
                "partner": "M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam (Bhopal SCA)",
                "applicant": "Ramesh Kumar",
                "phone": "9876543210",
                "income": 180000,
                "loan": 125000,
                "cost": 140000,
                "purpose": "micro_business",
                "status": "Under Review",
                "remarks": "Document scrutiny in progress at District SCA Bhopal Office.",
                "created_at": two_days_ago_str,
                "timeline": [
                    ApplicationStatusHistoryItem(
                        to_status="Submitted",
                        remarks="Application packet submitted online via UdyamNex Portal.",
                        updated_by="Applicant",
                        created_at=two_days_ago_str,
                    ),
                    ApplicationStatusHistoryItem(
                        from_status="Submitted",
                        to_status="Under Review",
                        remarks="Documents under initial scrutiny by District Welfare Officer.",
                        updated_by="SCA Verification Officer",
                        created_at=yesterday_str,
                    ),
                ],
            },
            {
                "id": "d1000002-0000-0000-0000-000000000002",
                "app_num": "ARTH-2024-91204",
                "scheme": "Term Loan",
                "partner": "Madhya Pradesh Gramin Bank (Shivaji Nagar, Bhopal)",
                "applicant": "Sunita Ahirwar",
                "phone": "9823456781",
                "income": 240000,
                "loan": 300000,
                "cost": 333333,
                "purpose": "business",
                "status": "Forwarded to Partner",
                "remarks": "Application packet forwarded to MP Gramin Bank Lead Branch for field verification.",
                "created_at": yesterday_str,
                "timeline": [
                    ApplicationStatusHistoryItem(
                        to_status="Submitted",
                        remarks="Submitted online.",
                        updated_by="Applicant",
                        created_at=yesterday_str,
                    ),
                    ApplicationStatusHistoryItem(
                        from_status="Submitted",
                        to_status="Under Review",
                        remarks="Preliminary eligibility rules verified.",
                        updated_by="SCA Officer",
                        created_at=yesterday_str,
                    ),
                    ApplicationStatusHistoryItem(
                        from_status="Under Review",
                        to_status="Forwarded to Partner",
                        remarks="Forwarded to MP Gramin Bank Branch for credit appraisal.",
                        updated_by="SCA Officer",
                        created_at=now_str,
                    ),
                ],
            },
            {
                "id": "d1000003-0000-0000-0000-000000000003",
                "app_num": "ARTH-2024-74199",
                "scheme": "Educational Loan Scheme (ELS)",
                "partner": "M.P. Rajya SC Finance & Dev Corp (Indore Branch)",
                "applicant": "Pooja Malviya",
                "phone": "9425012345",
                "income": 280000,
                "loan": 800000,
                "cost": 888888,
                "purpose": "education",
                "status": "Documents Required",
                "remarks": "Please provide confirmed semester fee structure and 12th marksheet copy.",
                "created_at": two_days_ago_str,
                "timeline": [
                    ApplicationStatusHistoryItem(
                        to_status="Submitted",
                        remarks="Submitted online.",
                        updated_by="Applicant",
                        created_at=two_days_ago_str,
                    ),
                    ApplicationStatusHistoryItem(
                        from_status="Submitted",
                        to_status="Documents Required",
                        remarks="College fee structure receipt requested from applicant.",
                        updated_by="SCA Education Desk",
                        created_at=yesterday_str,
                    ),
                ],
            },
        ]

        for item in demo_records:
            checklist = cls.get_scheme_document_checklist(scheme_name=item["scheme"])
            app_obj = ApplicationOut(
                id=item["id"],
                application_number=item["app_num"],
                scheme_name=item["scheme"],
                partner_name=item["partner"],
                applicant_name=item["applicant"],
                applicant_phone=item["phone"],
                annual_family_income=item["income"],
                loan_amount=item["loan"],
                project_cost=item["cost"],
                purpose=item["purpose"],
                sc_caste_declared=True,
                status=item["status"],
                remarks=item["remarks"],
                documents=checklist.documents,
                timeline=item["timeline"],
                created_at=item["created_at"],
                updated_at=now_str,
                demo_disclaimer="Demo status simulation — not connected to NSFDC's live systems.",
            )
            _APPLICATIONS_DB[app_obj.id] = app_obj
            _APPLICATIONS_DB[app_obj.application_number] = app_obj

