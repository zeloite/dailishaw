-- Create inputs table
CREATE TABLE IF NOT EXISTS inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sl_no TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  input TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS inputs_user_id_idx ON inputs(user_id);
CREATE INDEX IF NOT EXISTS inputs_created_at_idx ON inputs(created_at);

-- Enable RLS
ALTER TABLE inputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inputs table
-- Users can view their own inputs
CREATE POLICY "Users can view their own inputs"
  ON inputs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own inputs
CREATE POLICY "Users can insert their own inputs"
  ON inputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own inputs
CREATE POLICY "Users can update their own inputs"
  ON inputs FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own inputs
CREATE POLICY "Users can delete their own inputs"
  ON inputs FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all inputs
CREATE POLICY "Admins can view all inputs"
  ON inputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
