-- user_profile 테이블에 disease 필드 추가
-- Supabase 대시보드 → SQL Editor에서 실행하세요

ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS disease JSONB DEFAULT '[]'::jsonb;

-- 기존 데이터가 NULL인 경우 빈 배열로 설정
UPDATE user_profile 
SET disease = '[]'::jsonb 
WHERE disease IS NULL;

-- 코멘트 추가
COMMENT ON COLUMN user_profile.disease IS '질병/건강 상태 정보 (JSONB 배열)';



