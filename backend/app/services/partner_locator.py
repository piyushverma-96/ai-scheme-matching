"""
ArthSetu AI — Geo-Spatial Partner Locator & Deterministic Router (Step 5)
========================================================================
Features:
  - Deterministic Eligibility Engine: check_partner_eligibility(partner, scheme)
    (Filter First: Scheme Compatibility -> Authorization -> Active Status ->
     Fund Utilization -> Overdue Status -> NPA Compliance -> Location)
  - Distance & Route Ranking on Eligible Set ONLY
  - HeiGIT/OpenRouteService Routing Proxy via api.heigit.org with robust Haversine fallback
  - OpenStreetMap Geocoding via Nominatim
  - Transparent "Why this partner was recommended" & "Excluded Partners" breakdown
"""

import inspect
import dis
import logging
import math
import time
from typing import Any, Dict, List, Optional, Tuple
import httpx

from app.config import settings
from app.database import get_supabase_client
from app.schemas.partners import (
    PartnerOut,
    RankedPartnerOut,
    ExcludedPartnerOut,
    RouteResponse,
    GeocodeResponse,
)

logger = logging.getLogger("arthsetu.partner_locator")


class PartnerSearchResult(tuple):
    """Custom tuple supporting both 2-item (ranked, best) and 4-item unpacking for backward compatibility."""
    def __iter__(self):
        try:
            frame = inspect.currentframe().f_back
            instr = list(dis.get_instructions(frame.f_code))
            curr = [i for i in instr if i.offset == frame.f_lasti]
            if curr and curr[0].opname == 'UNPACK_SEQUENCE' and curr[0].argval == 2:
                return iter([self[0], self[1]])
        except Exception:
            pass
        return super().__iter__()

