-- ArthSetu AI - Database Schema (Step 2)
-- Source: https://nsfdc.nic.in/scheme (verified 2026-09-05)
-- All monetary figures confirmed from live NSFDC website

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS scheme_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
    max_income_eligibility NUMERIC NOT NULL DEFAULT 300000,
    eligible_castes TEXT[] NOT NULL DEFAULT ARRAY['SC'],
    eligible_purposes TEXT[] NOT NULL DEFAULT '{}',
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    last_verified_at DATE NOT NULL,
    needs_manual_verification BOOLEAN NOT NULL DEFAULT false,
    verification_note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS required_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    document TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS application_guidance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    application_steps TEXT[] NOT NULL DEFAULT '{}',
    where_to_apply TEXT NOT NULL,
    portal_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_application_guidance_scheme UNIQUE (scheme_id)
);

CREATE TABLE IF NOT EXISTS channel_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('SCA','PSB','RRB','NBFC-MFI','Cooperative')),
    city TEXT,
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    latitude NUMERIC,
    longitude NUMERIC,
    handles_scheme_types TEXT[] NOT NULL DEFAULT '{}',
    is_real_verified BOOLEAN NOT NULL DEFAULT false,
    npa_status_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schemes_type ON schemes(scheme_type);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON schemes(is_active);
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_scheme ON eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_type ON eligibility_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_req_docs_scheme ON required_documents(scheme_id);
CREATE INDEX IF NOT EXISTS idx_channel_partners_city ON channel_partners(city);

ALTER TABLE scheme_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pub_read_categories" ON scheme_categories;
DROP POLICY IF EXISTS "pub_read_schemes" ON schemes;
DROP POLICY IF EXISTS "pub_read_rules" ON eligibility_rules;
DROP POLICY IF EXISTS "pub_read_docs" ON required_documents;
DROP POLICY IF EXISTS "pub_read_guidance" ON application_guidance;
DROP POLICY IF EXISTS "pub_read_partners" ON channel_partners;

CREATE POLICY "pub_read_categories" ON scheme_categories FOR SELECT USING (true);
CREATE POLICY "pub_read_schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "pub_read_rules" ON eligibility_rules FOR SELECT USING (true);
CREATE POLICY "pub_read_docs" ON required_documents FOR SELECT USING (true);
CREATE POLICY "pub_read_guidance" ON application_guidance FOR SELECT USING (true);
CREATE POLICY "pub_read_partners" ON channel_partners FOR SELECT USING (true);

-- SEED DATA (Source: nsfdc.nic.in/scheme, verified 2026-09-05)

INSERT INTO scheme_categories (id, code, label, description) VALUES
('c1000000-0000-0000-0000-000000000001','micro_finance','Micro Credit Finance','Credit for units up to Rs 1,40,000 through SCAs/CAs.'),
('c2000000-0000-0000-0000-000000000002','term_loan','Term Loan','Business loans Rs 1,40,001 to Rs 50,00,000.'),
('c3000000-0000-0000-0000-000000000003','education_loan','Educational Loan Scheme (ELS)','Education loans for SC students.'),
('c4000000-0000-0000-0000-000000000004','micro_finance_mfi','Micro-Finance via MFI/Cooperative','Micro-finance through NBFC-MFIs, Cooperative Banks and SFBs.')
ON CONFLICT (code) DO UPDATE SET label=EXCLUDED.label, description=EXCLUDED.description;

