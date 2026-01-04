-- Migration: Add support for multiple doctor visits per day in expenses table
-- This allows users to add multiple entries for different doctors/locations on the same day

-- Add visit_order column to maintain order of visits on the same day
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS visit_order integer DEFAULT 0;

-- Create index for visit_order
CREATE INDEX IF NOT EXISTS idx_expenses_visit_order ON expenses(visit_order);

-- Add comment
COMMENT ON COLUMN expenses.visit_order IS 'Order of visit on the same day (0-indexed)';

