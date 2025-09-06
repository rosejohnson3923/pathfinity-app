/*
  # Sample Data for Development

  1. Sample Data
    - Create sample tenant
    - Create sample users
    - Create sample subjects
    - Create sample achievements
    - Create sample progress data

  2. Note
    - This is for development/demo purposes only
    - Should not be run in production
*/

-- Insert sample tenant
INSERT INTO tenants (id, name, slug, domain, subscription_tier, max_users) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Riverside Elementary School', 'riverside-elementary', 'riverside.pathfinity.com', 'premium', 500)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample subjects for the tenant
INSERT INTO subjects (tenant_id, name, code, grade_levels, description, color, icon) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Mathematics', 'MATH', ARRAY['K','1','2','3','4','5','6'], 'Core mathematics curriculum', '#3B82F6', 'calculator'),
('550e8400-e29b-41d4-a716-446655440000', 'English Language Arts', 'ELA', ARRAY['K','1','2','3','4','5','6'], 'Reading, writing, and language skills', '#10B981', 'book-open'),
('550e8400-e29b-41d4-a716-446655440000', 'Science', 'SCI', ARRAY['K','1','2','3','4','5','6'], 'Scientific inquiry and discovery', '#8B5CF6', 'microscope'),
('550e8400-e29b-41d4-a716-446655440000', 'Social Studies', 'SS', ARRAY['K','1','2','3','4','5','6'], 'History, geography, and civics', '#F59E0B', 'globe'),
('550e8400-e29b-41d4-a716-446655440000', 'Spanish', 'SPAN', ARRAY['7','8','9','10','11','12'], 'Spanish language learning', '#EF4444', 'languages')
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (tenant_id, title, description, icon, category, rarity, points_value, criteria) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Math Master', 'Completed 100 math problems', 'calculator', 'academic', 'epic', 500, '{"type": "lesson_completion", "subject": "MATH", "count": 100}'),
('550e8400-e29b-41d4-a716-446655440000', 'Team Player', 'Collaborated on 5 projects', 'users', 'collaboration', 'rare', 300, '{"type": "project_collaboration", "count": 5}'),
('550e8400-e29b-41d4-a716-446655440000', 'Creative Genius', 'Created 10 presentations', 'palette', 'creativity', 'legendary', 1000, '{"type": "creative_assets", "count": 10}'),
('550e8400-e29b-41d4-a716-446655440000', 'Streak Champion', 'Maintained 14-day learning streak', 'flame', 'consistency', 'rare', 400, '{"type": "streak", "days": 14}'),
('550e8400-e29b-41d4-a716-446655440000', 'First Steps', 'Completed your first lesson', 'star', 'academic', 'common', 50, '{"type": "lesson_completion", "count": 1}'),
('550e8400-e29b-41d4-a716-446655440000', 'Social Butterfly', 'Joined 3 study groups', 'message-circle', 'collaboration', 'common', 100, '{"type": "group_participation", "count": 3}')
ON CONFLICT DO NOTHING;

-- Insert sample rewards
INSERT INTO rewards (tenant_id, title, description, reward_type, points_cost, quantity_available) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Extra Recess Time', '10 minutes of additional recess', 'privilege', 200, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'Homework Pass', 'Skip one homework assignment', 'privilege', 500, 50),
('550e8400-e29b-41d4-a716-446655440000', 'Class Helper Badge', 'Be the teacher''s helper for a day', 'recognition', 300, 10),
('550e8400-e29b-41d4-a716-446655440000', 'Library VIP Pass', 'First pick of new books', 'privilege', 150, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'Principal''s Office Visit', 'Positive visit to share achievements', 'experience', 1000, 5)
ON CONFLICT DO NOTHING;

-- Insert sample leaderboards
INSERT INTO leaderboards (tenant_id, name, description, leaderboard_type, scope, time_period) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Top Learners', 'Students with the most points this month', 'points', 'tenant', 'monthly'),
('550e8400-e29b-41d4-a716-446655440000', 'Achievement Hunters', 'Students with the most achievements', 'achievements', 'tenant', 'all_time'),
('550e8400-e29b-41d4-a716-446655440000', 'Streak Masters', 'Longest learning streaks', 'streaks', 'tenant', 'all_time'),
('550e8400-e29b-41d4-a716-446655440000', 'Math Champions', 'Top performers in mathematics', 'points', 'subject', 'semester'),
('550e8400-e29b-41d4-a716-446655440000', 'Collaboration Stars', 'Most active project collaborators', 'collaboration', 'tenant', 'monthly')
ON CONFLICT DO NOTHING;

-- Note: User profiles and progress data should be created through the application
-- as they require proper authentication and tenant association