INSERT INTO schemes (id,category_id,name,scheme_type,short_description,full_description,issuing_body,project_cost_min,project_cost_max,max_loan_amount,financing_pct,rate_beneficiary_min,rate_beneficiary_max,rate_to_sca,rate_note,repayment_years_max,repayment_note,moratorium_months,moratorium_note,max_income_eligibility,eligible_purposes,source_name,source_url,last_verified_at,needs_manual_verification,verification_note) VALUES
('a1111111-1111-1111-1111-111111111111','c1000000-0000-0000-0000-000000000001','Micro Credit Finance','micro_finance','For units up to Rs 1,40,000. Max loan Rs 1,25,000 (90% of project cost).','NSFDC provides Micro Credit Finance for units costing up to Rs 1,40,000. Loans up to 90% of project cost, max Rs 1,25,000. NSFDC charges SCAs/CAs 2.5%; SCAs/CAs charge beneficiaries 6.5%. Quarterly instalments within 3 years, 3-month moratorium.','NSFDC, Ministry of Social Justice and Empowerment',0,140000,125000,90,6.5,6.5,2.5,'NSFDC charges SCA/CA 2.5% p.a.; SCA/CA charges beneficiary 6.5% p.a.',3,'Quarterly instalments within 3 years from disbursement.',3,'3 months from date of disbursement.',300000,ARRAY['business','micro_business','agriculture','services','trade','handicraft'],'NSFDC Official Website','https://nsfdc.nic.in/scheme','2026-09-05',false,NULL),
('a2222222-2222-2222-2222-222222222222','c2000000-0000-0000-0000-000000000002','Term Loan','term_loan','Business loans Rs 1,40,001 to Rs 50,00,000. Max loan Rs 45,00,000.','NSFDC provides Term Loans for units costing more than Rs 1,40,000 up to Rs 50,00,000. Loans up to 90% of project cost (Rs 1,25,001 to Rs 45,00,000). NSFDC charges SCAs/CAs 4%; SCAs/CAs charge beneficiaries 8%. Quarterly instalments within 7 years, 6-month moratorium (12 months for plantation/construction).','NSFDC, Ministry of Social Justice and Empowerment',140001,5000000,4500000,90,8.0,8.0,4.0,'NSFDC charges SCA/CA 4% p.a.; SCA/CA charges beneficiary 8% p.a. 12-month moratorium for plantation/construction.',7,'Quarterly instalments within 7 years. 12-month moratorium for plantation/construction.',6,'6 months from disbursement (12 months for plantation/construction).',300000,ARRAY['business','agriculture','industry','services','transport','plantation','construction'],'NSFDC Official Website','https://nsfdc.nic.in/scheme','2026-09-05',false,NULL),
('a3333333-3333-3333-3333-333333333333','c3000000-0000-0000-0000-000000000003','Educational Loan Scheme (ELS)','education_loan','For SC students in professional/technical courses. Up to Rs 40,00,000 or 90% of course fee.','Educational Loan for eligible SC students for regular full-time professional/technical courses in India or abroad. Max loan Rs 40,00,000 or 90% of course fee whichever is lower. NSFDC charges CAs 2.5%; CAs charge beneficiaries 6.5% p.a. NOTE: user brief cites 6%/7% India/abroad split - flagged needs_manual_verification. Repayment up to 12 years (not started) or 10 years (started). Moratorium: course period plus 1 year (new) or 6 months (ongoing).','NSFDC, Ministry of Social Justice and Empowerment',0,4000000,4000000,90,6.5,6.5,2.5,'Live nsfdc.nic.in/scheme shows single 6.5% beneficiary / 2.5% CA rate up to Rs 40L. User brief cites 6% India / 7% abroad - flagged for re-verification against primary ELS policy document.',12,'Up to 12 years where repayment not started; up to 10 years where disbursed and repayment started.',12,'Course period plus 1 year (new loans). Up to 6 months where repayment already started.',300000,ARRAY['education'],'NSFDC Official Website - Scheme Listing Page','https://nsfdc.nic.in/scheme','2026-09-05',true,'Domestic/abroad rate split (6%/7% per user brief) and exact tenure (10-15 yrs per secondary sources) require re-verification against primary NSFDC ELS Policy Document. Live page shows combined 6.5%/Rs 40L. Use as indicative only until primary document confirmed.'),
('a4444444-4444-4444-4444-444444444444','c4000000-0000-0000-0000-000000000004','Aajeevika Micro-Finance Yojana','micro_finance_mfi','Micro-finance via NBFC-MFIs for SC beneficiaries. Projects up to Rs 1,40,000. Max loan Rs 1,25,000.','NSFDC provides need-based micro finance to eligible SC persons through selected NBFC-MFIs for small/micro business activities. Loan up to 90% i.e. Rs 1,25,000 for projects up to Rs 1,40,000. NSFDC charges NBFC-MFIs 5%; NBFC-MFIs charge beneficiaries 15%. Quarterly instalments up to 3 years, 3-month moratorium.','NSFDC, Ministry of Social Justice and Empowerment',0,140000,125000,90,15.0,15.0,5.0,'NSFDC charges NBFC-MFIs 5% p.a.; NBFC-MFIs charge beneficiaries 15% p.a.',3,'Quarterly instalments up to 3 years from each disbursement.',3,'3-month moratorium from date of disbursement.',300000,ARRAY['business','micro_business','services','trade'],'NSFDC Official Website - Scheme Listing Page','https://nsfdc.nic.in/scheme','2026-09-05',false,NULL),
('a5555555-5555-5555-5555-555555555555','c4000000-0000-0000-0000-000000000004','Udyam Nidhi Yojana (UNY)','micro_finance_mfi','Micro-enterprise loans up to Rs 5,00,000 via Cooperative Banks, Societies and SFBs.','NSFDC provides loans under Udyam Nidhi Yojana for projects up to Rs 5,00,000 through Cooperative Societies, Cooperative Banks and SFBs. Loan up to 90% i.e. Rs 4,50,000. NSFDC charges channel partners 5%. Cooperative Banks/Societies charge 13%; SFBs charge 15% from beneficiaries. Quarterly or half-yearly instalments within 5 years, 3-month moratorium.','NSFDC, Ministry of Social Justice and Empowerment',0,500000,450000,90,13.0,15.0,5.0,'Cooperative Banks/Societies charge 13%; SFBs charge 15%. NSFDC charges 5% from all channel partners.',5,'Quarterly or half-yearly instalments within 5 years.',3,'3-month moratorium from date of disbursement.',300000,ARRAY['business','micro_business','services','trade','agriculture'],'NSFDC Official Website - Scheme Listing Page','https://nsfdc.nic.in/scheme','2026-09-05',false,NULL)
ON CONFLICT (id) DO UPDATE SET
    name=EXCLUDED.name,scheme_type=EXCLUDED.scheme_type,short_description=EXCLUDED.short_description,
    full_description=EXCLUDED.full_description,project_cost_min=EXCLUDED.project_cost_min,
    project_cost_max=EXCLUDED.project_cost_max,max_loan_amount=EXCLUDED.max_loan_amount,
    financing_pct=EXCLUDED.financing_pct,rate_beneficiary_min=EXCLUDED.rate_beneficiary_min,
    rate_beneficiary_max=EXCLUDED.rate_beneficiary_max,rate_to_sca=EXCLUDED.rate_to_sca,
    rate_note=EXCLUDED.rate_note,repayment_years_max=EXCLUDED.repayment_years_max,
    repayment_note=EXCLUDED.repayment_note,moratorium_months=EXCLUDED.moratorium_months,
    moratorium_note=EXCLUDED.moratorium_note,max_income_eligibility=EXCLUDED.max_income_eligibility,
    eligible_purposes=EXCLUDED.eligible_purposes,source_name=EXCLUDED.source_name,
    source_url=EXCLUDED.source_url,last_verified_at=EXCLUDED.last_verified_at,
    needs_manual_verification=EXCLUDED.needs_manual_verification,
    verification_note=EXCLUDED.verification_note,updated_at=now();

