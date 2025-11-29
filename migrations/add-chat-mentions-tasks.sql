-- Add mentions and task link to chat messages
ALTER TABLE chat_messages 
  ADD COLUMN IF NOT EXISTS mentions text,
  ADD COLUMN IF NOT EXISTS task_id integer REFERENCES tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS read_by text;

-- Add index for task_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_task_id ON chat_messages(task_id);

-- Add index for mentions (for faster mention queries)
CREATE INDEX IF NOT EXISTS idx_chat_messages_mentions ON chat_messages USING gin ((mentions::jsonb));

-- Drop old read_at column if exists (replaced by read_by array)
ALTER TABLE chat_messages DROP COLUMN IF EXISTS read_at;

-- Comment explaining the schema
COMMENT ON COLUMN chat_messages.mentions IS 'JSON array of user IDs that were mentioned with @username';
COMMENT ON COLUMN chat_messages.task_id IS 'Reference to task created from this message';
COMMENT ON COLUMN chat_messages.read_by IS 'JSON array of user IDs who have read this message';

