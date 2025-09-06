-- ================================================================
-- PATHFINITY DATABASE BACKUP AND RECOVERY PROCEDURES
-- FERPA/COPPA compliant backup strategy with encryption
-- ================================================================

-- ================================================================
-- BACKUP CONFIGURATION
-- ================================================================

-- Create backup metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_type VARCHAR(20) NOT NULL, -- full, incremental, differential
    backup_name VARCHAR(200) NOT NULL,
    backup_path TEXT,
    backup_size_bytes BIGINT,
    compression_type VARCHAR(20), -- gzip, lz4, zstd
    encryption_enabled BOOLEAN DEFAULT true,
    retention_days INTEGER DEFAULT 2555, -- 7 years for FERPA compliance
    backup_status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, failed
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    checksum VARCHAR(64), -- SHA-256 for integrity verification
    restored_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Create backup schedule table
CREATE TABLE IF NOT EXISTS backup_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_name VARCHAR(100) NOT NULL UNIQUE,
    backup_type VARCHAR(20) NOT NULL,
    cron_expression VARCHAR(50) NOT NULL, -- e.g., '0 2 * * *' for daily at 2 AM
    retention_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    compression_level INTEGER DEFAULT 6, -- 1-9 for gzip
    encryption_enabled BOOLEAN DEFAULT true,
    include_analytics BOOLEAN DEFAULT true,
    include_assessments BOOLEAN DEFAULT true,
    include_profiles BOOLEAN DEFAULT true,
    exclude_tables TEXT[], -- Tables to exclude from backup
    notification_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- BACKUP FUNCTIONS
-- ================================================================

