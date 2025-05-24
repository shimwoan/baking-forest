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

-- Enable row level security
ALTER TABLE baking_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for baking_classes
CREATE POLICY "Anyone can read baking classes"
  ON baking_classes
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admin can insert baking classes"
  ON baking_classes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  ));

CREATE POLICY "Only admin can update baking classes"
  ON baking_classes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  ));

-- Create policies for registrations
CREATE POLICY "Anyone can create registrations"
  ON registrations
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can read their own registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() -> 'email');

-- Create a function to increment enrolled count
CREATE OR REPLACE FUNCTION increment_enrolled(class_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE baking_classes
  SET enrolled = enrolled + 1
  WHERE id = class_id AND enrolled < capacity;
END;
$$ LANGUAGE plpgsql;

-- Insert mock data
INSERT INTO baking_classes (
  title, description, date, time, duration, 
  price, capacity, enrolled, level, items, 
  image, instructor, location
)
VALUES
(
  'French Croissant Masterclass',
  'Master the art of creating flaky, buttery croissants from scratch. Learn professional lamination techniques and take home a dozen freshly baked pastries.',
  '2025-06-15',
  '10:00 AM',
  '3 hours',
  85,
  8,
  5,
  'Intermediate',
  ARRAY['Classic Croissants', 'Pain au Chocolat', 'Almond Croissants', 'Ham & Cheese Croissants'],
  'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'Chef Marie Laurent',
  'Main Kitchen - 123 Baker Street'
),
(
  'Artisan Sourdough Bread',
  'Discover the secrets of creating perfect sourdough bread with a crispy crust and soft, airy interior. You''ll learn to make and maintain your own starter.',
  '2025-06-18',
  '2:00 PM',
  '4 hours',
  75,
  10,
  10,
  'Beginner',
  ARRAY['Sourdough Boule', 'Sourdough Starter', 'Focaccia', 'Sourdough Rolls'],
  'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'Chef Marco Rossi',
  'Bread Studio - 123 Baker Street'
),
(
  'Elegant French Macaron Workshop',
  'Create these delicate French confections with perfect feet, smooth tops, and delicious fillings. Master the macaronage technique and experiment with flavors.',
  '2025-06-20',
  '1:00 PM',
  '3 hours',
  95,
  8,
  6,
  'Advanced',
  ARRAY['Classic Vanilla Macarons', 'Chocolate Ganache Macarons', 'Raspberry Macarons', 'Pistachio Macarons', 'Salted Caramel Macarons'],
  'https://images.pexels.com/photos/239581/pexels-photo-239581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'Chef Sophie Dubois',
  'Pastry Studio - 123 Baker Street'
);