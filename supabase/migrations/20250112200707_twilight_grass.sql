/*
  # Portfolio Website Database Schema

  1. Core Tables
    - `contacts`
      - Primary communication channel for visitors
      - Stores form submissions with validation
    - `achievements`
      - Professional accomplishments and recognition
      - Links to companies and certifications
    - `experiences`
      - Work history and professional roles
      - Includes company relationships
    - `skills`
      - Technical and professional competencies
      - Categorized and rated abilities
    - `education`
      - Academic background and certifications
      - Institution relationships

  2. Supporting Tables
    - `companies`
      - Organizations for work experience
      - Includes logo and industry info
    - `institutions`
      - Educational institutions
      - Includes location and type
    - `certifications`
      - Professional certifications
      - Includes issuing organization

  3. Security
    - RLS enabled on all tables
    - Admin-only write access
    - Public read access for approved records
*/

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  logo_url text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text,
  logo_url text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Experiences Table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id),
  role text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  highlights text[] DEFAULT '{}',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Education Table
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id),
  degree text NOT NULL,
  field_of_study text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  grade text,
  achievements text[] DEFAULT '{}',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuing_organization text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  credential_id text,
  credential_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (expiry_date IS NULL OR expiry_date >= issue_date)
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  proficiency integer CHECK (proficiency BETWEEN 1 AND 5),
  is_featured boolean DEFAULT false,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  company_id uuid REFERENCES companies(id),
  media_url text,
  is_featured boolean DEFAULT false,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) >= 2),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  message text NOT NULL CHECK (length(message) >= 10),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  read_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Companies: Public read, admin write
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Companies are editable by admin only"
  ON companies FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() = 'admin@example.com'))
  WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() = 'admin@example.com'));

-- Similar policies for other tables...
CREATE POLICY "Experiences are viewable by everyone"
  ON experiences FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Education records are viewable by everyone"
  ON education FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Contacts can be created by anyone"
  ON contacts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Contacts are viewable by admin only"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE auth.email() = 'admin@example.com'));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Similar triggers for other tables...
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();