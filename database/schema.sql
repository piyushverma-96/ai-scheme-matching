-- =====================================================================
-- ArthSetu AI - Database Schema & Seed Data
-- Smart India Hackathon Problem Statement 26092
-- Ministry of Social Justice and Empowerment
-- =====================================================================

-- 1. Enable UUID Extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. CREATE TABLES
-- =====================================================================

-- Table 1: Schemes
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scheme_type TEXT NOT NULL CHECK (scheme_type IN ('micro_finance', 'term_loan', 'education_loan')),
    min_amount NUMERIC NOT NULL DEFAULT 0,
    max_amount NUMERIC NOT NULL,
    rate_min NUMERIC NOT NULL,
    rate_max NUMERIC NOT NULL,
    moratorium_months INT NOT NULL DEFAULT 0,
    moratorium_note TEXT,
    max_income_eligibility NUMERIC NOT NULL DEFAULT 500000,
    repayment_years INT NOT NULL,
    financing_pct NUMERIC NOT NULL DEFAULT 90,
    description TEXT NOT NULL,
    issuing_body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 2: Channel Partners
CREATE TABLE IF NOT EXISTS channel_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('SCA', 'PSB', 'RRB', 'NBFC-MFI')),
    city TEXT,
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    latitude NUMERIC,
    longitude NUMERIC,
    handles_scheme_types TEXT[] NOT NULL DEFAULT '{}',
    is_real_verified BOOLEAN NOT NULL DEFAULT false,
    npa_status_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 3: Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_type TEXT,
    project_cost NUMERIC,
    annual_income NUMERIC,
    city TEXT,
    matched_scheme_id UUID REFERENCES schemes(id) ON DELETE SET NULL,
    recommended_partner_id UUID REFERENCES channel_partners(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 4: Application Guidance
CREATE TABLE IF NOT EXISTS application_guidance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    required_documents TEXT[] NOT NULL DEFAULT '{}',
    application_steps TEXT[] NOT NULL DEFAULT '{}',
    where_to_apply TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_application_guidance_scheme UNIQUE (scheme_id)
);

