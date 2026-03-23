-- =============================================
-- 감사 추적용 원문/출력 컬럼 추가
-- 국정원 보안성검토 대비: 입력값, 검증과정, 출력값 전수 기록
-- =============================================

-- 원본 프롬프트 (사용자가 입력한 그대로)
ALTER TABLE validation_logs ADD COLUMN IF NOT EXISTS original_prompt TEXT;

-- 필터링된 프롬프트 (보안 검증 후 마스킹 처리된 결과)
ALTER TABLE validation_logs ADD COLUMN IF NOT EXISTS sanitized_prompt TEXT;

-- 권장사항 메시지
ALTER TABLE validation_logs ADD COLUMN IF NOT EXISTS recommendation TEXT;
