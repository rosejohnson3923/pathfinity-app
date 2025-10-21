-- =====================================================
-- Add COO to c_suite_org CHECK constraint
-- Created: October 19, 2025
-- =====================================================

-- Update the CHECK constraint on ccm_role_cards to include 'coo'
ALTER TABLE ccm_role_cards
DROP CONSTRAINT IF EXISTS ccm_role_cards_c_suite_org_check;

ALTER TABLE ccm_role_cards
ADD CONSTRAINT ccm_role_cards_c_suite_org_check
CHECK (c_suite_org IN ('ceo', 'cfo', 'cmo', 'cto', 'chro', 'coo'));

-- Update the CHECK constraint on ccm_session_participants to include 'coo'
ALTER TABLE ccm_session_participants
DROP CONSTRAINT IF EXISTS ccm_session_participants_c_suite_choice_check;

ALTER TABLE ccm_session_participants
ADD CONSTRAINT ccm_session_participants_c_suite_choice_check
CHECK (c_suite_choice IN ('ceo', 'cfo', 'cmo', 'cto', 'chro', 'coo'));

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Updated c_suite_org CHECK constraints to include COO';
  RAISE NOTICE '📊 Valid values: ceo, cfo, cmo, cto, chro, coo';
  RAISE NOTICE '';
END $$;
