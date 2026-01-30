-- Add parent_id to comments for nesting
alter table if exists comments add column if not exists parent_id uuid references comments(id) on delete cascade;

-- Add comment_id to reports for reporting comments
alter table if exists reports add column if not exists comment_id uuid references comments(id);

-- Update Reports Policy to allow reporting comments (no change needed if policy is just "true" for insert, but let's verify)
-- The existing policy "Users can report" on reports is "insert with check (true)", so it covers comment_id too.

-- Fix Community Name undefined error in Compose? (Handled in Code)