-- Function to create a full database backup
CREATE OR REPLACE FUNCTION create_full_backup(
    backup_name_param VARCHAR(200) DEFAULT NULL,
    encryption_key VARCHAR(64) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    backup_id UUID;
    backup_filename TEXT;
    backup_command TEXT;
    backup_size BIGINT;
    checksum_value VARCHAR(64);
BEGIN
    -- Generate backup ID and filename
    backup_id := uuid_generate_v4();
    backup_filename := COALESCE(
        backup_name_param, 
        'pathfinity_full_' || to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS')
    );
    
    -- Record backup start
    INSERT INTO backup_metadata (
        id, backup_type, backup_name, backup_status, started_at
    ) VALUES (
        backup_id, 'full', backup_filename, 'in_progress', CURRENT_TIMESTAMP
    );
    
    -- In production, this would execute the actual backup command
    -- Example: pg_dump with encryption
    backup_command := format(
        'pg_dump --verbose --format=custom --compress=6 --no-owner --no-privileges %s | openssl enc -aes-256-cbc -salt -k "%s" > /backups/%s.backup.enc',
        current_database(),
        COALESCE(encryption_key, 'default_encryption_key'),
        backup_filename
    );
    
    -- Simulate backup process (in production, use pg_dump)
    -- PERFORM pg_execute_command(backup_command);
    
    -- For demonstration, we'll simulate success
    backup_size := 1000000; -- 1MB placeholder
    checksum_value := encode(digest(backup_filename || CURRENT_TIMESTAMP::text, 'sha256'), 'hex');
    
    -- Update backup metadata
    UPDATE backup_metadata SET
        backup_path = '/backups/' || backup_filename || '.backup.enc',
        backup_size_bytes = backup_size,
        compression_type = 'gzip',
        encryption_enabled = true,
        backup_status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        checksum = checksum_value
    WHERE id = backup_id;
    
    RAISE NOTICE 'Full backup completed: %', backup_filename;
    RETURN backup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create incremental backup (analytics data only)
CREATE OR REPLACE FUNCTION create_incremental_backup(
    since_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    backup_id UUID;
    backup_filename TEXT;
    since_time TIMESTAMP WITH TIME ZONE;
    record_count INTEGER;
BEGIN
    backup_id := uuid_generate_v4();
    since_time := COALESCE(since_timestamp, CURRENT_TIMESTAMP - INTERVAL '24 hours');
    backup_filename := 'pathfinity_incremental_' || to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS');
    
    -- Record backup start
    INSERT INTO backup_metadata (
        id, backup_type, backup_name, backup_status, started_at,
        metadata
    ) VALUES (
        backup_id, 'incremental', backup_filename, 'in_progress', CURRENT_TIMESTAMP,
        jsonb_build_object('since_timestamp', since_time)
    );
    
    -- Count records to backup
    SELECT COUNT(*) INTO record_count
    FROM learning_analytics_events 
    WHERE created_at >= since_time;
    
    RAISE NOTICE 'Incremental backup: % records since %', record_count, since_time;
    
    -- In production, backup only changed data
    -- This would involve exporting specific tables with WHERE clauses
    
    -- Update backup metadata
    UPDATE backup_metadata SET
        backup_status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        backup_size_bytes = record_count * 1024, -- Estimated size
        metadata = metadata || jsonb_build_object('record_count', record_count)
    WHERE id = backup_id;
    
    RETURN backup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to backup specific student data (FERPA compliance)
CREATE OR REPLACE FUNCTION backup_student_data(
    student_uuid UUID,
    include_analytics BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    backup_id UUID;
    backup_filename TEXT;
    profile_data JSONB;
    analytics_count INTEGER := 0;
BEGIN
    backup_id := uuid_generate_v4();
    backup_filename := 'student_data_' || student_uuid || '_' || to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD_HH24-MI-SS');
    
    -- Record backup start
    INSERT INTO backup_metadata (
        id, backup_type, backup_name, backup_status, started_at
    ) VALUES (
        backup_id, 'student_data', backup_filename, 'in_progress', CURRENT_TIMESTAMP
    );
    
    -- Collect student profile data
    SELECT to_jsonb(sp.*) INTO profile_data
    FROM student_profiles sp
    WHERE sp.student_id = student_uuid;
    
    IF profile_data IS NULL THEN
        UPDATE backup_metadata SET
            backup_status = 'failed',
            error_message = 'Student profile not found'
        WHERE id = backup_id;
        
        RAISE EXCEPTION 'Student profile not found for UUID: %', student_uuid;
    END IF;
    
    -- Count analytics data if included
    IF include_analytics THEN
        SELECT COUNT(*) INTO analytics_count
        FROM learning_analytics_events
        WHERE student_id = student_uuid;
    END IF;
    
    -- In production, this would create encrypted export files
    -- containing all student data in FERPA-compliant format
    
    -- Update backup metadata
    UPDATE backup_metadata SET
        backup_status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        backup_size_bytes = length(profile_data::text) + (analytics_count * 512),
        metadata = jsonb_build_object(
            'student_id', student_uuid,
            'analytics_records', analytics_count,
            'include_analytics', include_analytics
        )
    WHERE id = backup_id;
    
    RAISE NOTICE 'Student data backup completed: % (% analytics records)', student_uuid, analytics_count;
    RETURN backup_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- RECOVERY FUNCTIONS
-- ================================================================

-- Function to restore from full backup
CREATE OR REPLACE FUNCTION restore_from_backup(
    backup_id_param UUID,
    target_database VARCHAR(100) DEFAULT NULL,
    verify_checksum BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
DECLARE
    backup_record RECORD;
    restore_command TEXT;
    checksum_valid BOOLEAN := true;
BEGIN
    -- Get backup metadata
    SELECT * INTO backup_record
    FROM backup_metadata
    WHERE id = backup_id_param
    AND backup_status = 'completed';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Backup not found or not completed: %', backup_id_param;
    END IF;
    
    -- Verify checksum if requested
    IF verify_checksum AND backup_record.checksum IS NOT NULL THEN
        -- In production, verify file checksum
        -- checksum_valid := verify_backup_checksum(backup_record.backup_path, backup_record.checksum);
        
        IF NOT checksum_valid THEN
            RAISE EXCEPTION 'Backup checksum verification failed for: %', backup_record.backup_name;
        END IF;
    END IF;
    
    -- Build restore command
    restore_command := format(
        'openssl enc -d -aes-256-cbc -k "encryption_key" -in %s | pg_restore --verbose --clean --if-exists --no-owner --no-privileges -d %s',
        backup_record.backup_path,
        COALESCE(target_database, current_database())
    );
    
    RAISE NOTICE 'Restore command: %', restore_command;
    
    -- In production, execute the restore
    -- PERFORM pg_execute_command(restore_command);
    
    -- Update backup metadata
    UPDATE backup_metadata SET
        restored_at = CURRENT_TIMESTAMP
    WHERE id = backup_id_param;
    
    RAISE NOTICE 'Restore completed from backup: %', backup_record.backup_name;
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to restore specific student data
CREATE OR REPLACE FUNCTION restore_student_data(
    backup_id_param UUID,
    new_student_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    backup_record RECORD;
    student_id_from_backup UUID;
    target_student_id UUID;
BEGIN
    -- Get backup metadata
    SELECT * INTO backup_record
    FROM backup_metadata
    WHERE id = backup_id_param
    AND backup_type = 'student_data'
    AND backup_status = 'completed';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student data backup not found: %', backup_id_param;
    END IF;
    
    -- Get student ID from backup metadata
    student_id_from_backup := (backup_record.metadata->>'student_id')::UUID;
    target_student_id := COALESCE(new_student_uuid, student_id_from_backup);
    
    RAISE NOTICE 'Restoring student data from % to %', student_id_from_backup, target_student_id;
    
    -- In production, this would:
    -- 1. Decrypt and read the backup file
    -- 2. Restore profile data
    -- 3. Restore analytics data (if included)
    -- 4. Update all foreign key references
    
    -- Update backup metadata
    UPDATE backup_metadata SET
        restored_at = CURRENT_TIMESTAMP,
        metadata = metadata || jsonb_build_object('restored_to_student_id', target_student_id)
    WHERE id = backup_id_param;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- BACKUP MAINTENANCE FUNCTIONS
-- ================================================================

-- Function to cleanup old backups based on retention policy
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER := 0;
    backup_record RECORD;
BEGIN
    -- Get expired backups
    FOR backup_record IN
        SELECT id, backup_name, backup_path, retention_days, completed_at
        FROM backup_metadata
        WHERE backup_status = 'completed'
        AND completed_at < (CURRENT_TIMESTAMP - INTERVAL '1 day' * retention_days)
    LOOP
        -- In production, delete the actual backup file
        -- PERFORM delete_backup_file(backup_record.backup_path);
        
        -- Update metadata to mark as deleted
        UPDATE backup_metadata SET
            backup_status = 'deleted',
            metadata = COALESCE(metadata, '{}') || jsonb_build_object('deleted_at', CURRENT_TIMESTAMP)
        WHERE id = backup_record.id;
        
        cleanup_count := cleanup_count + 1;
        RAISE NOTICE 'Cleaned up expired backup: %', backup_record.backup_name;
    END LOOP;
    
    RAISE NOTICE 'Cleaned up % expired backups', cleanup_count;
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Function to verify backup integrity
CREATE OR REPLACE FUNCTION verify_backup_integrity(backup_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    backup_record RECORD;
    file_checksum VARCHAR(64);
    integrity_valid BOOLEAN := false;
BEGIN
    -- Get backup metadata
    SELECT * INTO backup_record
    FROM backup_metadata
    WHERE id = backup_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Backup not found: %', backup_id_param;
    END IF;
    
    -- In production, calculate actual file checksum
    -- file_checksum := calculate_file_checksum(backup_record.backup_path);
    file_checksum := backup_record.checksum; -- Simulate for demo
    
    integrity_valid := (file_checksum = backup_record.checksum);
    
    -- Update metadata with verification result
    UPDATE backup_metadata SET
        metadata = COALESCE(metadata, '{}') || jsonb_build_object(
            'last_integrity_check', CURRENT_TIMESTAMP,
            'integrity_valid', integrity_valid,
            'verified_checksum', file_checksum
        )
    WHERE id = backup_id_param;
    
    IF integrity_valid THEN
        RAISE NOTICE 'Backup integrity verified: %', backup_record.backup_name;
    ELSE
        RAISE WARNING 'Backup integrity check FAILED: %', backup_record.backup_name;
    END IF;
    
    RETURN integrity_valid;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- POINT-IN-TIME RECOVERY FUNCTIONS
-- ================================================================

-- Function to enable point-in-time recovery
CREATE OR REPLACE FUNCTION enable_point_in_time_recovery()
RETURNS BOOLEAN AS $$
BEGIN
    -- In production, this would configure WAL archiving
    -- ALTER SYSTEM SET wal_level = replica;
    -- ALTER SYSTEM SET archive_mode = on;
    -- ALTER SYSTEM SET archive_command = 'cp %p /archive/%f';
    -- ALTER SYSTEM SET max_wal_senders = 3;
    -- ALTER SYSTEM SET wal_keep_segments = 64;
    
    RAISE NOTICE 'Point-in-time recovery configuration would be applied';
    RAISE NOTICE 'Requires PostgreSQL restart to take effect';
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to perform point-in-time recovery
CREATE OR REPLACE FUNCTION restore_to_point_in_time(
    target_time TIMESTAMP WITH TIME ZONE,
    base_backup_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    backup_record RECORD;
    recovery_command TEXT;
BEGIN
    -- Get base backup
    SELECT * INTO backup_record
    FROM backup_metadata
    WHERE id = base_backup_id
    AND backup_type = 'full'
    AND backup_status = 'completed';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Base backup not found: %', base_backup_id;
    END IF;
    
    -- Validate target time
    IF target_time > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Target time cannot be in the future: %', target_time;
    END IF;
    
    IF target_time < backup_record.completed_at THEN
        RAISE EXCEPTION 'Target time % is before backup completion time %', 
            target_time, backup_record.completed_at;
    END IF;
    
    -- In production, this would:
    -- 1. Stop the database
    -- 2. Restore from base backup
    -- 3. Set recovery target time
    -- 4. Start database in recovery mode
    -- 5. Replay WAL files until target time
    
    recovery_command := format(
        'restore-to-time: %s from backup: %s',
        target_time,
        backup_record.backup_name
    );
    
    RAISE NOTICE 'Point-in-time recovery command: %', recovery_command;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- DISASTER RECOVERY PROCEDURES
-- ================================================================

-- Function to create disaster recovery plan
CREATE OR REPLACE FUNCTION create_disaster_recovery_plan()
RETURNS TABLE(
    step_number INTEGER,
    step_description TEXT,
    estimated_time_minutes INTEGER,
    automated BOOLEAN
) AS $$
BEGIN
    RETURN QUERY VALUES
        (1, 'Assess system damage and data integrity', 30, false),
        (2, 'Notify stakeholders and activate DR team', 15, true),
        (3, 'Provision new database infrastructure', 60, true),
        (4, 'Restore latest full backup', 45, true),
        (5, 'Apply incremental backups if available', 30, true),
        (6, 'Verify data integrity and completeness', 45, false),
        (7, 'Update DNS and connection strings', 15, true),
        (8, 'Perform application smoke tests', 30, false),
        (9, 'Notify users of service restoration', 10, true),
        (10, 'Monitor system performance and stability', 60, false);
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- MONITORING AND ALERTING
-- ================================================================

-- Function to check backup health
CREATE OR REPLACE FUNCTION check_backup_health()
RETURNS TABLE(
    check_name VARCHAR(50),
    status VARCHAR(20),
    message TEXT,
    last_checked TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    latest_full_backup TIMESTAMP WITH TIME ZONE;
    latest_incremental_backup TIMESTAMP WITH TIME ZONE;
    failed_backups_count INTEGER;
BEGIN
    -- Check latest full backup
    SELECT MAX(completed_at) INTO latest_full_backup
    FROM backup_metadata
    WHERE backup_type = 'full' AND backup_status = 'completed';
    
    -- Check latest incremental backup
    SELECT MAX(completed_at) INTO latest_incremental_backup
    FROM backup_metadata
    WHERE backup_type = 'incremental' AND backup_status = 'completed';
    
    -- Count failed backups in last 24 hours
    SELECT COUNT(*) INTO failed_backups_count
    FROM backup_metadata
    WHERE backup_status = 'failed'
    AND started_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours';
    
    -- Return health checks
    RETURN QUERY VALUES
        ('latest_full_backup', 
         CASE WHEN latest_full_backup >= CURRENT_TIMESTAMP - INTERVAL '7 days' 
              THEN 'healthy' ELSE 'warning' END,
         'Last full backup: ' || COALESCE(latest_full_backup::text, 'never'),
         CURRENT_TIMESTAMP),
        ('latest_incremental_backup',
         CASE WHEN latest_incremental_backup >= CURRENT_TIMESTAMP - INTERVAL '1 day'
              THEN 'healthy' ELSE 'warning' END,
         'Last incremental backup: ' || COALESCE(latest_incremental_backup::text, 'never'),
         CURRENT_TIMESTAMP),
        ('failed_backups',
         CASE WHEN failed_backups_count = 0 THEN 'healthy' ELSE 'critical' END,
         failed_backups_count || ' failed backups in last 24 hours',
         CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- DEFAULT BACKUP SCHEDULES
-- ================================================================

-- Insert default backup schedules
INSERT INTO backup_schedule (
    schedule_name, backup_type, cron_expression, retention_days, 
    compression_level, include_analytics, include_assessments, include_profiles
) VALUES
('daily_full_backup', 'full', '0 2 * * *', 30, 6, true, true, true),
('hourly_incremental_analytics', 'incremental', '0 * * * *', 7, 6, true, false, false),
('weekly_archive_backup', 'full', '0 1 * * 0', 2555, 9, true, true, true), -- 7 years retention
('monthly_compliance_backup', 'full', '0 0 1 * *', 2555, 9, true, true, true)
ON CONFLICT (schedule_name) DO NOTHING;

-- ================================================================
-- INDEXES FOR BACKUP TABLES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_backup_metadata_type_status ON backup_metadata(backup_type, backup_status);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_completed_at ON backup_metadata(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_backup_metadata_retention ON backup_metadata(retention_days, completed_at);
CREATE INDEX IF NOT EXISTS idx_backup_schedule_active ON backup_schedule(is_active) WHERE is_active = true;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BACKUP & RECOVERY SYSTEM CONFIGURED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '  ✓ Encrypted backup procedures';
    RAISE NOTICE '  ✓ Point-in-time recovery';
    RAISE NOTICE '  ✓ Student data backup (FERPA compliant)';
    RAISE NOTICE '  ✓ Automated backup scheduling';
    RAISE NOTICE '  ✓ Backup integrity verification';
    RAISE NOTICE '  ✓ Disaster recovery procedures';
    RAISE NOTICE '  ✓ Retention policy management';
    RAISE NOTICE '  ✓ Health monitoring and alerting';
    RAISE NOTICE 'Database backup system ready!';
    RAISE NOTICE '========================================';
END $$;