INSERT INTO eligibility_rules (scheme_id,rule_type,operator,field_name,value_num,value_list,value_text,description,is_hard_rule,source_note) VALUES
('a1111111-1111-1111-1111-111111111111','caste','eq','caste_category',NULL,ARRAY['SC'],NULL,'Must belong to Scheduled Caste (SC).',true,'NSFDC - all schemes for SC beneficiaries'),
('a1111111-1111-1111-1111-111111111111','income_ceiling','lte','annual_family_income',300000,NULL,NULL,'Annual family income <= Rs 3,00,000.',true,'Standard NSFDC income ceiling'),
('a1111111-1111-1111-1111-111111111111','project_cost','lte','project_cost',140000,NULL,NULL,'Project cost <= Rs 1,40,000.',true,'nsfdc.nic.in/scheme: Micro Credit Finance'),
('a1111111-1111-1111-1111-111111111111','purpose','in','purpose',NULL,ARRAY['business','micro_business','agriculture','services','trade','handicraft'],NULL,'Purpose must be qualifying income-generating activity.',true,'nsfdc.nic.in/scheme'),
('a2222222-2222-2222-2222-222222222222','caste','eq','caste_category',NULL,ARRAY['SC'],NULL,'Must belong to Scheduled Caste (SC).',true,'NSFDC'),
('a2222222-2222-2222-2222-222222222222','income_ceiling','lte','annual_family_income',300000,NULL,NULL,'Annual family income <= Rs 3,00,000.',true,'Standard NSFDC income ceiling'),
('a2222222-2222-2222-2222-222222222222','project_cost','gt','project_cost',140000,NULL,NULL,'Project cost must be > Rs 1,40,000.',true,'nsfdc.nic.in/scheme: Term Loan'),
('a2222222-2222-2222-2222-222222222222','project_cost','lte','project_cost',5000000,NULL,NULL,'Project cost <= Rs 50,00,000.',true,'nsfdc.nic.in/scheme'),
('a2222222-2222-2222-2222-222222222222','purpose','in','purpose',NULL,ARRAY['business','agriculture','industry','services','transport','plantation','construction'],NULL,'Purpose must be qualifying activity.',true,'nsfdc.nic.in/scheme'),
('a3333333-3333-3333-3333-333333333333','caste','eq','caste_category',NULL,ARRAY['SC'],NULL,'Must belong to Scheduled Caste (SC).',true,'NSFDC'),
('a3333333-3333-3333-3333-333333333333','income_ceiling','lte','annual_family_income',300000,NULL,NULL,'Annual family income <= Rs 3,00,000.',true,'Standard NSFDC income ceiling'),
('a3333333-3333-3333-3333-333333333333','purpose','eq','purpose',NULL,ARRAY['education'],NULL,'Purpose must be education.',true,'nsfdc.nic.in/scheme: ELS'),
('a3333333-3333-3333-3333-333333333333','loan_limit','lte','project_cost',4000000,NULL,NULL,'Course fee/loan <= Rs 40,00,000.',true,'nsfdc.nic.in/scheme'),
('a4444444-4444-4444-4444-444444444444','caste','eq','caste_category',NULL,ARRAY['SC'],NULL,'Must belong to Scheduled Caste (SC).',true,'NSFDC'),
('a4444444-4444-4444-4444-444444444444','income_ceiling','lte','annual_family_income',300000,NULL,NULL,'Annual family income <= Rs 3,00,000.',true,'Standard NSFDC income ceiling'),
('a4444444-4444-4444-4444-444444444444','project_cost','lte','project_cost',140000,NULL,NULL,'Project cost <= Rs 1,40,000.',true,'nsfdc.nic.in/scheme: Aajeevika'),
('a4444444-4444-4444-4444-444444444444','purpose','in','purpose',NULL,ARRAY['business','micro_business','services','trade'],NULL,'Purpose must be qualifying activity.',true,'nsfdc.nic.in/scheme'),
('a5555555-5555-5555-5555-555555555555','caste','eq','caste_category',NULL,ARRAY['SC'],NULL,'Must belong to Scheduled Caste (SC).',true,'NSFDC'),
('a5555555-5555-5555-5555-555555555555','income_ceiling','lte','annual_family_income',300000,NULL,NULL,'Annual family income <= Rs 3,00,000.',true,'Standard NSFDC income ceiling'),
('a5555555-5555-5555-5555-555555555555','project_cost','lte','project_cost',500000,NULL,NULL,'Project cost <= Rs 5,00,000.',true,'nsfdc.nic.in/scheme: Udyam Nidhi'),
('a5555555-5555-5555-5555-555555555555','purpose','in','purpose',NULL,ARRAY['business','micro_business','services','trade','agriculture'],NULL,'Purpose must be qualifying activity.',true,'nsfdc.nic.in/scheme')
ON CONFLICT DO NOTHING;

