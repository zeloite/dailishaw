-- Add specialty and contact_detail columns to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS contact_detail TEXT;
