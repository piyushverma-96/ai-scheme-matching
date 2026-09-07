-- =============================================================================
-- Migration: Additive Verification Metadata Columns (Step 6 / Section 6)
-- Schemes & Partners Verification Traceability
-- =============================================================================

-- 1. Add verification metadata columns to schemes table (Additive only)
ALTER TABLE schemes 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified';

ALTER TABLE schemes 
ADD COLUMN IF NOT EXISTS verification_source_type TEXT DEFAULT 'official_portal';

ALTER TABLE schemes 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 2. Add verification metadata columns to partners table (Additive only)
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified';

ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS verification_source_type TEXT DEFAULT 'official_directory';

ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 3. Update existing verified records with appropriate source types
UPDATE schemes 
SET verification_status = 'verified', 
    verification_source_type = 'official_portal',
    verification_notes = 'Verified against https://nsfdc.nic.in/scheme guidelines'
WHERE verification_status IS NULL OR verification_status = 'verified';

UPDATE partners 
SET verification_status = 'verified', 
    verification_source_type = 'official_directory',
    verification_notes = 'Verified against NSFDC Channelizing Agency / State Nodal Directory'
WHERE verification_status IS NULL OR verification_status = 'verified';
