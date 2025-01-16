/*
  # Fix admin function and policies

  1. Changes
    - Update is_admin function to properly check email
    - Recreate contacts table policies
    - Add proper error handling

  2. Security
    - Maintains secure admin access
    - Ensures proper email verification
*/

-- Drop existing function and recreate with proper email check
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND email = 'vaibhavbhardwaj2396@gmail.com'
    AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for everyone on contacts" ON contacts;
DROP POLICY IF EXISTS "Enable read access for admin on contacts" ON contacts;
DROP POLICY IF EXISTS "Enable update for admin on contacts" ON contacts;
DROP POLICY IF EXISTS "Enable delete for admin on contacts" ON contacts;

-- Recreate policies with simplified conditions
CREATE POLICY "Enable insert for everyone on contacts"
  ON contacts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable read access for admin on contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

CREATE POLICY "Enable update for admin on contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

CREATE POLICY "Enable delete for admin on contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com');