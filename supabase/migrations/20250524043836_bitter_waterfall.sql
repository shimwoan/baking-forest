/*
  # Baking class reservation schema

  1. New Tables
    - `baking_classes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `time` (text)
      - `duration` (text)
      - `price` (numeric)
      - `capacity` (integer)
      - `enrolled` (integer)
      - `level` (text)
      - `items` (text array)
      - `image` (text)
      - `instructor` (text)
      - `location` (text)
      - `created_at` (timestamptz)
    - `registrations`
      - `id` (uuid, primary key)
      - `class_id` (uuid, foreign key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on both tables
    - Add policy for authenticated users to read all baking classes
    - Add policy for authenticated users to create registrations
  3. Functions
    - `increment_enrolled` function to update enrolled count
*/

-- Create baking_classes table
CREATE TABLE IF NOT EXISTS baking_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  duration text NOT NULL,
  price numeric NOT NULL,
  capacity integer NOT NULL,
  enrolled integer NOT NULL DEFAULT 0,
  level text NOT NULL,
  items text[] NOT NULL,
  image text NOT NULL,
  instructor text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES baking_classes(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE baking_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read baking classes" ON baking_classes;
  DROP POLICY IF EXISTS "Only admin can insert baking classes" ON baking_classes;
  DROP POLICY IF EXISTS "Only admin can update baking classes" ON baking_classes;
  DROP POLICY IF EXISTS "Anyone can create registrations" ON registrations;
  DROP POLICY IF EXISTS "Users can read their own registrations" ON registrations;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Policies for baking_classes
CREATE POLICY "Anyone can read baking classes"
  ON baking_classes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admin can insert baking classes"
  ON baking_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'admin@example.com'
    )
  );

CREATE POLICY "Only admin can update baking classes"
  ON baking_classes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'admin@example.com'
    )
  );

-- Policies for registrations
CREATE POLICY "Anyone can create registrations"
  ON registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));

-- Create function to increment enrolled count
CREATE OR REPLACE FUNCTION increment_enrolled(class_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE baking_classes
  SET enrolled = enrolled + 1
  WHERE id = class_id AND enrolled < capacity;
END;
$$ LANGUAGE plpgsql;