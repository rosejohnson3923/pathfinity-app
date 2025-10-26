-- Check if cards were actually created for the session
SELECT COUNT(*) as card_count
FROM cm_cards
WHERE game_session_id = 'e5742dcc-5d1e-445e-8275-b0a0c4fb9d1b';

-- Also check what's in the cards table
SELECT
  game_session_id,
  COUNT(*) as card_count,
  MAX(created_at) as last_created
FROM cm_cards
GROUP BY game_session_id
ORDER BY last_created DESC
LIMIT 5;
