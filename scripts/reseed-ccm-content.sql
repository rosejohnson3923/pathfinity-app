-- =====================================================
-- CCM Content RE-SEEDING Script
-- Clears old content and seeds fresh updated content
-- Created: October 19, 2025
-- =====================================================

\echo ''
\echo '⚠️  WARNING: This will DELETE all existing CCM content!'
\echo 'Press Ctrl+C to cancel, or any key to continue...'
\echo ''

-- Clear existing content in reverse dependency order
DELETE FROM ccm_round_submissions;
DELETE FROM ccm_session_participants;
DELETE FROM ccm_game_sessions;
DELETE FROM ccm_perpetual_rooms;
DELETE FROM ccm_synergy_cards;
DELETE FROM ccm_role_cards;
DELETE FROM ccm_challenge_cards;

\echo '🗑️  Old content cleared'
\echo ''
\echo '📦 Seeding fresh content...'
\echo ''

-- Now run the full seed script
\i /mnt/c/Users/rosej/Documents/Projects/pathfinity-app/scripts/seed-ccm-content.sql
