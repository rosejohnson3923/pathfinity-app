-- ================================================================
-- FIX ALL CAREER MATCH RLS POLICIES
-- Migration 061: Enable proper access to all Career Match tables
-- ================================================================

-- ================================================================
-- cm_game_sessions - Allow authenticated users to read and create
-- ================================================================

DROP POLICY IF EXISTS "cm_game_sessions_select_policy" ON cm_game_sessions;
DROP POLICY IF EXISTS "cm_game_sessions_insert_policy" ON cm_game_sessions;
DROP POLICY IF EXISTS "cm_game_sessions_update_policy" ON cm_game_sessions;

-- Allow all authenticated users to view sessions
CREATE POLICY "cm_game_sessions_select_all" ON cm_game_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to create sessions
CREATE POLICY "cm_game_sessions_insert_all" ON cm_game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update sessions
CREATE POLICY "cm_game_sessions_update_all" ON cm_game_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON cm_game_sessions TO authenticated;

-- ================================================================
-- cm_session_participants - Allow authenticated users full access
-- ================================================================

DROP POLICY IF EXISTS "cm_session_participants_select_policy" ON cm_session_participants;
DROP POLICY IF EXISTS "cm_session_participants_insert_policy" ON cm_session_participants;
DROP POLICY IF EXISTS "cm_session_participants_update_policy" ON cm_session_participants;

CREATE POLICY "cm_session_participants_select_all" ON cm_session_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cm_session_participants_insert_all" ON cm_session_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cm_session_participants_update_all" ON cm_session_participants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON cm_session_participants TO authenticated;

-- ================================================================
-- cm_cards - Allow authenticated users full access
-- ================================================================

DROP POLICY IF EXISTS "cm_cards_select_policy" ON cm_cards;
DROP POLICY IF EXISTS "cm_cards_insert_policy" ON cm_cards;
DROP POLICY IF EXISTS "cm_cards_update_policy" ON cm_cards;

CREATE POLICY "cm_cards_select_all" ON cm_cards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cm_cards_insert_all" ON cm_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cm_cards_update_all" ON cm_cards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON cm_cards TO authenticated;

-- ================================================================
-- cm_moves - Allow authenticated users to read and insert
-- ================================================================

DROP POLICY IF EXISTS "cm_moves_select_policy" ON cm_moves;
DROP POLICY IF EXISTS "cm_moves_insert_policy" ON cm_moves;

CREATE POLICY "cm_moves_select_all" ON cm_moves
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cm_moves_insert_all" ON cm_moves
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

GRANT SELECT, INSERT ON cm_moves TO authenticated;

-- ================================================================
-- cm_perpetual_rooms - Allow UPDATE for game state changes
-- ================================================================

DROP POLICY IF EXISTS "cm_perpetual_rooms_update_policy" ON cm_perpetual_rooms;

CREATE POLICY "cm_perpetual_rooms_update_all" ON cm_perpetual_rooms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT UPDATE ON cm_perpetual_rooms TO authenticated;

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match RLS Policies Updated!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   cm_perpetual_rooms: SELECT, UPDATE';
    RAISE NOTICE '   cm_game_sessions: SELECT, INSERT, UPDATE';
    RAISE NOTICE '   cm_session_participants: SELECT, INSERT, UPDATE';
    RAISE NOTICE '   cm_cards: SELECT, INSERT, UPDATE';
    RAISE NOTICE '   cm_moves: SELECT, INSERT';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   All authenticated users have full access';
    RAISE NOTICE '';
END $$;
