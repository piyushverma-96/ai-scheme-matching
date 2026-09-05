-- =============================================================================
-- Stage 6 Reconciliation Migration: Full Target Database Model
-- Reconciles existing verified fields without duplicating columns
-- =============================================================================

-- 1. Add reconciled general scheme fields if not already present
ALTER TABLE schemes
    ADD COLUMN IF NOT EXISTS ministry TEXT DEFAULT 'Ministry of Social Justice and Empowerment',
    ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Department of Social Justice and Empowerment',
    ADD COLUMN IF NOT EXISTS scheme_category TEXT DEFAULT 'Concessional Finance',
    ADD COLUMN IF NOT EXISTS target_beneficiary TEXT DEFAULT 'Scheduled Caste (SC) Beneficiaries',
    ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'Self-employment, business establishment, and higher education',
    ADD COLUMN IF NOT EXISTS sectors TEXT[] DEFAULT ARRAY['Trade', 'Services', 'Agriculture', 'Transport', 'Education'],
    ADD COLUMN IF NOT EXISTS applicable_states TEXT[] DEFAULT ARRAY['All States and UTs'],
    ADD COLUMN IF NOT EXISTS financial_benefit JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS application_mode TEXT DEFAULT 'channel_agency',
    ADD COLUMN IF NOT EXISTS required_documents TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS official_application_url TEXT DEFAULT 'https://nsfdc.nic.in/scheme',
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Note:
-- - benefit_type already exists in schemes (keeps exact name)
-- - benefit_summary already exists in schemes (keeps exact name, does NOT duplicate benefit_description)
-- - has_financial_calculation already exists in schemes (gating boolean)
-- - application_channel_type and application_channel_details already exist in schemes (keeps exact names)
-- - eligibility_rules are normalized in the eligibility_rules table with foreign key scheme_id

-- 2. Update verified NSFDC Schemes with full target shape data
UPDATE schemes
SET
    ministry = 'Ministry of Social Justice and Empowerment',
    department = 'Department of Social Justice and Empowerment',
    scheme_category = 'Microfinance / Tiny Self-Employment',
    target_beneficiary = 'SC micro-entrepreneurs & Self Help Groups (SHGs)',
    purpose = 'Tiny self-employment units, small trade, artisan work, and micro-enterprises',
    sectors = ARRAY['Micro Business', 'Services', 'Retail Trade', 'Artisans', 'Animal Husbandry'],
    applicable_states = ARRAY['All States and UTs'],
    benefit_type = 'loan',
    benefit_summary = 'Direct micro-finance credit assistance up to ₹1,25,000 for tiny self-employment units and SHGs at 6.5% subsidized interest rate.',
    has_financial_calculation = true,
    financial_benefit = jsonb_build_object(
        'benefit_type', 'loan',
        'max_amount', 125000,
        'financing_pct', 90,
        'rate_pct', 6.5,
        'subsidy_pct', 0,
        'has_moratorium', false,
        'description', '90% project cost financed up to ₹1.25 Lakh at 6.5% p.a.'
    ),
    application_mode = 'channel_agency',
    application_channel_type = 'channel_partner',
    application_channel_details = jsonb_build_object(
        'channel_category', 'State Channelizing Agency (SCA) / Microfinance Nodal Desk',
        'partner_types', jsonb_build_array('SCA', 'RRB', 'PSB', 'NBFC_MFI'),
        'instructions', 'Apply through designated district State Channelizing Agency or empanelled regional rural bank.'
    ),
    required_documents = ARRAY['caste_certificate', 'income_certificate', 'aadhaar_card', 'bank_passbook', 'photographs', 'quotation_machinery'],
    official_application_url = 'https://nsfdc.nic.in/scheme',
    source_name = 'NSFDC Official Scheme Directory',
    source_url = 'https://nsfdc.nic.in/scheme',
    last_verified_at = '2026-09-05',
    status = 'active'
WHERE id = 'a1111111-1111-1111-1111-111111111111' OR name ILIKE '%Micro Credit%';

