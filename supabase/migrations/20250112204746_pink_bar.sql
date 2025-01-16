/*
  # Update RLS policies with proper checks

  1. Changes
    - Add existence checks before creating policies
    - Simplify policy conditions using direct email comparison
    - Ensure clean policy creation for all tables

  2. Security
    - Maintains secure admin access
    - Uses email-based authentication
    - Preserves existing security model
*/

-- Drop existing policies safely
DO $$ 
DECLARE
  table_name text;
  policy_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('companies', 'experiences', 'education', 'certifications', 'skills', 'achievements', 'contacts')
  LOOP
    FOR policy_name IN
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    END LOOP;
  END LOOP;
END $$;

-- Create new policies for standard tables
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('companies', 'experiences', 'education', 'certifications', 'skills', 'achievements')
  LOOP
    EXECUTE format('
      CREATE POLICY "Enable read access for all users on %I"
        ON %I FOR SELECT
        TO public
        USING (true);

      CREATE POLICY "Enable insert for admin on %I"
        ON %I FOR INSERT
        TO authenticated
        WITH CHECK (auth.email() = ''vaibhavbhardwaj2396@gmail.com'');

      CREATE POLICY "Enable update for admin on %I"
        ON %I FOR UPDATE
        TO authenticated
        USING (auth.email() = ''vaibhavbhardwaj2396@gmail.com'')
        WITH CHECK (auth.email() = ''vaibhavbhardwaj2396@gmail.com'');

      CREATE POLICY "Enable delete for admin on %I"
        ON %I FOR DELETE
        TO authenticated
        USING (auth.email() = ''vaibhavbhardwaj2396@gmail.com'');
    ', table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Special policies for contacts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contacts' 
    AND policyname = 'Enable insert for everyone on contacts'
  ) THEN
    CREATE POLICY "Enable insert for everyone on contacts"
      ON contacts FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contacts' 
    AND policyname = 'Enable read access for admin on contacts'
  ) THEN
    CREATE POLICY "Enable read access for admin on contacts"
      ON contacts FOR SELECT
      TO authenticated
      USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contacts' 
    AND policyname = 'Enable update for admin on contacts'
  ) THEN
    CREATE POLICY "Enable update for admin on contacts"
      ON contacts FOR UPDATE
      TO authenticated
      USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
      WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'contacts' 
    AND policyname = 'Enable delete for admin on contacts'
  ) THEN
    CREATE POLICY "Enable delete for admin on contacts"
      ON contacts FOR DELETE
      TO authenticated
      USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com');
  END IF;
END $$;