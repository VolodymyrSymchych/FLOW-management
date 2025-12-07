-- Migration: Add team_id column to projects table
-- Date: 2025-12-07
-- Description: Add team association to projects for team-based filtering

-- Add team_id column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_id INTEGER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);

-- Add index for combined user_id and team_id queries
CREATE INDEX IF NOT EXISTS idx_projects_user_team ON projects(user_id, team_id);
