-- Add activity_level column to user_profiles table
-- Migration: Add activity level for more accurate calorie calculation

ALTER TABLE user_profiles 
ADD COLUMN activity_level TEXT DEFAULT 'moderate';

-- Add comment
COMMENT ON COLUMN user_profiles.activity_level IS 'Activity level for calorie calculation: sedentary, light, moderate, active, very_active';

-- Update existing records to have default moderate activity level
UPDATE user_profiles 
SET activity_level = 'moderate' 
WHERE activity_level IS NULL;

