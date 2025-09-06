| table_name              | column_name                | data_type                | is_nullable | column_default        |
| ----------------------- | -------------------------- | ------------------------ | ----------- | --------------------- |
| achievements            | id                         | uuid                     | NO          | gen_random_uuid()     |
| achievements            | tenant_id                  | uuid                     | NO          | null                  |
| achievements            | title                      | text                     | NO          | null                  |
| achievements            | description                | text                     | NO          | null                  |
| achievements            | icon                       | text                     | NO          | null                  |
| achievements            | category                   | text                     | NO          | null                  |
| achievements            | rarity                     | text                     | YES         | 'common'::text        |
| achievements            | points_value               | integer                  | YES         | 0                     |
| achievements            | criteria                   | jsonb                    | NO          | null                  |
| achievements            | is_active                  | boolean                  | YES         | true                  |
| achievements            | is_repeatable              | boolean                  | YES         | false                 |
| achievements            | max_times_earnable         | integer                  | YES         | 1                     |
| achievements            | created_at                 | timestamp with time zone | YES         | now()                 |
| achievements            | updated_at                 | timestamp with time zone | YES         | now()                 |
| assessments             | id                         | uuid                     | NO          | gen_random_uuid()     |
| assessments             | tenant_id                  | uuid                     | NO          | null                  |
| assessments             | student_id                 | uuid                     | NO          | null                  |
| assessments             | skills_topic_id            | uuid                     | YES         | null                  |
| assessments             | assessment_type            | text                     | NO          | null                  |
| assessments             | questions                  | jsonb                    | NO          | null                  |
| assessments             | responses                  | jsonb                    | YES         | null                  |
| assessments             | score_percentage           | integer                  | YES         | null                  |
| assessments             | mastery_demonstrated       | text                     | YES         | null                  |
| assessments             | time_taken_minutes         | integer                  | YES         | null                  |
| assessments             | started_at                 | timestamp with time zone | YES         | null                  |
| assessments             | completed_at               | timestamp with time zone | YES         | null                  |
| assessments             | status                     | text                     | YES         | 'not_started'::text   |
| assessments             | created_at                 | timestamp with time zone | YES         | now()                 |
| assessments             | updated_at                 | timestamp with time zone | YES         | now()                 |
| collaboration_spaces    | id                         | uuid                     | NO          | gen_random_uuid()     |
| collaboration_spaces    | tenant_id                  | uuid                     | NO          | null                  |
| collaboration_spaces    | project_id                 | uuid                     | NO          | null                  |
| collaboration_spaces    | name                       | text                     | NO          | null                  |
| collaboration_spaces    | description                | text                     | YES         | null                  |
| collaboration_spaces    | space_type                 | text                     | NO          | null                  |
| collaboration_spaces    | content                    | jsonb                    | YES         | '{}'::jsonb           |
| collaboration_spaces    | settings                   | jsonb                    | YES         | '{}'::jsonb           |
| collaboration_spaces    | last_activity_at           | timestamp with time zone | YES         | now()                 |
| collaboration_spaces    | is_archived                | boolean                  | YES         | false                 |
| collaboration_spaces    | created_at                 | timestamp with time zone | YES         | now()                 |
| collaboration_spaces    | updated_at                 | timestamp with time zone | YES         | now()                 |
| content_library         | id                         | uuid                     | NO          | gen_random_uuid()     |
| content_library         | tenant_id                  | uuid                     | NO          | null                  |
| content_library         | creator_id                 | uuid                     | NO          | null                  |
| content_library         | title                      | text                     | NO          | null                  |
| content_library         | description                | text                     | YES         | null                  |
| content_library         | content_type               | text                     | NO          | null                  |
| content_library         | subject_areas              | ARRAY                    | YES         | null                  |
| content_library         | grade_levels               | ARRAY                    | YES         | null                  |
| content_library         | difficulty_level           | integer                  | YES         | 1                     |
| content_library         | content_data               | jsonb                    | NO          | null                  |
| content_library         | metadata                   | jsonb                    | YES         | '{}'::jsonb           |
| content_library         | file_urls                  | ARRAY                    | YES         | null                  |
| content_library         | thumbnail_url              | text                     | YES         | null                  |
| content_library         | duration_minutes           | integer                  | YES         | null                  |
| content_library         | language                   | text                     | YES         | 'en'::text            |
| content_library         | accessibility_features     | ARRAY                    | YES         | null                  |
| content_library         | usage_rights               | text                     | YES         | 'internal'::text      |
| content_library         | view_count                 | integer                  | YES         | 0                     |
| content_library         | rating_average             | numeric                  | YES         | 0.0                   |
| content_library         | rating_count               | integer                  | YES         | 0                     |
| content_library         | is_published               | boolean                  | YES         | false                 |
| content_library         | published_at               | timestamp with time zone | YES         | null                  |
| content_library         | created_at                 | timestamp with time zone | YES         | now()                 |
| content_library         | updated_at                 | timestamp with time zone | YES         | now()                 |
| creative_assets         | id                         | uuid                     | NO          | gen_random_uuid()     |
| creative_assets         | tenant_id                  | uuid                     | NO          | null                  |
| creative_assets         | creator_id                 | uuid                     | NO          | null                  |
| creative_assets         | project_id                 | uuid                     | YES         | null                  |
| creative_assets         | title                      | text                     | NO          | null                  |
| creative_assets         | description                | text                     | YES         | null                  |
| creative_assets         | asset_type                 | text                     | NO          | null                  |
| creative_assets         | design_data                | jsonb                    | NO          | null                  |
| creative_assets         | preview_url                | text                     | YES         | null                  |
| creative_assets         | export_urls                | jsonb                    | YES         | '{}'::jsonb           |
| creative_assets         | template_category          | text                     | YES         | null                  |
| creative_assets         | is_template                | boolean                  | YES         | false                 |
| creative_assets         | is_public                  | boolean                  | YES         | false                 |
| creative_assets         | view_count                 | integer                  | YES         | 0                     |
| creative_assets         | like_count                 | integer                  | YES         | 0                     |
| creative_assets         | fork_count                 | integer                  | YES         | 0                     |
| creative_assets         | version                    | integer                  | YES         | 1                     |
| creative_assets         | parent_asset_id            | uuid                     | YES         | null                  |
| creative_assets         | created_at                 | timestamp with time zone | YES         | now()                 |
| creative_assets         | updated_at                 | timestamp with time zone | YES         | now()                 |
| daily_assignments       | id                         | uuid                     | NO          | gen_random_uuid()     |
| daily_assignments       | student_id                 | text                     | NO          | null                  |
| daily_assignments       | assignment_date            | date                     | NO          | null                  |
| daily_assignments       | skill_id                   | uuid                     | NO          | null                  |
| daily_assignments       | subject                    | text                     | NO          | null                  |
| daily_assignments       | estimated_time_minutes     | integer                  | NO          | null                  |
| daily_assignments       | assigned_tool              | text                     | NO          | null                  |
| daily_assignments       | status                     | text                     | NO          | 'assigned'::text      |
| daily_assignments       | created_at                 | timestamp with time zone | YES         | now()                 |
| leaderboard_rankings    | user_id                    | uuid                     | YES         | null                  |
| leaderboard_rankings    | tenant_id                  | uuid                     | YES         | null                  |
| leaderboard_rankings    | full_name                  | text                     | YES         | null                  |
| leaderboard_rankings    | avatar_url                 | text                     | YES         | null                  |
| leaderboard_rankings    | grade_level                | text                     | YES         | null                  |
| leaderboard_rankings    | total_points               | bigint                   | YES         | null                  |
| leaderboard_rankings    | total_achievements         | bigint                   | YES         | null                  |
| leaderboard_rankings    | longest_streak             | integer                  | YES         | null                  |
| leaderboard_rankings    | points_rank                | bigint                   | YES         | null                  |
| leaderboard_rankings    | achievements_rank          | bigint                   | YES         | null                  |
| leaderboard_rankings    | streak_rank                | bigint                   | YES         | null                  |
| leaderboards            | id                         | uuid                     | NO          | gen_random_uuid()     |
| leaderboards            | tenant_id                  | uuid                     | NO          | null                  |
| leaderboards            | name                       | text                     | NO          | null                  |
| leaderboards            | description                | text                     | YES         | null                  |
| leaderboards            | leaderboard_type           | text                     | NO          | null                  |
| leaderboards            | scope                      | text                     | YES         | 'tenant'::text        |
| leaderboards            | scope_filter               | jsonb                    | YES         | '{}'::jsonb           |
| leaderboards            | time_period                | text                     | YES         | 'all_time'::text      |
| leaderboards            | max_entries                | integer                  | YES         | 100                   |
| leaderboards            | is_active                  | boolean                  | YES         | true                  |
| leaderboards            | created_at                 | timestamp with time zone | YES         | now()                 |
| leaderboards            | updated_at                 | timestamp with time zone | YES         | now()                 |
| learning_paths          | id                         | uuid                     | NO          | gen_random_uuid()     |
| learning_paths          | tenant_id                  | uuid                     | NO          | null                  |
| learning_paths          | student_id                 | uuid                     | NO          | null                  |
| learning_paths          | subject_id                 | uuid                     | NO          | null                  |
| learning_paths          | path_sequence              | ARRAY                    | NO          | null                  |
| learning_paths          | current_position           | integer                  | YES         | 0                     |
| learning_paths          | adaptive_adjustments       | jsonb                    | YES         | '{}'::jsonb           |
| learning_paths          | generated_at               | timestamp with time zone | YES         | now()                 |
| learning_paths          | last_updated               | timestamp with time zone | YES         | now()                 |
| learning_paths          | is_active                  | boolean                  | YES         | true                  |
| learning_paths          | created_at                 | timestamp with time zone | YES         | now()                 |
| learning_paths          | updated_at                 | timestamp with time zone | YES         | now()                 |
| lesson_plans            | id                         | uuid                     | NO          | gen_random_uuid()     |
| lesson_plans            | tenant_id                  | uuid                     | NO          | null                  |
| lesson_plans            | student_id                 | uuid                     | NO          | null                  |
| lesson_plans            | skills_topic_id            | uuid                     | NO          | null                  |
| lesson_plans            | lesson_type                | text                     | NO          | null                  |
| lesson_plans            | content                    | jsonb                    | NO          | null                  |
| lesson_plans            | difficulty_adjustment      | integer                  | YES         | 0                     |
| lesson_plans            | estimated_duration_minutes | integer                  | YES         | 30                    |
| lesson_plans            | scheduled_date             | date                     | NO          | null                  |
| lesson_plans            | status                     | text                     | YES         | 'scheduled'::text     |
| lesson_plans            | completion_percentage      | integer                  | YES         | 0                     |
| lesson_plans            | time_spent_minutes         | integer                  | YES         | 0                     |
| lesson_plans            | created_at                 | timestamp with time zone | YES         | now()                 |
| lesson_plans            | updated_at                 | timestamp with time zone | YES         | now()                 |
| live_sessions           | id                         | uuid                     | NO          | gen_random_uuid()     |
| live_sessions           | tenant_id                  | uuid                     | NO          | null                  |
| live_sessions           | host_id                    | uuid                     | NO          | null                  |
| live_sessions           | title                      | text                     | NO          | null                  |
| live_sessions           | description                | text                     | YES         | null                  |
| live_sessions           | session_type               | text                     | YES         | 'class'::text         |
| live_sessions           | subject_area               | text                     | YES         | null                  |
| live_sessions           | grade_level                | text                     | YES         | null                  |
| live_sessions           | max_participants           | integer                  | YES         | 50                    |
| live_sessions           | scheduled_start            | timestamp with time zone | NO          | null                  |
| live_sessions           | scheduled_end              | timestamp with time zone | NO          | null                  |
| live_sessions           | actual_start               | timestamp with time zone | YES         | null                  |
| live_sessions           | actual_end                 | timestamp with time zone | YES         | null                  |
| live_sessions           | meeting_url                | text                     | YES         | null                  |
| live_sessions           | meeting_id                 | text                     | YES         | null                  |
| live_sessions           | passcode                   | text                     | YES         | null                  |
| live_sessions           | settings                   | jsonb                    | YES         | '{}'::jsonb           |
| live_sessions           | status                     | text                     | YES         | 'scheduled'::text     |
| live_sessions           | recording_url              | text                     | YES         | null                  |
| live_sessions           | attendance_count           | integer                  | YES         | 0                     |
| live_sessions           | created_at                 | timestamp with time zone | YES         | now()                 |
| live_sessions           | updated_at                 | timestamp with time zone | YES         | now()                 |
| mastery_groups          | id                         | uuid                     | NO          | gen_random_uuid()     |
| mastery_groups          | tenant_id                  | uuid                     | NO          | null                  |
| mastery_groups          | subject_id                 | uuid                     | NO          | null                  |
| mastery_groups          | name                       | text                     | NO          | null                  |
| mastery_groups          | description                | text                     | YES         | null                  |
| mastery_groups          | grade_level                | text                     | NO          | null                  |
| mastery_groups          | sequence_order             | integer                  | NO          | 1                     |
| mastery_groups          | prerequisites              | ARRAY                    | YES         | null                  |
| mastery_groups          | created_at                 | timestamp with time zone | YES         | now()                 |
| mastery_groups          | updated_at                 | timestamp with time zone | YES         | now()                 |
| media_files             | id                         | uuid                     | NO          | gen_random_uuid()     |
| media_files             | tenant_id                  | uuid                     | NO          | null                  |
| media_files             | uploader_id                | uuid                     | NO          | null                  |
| media_files             | filename                   | text                     | NO          | null                  |
| media_files             | original_filename          | text                     | NO          | null                  |
| media_files             | file_type                  | text                     | NO          | null                  |
| media_files             | file_size_bytes            | bigint                   | NO          | null                  |
| media_files             | storage_path               | text                     | NO          | null                  |
| media_files             | public_url                 | text                     | YES         | null                  |
| media_files             | thumbnail_url              | text                     | YES         | null                  |
| media_files             | metadata                   | jsonb                    | YES         | '{}'::jsonb           |
| media_files             | processing_status          | text                     | YES         | 'pending'::text       |
| media_files             | virus_scan_status          | text                     | YES         | 'pending'::text       |
| media_files             | access_level               | text                     | YES         | 'private'::text       |
| media_files             | download_count             | integer                  | YES         | 0                     |
| media_files             | created_at                 | timestamp with time zone | YES         | now()                 |
| media_files             | updated_at                 | timestamp with time zone | YES         | now()                 |
| mentorships             | id                         | uuid                     | NO          | gen_random_uuid()     |
| mentorships             | tenant_id                  | uuid                     | NO          | null                  |
| mentorships             | project_id                 | uuid                     | YES         | null                  |
| mentorships             | mentor_id                  | uuid                     | NO          | null                  |
| mentorships             | mentee_id                  | uuid                     | NO          | null                  |
| mentorships             | subject_area               | text                     | NO          | null                  |
| mentorships             | mentorship_type            | text                     | YES         | 'project'::text       |
| mentorships             | goals                      | ARRAY                    | YES         | null                  |
| mentorships             | meeting_schedule           | text                     | YES         | null                  |
| mentorships             | status                     | text                     | YES         | 'active'::text        |
| mentorships             | start_date                 | date                     | YES         | CURRENT_DATE          |
| mentorships             | end_date                   | date                     | YES         | null                  |
| mentorships             | feedback_rating            | integer                  | YES         | null                  |
| mentorships             | created_at                 | timestamp with time zone | YES         | now()                 |
| mentorships             | updated_at                 | timestamp with time zone | YES         | now()                 |
| peer_reviews            | id                         | uuid                     | NO          | gen_random_uuid()     |
| peer_reviews            | tenant_id                  | uuid                     | NO          | null                  |
| peer_reviews            | project_id                 | uuid                     | NO          | null                  |
| peer_reviews            | reviewer_id                | uuid                     | NO          | null                  |
| peer_reviews            | reviewee_id                | uuid                     | NO          | null                  |
| peer_reviews            | submission_id              | uuid                     | YES         | null                  |
| peer_reviews            | criteria                   | jsonb                    | NO          | null                  |
| peer_reviews            | scores                     | jsonb                    | NO          | null                  |
| peer_reviews            | comments                   | text                     | YES         | null                  |
| peer_reviews            | overall_rating             | integer                  | YES         | null                  |
| peer_reviews            | is_anonymous               | boolean                  | YES         | true                  |
| peer_reviews            | submitted_at               | timestamp with time zone | YES         | now()                 |
| peer_reviews            | created_at                 | timestamp with time zone | YES         | now()                 |
| peer_reviews            | updated_at                 | timestamp with time zone | YES         | now()                 |
| points_transactions     | id                         | uuid                     | NO          | gen_random_uuid()     |
| points_transactions     | tenant_id                  | uuid                     | NO          | null                  |
| points_transactions     | user_id                    | uuid                     | NO          | null                  |
| points_transactions     | transaction_type           | text                     | NO          | null                  |
| points_transactions     | points_amount              | integer                  | NO          | null                  |
| points_transactions     | source_type                | text                     | NO          | null                  |
| points_transactions     | source_id                  | uuid                     | YES         | null                  |
| points_transactions     | description                | text                     | NO          | null                  |
| points_transactions     | metadata                   | jsonb                    | YES         | '{}'::jsonb           |
| points_transactions     | created_at                 | timestamp with time zone | YES         | now()                 |
| project_members         | id                         | uuid                     | NO          | gen_random_uuid()     |
| project_members         | tenant_id                  | uuid                     | NO          | null                  |
| project_members         | project_id                 | uuid                     | NO          | null                  |
| project_members         | user_id                    | uuid                     | NO          | null                  |
| project_members         | role                       | text                     | YES         | 'member'::text        |
| project_members         | joined_at                  | timestamp with time zone | YES         | now()                 |
| project_members         | contribution_score         | integer                  | YES         | 0                     |
| project_members         | status                     | text                     | YES         | 'active'::text        |
| project_members         | created_at                 | timestamp with time zone | YES         | now()                 |
| project_members         | updated_at                 | timestamp with time zone | YES         | now()                 |
| project_submissions     | id                         | uuid                     | NO          | gen_random_uuid()     |
| project_submissions     | tenant_id                  | uuid                     | NO          | null                  |
| project_submissions     | project_id                 | uuid                     | NO          | null                  |
| project_submissions     | submitter_id               | uuid                     | NO          | null                  |
| project_submissions     | title                      | text                     | NO          | null                  |
| project_submissions     | description                | text                     | YES         | null                  |
| project_submissions     | submission_type            | text                     | NO          | null                  |
| project_submissions     | content                    | jsonb                    | NO          | null                  |
| project_submissions     | feedback                   | jsonb                    | YES         | '{}'::jsonb           |
| project_submissions     | grade_percentage           | integer                  | YES         | null                  |
| project_submissions     | submitted_at               | timestamp with time zone | YES         | now()                 |
| project_submissions     | reviewed_at                | timestamp with time zone | YES         | null                  |
| project_submissions     | status                     | text                     | YES         | 'submitted'::text     |
| project_submissions     | created_at                 | timestamp with time zone | YES         | now()                 |
| project_submissions     | updated_at                 | timestamp with time zone | YES         | now()                 |
| projects                | id                         | uuid                     | NO          | gen_random_uuid()     |
| projects                | tenant_id                  | uuid                     | NO          | null                  |
| projects                | creator_id                 | uuid                     | NO          | null                  |
| projects                | title                      | text                     | NO          | null                  |
| projects                | description                | text                     | YES         | null                  |
| projects                | project_type               | text                     | YES         | 'collaborative'::text |
| projects                | subject_areas              | ARRAY                    | YES         | null                  |
| projects                | difficulty_level           | integer                  | YES         | 1                     |
| projects                | estimated_duration_days    | integer                  | YES         | 7                     |
| projects                | max_team_size              | integer                  | YES         | 4                     |
| projects                | skills_required            | ARRAY                    | YES         | null                  |
| projects                | skills_gained              | ARRAY                    | YES         | null                  |
| projects                | resources                  | jsonb                    | YES         | '{}'::jsonb           |
| projects                | rubric                     | jsonb                    | YES         | null                  |
| projects                | status                     | text                     | YES         | 'draft'::text         |
| projects                | start_date                 | date                     | YES         | null                  |
| projects                | due_date                   | date                     | YES         | null                  |
| projects                | is_template                | boolean                  | YES         | false                 |
| projects                | template_category          | text                     | YES         | null                  |
| projects                | created_at                 | timestamp with time zone | YES         | now()                 |
| projects                | updated_at                 | timestamp with time zone | YES         | now()                 |
| recordings              | id                         | uuid                     | NO          | gen_random_uuid()     |
| recordings              | tenant_id                  | uuid                     | NO          | null                  |
| recordings              | session_id                 | uuid                     | YES         | null                  |
| recordings              | creator_id                 | uuid                     | NO          | null                  |
| recordings              | title                      | text                     | NO          | null                  |
| recordings              | description                | text                     | YES         | null                  |
| recordings              | recording_type             | text                     | NO          | null                  |
| recordings              | file_url                   | text                     | NO          | null                  |
| recordings              | thumbnail_url              | text                     | YES         | null                  |
| recordings              | duration_minutes           | integer                  | YES         | null                  |
| recordings              | file_size_bytes            | bigint                   | YES         | null                  |
| recordings              | transcript_url             | text                     | YES         | null                  |
| recordings              | captions_url               | text                     | YES         | null                  |
| recordings              | chapters                   | jsonb                    | YES         | '[]'::jsonb           |
| recordings              | view_count                 | integer                  | YES         | 0                     |
| recordings              | access_level               | text                     | YES         | 'private'::text       |
| recordings              | processing_status          | text                     | YES         | 'pending'::text       |
| recordings              | created_at                 | timestamp with time zone | YES         | now()                 |
| recordings              | updated_at                 | timestamp with time zone | YES         | now()                 |
| rewards                 | id                         | uuid                     | NO          | gen_random_uuid()     |
| rewards                 | tenant_id                  | uuid                     | NO          | null                  |
| rewards                 | title                      | text                     | NO          | null                  |
| rewards                 | description                | text                     | NO          | null                  |
| rewards                 | reward_type                | text                     | NO          | null                  |
| rewards                 | points_cost                | integer                  | NO          | null                  |
| rewards                 | quantity_available         | integer                  | YES         | null                  |
| rewards                 | quantity_redeemed          | integer                  | YES         | 0                     |
| rewards                 | is_active                  | boolean                  | YES         | true                  |
| rewards                 | valid_from                 | date                     | YES         | CURRENT_DATE          |
| rewards                 | valid_until                | date                     | YES         | null                  |
| rewards                 | redemption_instructions    | text                     | YES         | null                  |
| rewards                 | metadata                   | jsonb                    | YES         | '{}'::jsonb           |
| rewards                 | created_at                 | timestamp with time zone | YES         | now()                 |
| rewards                 | updated_at                 | timestamp with time zone | YES         | now()                 |
| session_participants    | id                         | uuid                     | NO          | gen_random_uuid()     |
| session_participants    | tenant_id                  | uuid                     | NO          | null                  |
| session_participants    | session_id                 | uuid                     | NO          | null                  |
| session_participants    | user_id                    | uuid                     | NO          | null                  |
| session_participants    | role                       | text                     | YES         | 'participant'::text   |
| session_participants    | joined_at                  | timestamp with time zone | YES         | null                  |
| session_participants    | left_at                    | timestamp with time zone | YES         | null                  |
| session_participants    | duration_minutes           | integer                  | YES         | 0                     |
| session_participants    | participation_score        | integer                  | YES         | 0                     |
| session_participants    | created_at                 | timestamp with time zone | YES         | now()                 |
| session_participants    | updated_at                 | timestamp with time zone | YES         | now()                 |
| skills_master           | id                         | uuid                     | NO          | gen_random_uuid()     |
| skills_master           | subject                    | text                     | NO          | null                  |
| skills_master           | grade                      | text                     | NO          | null                  |
| skills_master           | skills_area                | text                     | NO          | null                  |
| skills_master           | skills_cluster             | text                     | NO          | null                  |
| skills_master           | skill_number               | text                     | NO          | null                  |
| skills_master           | skill_name                 | text                     | NO          | null                  |
| skills_master           | skill_description          | text                     | YES         | null                  |
| skills_master           | difficulty_level           | integer                  | NO          | null                  |
| skills_master           | estimated_time_minutes     | integer                  | NO          | null                  |
| skills_master           | prerequisites              | ARRAY                    | YES         | null                  |
| skills_master           | created_at                 | timestamp with time zone | YES         | now()                 |
| skills_master           | updated_at                 | timestamp with time zone | YES         | now()                 |
| skills_topics           | id                         | uuid                     | NO          | gen_random_uuid()     |
| skills_topics           | tenant_id                  | uuid                     | NO          | null                  |
| skills_topics           | mastery_group_id           | uuid                     | NO          | null                  |
| skills_topics           | name                       | text                     | NO          | null                  |
| skills_topics           | description                | text                     | YES         | null                  |
| skills_topics           | learning_objectives        | ARRAY                    | YES         | null                  |
| skills_topics           | difficulty_level           | integer                  | YES         | 1                     |
| skills_topics           | estimated_duration_minutes | integer                  | YES         | 30                    |
| skills_topics           | sequence_order             | integer                  | NO          | 1                     |
| skills_topics           | created_at                 | timestamp with time zone | YES         | now()                 |
| skills_topics           | updated_at                 | timestamp with time zone | YES         | now()                 |
| streaks                 | id                         | uuid                     | NO          | gen_random_uuid()     |
| streaks                 | tenant_id                  | uuid                     | NO          | null                  |
| streaks                 | user_id                    | uuid                     | NO          | null                  |
| streaks                 | streak_type                | text                     | NO          | null                  |
| streaks                 | subject_id                 | uuid                     | YES         | null                  |
| streaks                 | current_count              | integer                  | YES         | 0                     |
| streaks                 | longest_count              | integer                  | YES         | 0                     |
| streaks                 | last_activity_date         | date                     | YES         | null                  |
| streaks                 | streak_start_date          | date                     | YES         | null                  |
| streaks                 | is_active                  | boolean                  | YES         | true                  |
| streaks                 | created_at                 | timestamp with time zone | YES         | now()                 |
| streaks                 | updated_at                 | timestamp with time zone | YES         | now()                 |
| student_profiles        | id                         | uuid                     | NO          | gen_random_uuid()     |
| student_profiles        | user_id                    | uuid                     | NO          | null                  |
| student_profiles        | first_name                 | text                     | NO          | null                  |
| student_profiles        | last_name                  | text                     | NO          | null                  |
| student_profiles        | display_name               | text                     | NO          | null                  |
| student_profiles        | grade_level                | text                     | NO          | null                  |
| student_profiles        | date_of_birth              | date                     | YES         | null                  |
| student_profiles        | enrollment_date            | date                     | NO          | CURRENT_DATE          |
| student_profiles        | learning_preferences       | jsonb                    | YES         | '{}'::jsonb           |
| student_profiles        | parent_email               | text                     | YES         | null                  |
| student_profiles        | school_id                  | text                     | YES         | null                  |
| student_profiles        | is_active                  | boolean                  | NO          | true                  |
| student_profiles        | created_at                 | timestamp with time zone | YES         | now()                 |
| student_profiles        | updated_at                 | timestamp with time zone | YES         | now()                 |
| student_progress        | id                         | uuid                     | NO          | gen_random_uuid()     |
| student_progress        | tenant_id                  | uuid                     | NO          | null                  |
| student_progress        | student_id                 | uuid                     | NO          | null                  |
| student_progress        | subject_id                 | uuid                     | NO          | null                  |
| student_progress        | mastery_group_id           | uuid                     | YES         | null                  |
| student_progress        | skills_topic_id            | uuid                     | YES         | null                  |
| student_progress        | mastery_level              | text                     | NO          | 'does-not-meet'::text |
| student_progress        | progress_percentage        | integer                  | YES         | 0                     |
| student_progress        | streak_days                | integer                  | YES         | 0                     |
| student_progress        | last_activity_date         | date                     | YES         | null                  |
| student_progress        | total_time_spent_minutes   | integer                  | YES         | 0                     |
| student_progress        | lessons_completed          | integer                  | YES         | 0                     |
| student_progress        | assessments_passed         | integer                  | YES         | 0                     |
| student_progress        | created_at                 | timestamp with time zone | YES         | now()                 |
| student_progress        | updated_at                 | timestamp with time zone | YES         | now()                 |
| student_skill_progress  | id                         | uuid                     | NO          | gen_random_uuid()     |
| student_skill_progress  | student_id                 | text                     | NO          | null                  |
| student_skill_progress  | skill_id                   | uuid                     | NO          | null                  |
| student_skill_progress  | status                     | text                     | NO          | 'not_started'::text   |
| student_skill_progress  | attempts                   | integer                  | YES         | 0                     |
| student_skill_progress  | score                      | numeric                  | YES         | null                  |
| student_skill_progress  | time_spent_minutes         | integer                  | YES         | 0                     |
| student_skill_progress  | completed_at               | timestamp with time zone | YES         | null                  |
| student_skill_progress  | created_at                 | timestamp with time zone | YES         | now()                 |
| student_skill_progress  | updated_at                 | timestamp with time zone | YES         | now()                 |
| subjects                | id                         | uuid                     | NO          | gen_random_uuid()     |
| subjects                | tenant_id                  | uuid                     | NO          | null                  |
| subjects                | name                       | text                     | NO          | null                  |
| subjects                | code                       | text                     | NO          | null                  |
| subjects                | grade_levels               | ARRAY                    | NO          | null                  |
| subjects                | description                | text                     | YES         | null                  |
| subjects                | color                      | text                     | YES         | '#3B82F6'::text       |
| subjects                | icon                       | text                     | YES         | 'book-open'::text     |
| subjects                | is_active                  | boolean                  | YES         | true                  |
| subjects                | created_at                 | timestamp with time zone | YES         | now()                 |
| subjects                | updated_at                 | timestamp with time zone | YES         | now()                 |
| tenants                 | id                         | uuid                     | NO          | gen_random_uuid()     |
| tenants                 | name                       | text                     | NO          | null                  |
| tenants                 | slug                       | text                     | NO          | null                  |
| tenants                 | domain                     | text                     | YES         | null                  |
| tenants                 | settings                   | jsonb                    | YES         | '{}'::jsonb           |
| tenants                 | subscription_tier          | text                     | YES         | 'basic'::text         |
| tenants                 | max_users                  | integer                  | YES         | 100                   |
| tenants                 | created_at                 | timestamp with time zone | YES         | now()                 |
| tenants                 | updated_at                 | timestamp with time zone | YES         | now()                 |
| user_achievements       | id                         | uuid                     | NO          | gen_random_uuid()     |
| user_achievements       | tenant_id                  | uuid                     | NO          | null                  |
| user_achievements       | user_id                    | uuid                     | NO          | null                  |
| user_achievements       | achievement_id             | uuid                     | NO          | null                  |
| user_achievements       | earned_at                  | timestamp with time zone | YES         | now()                 |
| user_achievements       | progress_data              | jsonb                    | YES         | '{}'::jsonb           |
| user_achievements       | times_earned               | integer                  | YES         | 1                     |
| user_achievements       | created_at                 | timestamp with time zone | YES         | now()                 |
| user_achievements       | updated_at                 | timestamp with time zone | YES         | now()                 |
| user_points_balance     | user_id                    | uuid                     | YES         | null                  |
| user_points_balance     | tenant_id                  | uuid                     | YES         | null                  |
| user_points_balance     | total_points               | bigint                   | YES         | null                  |
| user_points_balance     | points_earned              | bigint                   | YES         | null                  |
| user_points_balance     | points_spent               | bigint                   | YES         | null                  |
| user_profiles           | id                         | uuid                     | NO          | null                  |
| user_profiles           | tenant_id                  | uuid                     | NO          | null                  |
| user_profiles           | email                      | text                     | NO          | null                  |
| user_profiles           | full_name                  | text                     | NO          | null                  |
| user_profiles           | avatar_url                 | text                     | YES         | null                  |
| user_profiles           | role                       | text                     | YES         | 'student'::text       |
| user_profiles           | grade_level                | text                     | YES         | null                  |
| user_profiles           | subjects                   | ARRAY                    | YES         | null                  |
| user_profiles           | preferences                | jsonb                    | YES         | '{}'::jsonb           |
| user_profiles           | created_at                 | timestamp with time zone | YES         | now()                 |
| user_profiles           | updated_at                 | timestamp with time zone | YES         | now()                 |
| user_reward_redemptions | id                         | uuid                     | NO          | gen_random_uuid()     |
| user_reward_redemptions | tenant_id                  | uuid                     | NO          | null                  |
| user_reward_redemptions | user_id                    | uuid                     | NO          | null                  |
| user_reward_redemptions | reward_id                  | uuid                     | NO          | null                  |
| user_reward_redemptions | points_spent               | integer                  | NO          | null                  |
| user_reward_redemptions | redeemed_at                | timestamp with time zone | YES         | now()                 |
| user_reward_redemptions | status                     | text                     | YES         | 'pending'::text       |
| user_reward_redemptions | fulfillment_notes          | text                     | YES         | null                  |
| user_reward_redemptions | created_at                 | timestamp with time zone | YES         | now()                 |
| user_reward_redemptions | updated_at                 | timestamp with time zone | YES         | now()                 |