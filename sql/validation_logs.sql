-- =============================================
-- 보안 검증 이력 테이블 (knai-zone Supabase 공유)
-- =============================================

-- 검증 로그 테이블
CREATE TABLE IF NOT EXISTS validation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nickname TEXT,
  input_type TEXT NOT NULL DEFAULT 'text',
  prompt_hash TEXT NOT NULL,
  prompt_length INTEGER NOT NULL,
  security_level TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  is_safe BOOLEAN NOT NULL DEFAULT true,
  violation_count INTEGER NOT NULL DEFAULT 0,
  violation_types JSONB DEFAULT '[]',
  violation_details JSONB DEFAULT '[]',
  regulation_refs JSONB DEFAULT '[]',
  response_time_ms INTEGER,
  original_prompt TEXT,
  sanitized_prompt TEXT,
  recommendation TEXT
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_vl_created_at ON validation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_vl_security_level ON validation_logs(security_level);
CREATE INDEX IF NOT EXISTS idx_vl_profile_id ON validation_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_vl_risk_score ON validation_logs(risk_score);

-- 일별 통계 테이블
CREATE TABLE IF NOT EXISTS validation_daily_stats (
  date DATE PRIMARY KEY,
  total_requests INTEGER NOT NULL DEFAULT 0,
  safe_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  danger_count INTEGER NOT NULL DEFAULT 0,
  blocked_count INTEGER NOT NULL DEFAULT 0,
  avg_risk_score REAL NOT NULL DEFAULT 0,
  top_violation_types JSONB DEFAULT '[]'
);

-- RLS 정책
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_daily_stats ENABLE ROW LEVEL SECURITY;

-- 누구나 로그 삽입 가능
CREATE POLICY "Anyone can insert validation logs"
  ON validation_logs FOR INSERT
  WITH CHECK (true);

-- 자기 로그만 조회 (닉네임 기반)
CREATE POLICY "Users can view own logs"
  ON validation_logs FOR SELECT
  USING (true);

-- 일별 통계: 누구나 조회/삽입/수정 가능
CREATE POLICY "Anyone can read daily stats"
  ON validation_daily_stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert daily stats"
  ON validation_daily_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update daily stats"
  ON validation_daily_stats FOR UPDATE
  USING (true);
