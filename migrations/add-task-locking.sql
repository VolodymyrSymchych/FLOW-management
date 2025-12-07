-- Add locking fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS locked_by INTEGER,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS locked_by_email VARCHAR(255);

-- Add foreign key constraint
ALTER TABLE tasks
ADD CONSTRAINT tasks_locked_by_fkey
FOREIGN KEY (locked_by)
REFERENCES users(id)
ON DELETE SET NULL;

-- Add index for faster lock queries
CREATE INDEX IF NOT EXISTS idx_tasks_locked_by ON tasks(locked_by);
CREATE INDEX IF NOT EXISTS idx_tasks_locked_at ON tasks(locked_at);
