-- Add preferred_locale column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_locale VARCHAR(10) DEFAULT 'en';

-- Update existing users to have 'en' as default locale
UPDATE users
SET preferred_locale = 'en'
WHERE preferred_locale IS NULL;