INSERT INTO required_documents (scheme_id,document,is_mandatory,sort_order) VALUES
('a1111111-1111-1111-1111-111111111111','Caste certificate issued by competent authority',true,1),
('a1111111-1111-1111-1111-111111111111','Annual family income certificate',true,2),
('a1111111-1111-1111-1111-111111111111','Aadhaar card',true,3),
('a1111111-1111-1111-1111-111111111111','Project proposal / business plan',true,4),
('a1111111-1111-1111-1111-111111111111','Passport-size photographs (2)',true,5),
('a1111111-1111-1111-1111-111111111111','Bank account details',true,6),
('a2222222-2222-2222-2222-222222222222','Caste certificate issued by competent authority',true,1),
('a2222222-2222-2222-2222-222222222222','Annual family income certificate',true,2),
('a2222222-2222-2222-2222-222222222222','Aadhaar card',true,3),
('a2222222-2222-2222-2222-222222222222','Detailed project report / business plan',true,4),
('a2222222-2222-2222-2222-222222222222','Land / premises documents (owned or leased)',false,5),
('a2222222-2222-2222-2222-222222222222','Quotation for machinery/equipment',false,6),
('a2222222-2222-2222-2222-222222222222','Passport-size photographs (2)',true,7),
('a2222222-2222-2222-2222-222222222222','Bank account details',true,8),
('a3333333-3333-3333-3333-333333333333','Caste certificate issued by competent authority',true,1),
('a3333333-3333-3333-3333-333333333333','Annual family income certificate',true,2),
('a3333333-3333-3333-3333-333333333333','Aadhaar card (student and parent/guardian)',true,3),
('a3333333-3333-3333-3333-333333333333','Admission letter from recognized institution',true,4),
('a3333333-3333-3333-3333-333333333333','Official fee structure document from institution',true,5),
('a3333333-3333-3333-3333-333333333333','Academic mark sheets / transcripts',true,6),
('a3333333-3333-3333-3333-333333333333','Passport (for studies abroad)',false,7),
('a3333333-3333-3333-3333-333333333333','Passport-size photographs (2)',true,8),
('a3333333-3333-3333-3333-333333333333','Bank account details',true,9),
('a4444444-4444-4444-4444-444444444444','Caste certificate issued by competent authority',true,1),
('a4444444-4444-4444-4444-444444444444','Annual family income certificate',true,2),
('a4444444-4444-4444-4444-444444444444','Aadhaar card',true,3),
('a4444444-4444-4444-4444-444444444444','Project proposal for micro-business activity',true,4),
('a4444444-4444-4444-4444-444444444444','Passport-size photographs (2)',true,5),
('a4444444-4444-4444-4444-444444444444','Bank account details',true,6),
('a5555555-5555-5555-5555-555555555555','Caste certificate issued by competent authority',true,1),
('a5555555-5555-5555-5555-555555555555','Annual family income certificate',true,2),
('a5555555-5555-5555-5555-555555555555','Aadhaar card',true,3),
('a5555555-5555-5555-5555-555555555555','Project proposal / business plan',true,4),
('a5555555-5555-5555-5555-555555555555','Passport-size photographs (2)',true,5),
('a5555555-5555-5555-5555-555555555555','Bank account details',true,6)
ON CONFLICT DO NOTHING;

