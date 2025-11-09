-- Migration script to add missing columns to tasks table
-- Run this manually if drizzle-kit push requires interactive confirmation

-- Add depends_on column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'depends_on'
    ) THEN
        ALTER TABLE tasks ADD COLUMN depends_on TEXT;
    END IF;
END $$;

-- Add progress column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'progress'
    ) THEN
        ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add start_date column if it doesn't exist (should already exist, but checking)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE tasks ADD COLUMN start_date TIMESTAMP;
    END IF;
END $$;

-- Add end_date column if it doesn't exist (should already exist, but checking)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE tasks ADD COLUMN end_date TIMESTAMP;
    END IF;
END $$;

-- Update existing rows to have default progress value
UPDATE tasks SET progress = 0 WHERE progress IS NULL;

-- Add unique constraint for invoices.public_token if it doesn't exist
-- Note: This might fail if there are duplicate NULL values, but NULL values are allowed in unique constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invoices_public_token_unique'
    ) THEN
        -- First, set any NULL values to ensure uniqueness
        -- Then add the constraint
        ALTER TABLE invoices ADD CONSTRAINT invoices_public_token_unique UNIQUE (public_token);
    END IF;
EXCEPTION
    WHEN others THEN
        -- If constraint already exists or other error, ignore
        RAISE NOTICE 'Constraint might already exist or there are duplicate values';
END $$;

