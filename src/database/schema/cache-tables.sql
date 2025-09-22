-- Content Cache Database Schema
-- For storing Master Narratives and Micro Content

-- Master Narrative Cache Table
CREATE TABLE IF NOT EXISTS master_narrative_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  selected_character VARCHAR(50) NOT NULL,  -- companion
  career_id VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  narrative JSONB NOT NULL,  -- The actual MasterNarrative object
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),

  -- Indexes for fast lookup
  INDEX idx_cache_key ON master_narrative_cache(cache_key),
  INDEX idx_student_id ON master_narrative_cache(student_id),
  INDEX idx_expires_at ON master_narrative_cache(expires_at)
);

-- Micro Content Cache Table
CREATE TABLE IF NOT EXISTS micro_content_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  master_narrative_key VARCHAR(255) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  skill_id VARCHAR(100) NOT NULL,
  container_type VARCHAR(20) NOT NULL CHECK (container_type IN ('learn', 'experience', 'discover')),
  content JSONB NOT NULL,  -- The actual container content
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),

  -- Foreign key to master narrative
  FOREIGN KEY (master_narrative_key) REFERENCES master_narrative_cache(cache_key) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_micro_cache_key ON micro_content_cache(cache_key),
  INDEX idx_master_narrative ON micro_content_cache(master_narrative_key),
  INDEX idx_micro_expires_at ON micro_content_cache(expires_at)
);

-- Audio Cache Reference Table (links to Azure Blob Storage)
CREATE TABLE IF NOT EXISTS audio_cache (
  id SERIAL PRIMARY KEY,
  narrative_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  companion VARCHAR(50) NOT NULL,
  audio_type VARCHAR(20) NOT NULL CHECK (audio_type IN ('narration', 'effect', 'music')),
  blob_name VARCHAR(500) NOT NULL,  -- Path in Azure Blob Storage
  blob_url TEXT NOT NULL,  -- SAS URL for direct access
  duration_seconds DECIMAL(10, 2),
  file_size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  access_count INTEGER DEFAULT 0,

  -- Indexes
  INDEX idx_audio_narrative ON audio_cache(narrative_id),
  INDEX idx_audio_student ON audio_cache(student_id),
  INDEX idx_audio_expires ON audio_cache(expires_at)
);

-- Cache Metrics Table (for monitoring)
CREATE TABLE IF NOT EXISTS cache_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE DEFAULT CURRENT_DATE,
  cache_type VARCHAR(20) NOT NULL,
  total_requests INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  avg_response_time_ms DECIMAL(10, 2),
  total_size_bytes BIGINT DEFAULT 0,
  unique_users INTEGER DEFAULT 0,

  -- Unique constraint for daily metrics
  UNIQUE(metric_date, cache_type)
);

-- Function to clean expired cache entries (run daily)
CREATE OR REPLACE FUNCTION clean_expired_cache() RETURNS void AS $$
BEGIN
  DELETE FROM master_narrative_cache WHERE expires_at < NOW();
  DELETE FROM micro_content_cache WHERE expires_at < NOW();
  DELETE FROM audio_cache WHERE expires_at < NOW();

  -- Log cleanup metrics
  INSERT INTO cache_metrics (cache_type, total_requests, cache_hits)
  VALUES ('cleanup', 1, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update cache hit statistics
CREATE OR REPLACE FUNCTION update_cache_hit(cache_table TEXT, cache_key_value VARCHAR) RETURNS void AS $$
BEGIN
  IF cache_table = 'master_narrative' THEN
    UPDATE master_narrative_cache
    SET hit_count = hit_count + 1, last_accessed = NOW()
    WHERE cache_key = cache_key_value;
  ELSIF cache_table = 'micro_content' THEN
    UPDATE micro_content_cache
    SET hit_count = hit_count + 1, last_accessed = NOW()
    WHERE cache_key = cache_key_value;
  ELSIF cache_table = 'audio' THEN
    UPDATE audio_cache
    SET access_count = access_count + 1
    WHERE blob_name = cache_key_value;
  END IF;
END;
$$ LANGUAGE plpgsql;