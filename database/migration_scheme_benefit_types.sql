-- =============================================================================
-- Migration: Add Generalized Benefit Types & Impact Fields to Schemes Table
-- Problem Statement: 26092 (AI-Driven Scheme Matching for Marginalized Entrepreneurs)
-- =============================================================================

DO $$
BEGIN
    -- 1. Create benefit_type enum type if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scheme_benefit_type') THEN
        CREATE TYPE scheme_benefit_type AS ENUM (
            'loan',
            'subsidy',
            'grant',
            'credit_linked_subsidy',
            'skill_training',
            'equipment_infrastructure_support',
            'market_procurement_support',
            'other'
        );
    END IF;
END $$;

-- 2. Add benefit fields to schemes table
ALTER TABLE schemes
    ADD COLUMN IF NOT EXISTS benefit_type TEXT DEFAULT 'loan',
    ADD COLUMN IF NOT EXISTS benefit_summary TEXT,
    ADD COLUMN IF NOT EXISTS has_financial_calculation BOOLEAN DEFAULT true;

-- 3. Add check constraint on benefit_type if not using enum column directly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_schemes_benefit_type'
    ) THEN
        ALTER TABLE schemes
            ADD CONSTRAINT chk_schemes_benefit_type
            CHECK (benefit_type IN (
                'loan',
                'subsidy',
                'grant',
                'credit_linked_subsidy',
                'skill_training',
                'equipment_infrastructure_support',
                'market_procurement_support',
                'other'
            ));
    END IF;
END $$;

-- 4. Set accurate verified data for existing 3 NSFDC schemes
UPDATE schemes
SET
    benefit_type = 'loan',
    has_financial_calculation = true,
    benefit_summary = 'Direct micro-finance credit assistance up to ₹1,25,000 for tiny self-employment units and SHGs at 6.5% subsidized interest rate.'
WHERE id = 'a1111111-1111-1111-1111-111111111111' OR name ILIKE '%Micro Credit%';

UPDATE schemes
SET
    benefit_type = 'loan',
    has_financial_calculation = true,
    benefit_summary = 'Concessional term loan financing up to 90% of viable project cost (₹1.4L to ₹50L) with subsidized 8% interest and up to 12 months moratorium.'
WHERE id = 'a2222222-2222-2222-2222-222222222222' OR name ILIKE '%Term Loan%';

UPDATE schemes
SET
    benefit_type = 'loan',
    has_financial_calculation = true,
    benefit_summary = 'Concessional education credit up to ₹30L (India) / ₹40L (Abroad) covering 90% of course fee with 0.5% interest rebate for women beneficiaries.'
WHERE id = 'a3333333-3333-3333-3333-333333333333' OR name ILIKE '%Educational Loan%';
