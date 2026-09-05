"""
ArthSetu AI — Deterministic Eligibility Rule Engine (Step 2)
============================================================
Source: https://nsfdc.nic.in/scheme and official NSFDC scheme pages (verified 2026-09-05).

All figures in SCHEME_RULES and SEED_ELIGIBILITY_RULES are taken verbatim from official sources.
Fields marked needs_manual_verification=True are flagged explicitly.

Deterministic Verdict labels:
  - "Potentially Eligible" (All data-defined scheme rules satisfied)
  - "Partially Eligible"   (No hard rules failed, but missing required data or soft/borderline criteria)
  - "Does Not Match Current Criteria" (One or more mandatory hard rules failed)

NO LLM is used in this engine. Every check evaluates data-defined rules per scheme and produces
deterministic matching factors, failed factors, missing information, and a structured explanation.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("arthsetu.eligibility")


# ---------------------------------------------------------------------------
# Scheme Rule & Eligibility Rule Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class SchemeRule:
    scheme_id: str
    name: str
    scheme_type: str                     # micro_finance, term_loan, education_loan, micro_finance_mfi
    category_id: str
    short_description: str
    full_description: str
    issuing_body: str

    # Project / Loan thresholds (INR)
    project_cost_min: float              # inclusive lower bound (0 = no min)
    project_cost_max: Optional[float]    # inclusive upper bound (None = no cap)
    project_cost_min_exclusive: bool     # True when threshold is strictly >
    max_loan_amount: float               # hard cap on loan amount (INR)
    financing_pct: float                 # % of project cost financed (e.g. 90%)

    # Income eligibility
    max_annual_family_income: float      # INR (default 300000)

    # Interest rates & tenure
    rate_beneficiary_min: float          # % p.a.
    rate_beneficiary_max: float          # % p.a.
    rate_to_sca: float                   # % p.a.
    rate_note: str
    repayment_years_max: int
    repayment_note: str
    moratorium_months: int
    moratorium_note: str

    # Whitelist
    eligible_purposes: List[str]

    # Source provenance
    source_name: str
    source_url: str
    last_verified_at: str                # YYYY-MM-DD

    # Benefit classification & financial calculation
    benefit_type: str = "loan"
    benefit_summary: str = ""
    has_financial_calculation: bool = True
    support_type_display: Optional[str] = None
    benefit_amount_display: Optional[str] = None

    # Application channel routing
    application_channel_type: str = "channel_partner"  # 'channel_partner' | 'government_portal' | 'department_office' | 'district_authority' | 'other_official_channel'
    application_channel_details: Optional[Dict[str, Any]] = None

    # Verification flags
    needs_manual_verification: bool = False
    verification_note: str = ""

    # Specific condition flags
    requires_education_purpose: bool = False
    is_active: bool = True



@dataclass
class SchemeEligibilityRule:
    """
    Data-defined eligibility rule. Each scheme defines its OWN set of rules,
    specifying which fields matter, the operator, threshold values, and hard/soft behavior.
    """
    rule_id: str
    scheme_id: str
    field_name: str                      # 'annual_family_income', 'project_cost', 'loan_amount', 'purpose', 'caste_category', 'education_status', 'study_location', 'gender', 'age', 'state', etc.
    operator: str                        # 'lte', 'gte', 'lt', 'gt', 'eq', 'ne', 'in', 'not_in', 'between'
    value_num: Optional[float] = None
    value_min: Optional[float] = None
    value_max: Optional[float] = None
    value_list: Optional[List[str]] = None
    value_text: Optional[str] = None
    description: str = ""
    is_hard_rule: bool = True            # Failure of hard rule -> "Does Not Match Current Criteria". Soft failure/missing -> "Partially Eligible"
    rule_type: str = "general"
    source_note: str = ""
    needs_manual_verification: bool = False
    verification_note: str = ""


# ---------------------------------------------------------------------------
# VERIFIED SCHEME METADATA (Source: nsfdc.nic.in, 2026-09-05)
# ---------------------------------------------------------------------------

SCHEME_RULES: List[SchemeRule] = [
    # 1. Micro Credit Finance
    SchemeRule(
        scheme_id="a1111111-1111-1111-1111-111111111111",
        category_id="c1000000-0000-0000-0000-000000000001",
        name="Micro Credit Finance",
        scheme_type="micro_finance",
        short_description="Micro credit for units costing up to ₹1,40,000. Max loan ₹1,25,000 (up to 90% of project cost) at 6.5% p.a.",
        full_description=(
            "NSFDC provides Micro Credit Finance for units costing up to ₹1,40,000. "
            "Loan amount up to 90% of project cost with maximum ₹1,25,000. "
            "NSFDC charges SCA/CA 2.5% p.a., which in turn charges beneficiary 6.5% p.a. "
            "Repayable in quarterly instalments within 3 years including 3 months moratorium."
        ),
        issuing_body="National Scheduled Castes Finance and Development Corporation (NSFDC)",
        project_cost_min=0,
        project_cost_max=140000,
        project_cost_min_exclusive=False,
        max_loan_amount=125000,
        financing_pct=90.0,
        max_annual_family_income=300000,
        rate_beneficiary_min=6.5,
        rate_beneficiary_max=6.5,
        rate_to_sca=2.5,
        rate_note="NSFDC charges SCA/CA 2.5% p.a.; SCA/CA charges beneficiary 6.5% p.a.",
        repayment_years_max=3,
        repayment_note="Quarterly instalments within a maximum period of 3 years from date of disbursement.",
        moratorium_months=3,
        moratorium_note="3 months moratorium from date of disbursement.",
        eligible_purposes=[
            "entrepreneurship", "business", "micro_business", "micro_credit",
            "agriculture", "farming", "services", "trade", "handicraft"
        ],
        benefit_type="loan",
        benefit_summary="Concessional micro-enterprise loan up to ₹1,25,000 (up to 90% project financing) at 6.5% p.a.",
        support_type_display="Credit-Linked Financial Support (Micro-Credit)",
        has_financial_calculation=True,
        source_name="NSFDC Official Website",
        source_url="https://nsfdc.nic.in/en/micro-credit-finance",
        last_verified_at="2026-09-05",
        needs_manual_verification=False,
        verification_note="",
    ),


    # 2. Term Loan
    SchemeRule(
        scheme_id="a2222222-2222-2222-2222-222222222222",
        category_id="c2000000-0000-0000-0000-000000000002",
        name="Term Loan",
        scheme_type="term_loan",
        short_description="Term loan for units costing more than ₹1,40,000 up to ₹50,00,000. Max loan ₹45,00,000 (up to 90%) at 8% p.a.",
        full_description=(
            "NSFDC provides Term Loans for units costing more than ₹1,40,000 up to ₹50,00,000. "
            "Loan amount up to 90% of project cost, maximum between ₹1,25,000 and ₹45,00,000. "
            "NSFDC charges SCA/CA 4% p.a., which in turn charges beneficiary 8% p.a. "
            "Repayable in quarterly instalments within 7 years including 6 months moratorium "
            "(12 months for plantation and construction activities)."
        ),
        issuing_body="National Scheduled Castes Finance and Development Corporation (NSFDC)",
        project_cost_min=140000,
        project_cost_max=5000000,
        project_cost_min_exclusive=True,
        max_loan_amount=4500000,
        financing_pct=90.0,
        max_annual_family_income=300000,
        rate_beneficiary_min=8.0,
        rate_beneficiary_max=8.0,
        rate_to_sca=4.0,
        rate_note="NSFDC charges SCA/CA 4% p.a.; SCA/CA charges beneficiary 8% p.a.",
        repayment_years_max=7,
        repayment_note="Quarterly instalments within 7 years from date of disbursement.",
        moratorium_months=6,
        moratorium_note="6 months moratorium from disbursement (12 months for plantation/construction activities).",
        eligible_purposes=[
            "entrepreneurship", "business", "agriculture", "industry", "services",
            "transport", "plantation", "construction", "trade", "startup"
        ],
        benefit_type="loan",
        benefit_summary="Medium enterprise project loan up to ₹45,00,000 (up to 90% project financing) at 8.0% p.a. for up to 7 years",
        support_type_display="Term Loan Assistance (Project Finance)",
        has_financial_calculation=True,
        source_name="NSFDC Official Website",
        source_url="https://nsfdc.nic.in/en/term-loan",
        last_verified_at="2026-09-05",
        needs_manual_verification=False,
        verification_note="",
    ),

    # 3. Educational Loan Scheme (ELS)
    SchemeRule(
        scheme_id="a3333333-3333-3333-3333-333333333333",
        category_id="c3000000-0000-0000-0000-000000000003",
        name="Educational Loan Scheme (ELS)",
        scheme_type="education_loan",
        short_description="Education loan up to ₹30,00,000 (India) / ₹40,00,000 (Abroad) or 90% of course fee. Interest 6% to 6.5% p.a. with 0.5% rebate for women.",
        full_description=(
            "Educational loan for eligible SC students pursuing recognized full-time professional/technical "
            "courses in India or abroad. Maximum loan limit up to ₹30,00,000 for studies in India and "
            "₹40,00,000 for studies abroad, or 90% of course fee, whichever is lower. "
            "Beneficiary interest rate: 6% p.a. in India / 7% p.a. abroad (live portal lists unified 6.5% p.a.), "
            "with a 0.5% interest rebate for women beneficiaries. NSFDC charges SCA 2% to 2.5% p.a. "
            "Repayment up to 12 years (where repayment not started) / 10 years (where ongoing). "
            "Moratorium: course period plus 1 year."
        ),
        issuing_body="National Scheduled Castes Finance and Development Corporation (NSFDC)",
        project_cost_min=0,
        project_cost_max=4000000,
        project_cost_min_exclusive=False,
        max_loan_amount=4000000,
        financing_pct=90.0,
        max_annual_family_income=300000,
        rate_beneficiary_min=6.0,
        rate_beneficiary_max=6.5,
        rate_to_sca=2.5,
        rate_note="6.0% p.a. (India) / 7.0% p.a. (Abroad) or 6.5% on live portal; 0.5% rebate for women beneficiaries.",
        repayment_years_max=12,
        repayment_note="Up to 12 years where repayment has not started (up to 10 years where repayment has already started).",
        moratorium_months=12,
        moratorium_note="Course period plus 1 year (where repayment not started); up to 6 months where repayment started.",
        eligible_purposes=["education", "studies", "higher_education"],
        requires_education_purpose=True,
        benefit_type="loan",
        benefit_summary="Education course financing up to ₹30 Lakh (India) / ₹40 Lakh (Abroad) at 6.0%–7.0% p.a.",
        support_type_display="Educational Loan Assistance (Higher Education)",
        has_financial_calculation=True,
        source_name="NSFDC Official Website / NSFDC ELS Policy Document",
        source_url="https://nsfdc.nic.in/scheme",
        last_verified_at="2026-09-05",
        needs_manual_verification=True,
        verification_note=(
            "Repayment tenure confirmed from primary live source nsfdc.nic.in/scheme as 10–12 years with course+1yr moratorium. "
            "Domestic (India ₹30L @ 6%) vs. Abroad (₹40L @ 7%) with 0.5% female rebate is specified in official policy document, "
            "whereas live portal displays unified ₹40L @ 6.5%. Flagged needs_manual_verification=true for secondary cross-confirmation."
        ),
    ),


    # 4. Aajeevika Micro-Finance Yojana
    SchemeRule(
        scheme_id="a4444444-4444-4444-4444-444444444444",
        category_id="c4000000-0000-0000-0000-000000000004",
        name="Aajeevika Micro-Finance Yojana",
        scheme_type="micro_finance_mfi",
        short_description="Micro-finance through NBFC-MFIs for projects up to ₹1,40,000. Loan up to ₹1,25,000 (90%) at 15% p.a.",
        full_description=(
            "NSFDC provides prompt need-based micro finance to eligible SC beneficiaries through selected "
            "NBFC-MFIs for micro-enterprise activities. Loan up to 90% (max ₹1,25,000) for projects up to ₹1,40,000. "
            "NSFDC charges NBFC-MFIs 5% p.a.; NBFC-MFIs charge beneficiaries 15% p.a. "
            "Repayment in quarterly instalments up to 3 years with 3 months moratorium."
        ),
        issuing_body="National Scheduled Castes Finance and Development Corporation (NSFDC)",
        project_cost_min=0,
        project_cost_max=140000,
        project_cost_min_exclusive=False,
        max_loan_amount=125000,
        financing_pct=90.0,
        max_annual_family_income=300000,
        rate_beneficiary_min=15.0,
        rate_beneficiary_max=15.0,
        rate_to_sca=5.0,
        rate_note="NSFDC charges NBFC-MFIs 5% p.a.; NBFC-MFIs charge beneficiaries 15% p.a.",
        repayment_years_max=3,
        repayment_note="Quarterly instalments up to 3 years from each disbursement.",
        moratorium_months=3,
        moratorium_note="3 months moratorium from date of disbursement.",
        eligible_purposes=[
            "entrepreneurship", "business", "micro_business", "services", "trade"
        ],
        source_name="NSFDC Official Website",
        source_url="https://nsfdc.nic.in/scheme",
        last_verified_at="2026-09-05",
        needs_manual_verification=False,
        verification_note="",
    ),

    # 5. Udyam Nidhi Yojana (UNY)
    SchemeRule(
        scheme_id="a5555555-5555-5555-5555-555555555555",
        category_id="c4000000-0000-0000-0000-000000000004",
        name="Udyam Nidhi Yojana (UNY)",
        scheme_type="micro_finance_mfi",
        short_description="Micro-enterprise loans up to ₹5,00,000 through Cooperative Banks (13% p.a.) and SFBs (15% p.a.).",
        full_description=(
            "NSFDC provides loans under Udyam Nidhi Yojana for projects up to ₹5,00,000 through "
            "Cooperative Societies, Cooperative Banks, and Small Finance Banks (SFBs). Loan up to 90% (max ₹4,50,000). "
            "Interest to beneficiary: 13% p.a. (Cooperative Banks) / 15% p.a. (SFBs). NSFDC charges channel partners 5% p.a. "
            "Repayment in quarterly/half-yearly instalments up to 5 years with 3 months moratorium."
        ),
        issuing_body="National Scheduled Castes Finance and Development Corporation (NSFDC)",
        project_cost_min=0,
        project_cost_max=500000,
        project_cost_min_exclusive=False,
        max_loan_amount=450000,
        financing_pct=90.0,
        max_annual_family_income=300000,
        rate_beneficiary_min=13.0,
        rate_beneficiary_max=15.0,
        rate_to_sca=5.0,
        rate_note="Cooperative Banks/Societies charge 13% p.a.; Small Finance Banks charge 15% p.a. NSFDC charges 5% p.a.",
        repayment_years_max=5,
        repayment_note="Quarterly or half-yearly instalments within 5 years.",
        moratorium_months=3,
        moratorium_note="3 months moratorium from date of disbursement.",
        eligible_purposes=[
            "entrepreneurship", "business", "micro_business", "services", "trade", "agriculture"
        ],
        source_name="NSFDC Official Website",
        source_url="https://nsfdc.nic.in/scheme",
        last_verified_at="2026-09-05",
        needs_manual_verification=False,
        verification_note="",
    ),
]

# Quick index by scheme ID
RULE_BY_ID: Dict[str, SchemeRule] = {r.scheme_id: r for r in SCHEME_RULES}


# ---------------------------------------------------------------------------
# DATA-DEFINED ELIGIBILITY RULES (EACH SCHEME DEFINES ITS OWN RULES)
# ---------------------------------------------------------------------------

SEED_ELIGIBILITY_RULES: Dict[str, List[SchemeEligibilityRule]] = {
    # 1. Micro Credit Finance
    "a1111111-1111-1111-1111-111111111111": [
        SchemeEligibilityRule(
            rule_id="r1-caste",
            scheme_id="a1111111-1111-1111-1111-111111111111",
            field_name="caste_category",
            operator="in",
            value_list=["SC"],
            description="Applicant must belong to Scheduled Caste (SC) category.",
            is_hard_rule=True,
            rule_type="caste",
            source_note="NSFDC - all schemes exclusively for SC beneficiaries",
        ),
        SchemeEligibilityRule(
            rule_id="r1-income",
            scheme_id="a1111111-1111-1111-1111-111111111111",
            field_name="annual_family_income",
            operator="lte",
            value_num=300000.0,
            description="Annual family income must not exceed ₹3,00,000.",
            is_hard_rule=True,
            rule_type="income_ceiling",
            source_note="Standard NSFDC income ceiling: https://nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r1-cost",
            scheme_id="a1111111-1111-1111-1111-111111111111",
            field_name="project_cost",
            operator="lte",
            value_num=140000.0,
            description="Unit project cost must not exceed ₹1,40,000 for Micro Credit Finance.",
            is_hard_rule=True,
            rule_type="project_cost",
            source_note="nsfdc.nic.in/en/micro-credit-finance",
        ),
        SchemeEligibilityRule(
            rule_id="r1-purpose",
            scheme_id="a1111111-1111-1111-1111-111111111111",
            field_name="purpose",
            operator="in",
            value_list=[
                "entrepreneurship", "business", "micro_business", "micro_credit",
                "agriculture", "farming", "services", "trade", "handicraft"
            ],
            description="Activity must be a qualifying micro-enterprise or income-generating activity.",
            is_hard_rule=True,
            rule_type="purpose",
            source_note="nsfdc.nic.in/en/micro-credit-finance",
        ),
    ],

    # 2. Term Loan
    "a2222222-2222-2222-2222-222222222222": [
        SchemeEligibilityRule(
            rule_id="r2-caste",
            scheme_id="a2222222-2222-2222-2222-222222222222",
            field_name="caste_category",
            operator="in",
            value_list=["SC"],
            description="Applicant must belong to Scheduled Caste (SC) category.",
            is_hard_rule=True,
            rule_type="caste",
            source_note="NSFDC",
        ),
        SchemeEligibilityRule(
            rule_id="r2-income",
            scheme_id="a2222222-2222-2222-2222-222222222222",
            field_name="annual_family_income",
            operator="lte",
            value_num=300000.0,
            description="Annual family income must not exceed ₹3,00,000.",
            is_hard_rule=True,
            rule_type="income_ceiling",
            source_note="Standard NSFDC income ceiling: https://nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r2-cost-min",
            scheme_id="a2222222-2222-2222-2222-222222222222",
            field_name="project_cost",
            operator="gt",
            value_num=140000.0,
            description="Project cost must be greater than ₹1,40,000 (units up to ₹1,40,000 fall under Micro Credit Finance).",
            is_hard_rule=True,
            rule_type="project_cost_min",
            source_note="nsfdc.nic.in/en/term-loan",
        ),
        SchemeEligibilityRule(
            rule_id="r2-cost-max",
            scheme_id="a2222222-2222-2222-2222-222222222222",
            field_name="project_cost",
            operator="lte",
            value_num=5000000.0,
            description="Project cost must not exceed ₹50,00,000.",
            is_hard_rule=True,
            rule_type="project_cost_max",
            source_note="nsfdc.nic.in/en/term-loan",
        ),
        SchemeEligibilityRule(
            rule_id="r2-purpose",
            scheme_id="a2222222-2222-2222-2222-222222222222",
            field_name="purpose",
            operator="in",
            value_list=[
                "entrepreneurship", "business", "agriculture", "industry", "services",
                "transport", "plantation", "construction", "trade", "startup"
            ],
            description="Purpose must be a qualifying business, service, transport, or agriculture enterprise.",
            is_hard_rule=True,
            rule_type="purpose",
            source_note="nsfdc.nic.in/en/term-loan",
        ),
    ],

    # 3. Educational Loan Scheme (ELS)
    "a3333333-3333-3333-3333-333333333333": [
        SchemeEligibilityRule(
            rule_id="r3-caste",
            scheme_id="a3333333-3333-3333-3333-333333333333",
            field_name="caste_category",
            operator="in",
            value_list=["SC"],
            description="Applicant must belong to Scheduled Caste (SC) category.",
            is_hard_rule=True,
            rule_type="caste",
            source_note="NSFDC",
        ),
        SchemeEligibilityRule(
            rule_id="r3-income",
            scheme_id="a3333333-3333-3333-3333-333333333333",
            field_name="annual_family_income",
            operator="lte",
            value_num=300000.0,
            description="Annual family income must not exceed ₹3,00,000.",
            is_hard_rule=True,
            rule_type="income_ceiling",
            source_note="Standard NSFDC income ceiling: https://nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r3-purpose",
            scheme_id="a3333333-3333-3333-3333-333333333333",
            field_name="purpose",
            operator="in",
            value_list=["education", "studies", "higher_education"],
            description="Purpose must be recognized full-time professional/technical education courses.",
            is_hard_rule=True,
            rule_type="purpose",
            source_note="nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r3-cost",
            scheme_id="a3333333-3333-3333-3333-333333333333",
            field_name="project_cost",
            operator="lte",
            value_num=4000000.0,
            description="Course fee / loan requirement must not exceed ₹40,00,000 (up to ₹30,00,000 for studies in India, ₹40,00,000 for studies abroad).",
            is_hard_rule=True,
            rule_type="loan_limit",
            source_note="nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r3-location",
            scheme_id="a3333333-3333-3333-3333-333333333333",
            field_name="study_location",
            operator="in",
            value_list=["india", "abroad"],
            description="Recognized full-time course in India or Abroad.",
            is_hard_rule=False,
            rule_type="study_location",
            source_note="Rate is 6.0% in India vs. 7.0% Abroad per ELS policy document",
        ),
        SchemeEligibilityRule(
            rule_id="r3-education",
            scheme_id="a3333333-3333-3333-3333-333333333333",
            field_name="education_status",
            operator="not_in",
            value_list=["below_10th"],
            description="Candidate must have passed at least 10th/12th standard for technical/professional admission.",
            is_hard_rule=False,
            rule_type="education_status",
            source_note="nsfdc.nic.in/scheme",
        ),
    ],

    # 4. Aajeevika Micro-Finance Yojana
    "a4444444-4444-4444-4444-444444444444": [
        SchemeEligibilityRule(
            rule_id="r4-caste",
            scheme_id="a4444444-4444-4444-4444-444444444444",
            field_name="caste_category",
            operator="in",
            value_list=["SC"],
            description="Applicant must belong to Scheduled Caste (SC) category.",
            is_hard_rule=True,
            rule_type="caste",
            source_note="NSFDC",
        ),
        SchemeEligibilityRule(
            rule_id="r4-income",
            scheme_id="a4444444-4444-4444-4444-444444444444",
            field_name="annual_family_income",
            operator="lte",
            value_num=300000.0,
            description="Annual family income must not exceed ₹3,00,000.",
            is_hard_rule=True,
            rule_type="income_ceiling",
            source_note="Standard NSFDC income ceiling",
        ),
        SchemeEligibilityRule(
            rule_id="r4-cost",
            scheme_id="a4444444-4444-4444-4444-444444444444",
            field_name="project_cost",
            operator="lte",
            value_num=140000.0,
            description="Project cost must not exceed ₹1,40,000.",
            is_hard_rule=True,
            rule_type="project_cost",
            source_note="nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r4-purpose",
            scheme_id="a4444444-4444-4444-4444-444444444444",
            field_name="purpose",
            operator="in",
            value_list=["business", "micro_business", "services", "trade"],
            description="Purpose must be qualifying micro-enterprise or trade activity.",
            is_hard_rule=True,
            rule_type="purpose",
            source_note="nsfdc.nic.in/scheme",
        ),
    ],

    # 5. Udyam Nidhi Yojana (UNY)
    "a5555555-5555-5555-5555-555555555555": [
        SchemeEligibilityRule(
            rule_id="r5-caste",
            scheme_id="a5555555-5555-5555-5555-555555555555",
            field_name="caste_category",
            operator="in",
            value_list=["SC"],
            description="Applicant must belong to Scheduled Caste (SC) category.",
            is_hard_rule=True,
            rule_type="caste",
            source_note="NSFDC",
        ),
        SchemeEligibilityRule(
            rule_id="r5-income",
            scheme_id="a5555555-5555-5555-5555-555555555555",
            field_name="annual_family_income",
            operator="lte",
            value_num=300000.0,
            description="Annual family income must not exceed ₹3,00,000.",
            is_hard_rule=True,
            rule_type="income_ceiling",
            source_note="Standard NSFDC income ceiling",
        ),
        SchemeEligibilityRule(
            rule_id="r5-cost",
            scheme_id="a5555555-5555-5555-5555-555555555555",
            field_name="project_cost",
            operator="lte",
            value_num=500000.0,
            description="Project cost must not exceed ₹5,00,000.",
            is_hard_rule=True,
            rule_type="project_cost",
            source_note="nsfdc.nic.in/scheme",
        ),
        SchemeEligibilityRule(
            rule_id="r5-purpose",
            scheme_id="a5555555-5555-5555-5555-555555555555",
            field_name="purpose",
            operator="in",
            value_list=["business", "micro_business", "services", "trade", "agriculture"],
            description="Purpose must be qualifying micro-enterprise or cooperative trade activity.",
            is_hard_rule=True,
            rule_type="purpose",
            source_note="nsfdc.nic.in/scheme",
        ),
    ],
}


def get_rules_for_scheme(scheme_id: str) -> List[SchemeEligibilityRule]:
    """
    Fetches the data-defined eligibility rules for a specific scheme.
    First attempts to query Supabase `eligibility_rules` table.
    Falls back to verified local SEED_ELIGIBILITY_RULES if database is offline or empty.
    """
    try:
        from app.database import get_supabase_client
        supabase = get_supabase_client()
        resp = supabase.table("eligibility_rules").select("*").eq("scheme_id", scheme_id).execute()
        if resp and resp.data and len(resp.data) > 0:
            db_rules = []
            for row in resp.data:
                db_rules.append(
                    SchemeEligibilityRule(
                        rule_id=str(row.get("id")),
                        scheme_id=str(row.get("scheme_id")),
                        field_name=str(row.get("field_name")),
                        operator=str(row.get("operator")),
                        value_num=float(row["value_num"]) if row.get("value_num") is not None else None,
                        value_list=row.get("value_list"),
                        value_text=row.get("value_text"),
                        description=str(row.get("description", "")),
                        is_hard_rule=bool(row.get("is_hard_rule", True)),
                        rule_type=str(row.get("rule_type", "general")),
                        source_note=str(row.get("source_note", "")),
                        needs_manual_verification=bool(row.get("needs_manual_verification", False)),
                        verification_note=str(row.get("verification_note", "")),
                    )
                )
            return db_rules
    except Exception as exc:
        logger.debug(f"Could not load rules from Supabase for scheme '{scheme_id}' ({exc}); using verified local rules.")

    return SEED_ELIGIBILITY_RULES.get(scheme_id, [])


# ---------------------------------------------------------------------------
# Result Dataclass
# ---------------------------------------------------------------------------

@dataclass
class EligibilityResult:
    scheme_id: str
    scheme_name: str
    scheme_type: str
    verdict: str                          # "Potentially Eligible" | "Partially Eligible" | "Does Not Match Current Criteria"
    status: str = "eligible"              # "eligible" | "partially_eligible" | "ineligible"
    eligible: bool = False
    partially_eligible: bool = False
    matched: bool = False
    match_score: int = 0                  # 0–100 score
    matching_factors: List[str] = field(default_factory=list)
    reasons: List[str] = field(default_factory=list)
    failed_factors: List[str] = field(default_factory=list)
    disqualifiers: List[str] = field(default_factory=list)
    missing_information: List[str] = field(default_factory=list)
    explanation: str = ""
    recommended_loan_amount: Optional[float] = None
    interest_rate_display: str = ""
    repayment_years: int = 0
    moratorium_note: str = ""
    benefit_type: str = "loan"
    benefit_summary: str = ""
    has_financial_calculation: bool = True
    support_type_display: Optional[str] = None
    benefit_amount_display: Optional[str] = None
    application_channel_type: str = "channel_partner"
    application_channel_details: Optional[Dict[str, Any]] = None
    source_url: str = ""
    source_name: str = ""

    last_verified_at: str = ""
    needs_manual_verification: bool = False
    verification_note: str = ""


# ---------------------------------------------------------------------------
# Purpose Normalization
# ---------------------------------------------------------------------------

PURPOSE_MAP = {
    "entrepreneurship": "business",
    "startup": "business",
    "business": "business",
    "micro_business": "micro_business",
    "micro_credit": "micro_business",
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

def normalize_purpose(raw_purpose: str) -> str:
    cleaned = raw_purpose.strip().lower().replace(" ", "_").replace("-", "_")
    return PURPOSE_MAP.get(cleaned, cleaned)


# ---------------------------------------------------------------------------
# Deterministic Rule Evaluation Core (Data-Driven Per Scheme)
# ---------------------------------------------------------------------------

def _evaluate_single_rule(rule: SchemeEligibilityRule, profile: Dict[str, Any]) -> Tuple[bool, bool, str]:
    """
    Evaluates a single data-defined rule against user profile.
    Returns:
      (is_evaluated, is_passed, message)
      - is_evaluated: False if the profile field was missing (not provided or None)
      - is_passed: True if field was provided and condition was satisfied
      - message: reason / description
    """
    field_name = rule.field_name
    val = profile.get(field_name)

    # Smart fallback for common aliases
    if val is None:
        if field_name == "caste_category":
            if profile.get("sc_caste_declared") is False:
                val = "OTHER"
            elif profile.get("sc_caste_declared") is True:
                val = "SC"
            elif profile.get("category"):
                val = profile.get("category")
        elif field_name == "annual_family_income":
            val = profile.get("income")
        elif field_name == "project_cost":
            if profile.get("loan_amount") is not None:
                try:
                    val = round(float(profile["loan_amount"]) / 0.9, 2)
                except (ValueError, TypeError):
                    val = None

    # Check for missing field
    if val is None or val == "" or val == "not_specified":
        return False, False, f"Required field '{field_name}' not provided"

    op = rule.operator.lower().strip()

    try:
        if op == "lte":
            passes = float(val) <= float(rule.value_num)
        elif op == "lt":
            passes = float(val) < float(rule.value_num)
        elif op == "gte":
            passes = float(val) >= float(rule.value_num)
        elif op == "gt":
            passes = float(val) > float(rule.value_num)
        elif op == "eq":
            if rule.value_num is not None:
                passes = float(val) == float(rule.value_num)
            elif rule.value_list:
                passes = str(val).lower().strip() in [x.lower().strip() for x in rule.value_list]
            elif rule.value_text:
                passes = str(val).lower().strip() == str(rule.value_text).lower().strip()
            else:
                passes = False
        elif op == "ne":
            if rule.value_num is not None:
                passes = float(val) != float(rule.value_num)
            elif rule.value_list:
                passes = str(val).lower().strip() not in [x.lower().strip() for x in rule.value_list]
            else:
                passes = str(val).lower().strip() != str(rule.value_text).lower().strip()
        elif op == "in":
            allowed = [x.lower().strip() for x in (rule.value_list or [])]
            if isinstance(val, list):
                passes = any(str(item).lower().strip() in allowed for item in val)
            else:
                val_str = str(val).lower().strip()
                # Also handle purpose alias normalization if evaluating purpose
                if field_name == "purpose":
                    val_str = normalize_purpose(val_str)
                passes = val_str in allowed or (field_name == "purpose" and "entrepreneurship" in allowed and val_str in ("business", "micro_business"))
        elif op == "not_in":
            disallowed = [x.lower().strip() for x in (rule.value_list or [])]
            passes = str(val).lower().strip() not in disallowed
        elif op == "between":
            num_val = float(val)
            min_ok = rule.value_min is None or num_val >= float(rule.value_min)
            max_ok = rule.value_max is None or num_val <= float(rule.value_max)
            passes = min_ok and max_ok
        else:
            logger.warning(f"Unknown rule operator '{op}', evaluating as false.")
            passes = False
    except (ValueError, TypeError) as exc:
        logger.warning(f"Rule evaluation error for field '{field_name}' with value '{val}': {exc}")
        passes = False

    return True, passes, rule.description


def evaluate_scheme(
    rule: SchemeRule,
    purpose: str,
    annual_family_income: Optional[float] = None,
    project_cost: Optional[float] = None,
    loan_amount: Optional[float] = None,
    sc_caste_declared: Optional[bool] = True,
    education_status: Optional[str] = "not_applicable",
    study_location: Optional[str] = None,
    gender: Optional[str] = None,
    scheme_rules: Optional[List[SchemeEligibilityRule]] = None,
    **kwargs: Any,
) -> EligibilityResult:
    """
    Deterministically evaluates applicant profile against the scheme's OWN data-defined rules.
    Produces one of three official verdicts:
      - "Potentially Eligible" (All rules passed)
      - "Partially Eligible"   (No hard rules failed, but missing required data or soft/borderline criteria)
      - "Does Not Match Current Criteria" (One or more hard rules failed)
    """
    matching_factors: List[str] = []
    failed_factors: List[str] = []
    missing_info: List[str] = []
    soft_failed_factors: List[str] = []
    missing_hard_fields: List[str] = []

    # 1. Infer project_cost / loan_amount if one is provided
    if project_cost is None and loan_amount is not None:
        project_cost = round(loan_amount / 0.9, 2)
    elif loan_amount is None and project_cost is not None:
        loan_amount = round(project_cost * 0.9, 2)

    norm_purpose = normalize_purpose(purpose) if purpose else ""

    # Build canonical user profile dictionary
    profile: Dict[str, Any] = {
        "purpose": norm_purpose,
        "raw_purpose": purpose,
        "annual_family_income": annual_family_income,
        "income": annual_family_income,
        "project_cost": project_cost,
        "loan_amount": loan_amount,
        "sc_caste_declared": sc_caste_declared,
        "caste_category": "SC" if sc_caste_declared is True else ("OTHER" if sc_caste_declared is False else kwargs.get("caste_category")),
        "education_status": education_status if education_status not in (None, "not_applicable", "") else None,
        "study_location": study_location if study_location not in (None, "not_specified", "") else None,
        "gender": gender,
    }
    profile.update(kwargs)

    # 2. Retrieve scheme's data-defined eligibility rules
    defined_rules = scheme_rules or get_rules_for_scheme(rule.scheme_id)

    # 3. Evaluate each rule defined for this scheme
    for r in defined_rules:
        is_eval, passed, desc = _evaluate_single_rule(r, profile)

        if not is_eval:
            # Field value was missing from profile
            if r.is_hard_rule:
                missing_info.append(f"{r.description} (field '{r.field_name}' not provided)")
                missing_hard_fields.append(r.field_name)
            else:
                missing_info.append(f"{r.description} (field '{r.field_name}' optional)")
        elif passed:
            # Field satisfies criteria
            if r.field_name == "purpose":
                matching_factors.append(f"Purpose Match: Your need for '{norm_purpose or purpose}' matches {rule.name}'s eligible activity scope.")
            elif r.field_name == "project_cost" and r.value_num and r.operator == "lte":
                matching_factors.append(f"Financial Requirement: Project cost fits within the allowable limit of ₹{r.value_num:,.0f} for {rule.name}.")
            elif r.field_name == "project_cost" and r.value_num and r.operator == "gt":
                matching_factors.append(f"Financial Requirement: Project scale exceeds the micro-finance threshold (> ₹{r.value_num:,.0f}), qualifying for Term Loan support.")
            elif r.field_name == "annual_family_income" and r.value_num and r.operator == "lte":
                inc_val = f"₹{annual_family_income:,.0f}" if annual_family_income is not None else "your income"
                matching_factors.append(f"Income Criteria: Household income ({inc_val}) falls within the statutory ceiling of ₹{r.value_num:,.0f}.")
            elif r.field_name == "caste_category":
                matching_factors.append("Applicant Category: Scheduled Caste (SC) category is the designated beneficiary group.")
            else:
                matching_factors.append(r.description or f"Satisfies requirement for {r.field_name}.")
        else:
            # Field violated criteria
            val_input = profile.get(r.field_name)
            if r.field_name == "project_cost" and r.value_num and r.operator in ("lte", "lt"):
                val_str = f"₹{val_input:,.0f}" if isinstance(val_input, (int, float)) else str(val_input)
                fail_msg = f"Project cost exceeds the maximum allowable limit of ₹{r.value_num:,.0f} for {rule.name} (input: {val_str})."
            elif r.field_name == "annual_family_income" and r.value_num and r.operator in ("lte", "lt"):
                val_str = f"₹{val_input:,.0f}" if isinstance(val_input, (int, float)) else str(val_input)
                fail_msg = f"Annual family income exceeds the allowable ceiling of ₹{r.value_num:,.0f} (input: {val_str})."
            else:
                fail_msg = f"{r.description} (current input: {val_input})"

            if r.is_hard_rule:
                failed_factors.append(fail_msg)
            else:
                soft_failed_factors.append(fail_msg)

    # Add location coverage factor if applicable
    user_state = profile.get("state") or profile.get("stateName")
    loc_disp = user_state if user_state else "all States and Union Territories"
    matching_factors.append(f"Location Coverage: Scheme is operational across {loc_disp} through State Channelizing Agencies (SCAs).")

    # 4. Interest Rate & Benefit Calculations
    effective_rate_min = rule.rate_beneficiary_min
    effective_rate_max = rule.rate_beneficiary_max
    rebate_note = ""

    if rule.scheme_type == "education_loan":
        is_female = gender and gender.lower().strip() in ("female", "woman", "girl")
        if is_female:
            effective_rate_min = max(0.0, effective_rate_min - 0.5)
            effective_rate_max = max(0.0, effective_rate_max - 0.5)
            rebate_note = " (includes 0.5% interest rebate for women beneficiaries)"
            matching_factors.append("Priority Concession: Eligible for 0.5% interest rebate for women beneficiaries.")
        elif gender is None:
            missing_info.append("Gender not specified (women beneficiaries receive a 0.5% interest concession).")

        cost_val = project_cost or 1000000.0
        if study_location == "abroad":
            rate_display = f"7.0% p.a. (Abroad){rebate_note}"
            max_loan = min(cost_val * (rule.financing_pct / 100.0), 4000000.0)
        elif study_location == "india":
            rate_display = f"6.0% p.a. (India){rebate_note}"
            max_loan = min(cost_val * (rule.financing_pct / 100.0), 3000000.0)
        else:
            rate_display = f"{effective_rate_min}%–{effective_rate_max}% p.a.{rebate_note}"
            max_loan = min(cost_val * (rule.financing_pct / 100.0), rule.max_loan_amount)
    else:
        if effective_rate_min == effective_rate_max:
            rate_display = f"{effective_rate_min}% p.a."
        else:
            rate_display = f"{effective_rate_min}%–{effective_rate_max}% p.a."
        cost_val = project_cost or 100000.0
        max_loan = min(cost_val * (rule.financing_pct / 100.0), rule.max_loan_amount)

    # Remove duplicates while preserving order
    seen_factors = set()
    unique_matching_factors = []
    for f in matching_factors:
        if f not in seen_factors:
            seen_factors.add(f)
            unique_matching_factors.append(f)
    matching_factors = unique_matching_factors

    # 5. Deterministic Verdict Assignment & Transparent Match Score Calculation
    if failed_factors:
        # One or more mandatory hard rules failed -> Not Eligible
        verdict = "Does Not Match Current Criteria"
        status_label = "ineligible"
        is_eligible = False
        is_partially_eligible = False
        is_matched = False
        recommended_loan = None

        total_rules = max(1, len(defined_rules))
        passed_count = max(0, total_rules - len(failed_factors))
        score = int((passed_count / total_rules) * 45)

        disqualifiers_text = "; ".join(failed_factors)
        explanation = (
            f"You do not currently meet all criteria for {rule.name}. "
            f"Reason(s): {disqualifiers_text}."
        )

    elif missing_hard_fields or soft_failed_factors:
        # No hard rules violated, but missing required information or soft criteria borderline -> Partially Eligible
        verdict = "Partially Eligible"
        status_label = "partially_eligible"
        is_eligible = False
        is_partially_eligible = True
        is_matched = True
        recommended_loan = round(max_loan, 2) if project_cost is not None else None

        # Transparent score for partial eligibility
        score = 65
        if norm_purpose and norm_purpose in rule.eligible_purposes:
            score += 5
        score = min(75, score)

        explanation = (
            f"You are Partially Eligible for {rule.name}. "
            f"You meet {len(matching_factors)} criteria, but additional information or verification is required: "
            f"{'; '.join(missing_info + soft_failed_factors)}."
        )

    else:
        # All data-defined rules evaluated and passed -> Potentially Eligible
        verdict = "Potentially Eligible"
        status_label = "eligible"
        is_eligible = True
        is_partially_eligible = False
        is_matched = True
        recommended_loan = round(max_loan, 2)

        # Multi-factor transparent Match Score calculation (out of 100):
        # 1. Eligibility Strength (Base 35 pts)
        score_eligibility = 35

        # 2. Purpose & Sector Match (Up to 25 pts)
        score_purpose = 0
        if norm_purpose:
            if rule.scheme_type == "education_loan" and norm_purpose in ("education", "studies", "higher_education"):
                score_purpose = 25
            elif rule.scheme_type == "micro_finance" and norm_purpose in ("micro_business", "micro_credit", "trade", "handicraft", "services"):
                score_purpose = 25
            elif rule.scheme_type == "term_loan" and norm_purpose in ("business", "entrepreneurship", "industry", "transport", "agriculture", "construction", "plantation"):
                score_purpose = 25
            elif norm_purpose in rule.eligible_purposes:
                score_purpose = 20

        # 3. Financial Requirement & Natural Scale Match (Up to 20 pts)
        score_financial = 0
        if project_cost is not None:
            if rule.scheme_type == "micro_finance":
                if project_cost <= 140000:
                    score_financial = 20
                else:
                    score_financial = 5
            elif rule.scheme_type == "term_loan":
                if 140000 < project_cost <= 5000000:
                    score_financial = 20
                elif project_cost <= 140000:
                    score_financial = 10
            elif rule.scheme_type == "education_loan":
                if project_cost <= 4000000:
                    score_financial = 20
            else:
                score_financial = 18
        else:
            score_financial = 15

        # 4. Applicant Profile & Community Match (Up to 10 pts)
        score_category = 10 if (sc_caste_declared or profile.get("caste_category") == "SC") else 0

        # 5. Location Applicability (Up to 5 pts)
        score_location = 5

        # 6. Scheme-Specific Priority Conditions (Up to 5 pts)
        score_priority = 0
        if rule.scheme_type == "education_loan" and gender and gender.lower().strip() in ("female", "woman", "girl"):
            score_priority = 5
        elif profile.get("business_status") in ("new", "existing"):
            score_priority = 5
        elif profile.get("education_status") in ("graduate", "post_graduate", "12th_pass"):
            score_priority = 3

        total_score = score_eligibility + score_purpose + score_financial + score_category + score_location + score_priority
        score = max(70, min(100, total_score))


        cost_disp = f"₹{project_cost:,.0f}" if project_cost is not None else "your project"
        inc_disp = f"₹{annual_family_income:,.0f}" if annual_family_income is not None else "eligible income ceiling"

        if rule.benefit_type == "loan":
            explanation = (
                f"You meet all mandatory eligibility criteria for {rule.name}. "
                f"Based on your project cost of {cost_disp} and annual family income of {inc_disp}, "
                f"you are potentially eligible for up to ₹{recommended_loan:,.0f} ({rule.financing_pct:.0f}% financing) "
                f"at an interest rate of {rate_display} with a maximum repayment tenure of {rule.repayment_years_max} years "
                f"and a moratorium of {rule.moratorium_months} months."
            )
        else:
            explanation = (
                f"You meet all mandatory eligibility criteria for {rule.name}. "
                f"Based on your profile and annual family income of {inc_disp}, "
                f"you are potentially eligible for {rule.benefit_summary or rule.short_description}."
            )

    return EligibilityResult(
        scheme_id=rule.scheme_id,
        scheme_name=rule.name,
        scheme_type=rule.scheme_type,
        verdict=verdict,
        status=status_label,
        eligible=is_eligible,
        partially_eligible=is_partially_eligible,
        matched=is_matched,
        match_score=score,
        matching_factors=matching_factors,
        reasons=matching_factors,
        failed_factors=failed_factors,
        disqualifiers=failed_factors,
        missing_information=missing_info,
        explanation=explanation,
        recommended_loan_amount=recommended_loan,
        interest_rate_display=rate_display,
        repayment_years=rule.repayment_years_max,
        moratorium_note=rule.moratorium_note,
        benefit_type=rule.benefit_type,
        benefit_summary=rule.benefit_summary or rule.short_description,
        has_financial_calculation=rule.has_financial_calculation,
        support_type_display=rule.support_type_display or rate_display,
        benefit_amount_display=rule.benefit_amount_display or (f"Up to ₹{recommended_loan:,.0f}" if recommended_loan else None),
        application_channel_type=rule.application_channel_type,
        application_channel_details=rule.application_channel_details,
        source_name=rule.source_name,
        source_url=rule.source_url,

        last_verified_at=rule.last_verified_at,
        needs_manual_verification=rule.needs_manual_verification,
        verification_note=rule.verification_note,
    )


# ---------------------------------------------------------------------------
# Public Engine APIs
# ---------------------------------------------------------------------------

def check_all_schemes(
    purpose: str,
    annual_family_income: Optional[float] = None,
    project_cost: Optional[float] = None,
    loan_amount: Optional[float] = None,
    sc_caste_declared: Optional[bool] = True,
    education_status: Optional[str] = "not_applicable",
    study_location: Optional[str] = None,
    gender: Optional[str] = None,
    **kwargs: Any,
) -> List[EligibilityResult]:
    """
    Evaluates all known NSFDC schemes against applicant inputs.
    Sorted: Potentially Eligible first (highest score), then Partially Eligible, then Ineligible.
    """
    results = [
        evaluate_scheme(
            rule=rule,
            purpose=purpose,
            annual_family_income=annual_family_income,
            project_cost=project_cost,
            loan_amount=loan_amount,
            sc_caste_declared=sc_caste_declared,
            education_status=education_status,
            study_location=study_location,
            gender=gender,
            **kwargs,
        )
        for rule in SCHEME_RULES
        if rule.is_active
    ]

    # Sort priority:
    # 0 = Fully eligible (Potentially Eligible)
    # 1 = Partially eligible
    # 2 = Ineligible
    def sort_key(r: EligibilityResult):
        if r.eligible:
            rank = 0
        elif r.partially_eligible:
            rank = 1
        else:
            rank = 2
        return (rank, -r.match_score)

    results.sort(key=sort_key)
    return results


def check_single_scheme(
    scheme_id: str,
    purpose: str,
    annual_family_income: Optional[float] = None,
    project_cost: Optional[float] = None,
    loan_amount: Optional[float] = None,
    sc_caste_declared: Optional[bool] = True,
    education_status: Optional[str] = "not_applicable",
    study_location: Optional[str] = None,
    gender: Optional[str] = None,
    **kwargs: Any,
) -> EligibilityResult:
    rule = RULE_BY_ID.get(scheme_id)
    if not rule:
        raise ValueError(f"Unknown scheme_id '{scheme_id}'. Valid IDs: {list(RULE_BY_ID.keys())}")

    return evaluate_scheme(
        rule=rule,
        purpose=purpose,
        annual_family_income=annual_family_income,
        project_cost=project_cost,
        loan_amount=loan_amount,
        sc_caste_declared=sc_caste_declared,
        education_status=education_status,
        study_location=study_location,
        gender=gender,
        **kwargs,
    )


def get_best_match(
    purpose: str,
    annual_family_income: Optional[float] = None,
    project_cost: Optional[float] = None,
    loan_amount: Optional[float] = None,
    sc_caste_declared: Optional[bool] = True,
    education_status: Optional[str] = "not_applicable",
    study_location: Optional[str] = None,
    gender: Optional[str] = None,
    **kwargs: Any,
) -> Optional[EligibilityResult]:
    """
    Returns the highest-ranking fully eligible scheme.
    If no scheme is fully eligible, returns the highest-ranking partially eligible scheme.
    """
    all_results = check_all_schemes(
        purpose=purpose,
        annual_family_income=annual_family_income,
        project_cost=project_cost,
        loan_amount=loan_amount,
        sc_caste_declared=sc_caste_declared,
        education_status=education_status,
        study_location=study_location,
        gender=gender,
        **kwargs,
    )

    # 1. Prefer fully eligible schemes
    for r in all_results:
        if r.eligible:
            return r

    # 2. Fall back to partially eligible schemes
    for r in all_results:
        if r.partially_eligible:
            return r

    return None


def get_verified_schemes_data() -> List[Dict[str, Any]]:
    """Returns structured verified schemes dictionary for database seed / fallback list."""
    return [
        {
            "id": r.scheme_id,
            "category_id": r.category_id,
            "name": r.name,
            "scheme_type": r.scheme_type,
            "short_description": r.short_description,
            "full_description": r.full_description,
            "issuing_body": r.issuing_body,
            "project_cost_min": r.project_cost_min,
            "project_cost_max": r.project_cost_max,
            "max_loan_amount": r.max_loan_amount,
            "financing_pct": r.financing_pct,
            "rate_beneficiary_min": r.rate_beneficiary_min,
            "rate_beneficiary_max": r.rate_beneficiary_max,
            "rate_to_sca": r.rate_to_sca,
            "rate_note": r.rate_note,
            "repayment_years_max": r.repayment_years_max,
            "repayment_note": r.repayment_note,
            "moratorium_months": r.moratorium_months,
            "moratorium_note": r.moratorium_note,
            "max_income_eligibility": r.max_annual_family_income,
            "eligible_purposes": r.eligible_purposes,
            "benefit_type": r.benefit_type,
            "benefit_summary": r.benefit_summary or r.short_description,
            "has_financial_calculation": r.has_financial_calculation,
            "support_type_display": r.support_type_display or f"{r.rate_beneficiary_min}% p.a.",
            "benefit_amount_display": r.benefit_amount_display or f"Up to ₹{r.max_loan_amount:,.0f}",
            "application_channel_type": r.application_channel_type,
            "application_channel_details": r.application_channel_details,
            "source_name": r.source_name,
            "source_url": r.source_url,
            "last_verified_at": r.last_verified_at,
            "needs_manual_verification": r.needs_manual_verification,
            "verification_note": r.verification_note,
            "is_active": r.is_active,
        }
        for r in SCHEME_RULES
    ]



def get_all_seed_rules() -> List[Dict[str, Any]]:
    """Returns flat list of all data-defined rules for database seed / inspection."""
    all_rules = []
    for s_id, rules in SEED_ELIGIBILITY_RULES.items():
        for r in rules:
            all_rules.append({
                "id": r.rule_id,
                "scheme_id": r.scheme_id,
                "field_name": r.field_name,
                "operator": r.operator,
                "value_num": r.value_num,
                "value_list": r.value_list,
                "value_text": r.value_text,
                "description": r.description,
                "is_hard_rule": r.is_hard_rule,
                "rule_type": r.rule_type,
                "source_note": r.source_note,
                "needs_manual_verification": r.needs_manual_verification,
                "verification_note": r.verification_note,
            })
    return all_rules