UPDATE schemes
SET
    ministry = 'Ministry of Social Justice and Empowerment',
    department = 'Department of Social Justice and Empowerment',
    scheme_category = 'Term Loan / Enterprise Finance',
    target_beneficiary = 'SC entrepreneurs establishing viable business, service, or industrial units',
    purpose = 'Medium to long term viable enterprise projects requiring project cost up to ₹50 Lakh',
    sectors = ARRAY['Manufacturing', 'Services', 'Transport', 'Agriculture Allied', 'Trading'],
    applicable_states = ARRAY['All States and UTs'],
    benefit_type = 'loan',
    benefit_summary = 'Concessional term loan financing up to 90% of viable project cost (₹1.4L to ₹50L) with subsidized 8% interest and up to 12 months moratorium.',
    has_financial_calculation = true,
    financial_benefit = jsonb_build_object(
        'benefit_type', 'loan',
        'max_amount', 5000000,
        'financing_pct', 90,
        'rate_pct', 8.0,
        'moratorium_months', 6,
        'repayment_years', 7,
        'description', '90% project cost financed up to ₹50.00 Lakh at 8.0% p.a. with 6-month moratorium.'
    ),
    application_mode = 'channel_agency',
    application_channel_type = 'channel_partner',
    application_channel_details = jsonb_build_object(
        'channel_category', 'State Channelizing Agency (SCA) / Empanelled Public Sector Bank',
        'partner_types', jsonb_build_array('SCA', 'PSB', 'RRB'),
        'instructions', 'Submit detailed project report (DPR) to the district State Channelizing Agency or empanelled bank.'
    ),
    required_documents = ARRAY['caste_certificate', 'income_certificate', 'aadhaar_card', 'bank_passbook', 'photographs', 'project_report', 'quotation_machinery'],
    official_application_url = 'https://nsfdc.nic.in/scheme',
    source_name = 'NSFDC Official Scheme Directory',
    source_url = 'https://nsfdc.nic.in/scheme',
    last_verified_at = '2026-09-05',
    status = 'active'
WHERE id = 'a2222222-2222-2222-2222-222222222222' OR name ILIKE '%Term Loan%';

UPDATE schemes
SET
    ministry = 'Ministry of Social Justice and Empowerment',
    department = 'Department of Social Justice and Empowerment',
    scheme_category = 'Higher Technical & Professional Education Credit',
    target_beneficiary = 'SC students pursuing professional/technical degree/diploma courses in India or abroad',
    purpose = 'Higher technical and professional degree education expenses including tuition fees, books, and hostel charges',
    sectors = ARRAY['Higher Education', 'Technical Education', 'Professional Courses'],
    applicable_states = ARRAY['All States and UTs'],
    benefit_type = 'loan',
    benefit_summary = 'Concessional education credit up to ₹30L (India) / ₹40L (Abroad) covering 90% of course fee with 0.5% interest rebate for women beneficiaries.',
    has_financial_calculation = true,
    financial_benefit = jsonb_build_object(
        'benefit_type', 'loan',
        'max_amount_india', 3000000,
        'max_amount_abroad', 4000000,
        'financing_pct', 90,
        'rate_pct', 4.0,
        'women_rebate_pct', 0.5,
        'moratorium_months', 6,
        'repayment_years', 5,
        'description', '90% course fee financed up to ₹30L (India) / ₹40L (Abroad) at 4.0% p.a. (3.5% for women).'
    ),
    application_mode = 'channel_agency',
    application_channel_type = 'channel_partner',
    application_channel_details = jsonb_build_object(
        'channel_category', 'State Channelizing Agency (SCA) / Empanelled Public Sector Bank',
        'partner_types', jsonb_build_array('SCA', 'PSB'),
        'instructions', 'Submit admission letter and official fee schedule to the State Channelizing Agency or empanelled bank.'
    ),
    required_documents = ARRAY['caste_certificate', 'income_certificate', 'aadhaar_card', 'bank_passbook', 'photographs', 'admission_letter', 'fee_structure', 'academic_marksheets'],
    official_application_url = 'https://nsfdc.nic.in/scheme',
    source_name = 'NSFDC Official Scheme Directory',
    source_url = 'https://nsfdc.nic.in/scheme',
    last_verified_at = '2026-09-05',
    status = 'active'
WHERE id = 'a3333333-3333-3333-3333-333333333333' OR name ILIKE '%Educational Loan%';
