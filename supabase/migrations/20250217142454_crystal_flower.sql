/*
  # Create arrangements schema

  1. New Tables
    - `arrangements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `genre` (text)
      - `bpm` (integer)
      - `xml_data` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    - `block_data`
      - `id` (uuid, primary key)
      - `arrangement_id` (uuid, references arrangements)
      - `block_index` (integer)
      - `chords` (text[])
      - `template_category` (text)
      - `template_subgenre` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create arrangements table
CREATE TABLE arrangements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  genre text NOT NULL,
  bpm integer NOT NULL,
  xml_data text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create block_data table
CREATE TABLE block_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arrangement_id uuid REFERENCES arrangements ON DELETE CASCADE NOT NULL,
  block_index integer NOT NULL,
  chords text[] NOT NULL,
  template_category text,
  template_subgenre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE arrangements ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_data ENABLE ROW LEVEL SECURITY;

-- Create policies for arrangements
CREATE POLICY "Users can create their own arrangements"
  ON arrangements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own arrangements"
  ON arrangements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own arrangements"
  ON arrangements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own arrangements"
  ON arrangements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for block_data
CREATE POLICY "Users can create block data for their arrangements"
  ON block_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM arrangements
      WHERE arrangements.id = block_data.arrangement_id
      AND arrangements.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view block data for their arrangements"
  ON block_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM arrangements
      WHERE arrangements.id = block_data.arrangement_id
      AND arrangements.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update block data for their arrangements"
  ON block_data
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM arrangements
      WHERE arrangements.id = block_data.arrangement_id
      AND arrangements.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM arrangements
      WHERE arrangements.id = block_data.arrangement_id
      AND arrangements.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete block data for their arrangements"
  ON block_data
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM arrangements
      WHERE arrangements.id = block_data.arrangement_id
      AND arrangements.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX arrangements_user_id_idx ON arrangements(user_id);
CREATE INDEX block_data_arrangement_id_idx ON block_data(arrangement_id);
CREATE INDEX block_data_block_index_idx ON block_data(block_index);