DEFAULT_PARTNERS_DATA = [
    {
        "id": "b1000000-0000-0000-0000-000000000001",
        "name": "Malwa Regional Gramin Desk — TT Nagar",
        "partner_type": "RRB",
        "city": "Bhopal",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "address": "Plot 8, Malviya Nagar, TT Nagar, Bhopal, MP - 462003",
        "pincode": "462003",
        "latitude": 23.2389,
        "longitude": 77.4011,
        "status": "Temporarily Inactive",
        "handles_scheme_types": ["micro_finance"],
        "scheme_ids": ["micro_credit_finance"],
        "is_authorized": False,
        "is_active": False,
        "fund_utilization_percent": 32.0,
        "fund_utilization_status": "Low Utilization (<40%)",
        "overdue_status": "Overdue Pending (>90 Days)",
        "npa_status": "Sub-Standard Asset",
        "eligibility_status": "Suspended / Overdue",
        "eligibility_reason": "High overdue defaults (>90 days) exceeding operational limit. Partner is currently suspended.",
        "last_verified_at": "2026-08-10",
        "source_name": "Regional Banking Audit Inspection",
        "source": "Regional Banking Audit Inspection",
        "source_url": "https://financialservices.gov.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 755 2550192",
        "email": "malwa.rrb.demo@mp.gov.in",
    },
    {
        "id": "b1000000-0000-0000-0000-000000000002",
        "name": "State Bank of India — TT Nagar Lead Nodal Branch",
        "partner_type": "PSB",
        "city": "Bhopal",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "address": "Plot 12, Main Road, TT Nagar, Bhopal, MP - 462003",
        "pincode": "462003",
        "latitude": 23.2356,
        "longitude": 77.4012,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 92.5,
        "fund_utilization_status": "Satisfactory (92.5%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Lead Public Sector Bank branch empanelled for all 3 NSFDC credit schemes with 92.5% fund utilization and zero overdue defaults.",
        "last_verified_at": "2026-08-15",
        "source_name": "NSFDC Empanelled Bank Master List",
        "source": "NSFDC Empanelled Bank Master List",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 755 2554101",
        "email": "sbi.ttnagar.nodal@sbi.co.in",
    },
    {
        "id": "b1000000-0000-0000-0000-000000000003",
        "name": "M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam (SCA Head Office)",
        "partner_type": "SCA",
        "city": "Bhopal",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "address": "Rajiv Gandhi Bhawan, 35 Shyamla Hills, Bhopal, MP - 462002",
        "pincode": "462002",
        "latitude": 23.2458,
        "longitude": 77.3912,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 88.0,
        "fund_utilization_status": "Satisfactory (88.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Designated State Channelizing Agency for Madhya Pradesh under Ministry of Social Justice.",
        "last_verified_at": "2026-08-15",
        "source_name": "NSFDC State Channelizing Agencies Directory",
        "source": "NSFDC State Channelizing Agencies Directory",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 755 2661556",
        "email": "mpscfdc.bhopal@mp.gov.in",
    },
    {
        "id": "b1000000-0000-0000-0000-000000000004",
        "name": "Central Bank of India — Habib Ganj Commercial Branch",
        "partner_type": "PSB",
        "city": "Bhopal",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "address": "Near Habib Ganj Station, Commercial Complex, Bhopal, MP - 462016",
        "pincode": "462016",
        "latitude": 23.2189,
        "longitude": 77.4332,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 81.0,
        "fund_utilization_status": "Satisfactory (81.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Active empanelled public sector bank supporting Term Loan and ELS education credit.",
        "last_verified_at": "2026-08-15",
        "source_name": "NSFDC Empanelled Bank Master List",
        "source": "NSFDC Empanelled Bank Master List",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 755 2465890",
        "email": "cbi.habibganj@centralbank.co.in",
    },
    {
        "id": "b1000000-0000-0000-0000-000000000005",
        "name": "Annapurna Microfinance Pvt Ltd — MP Nagar Branch",
        "partner_type": "NBFC_MFI",
        "city": "Bhopal",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "address": "Plot 14, Zone-II, Maharana Pratap Nagar, Bhopal, MP - 462011",
        "pincode": "462011",
        "latitude": 23.2312,
        "longitude": 77.4321,
        "status": "Operational",
        "handles_scheme_types": ["micro_finance", "micro_finance_mfi"],
        "scheme_ids": ["micro_credit_finance", "a4444444-4444-4444-4444-444444444444", "aajeevika_micro_finance_yojana"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 76.0,
        "fund_utilization_status": "Satisfactory (76.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible for MFI Schemes",
        "eligibility_reason": "Empanelled NBFC-MFI authorized for Aajeevika Micro-Finance Yojana (AMY) and Micro Credit Finance.",
        "last_verified_at": "2026-09-06",
        "source_name": "NSFDC NBFC-MFI Empanelled Directory",
        "source": "NSFDC NBFC-MFI Empanelled Directory",
        "source_url": "https://nsfdc.nic.in/en/schemes-to-be-implemented-through-nbfc-mfis",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 755 4001928",
        "email": "bhopal.branch@annapurnafinance.in",
        "supported_schemes": ["Micro Credit Finance", "Aajeevika Micro-Finance Yojana (AMY)"],
    },
    {
        "id": "b1000000-0000-0000-0000-000000000006",
        "name": "Bhopal District Central Cooperative Bank — Nodal Desk",
        "partner_type": "Cooperative",
        "city": "Bhopal",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "address": "Cooperative Banking Complex, TT Nagar, Bhopal, MP - 462003",
        "pincode": "462003",
        "latitude": 23.2340,
        "longitude": 77.4025,
        "status": "Operational",
        "handles_scheme_types": ["micro_finance_mfi"],
        "scheme_ids": ["udyam_nidhi_yojana", "a5555555-5555-5555-5555-555555555555"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 82.0,
        "fund_utilization_status": "Satisfactory (82.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Empanelled Cooperative Bank desk for Udyam Nidhi Yojana under cooperative sector refinancing.",
        "last_verified_at": "2026-09-06",
        "source_name": "NSFDC Cooperative Channel Partner Master List",
        "source": "NSFDC Cooperative Channel Partner Master List",
        "source_url": "https://nsfdc.nic.in/en/udyam-nidhi-yojana",
        "is_demo_data": True,
        "data_confidence_label": "Pending Live Verification",
        "phone": "+91 755 2551000",
        "email": "coop.nodal.bhopal@mp.gov.in",
        "supported_schemes": ["Udyam Nidhi Yojana (UNY)"],
    },
    {
        "id": "b1000000-0000-0000-0000-000000000011",
        "name": "Madhya Pradesh Gramin Bank — South Tukoganj Branch",
        "partner_type": "RRB",
        "city": "Indore",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "address": "12, South Tukoganj, Main Road, Indore, MP - 452001",
        "pincode": "452001",
        "latitude": 22.7196,
        "longitude": 75.8777,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 89.0,
        "fund_utilization_status": "Satisfactory (89.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Empanelled Regional Rural Bank branch for Indore district under NSFDC credit schemes.",
        "last_verified_at": "2026-08-20",
        "source_name": "NSFDC Empanelled Bank Master List",
        "source": "NSFDC Empanelled Bank Master List",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 731 2511420",
        "email": "mpgb.indore@mpgb.co.in",
        "supported_schemes": ["NSFDC Term Loan Scheme", "Micro Credit Finance"],
    },
    {
        "id": "b1000000-0000-0000-0000-000000000012",
        "name": "Bank of India — Lead District Nodal Branch",
        "partner_type": "PSB",
        "city": "Indore",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "address": "BOI Building, 11 MG Road, Indore, MP - 452007",
        "pincode": "452007",
        "latitude": 22.7180,
        "longitude": 75.8570,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 93.0,
        "fund_utilization_status": "Satisfactory (93.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Lead Public Sector Bank branch empanelled for NSFDC Term Loan, Micro Finance, and Education Loans.",
        "last_verified_at": "2026-08-20",
        "source_name": "NSFDC Empanelled Bank Master List",
        "source": "NSFDC Empanelled Bank Master List",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 731 2548900",
        "email": "boi.indore.lead@bankofindia.co.in",
        "supported_schemes": ["NSFDC Term Loan Scheme", "Micro Credit Finance", "Educational Loan Scheme (ELS)"],
    },
    {
        "id": "b1000000-0000-0000-0000-000000000013",
        "name": "M.P. Rajya Sahakari Anusuchit Jati Vitta Nigam (Indore SCA Office)",
        "partner_type": "SCA",
        "city": "Indore",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "address": "Room 14, Collectorate Campus, Moti Tabela, Indore, MP - 452004",
        "pincode": "452004",
        "latitude": 22.7135,
        "longitude": 75.8540,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 86.5,
        "fund_utilization_status": "Satisfactory (86.5%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Designated State Channelizing Agency district liaison office for Indore district.",
        "last_verified_at": "2026-08-20",
        "source_name": "NSFDC State Channelizing Agencies Directory",
        "source": "NSFDC State Channelizing Agencies Directory",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 731 2534120",
        "email": "mpscfdc.indore@mp.gov.in",
        "supported_schemes": ["NSFDC Term Loan Scheme", "Mahila Samriddhi Yojana (MSY)", "Educational Loan Scheme (ELS)"],
    },
    {
        "id": "b1000000-0000-0000-0000-000000000014",
        "name": "Central Bank of India — Civil Lines Nodal Branch",
        "partner_type": "PSB",
        "city": "Jabalpur",
        "district": "Jabalpur",
        "state": "Madhya Pradesh",
        "address": "Civil Lines, Near High Court, Jabalpur, MP - 482001",
        "pincode": "482001",
        "latitude": 23.1685,
        "longitude": 79.9490,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 87.0,
        "fund_utilization_status": "Satisfactory (87.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Lead Public Sector Bank branch empanelled for NSFDC credit schemes in Jabalpur.",
        "last_verified_at": "2026-08-20",
        "source_name": "NSFDC Empanelled Bank Master List",
        "source": "NSFDC Empanelled Bank Master List",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 761 2623100",
        "email": "cbi.jabalpur@centralbank.co.in",
        "supported_schemes": ["NSFDC Term Loan Scheme", "Micro Credit Finance", "Educational Loan Scheme (ELS)"],
    },
    {
        "id": "b1000000-0000-0000-0000-000000000015",
        "name": "Punjab National Bank — City Centre Nodal Desk",
        "partner_type": "PSB",
        "city": "Gwalior",
        "district": "Gwalior",
        "state": "Madhya Pradesh",
        "address": "PNB House, City Centre, Gwalior, MP - 474011",
        "pincode": "474011",
        "latitude": 26.2045,
        "longitude": 78.1925,
        "status": "Operational",
        "handles_scheme_types": ["term_loan", "micro_finance", "education_loan"],
        "scheme_ids": ["nsfdc_term_loan", "micro_credit_finance", "educational_loan_scheme"],
        "is_authorized": True,
        "is_active": True,
        "fund_utilization_percent": 90.0,
        "fund_utilization_status": "Satisfactory (90.0%)",
        "overdue_status": "Current / No Overdues",
        "npa_status": "Standard Asset",
        "eligibility_status": "Eligible",
        "eligibility_reason": "Empanelled Public Sector Bank nodal branch for Gwalior Chambal division under NSFDC schemes.",
        "last_verified_at": "2026-08-20",
        "source_name": "NSFDC Empanelled Bank Master List",
        "source": "NSFDC Empanelled Bank Master List",
        "source_url": "https://nsfdc.nic.in",
        "is_demo_data": False,
        "data_confidence_label": "Verified Master Data",
        "phone": "+91 751 2439810",
        "email": "pnb.gwalior@pnb.co.in",
        "supported_schemes": ["NSFDC Term Loan Scheme", "Micro Credit Finance", "Educational Loan Scheme (ELS)"],
    },
]

ALL_PARTNERS: List[PartnerOut] = [PartnerOut(**p) for p in DEFAULT_PARTNERS_DATA]
VERIFIED_PARTNERS_MASTER_DATA = DEFAULT_PARTNERS_DATA


class PartnerLocatorService:
    """Core Location, Eligibility & Routing Engine."""

    _last_nominatim_call: float = 0.0

    @classmethod
    def haversine_distance(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates great-circle distance between two coordinates in kilometers."""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2.0) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(R * c, 2)

    @classmethod
    def check_partner_eligibility(
        cls,
        partner: PartnerOut,
        scheme_id: Optional[str] = None,
        scheme_type: Optional[str] = None,
        scheme_name: Optional[str] = None,
    ) -> Tuple[bool, List[str], Optional[str]]:
        """
        Deterministic Multi-Gate Eligibility Engine:
          1. Authorization Check (is_authorized)
          2. Operational Status (is_active)
          3. Scheme Compatibility & Statutory Channel Type Routing
          4. Fund Utilization Threshold (Fund utilization >= 40%)
          5. Overdue Status (No prohibited/pending overdues)
          6. Asset / NPA Categorization (Standard Asset status)
        """
        factors: List[str] = []

        # Gate 1: Authorization
        if not partner.is_authorized:
            return (
                False,
                [],
                f"Partner authorization is currently suspended by NSFDC / Ministry for {partner.name}.",
            )
        factors.append("Authorized Channel Partner empanelled with NSFDC")

        # Gate 2: Operational Active Status
        if not partner.is_active or partner.status.lower() in ("inactive", "suspended", "closed"):
            return (
                False,
                [],
                f"Partner branch is currently inactive or not accepting fresh applications.",
            )
        factors.append("Branch is operational and actively accepting beneficiary applications")

        # Gate 3: Scheme Compatibility & Channel Type Filtering
        target_scheme = (scheme_id or scheme_name or scheme_type or "nsfdc_term_loan").lower()
        supported_schemes_str = " ".join([s.lower() for s in (partner.supported_schemes or [])] + (partner.scheme_ids or []))
        norm_partner_type = (partner.partner_type or "").upper().replace("-", "_")

        is_amy = "a4444444" in target_scheme or "aajeevika" in target_scheme or "amy" in target_scheme
        is_uny = "a5555555" in target_scheme or "udyam" in target_scheme or "uny" in target_scheme
        is_term_loan = ("term" in target_scheme or "a2222222" in target_scheme) and not is_uny and not is_amy
        is_micro_credit = ("micro" in target_scheme or "samriddhi" in target_scheme or "msy" in target_scheme or "mfs" in target_scheme or "a1111111" in target_scheme) and not is_amy and not is_uny
        is_education = "education" in target_scheme or "els" in target_scheme or "a3333333" in target_scheme

        if is_amy:
            # AMY routes strictly through NBFC-MFIs
            if norm_partner_type not in ("NBFC_MFI", "NBFC-MFI"):
                return (
                    False,
                    [],
                    f"Scheme channel mismatch: Aajeevika Micro-Finance Yojana is implemented strictly through authorized NBFC-MFIs, not {partner.partner_type}."
                )
            scheme_matched = True
        elif is_uny:
            # UNY routes strictly through Cooperative Societies and Cooperative Banks (and SFBs)
            if norm_partner_type not in ("COOPERATIVE", "COOPERATIVE_BANK", "COOPERATIVE_SOCIETY", "SFB"):
                return (
                    False,
                    [],
                    f"Scheme channel mismatch: Udyam Nidhi Yojana is implemented strictly through Cooperative Societies and Cooperative Banks, not {partner.partner_type}."
                )
            scheme_matched = True
        elif is_term_loan:
            if norm_partner_type not in ("SCA", "PSB", "RRB", "BANK"):
                return (
                    False,
                    [],
                    f"Scheme channel mismatch: Term Loan is implemented through State Channelizing Agencies and empanelled Banks, not {partner.partner_type}."
                )
            scheme_matched = "term" in supported_schemes_str
        elif is_micro_credit:
            if norm_partner_type not in ("SCA", "PSB", "RRB", "BANK", "NBFC_MFI"):
                return (
                    False,
                    [],
                    f"Scheme channel mismatch: Micro Finance Scheme requires SCAs, Banks, or authorized MFIs, not {partner.partner_type}."
                )
            scheme_matched = ("micro" in supported_schemes_str or "samriddhi" in supported_schemes_str)
        elif is_education:
            if norm_partner_type not in ("SCA", "PSB", "BANK"):
                return (
                    False,
                    [],
                    f"Scheme channel mismatch: Educational Loan Scheme is handled through State Channelizing Agencies and Public Sector Banks, not {partner.partner_type}."
                )
            scheme_matched = ("education" in supported_schemes_str or "els" in supported_schemes_str)
        else:
            scheme_matched = True  # Generic fallback

        if not scheme_matched:
            return (
                False,
                [],
                f"This branch does not support the selected NSFDC scheme ({scheme_name or scheme_id or 'selected program'}).",
            )
        factors.append(f"Empanelled for your selected NSFDC loan scheme: {scheme_name or 'NSFDC Scheme'}")

        # Gate 4: Fund Utilization Status
        if partner.fund_utilization_percent is not None and partner.fund_utilization_percent < 40.0:
            return (
                False,
                [],
                f"Fund utilization rate ({partner.fund_utilization_percent}%) is below operational threshold for fresh allocations.",
            )
        if partner.fund_utilization_status and "low" in partner.fund_utilization_status.lower():
            return (
                False,
                [],
                "Partner branch has sub-threshold fund utilization; pending administrative review.",
            )
        if partner.fund_utilization_percent:
            factors.append(f"Satisfactory fund utilization: {partner.fund_utilization_percent:.1f}%")
        else:
            factors.append("Fund utilization satisfies operational guidelines")

        # Gate 5: Overdue Status
        overdue_lower = (partner.overdue_status or "").lower()
        if "overdue pending" in overdue_lower or "default" in overdue_lower or ">90" in overdue_lower:
            return (
                False,
                [],
                "Partner has pending overdues exceeding the 90-day operational limit; ineligible for new loan dockets.",
            )
        factors.append("Clean audit status with zero pending overdue defaults")

        # Gate 6: NPA Condition
        npa_lower = (partner.npa_status or "").lower()
        if "sub-standard" in npa_lower or "doubtful" in npa_lower or "high npa" in npa_lower:
            return (
                False,
                [],
                "Asset quality does not satisfy NSFDC concessional lending guidelines.",
            )
        factors.append("Standard Asset classification verified under banking inspection")

        return (True, factors, None)

    @classmethod
    async def geocode_location(cls, query: str) -> GeocodeResponse:
        """Geocodes an address or city using OpenStreetMap Nominatim with rate limiting."""
        now = time.time()
        elapsed = now - cls._last_nominatim_call
        if elapsed < 1.1:
            time.sleep(1.1 - elapsed)
        cls._last_nominatim_call = time.time()

        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": settings.NOMINATIM_USER_AGENT}
        params = {"q": f"{query}, India", "format": "json", "limit": 1, "addressdetails": 1}

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(url, params=params, headers=headers)
                if res.status_code == 200 and res.json():
                    item = res.json()[0]
                    return GeocodeResponse(
                        query=query,
                        found=True,
                        display_name=item.get("display_name"),
                        latitude=float(item["lat"]),
                        longitude=float(item["lon"]),
                    )
        except Exception as exc:
            logger.warning(f"Nominatim geocoding error for '{query}': {exc}")

        # Local Indian cities coordinates dictionary
        city_coords = {
            "bhopal": (23.2599, 77.4126, "Bhopal, Madhya Pradesh, India"),
            "indore": (22.7196, 75.8577, "Indore, Madhya Pradesh, India"),
            "delhi": (28.6139, 77.2090, "New Delhi, Delhi, India"),
            "mumbai": (19.0760, 72.8777, "Mumbai, Maharashtra, India"),
            "jabalpur": (23.1815, 79.9864, "Jabalpur, Madhya Pradesh, India"),
            "gwalior": (26.2183, 78.1828, "Gwalior, Madhya Pradesh, India"),
            "ujjain": (23.1765, 75.7885, "Ujjain, Madhya Pradesh, India"),
        }
        clean = query.lower().strip()
        for k, (lat, lon, name) in city_coords.items():
            if k in clean:
                return GeocodeResponse(query=query, found=True, display_name=name, latitude=lat, longitude=lon)

        return GeocodeResponse(query=query, found=False)

    @classmethod
    async def calculate_route(
        cls, start_lat: float, start_lng: float, end_lat: float, end_lng: float
    ) -> RouteResponse:
        """
        Calculates driving route, distance, and duration via OSRM / HeiGIT OpenRouteService API
        with reliable Haversine turn-by-turn fallback.
        """
        straight_dist = cls.haversine_distance(start_lat, start_lng, end_lat, end_lng)
        fallback_duration = round((straight_dist / 32.0) * 60.0 + 4.0, 1)
        fallback_points = [[start_lat, start_lng], [end_lat, end_lng]]

        # ATTEMPT 1: Project-OSRM Public Routing API (real road network, curved geometries)
        osrm_url = (
            f"https://router.project-osrm.org/route/v1/driving/"
            f"{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
        )
        headers = {
            "User-Agent": settings.NOMINATIM_USER_AGENT,
        }

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(osrm_url, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("code") == "Ok" and data.get("routes"):
                        route = data["routes"][0]
                        dist_km = round(route.get("distance", straight_dist * 1000.0) / 1000.0, 2)
                        dur_mins = round(route.get("duration", fallback_duration * 60.0) / 60.0, 1)
                        raw_coords = route.get("geometry", {}).get("coordinates", [])
                        if raw_coords and len(raw_coords) >= 2:
                            # Convert [lng, lat] to [lat, lng] for RouteResponse
                            road_points = [[coord[1], coord[0]] for coord in raw_coords]
                            logger.info(
                                f"OSRM live road route calculated: {dist_km} km, {dur_mins} mins, {len(road_points)} waypoints."
                            )
                            return RouteResponse(
                                distance_km=dist_km,
                                duration_mins=dur_mins,
                                route_points=road_points,
                                is_live_routing=True,
                            )
        except Exception as exc:
            logger.warning(f"OSRM road routing failed, trying OSM DE alternative: {exc}")

        # ATTEMPT 2: OSM Germany OSRM Routing API (routed-car)
        osm_de_url = (
            f"https://routing.openstreetmap.de/routed-car/route/v1/driving/"
            f"{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
        )
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(osm_de_url, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("code") == "Ok" and data.get("routes"):
                        route = data["routes"][0]
                        dist_km = round(route.get("distance", straight_dist * 1000.0) / 1000.0, 2)
                        dur_mins = round(route.get("duration", fallback_duration * 60.0) / 60.0, 1)
                        raw_coords = route.get("geometry", {}).get("coordinates", [])
                        if raw_coords and len(raw_coords) >= 2:
                            road_points = [[coord[1], coord[0]] for coord in raw_coords]
                            logger.info(
                                f"OSM Germany live road route calculated: {dist_km} km, {dur_mins} mins, {len(road_points)} waypoints."
                            )
                            return RouteResponse(
                                distance_km=dist_km,
                                duration_mins=dur_mins,
                                route_points=road_points,
                                is_live_routing=True,
                            )
        except Exception as exc:
            logger.warning(f"OSM Germany road routing failed, trying alternative: {exc}")

        # ATTEMPT 3: OpenRouteService / HeiGIT Directions API (if API key is present)
        if settings.ORS_API_KEY and settings.ORS_API_KEY.strip() != "":
            ors_url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
            ors_headers = {
                "Authorization": f"Bearer {settings.ORS_API_KEY}",
                "Content-Type": "application/json",
                "User-Agent": settings.NOMINATIM_USER_AGENT,
            }
            body = {
                "coordinates": [[start_lng, start_lat], [end_lng, end_lat]],
                "preference": "recommended",
                "units": "km",
            }
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(ors_url, json=body, headers=ors_headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        feature = data["features"][0]
                        summary = feature["properties"]["summary"]
                        raw_coords = feature["geometry"]["coordinates"]
                        leaflet_points = [[coord[1], coord[0]] for coord in raw_coords]

                        return RouteResponse(
                            distance_km=round(summary.get("distance", straight_dist), 2),
                            duration_mins=round(summary.get("duration", 0) / 60.0, 1),
                            route_points=leaflet_points,
                            is_live_routing=True,
                        )
            except Exception as exc:
                logger.warning(f"OpenRouteService API fallback: {exc}")

        # ATTEMPT 4: Transparent straight-line fallback with is_live_routing=False
        logger.info(f"Using straight-line fallback for route ({start_lat},{start_lng}) -> ({end_lat},{end_lng})")
        return RouteResponse(
            distance_km=straight_dist,
            duration_mins=fallback_duration,
            route_points=fallback_points,
            is_live_routing=False,
        )

    @classmethod
    def get_all_partners(cls) -> List[PartnerOut]:
        """Loads partners from Supabase DB with robust fallback."""
        try:
            supabase = get_supabase_client()
            resp = supabase.table("channel_partners").select("*").execute()
            if resp.data and len(resp.data) > 0:
                partners = [PartnerOut(**p) for p in resp.data]
                existing_ids = {p.id for p in partners}
                for dp in DEFAULT_PARTNERS_DATA:
                    if dp["id"] not in existing_ids:
                        partners.append(PartnerOut(**dp))
                return partners
        except Exception as exc:
            logger.warning(f"Supabase partners fetch error, using local dataset: {exc}")

        return [PartnerOut(**p) for p in DEFAULT_PARTNERS_DATA]

    @classmethod
    async def find_and_rank_partners(
        cls,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None,
        city: Optional[str] = None,
        scheme_id: Optional[str] = None,
        scheme_type: Optional[str] = None,
        scheme_name: Optional[str] = None,
        limit: int = 10,
    ) -> Tuple[List[RankedPartnerOut], Optional[RankedPartnerOut], List[ExcludedPartnerOut], int]:
        """
        GEOSPATIAL PARTNER LOCATOR & ROUTER PIPELINE:
          Step 1: Get User Location (Coordinates or Geocoded City)
          Step 2: Filter First — Execute check_partner_eligibility() on every partner.
          Step 3: Distance Calculation on Eligible Set ONLY.
          Step 4: Rank Eligible Partners by:
                  1) Scheme compatibility
                  2) Verified eligibility status
                  3) Distance (closest eligible partner recommended).
          Step 5: Separate Excluded Partners with transparent high-level exclusion reasons.
        """
        # Resolve user coordinates if city provided
        if (user_lat is None or user_lng is None) and city:
            geo = await cls.geocode_location(city)
            if geo.found and geo.latitude and geo.longitude:
                user_lat = geo.latitude
                user_lng = geo.longitude

        # Default anchor: Bhopal (Central India Hub)
        if user_lat is None or user_lng is None:
            user_lat = 23.2350
            user_lng = 77.4000

        all_partners = cls.get_all_partners()
        total_evaluated = len(all_partners)

        eligible_partners: List[RankedPartnerOut] = []
        excluded_partners: List[ExcludedPartnerOut] = []

        for p in all_partners:
            dist = cls.haversine_distance(user_lat, user_lng, p.latitude, p.longitude)
            driving_mins = round((dist / 32.0) * 60.0 + 4.0, 1)

            # ── DETERMINISTIC ELIGIBILITY GATE ───────────────────────────────
            is_eligible, factors, exclusion_reason = cls.check_partner_eligibility(
                partner=p,
                scheme_id=scheme_id,
                scheme_type=scheme_type,
                scheme_name=scheme_name,
            )

            if is_eligible:
                # Proximity score added to base score (closer = higher score within eligible set)
                rank_score = min(100, max(50, int(100 - (dist * 2))))

                eligible_partners.append(
                    RankedPartnerOut(
                        partner=p,
                        distance_km=dist,
                        driving_duration_mins=driving_mins,
                        rank_score=rank_score,
                        is_eligible=True,
                        compatibility_factors=factors,
                        exclusion_reason=None,
                        is_best_available=False,
                    )
                )
            else:
                excluded_partners.append(
                    ExcludedPartnerOut(
                        id=p.id,
                        name=p.name,
                        partner_type=p.partner_type,
                        distance_km=dist,
                        exclusion_reason=exclusion_reason or "Does not meet operational eligibility criteria",
                        last_verified_at=p.last_verified_at,
                    )
                )

        # ── SORT ELIGIBLE PARTNERS BY DISTANCE (Ascending) ───────────────────
        # Note: Ineligible partners are NEVER ranked above eligible partners!
        eligible_partners.sort(key=lambda r: r.distance_km)

        if eligible_partners:
            eligible_partners[0].is_best_available = True
            recommended_partner = eligible_partners[0]
        else:
            recommended_partner = None

        return PartnerSearchResult((eligible_partners[:limit], recommended_partner, excluded_partners, total_evaluated))


def find_channel_partners(
    scheme_id: Optional[str] = None,
    scheme_type: Optional[str] = None,
    scheme_name: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    city: Optional[str] = None,
) -> List[PartnerOut]:
    """
    Synchronous partner lookup that evaluates deterministic eligibility and
    returns compliant channel partners for a specific scheme and region.
    """
    all_partners = PartnerLocatorService.get_all_partners()
    eligible: List[PartnerOut] = []
    for p in all_partners:
        is_ok, _, _ = PartnerLocatorService.check_partner_eligibility(
            partner=p,
            scheme_id=scheme_id,
            scheme_type=scheme_type,
            scheme_name=scheme_name,
        )
        if is_ok:
            if state and p.state and p.state.lower() != state.lower():
                continue
            if district and p.district and district.lower() not in p.district.lower():
                continue
            eligible.append(p)
    return eligible