-- =====================================================================
-- 3. INDEXES FOR FAST LOOKUPS
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_schemes_scheme_type ON schemes(scheme_type);
CREATE INDEX IF NOT EXISTS idx_channel_partners_city ON channel_partners(city);
CREATE INDEX IF NOT EXISTS idx_channel_partners_partner_type ON channel_partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_channel_partners_is_verified ON channel_partners(is_real_verified);
CREATE INDEX IF NOT EXISTS idx_applications_city ON applications(city);
CREATE INDEX IF NOT EXISTS idx_applications_matched_scheme_id ON applications(matched_scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_recommended_partner_id ON applications(recommended_partner_id);
CREATE INDEX IF NOT EXISTS idx_application_guidance_scheme_id ON application_guidance(scheme_id);

-- =====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow clean re-runs
DROP POLICY IF EXISTS "Allow public read access to schemes" ON schemes;
DROP POLICY IF EXISTS "Allow public read access to channel_partners" ON channel_partners;
DROP POLICY IF EXISTS "Allow public read access to application_guidance" ON application_guidance;
DROP POLICY IF EXISTS "Allow authenticated users to insert applications" ON applications;
DROP POLICY IF EXISTS "Allow authenticated users to read applications" ON applications;
DROP POLICY IF EXISTS "Allow public read access to applications" ON applications;

-- Public read policies for reference data
CREATE POLICY "Allow public read access to schemes"
    ON schemes FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to channel_partners"
    ON channel_partners FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to application_guidance"
    ON application_guidance FOR SELECT
    USING (true);

-- Applications policies: authenticated inserts, authenticated selects
CREATE POLICY "Allow authenticated users to insert applications"
    ON applications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read applications"
    ON applications FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================================
-- 5. SEED DATA (NSFDC Real Schemes, Guidance, & Verified Partners)
-- =====================================================================

-- 5a. Seed Schemes
INSERT INTO schemes (
    id,
    name,
    scheme_type,
    min_amount,
    max_amount,
    rate_min,
    rate_max,
    moratorium_months,
    moratorium_note,
    max_income_eligibility,
    repayment_years,
    financing_pct,
    description,
    issuing_body
) VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'Micro Credit Finance',
    'micro_finance',
    0,
    140000,
    6.5,
    6.5,
    3,
    '3 months from date of disbursement',
    500000,
    3,
    90,
    'For small/micro business activities. NSFDC finances up to 90% of project cost with a maximum disbursed amount of about ₹1.25 lakh, for units costing up to ₹1,40,000.',
    'National Scheduled Castes Finance and Development Corporation (NSFDC), Ministry of Social Justice and Empowerment'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Term Loan Scheme',
    'term_loan',
    140001,
    5000000,
    6.5,
    8.0,
    6,
    '6 months from date of disbursement',
    500000,
    10,
    90,
    'For setting up or expanding income-generating business activities across agriculture, industry, services and transport sectors, for projects costing up to ₹50 lakh.',
    'National Scheduled Castes Finance and Development Corporation (NSFDC), Ministry of Social Justice and Empowerment'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Educational Loan Scheme',
    'education_loan',
    0,
    2000000,
    4.0,
    6.5,
    6,
    '6 months after course completion or getting employment, whichever is earlier',
    500000,
    10,
    90,
    'For SC students pursuing full-time professional/technical education in India or abroad.',
    'National Scheduled Castes Finance and Development Corporation (NSFDC), Ministry of Social Justice and Empowerment'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    scheme_type = EXCLUDED.scheme_type,
    min_amount = EXCLUDED.min_amount,
    max_amount = EXCLUDED.max_amount,
    rate_min = EXCLUDED.rate_min,
    rate_max = EXCLUDED.rate_max,
    moratorium_months = EXCLUDED.moratorium_months,
    moratorium_note = EXCLUDED.moratorium_note,
    max_income_eligibility = EXCLUDED.max_income_eligibility,
    repayment_years = EXCLUDED.repayment_years,
    financing_pct = EXCLUDED.financing_pct,
    description = EXCLUDED.description,
    issuing_body = EXCLUDED.issuing_body;

-- 5b. Seed Application Guidance
INSERT INTO application_guidance (
    scheme_id,
    required_documents,
    application_steps,
    where_to_apply
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    ARRAY[
        'Caste certificate',
        'Income certificate (family income proof)',
        'Aadhaar card',
        'Project proposal / business plan',
        'Passport-size photographs',
        'Bank account details'
    ],
    ARRAY[
        'Contact your district office of the State Channelizing Agency (SCA), Regional Rural Bank, or NBFC-MFI listed as your nearest partner',
        'Collect and fill the NSFDC loan application form (available at the partner office or on nsfdc.nic.in)',
        'Submit the form along with required documents to the Channelizing Agency',
        'The Channelizing Agency verifies eligibility and forwards the application to NSFDC for fund sanction',
        'On approval, funds are disbursed to the beneficiary through the Channelizing Agency in installments as per the scheme''s terms'
    ],
    'District office of your nearest State Channelizing Agency (SCA), RRB, or NBFC-MFI shown in the Partner Locator step'
),
(
    'a2222222-2222-2222-2222-222222222222',
    ARRAY[
        'Caste certificate',
        'Income certificate (family income proof)',
        'Aadhaar card',
        'Project proposal / business plan',
        'Passport-size photographs',
        'Bank account details'
    ],
    ARRAY[
        'Contact your district office of the State Channelizing Agency (SCA), Regional Rural Bank, or NBFC-MFI listed as your nearest partner',
        'Collect and fill the NSFDC loan application form (available at the partner office or on nsfdc.nic.in)',
        'Submit the form along with required documents to the Channelizing Agency',
        'The Channelizing Agency verifies eligibility and forwards the application to NSFDC for fund sanction',
        'On approval, funds are disbursed to the beneficiary through the Channelizing Agency in installments as per the scheme''s terms'
    ],
    'District office of your nearest State Channelizing Agency (SCA), RRB, or NBFC-MFI shown in the Partner Locator step'
),
(
    'a3333333-3333-3333-3333-333333333333',
    ARRAY[
        'Caste certificate',
        'Income certificate',
        'Aadhaar card',
        'Admission letter from a recognized institution',
        'Fee structure document',
        'Academic mark sheets',
        'Passport-size photographs'
    ],
    ARRAY[
        'Visit nsfdc.nic.in and navigate to the Educational Loan Scheme (ELS) section, or contact the nearest State Channelizing Agency',
        'Download and fill the application form',
        'Attach all required documents including proof of admission',
        'Submit to the Channelizing Agency (SCA) for verification',
        'On approval, the loan amount is disbursed directly to the institution or to the beneficiary per the disbursement schedule'
    ],
    'Nearest State Channelizing Agency (SCA) — see Partner Locator step'
)
ON CONFLICT (scheme_id) DO UPDATE SET
    required_documents = EXCLUDED.required_documents,
    application_steps = EXCLUDED.application_steps,
    where_to_apply = EXCLUDED.where_to_apply;

-- 5c. Seed Channel Partners
INSERT INTO channel_partners (
    id,
    name,
    partner_type,
    city,
    state,
    latitude,
    longitude,
    handles_scheme_types,
    is_real_verified,
    npa_status_note
) VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    'M.P. Rajya Sahakari Anusuchit Jati Vitta Evam Vikas Nigam Maryadit',
    'SCA',
    'Bhopal',
    'Madhya Pradesh',
    23.2599,
    77.4126,
    ARRAY['micro_finance', 'term_loan', 'education_loan'],
    true,
    'Not publicly available — NSFDC''s internal fund-utilization and NPA data is not exposed via any public API. In a production system this field would be populated via secure integration with NSFDC''s internal MIS.'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'Madhya Pradesh Gramin Bank',
    'RRB',
    'Indore',
    'Madhya Pradesh',
    22.7196,
    75.8577,
    ARRAY['micro_finance', 'term_loan'],
    true,
    'Not publicly available — NSFDC''s internal fund-utilization and NPA data is not exposed via any public API. In a production system this field would be populated via secure integration with NSFDC''s internal MIS.'
),
(
    'b3333333-3333-3333-3333-333333333333',
    'Public Sector Bank (category placeholder — exact NSFDC-empanelled branch pending verification)',
    'PSB',
    'Bhopal',
    'Madhya Pradesh',
    23.2599,
    77.4126,
    ARRAY['micro_finance', 'term_loan', 'education_loan'],
    false,
    'Category placeholder — exact NSFDC-empanelled branch pending verification'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    partner_type = EXCLUDED.partner_type,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    handles_scheme_types = EXCLUDED.handles_scheme_types,
    is_real_verified = EXCLUDED.is_real_verified,
    npa_status_note = EXCLUDED.npa_status_note;