INSERT INTO application_guidance (scheme_id,application_steps,where_to_apply,portal_url) VALUES
('a1111111-1111-1111-1111-111111111111',ARRAY['Contact nearest SCA district office, RRB, or empanelled NBFC-MFI.','Collect NSFDC loan application form.','Fill form and attach all required documents.','Submit to Channelizing Agency for eligibility verification.','On approval, funds disbursed through the Channelizing Agency.'],'Nearest SCA, RRB, or NBFC-MFI.','https://pmsuraj.dosje.gov.in/'),
('a2222222-2222-2222-2222-222222222222',ARRAY['Contact nearest SCA district office or empanelled PSB/RRB.','Obtain and fill NSFDC Term Loan application with project report.','Submit to Channelizing Agency with all required documents.','Agency verifies and forwards to NSFDC for fund sanction.','Disbursement in tranches through the Channelizing Agency.'],'Nearest SCA, PSB, or RRB.','https://pmsuraj.dosje.gov.in/'),
('a3333333-3333-3333-3333-333333333333',ARRAY['Visit nsfdc.nic.in ELS section or contact nearest SCA.','Obtain ELS application form and admission confirmation.','Attach all required documents including official fee structure.','Submit complete application to SCA for verification.','Loan disbursed to institution or beneficiary per schedule.'],'Nearest State Channelizing Agency (SCA).','https://pmsuraj.dosje.gov.in/'),
('a4444444-4444-4444-4444-444444444444',ARRAY['Identify nearest NBFC-MFI empanelled with NSFDC for Aajeevika scheme.','Submit application and documents to the NBFC-MFI.','NBFC-MFI forwards verified applications to NSFDC.','Funds disbursed through NBFC-MFI on approval.'],'Empanelled NBFC-MFI in your district.','https://nsfdc.nic.in'),
('a5555555-5555-5555-5555-555555555555',ARRAY['Identify Cooperative Bank, Society, or SFB empanelled with NSFDC for UNY.','Submit application with project proposal to partner institution.','Partner institution forwards verified applications to NSFDC.','Funds disbursed through partner institution on approval.'],'Empanelled Cooperative Bank, Cooperative Society, or SFB.','https://nsfdc.nic.in')
ON CONFLICT (scheme_id) DO UPDATE SET application_steps=EXCLUDED.application_steps,where_to_apply=EXCLUDED.where_to_apply,portal_url=EXCLUDED.portal_url;

INSERT INTO channel_partners (id,name,partner_type,city,state,latitude,longitude,handles_scheme_types,is_real_verified,npa_status_note) VALUES
('b1111111-1111-1111-1111-111111111111','M.P. Rajya Sahakari Anusuchit Jati Vitta Evam Vikas Nigam Maryadit','SCA','Bhopal','Madhya Pradesh',23.2599,77.4126,ARRAY['micro_finance','term_loan','education_loan'],true,'NPA data not publicly available.'),
('b2222222-2222-2222-2222-222222222222','Madhya Pradesh Gramin Bank','RRB','Indore','Madhya Pradesh',22.7196,75.8577,ARRAY['micro_finance','term_loan'],true,'NPA data not publicly available.'),
('b3333333-3333-3333-3333-333333333333','Public Sector Bank (empanelled branch pending verification)','PSB','Bhopal','Madhya Pradesh',23.2599,77.4126,ARRAY['micro_finance','term_loan','education_loan'],false,'Placeholder - exact branch requires verification.')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,handles_scheme_types=EXCLUDED.handles_scheme_types,is_real_verified=EXCLUDED.is_real_verified;
