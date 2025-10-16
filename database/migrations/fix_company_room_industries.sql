-- Fix company room industry associations
-- This script ensures all company rooms have valid industry_id references

-- First, let's see what industries exist
SELECT id, code, name FROM cc_industries ORDER BY name;

-- Check which company rooms have NULL industry_id
SELECT code, name, industry_id FROM cc_company_rooms WHERE industry_id IS NULL;

-- Update company rooms with correct industry references
-- Using more flexible matching to ensure we find industries

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%healthcare%' OR name ILIKE '%medical%' OR code = 'HEALTH' LIMIT 1)
WHERE code = 'MEDICORE' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%technology%' OR name ILIKE '%software%' OR code = 'TECH' LIMIT 1)
WHERE code = 'CLOUDPEAK' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%retail%' OR name ILIKE '%fashion%' OR code = 'RETAIL' LIMIT 1)
WHERE code = 'TRENDFWD' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%finance%' OR name ILIKE '%banking%' OR code = 'FINANCE' LIMIT 1)
WHERE code = 'HORIZON' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%food%' OR name ILIKE '%restaurant%' OR code = 'FOOD' LIMIT 1)
WHERE code = 'QUICKSERVE' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%transport%' OR name ILIKE '%airline%' OR code = 'TRANSPORT' LIMIT 1)
WHERE code = 'SKYCONNECT' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%energy%' OR name ILIKE '%utility%' OR code = 'ENERGY' LIMIT 1)
WHERE code = 'GREENGRID' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%telecom%' OR name ILIKE '%communication%' OR code = 'TELECOM' LIMIT 1)
WHERE code = 'NEXTGEN' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%entertainment%' OR name ILIKE '%gaming%' OR code = 'GAMING' LIMIT 1)
WHERE code = 'PLAYFORGE' AND industry_id IS NULL;

UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries WHERE name ILIKE '%construction%' OR name ILIKE '%real estate%' OR code = 'CONSTRUCT' LIMIT 1)
WHERE code = 'BUILDRIGHT' AND industry_id IS NULL;

-- If still NULL, assign a default industry (first available)
UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries LIMIT 1)
WHERE industry_id IS NULL;

-- Verify all company rooms now have industry associations
SELECT
    cr.code,
    cr.name as company_name,
    cr.industry_id,
    i.name as industry_name
FROM cc_company_rooms cr
LEFT JOIN cc_industries i ON cr.industry_id = i.id
ORDER BY cr.name;
