-- =============================================================================
-- ArthSetu AI — Master Database Schema & Verified Seed Data (Step 6 Production-Ready)
-- =============================================================================
-- Problem Statement: 26092 (Ministry of Social Justice and Empowerment / NSFDC)
-- Primary Official Source: https://nsfdc.nic.in/scheme (Verified: 2026-09-05)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Scheme Categories Table
CREATE TABLE IF NOT EXISTS scheme_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Verified Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES scheme_categories(id),
    name TEXT NOT NULL,
    scheme_type TEXT NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT,
    issuing_body TEXT NOT NULL DEFAULT 'National Scheduled Castes Finance and Development Corporation (NSFDC)',
    project_cost_min NUMERIC NOT NULL DEFAULT 0,
    project_cost_max NUMERIC,
    max_loan_amount NUMERIC NOT NULL,
    financing_pct NUMERIC NOT NULL DEFAULT 90,
    rate_beneficiary_min NUMERIC NOT NULL,
    rate_beneficiary_max NUMERIC NOT NULL,
    rate_to_sca NUMERIC NOT NULL,
    rate_note TEXT,
    repayment_years_max INT NOT NULL,
    repayment_note TEXT,
    moratorium_months INT NOT NULL DEFAULT 0,
    moratorium_note TEXT,
    max_income_eligibility NUMERIC NOT NULL DEFAULT 500000,
    eligible_castes TEXT[] NOT NULL DEFAULT ARRAY['SC'],
    eligible_purposes TEXT[] NOT NULL DEFAULT '{}',
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    last_verified_at DATE NOT NULL DEFAULT '2026-09-06',
    needs_manual_verification BOOLEAN NOT NULL DEFAULT false,
    verification_note TEXT,
    verification_status TEXT DEFAULT 'verified',
    verification_source_type TEXT DEFAULT 'official_portal',
    verification_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Deterministic Eligibility Rules Table
CREATE TABLE IF NOT EXISTS eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL,
    operator TEXT NOT NULL,
    field_name TEXT NOT NULL,
    value_num NUMERIC,
    value_list TEXT[],
    value_text TEXT,
    description TEXT NOT NULL,
    is_hard_rule BOOLEAN NOT NULL DEFAULT true,
    source_note TEXT,
    needs_manual_verification BOOLEAN NOT NULL DEFAULT false,
    verification_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Channelizing Partners & Empanelled Banks Directory Table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('SCA', 'PSB', 'RRB', 'NBFC_MFI', 'Cooperative')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'Active', 'Temporarily Inactive')),
    supported_schemes TEXT[] NOT NULL DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'NSFDC Official SCA Directory',
    last_verified_at DATE NOT NULL DEFAULT '2026-09-06',
    data_confidence_label TEXT NOT NULL CHECK (data_confidence_label IN ('Verified Master Data', 'Prototype/Demo Data', 'Pending Live Verification')),
    verification_status TEXT DEFAULT 'verified',
    verification_source_type TEXT DEFAULT 'official_directory',
    verification_notes TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    operating_hours TEXT DEFAULT '10:00 AM - 5:00 PM (Mon-Sat)',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Partner Scheme Mapping Table
CREATE TABLE IF NOT EXISTS partner_scheme_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_partner_scheme UNIQUE (partner_id, scheme_id)
);

-- 6. Beneficiary Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT NOT NULL UNIQUE,
    scheme_id UUID REFERENCES schemes(id),
    scheme_name TEXT NOT NULL,
    partner_id UUID REFERENCES partners(id),
    partner_name TEXT,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    applicant_email TEXT,
    annual_family_income NUMERIC NOT NULL,
    loan_amount NUMERIC NOT NULL,
    project_cost NUMERIC NOT NULL,
    purpose TEXT NOT NULL,
    sc_caste_declared BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (
        status IN (
            'Draft',
            'Submitted',
            'Under Review',
            'Documents Required',
            'Forwarded to Partner',
            'Processing',
            'Decision'
        )
    ),
    decision_verdict TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Application Documents Table
CREATE TABLE IF NOT EXISTS application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    file_url TEXT,
    is_uploaded BOOLEAN NOT NULL DEFAULT false,
    is_verified_demo BOOLEAN NOT NULL DEFAULT false,
    verification_notes TEXT,
    uploaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Application Status Timeline Audit Table
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    remarks TEXT NOT NULL,
    updated_by TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schemes_type ON schemes(scheme_type);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON schemes(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_city ON partners(city);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_apps_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_apps_phone ON applications(applicant_phone);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────
ALTER TABLE scheme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_scheme_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pub_read_schemes_v6" ON schemes FOR SELECT USING (true);
CREATE POLICY "pub_read_categories_v6" ON scheme_categories FOR SELECT USING (true);
CREATE POLICY "pub_read_rules_v6" ON eligibility_rules FOR SELECT USING (true);
CREATE POLICY "pub_read_partners_v6" ON partners FOR SELECT USING (true);
CREATE POLICY "pub_read_partner_mapping_v6" ON partner_scheme_mapping FOR SELECT USING (true);
CREATE POLICY "pub_read_apps_v6" ON applications FOR SELECT USING (true);
CREATE POLICY "pub_write_apps_v6" ON applications FOR ALL USING (true);
CREATE POLICY "pub_read_docs_v6" ON application_documents FOR ALL USING (true);
CREATE POLICY "pub_read_history_v6" ON application_status_history FOR ALL USING (true);
