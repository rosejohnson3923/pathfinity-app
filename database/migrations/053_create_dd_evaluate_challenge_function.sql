-- ================================================================
-- CREATE DECISION DESK RPC FUNCTION: dd_evaluate_challenge
-- Migration 053: Copy cc_evaluate_challenge to dd_evaluate_challenge
-- ================================================================
-- This migration creates dd_evaluate_challenge RPC function
-- Based on cc_evaluate_challenge but references dd_challenges table
-- ================================================================

-- ================================================================
-- STEP 1: Create dd_evaluate_challenge function
-- ================================================================

CREATE OR REPLACE FUNCTION dd_evaluate_challenge(
    p_team_power INTEGER,
    p_challenge_id UUID
) RETURNS VARCHAR AS $$
DECLARE
    v_difficulty_score INTEGER;
    v_perfect_score INTEGER;
    v_failure_threshold INTEGER;
BEGIN
    SELECT
        base_difficulty_score,
        perfect_score,
        failure_threshold
    INTO v_difficulty_score, v_perfect_score, v_failure_threshold
    FROM dd_challenges
    WHERE id = p_challenge_id;

    IF p_team_power >= v_perfect_score THEN
        RETURN 'perfect';
    ELSIF p_team_power >= v_difficulty_score THEN
        RETURN 'success';
    ELSIF p_team_power >= v_failure_threshold THEN
        RETURN 'failure';
    ELSE
        RETURN 'failure';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Decision Desk RPC Function Created!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Function: dd_evaluate_challenge';
    RAISE NOTICE '   Purpose: Evaluate challenge results';
    RAISE NOTICE '   Table: dd_challenges';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Function signature:';
    RAISE NOTICE '   dd_evaluate_challenge(team_power, challenge_id)';
    RAISE NOTICE '';
    RAISE NOTICE 'Returns:';
    RAISE NOTICE '   ''perfect'' - Team power >= perfect score';
    RAISE NOTICE '   ''success'' - Team power >= difficulty score';
    RAISE NOTICE '   ''failure'' - Team power < difficulty score';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
