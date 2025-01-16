/*
  # Add RLS policies for contacts table

  1. Changes
    - Add policies to allow public insert for contact form submissions
    - Add policies for admin access to view and manage contacts
    - Fix permission denied errors for contacts table

  2. Security
    - Enable public insert access for contact form
    - Restrict read/update/delete to admin users only
*/

-- Contacts table policies
CREATE POLICY "Enable insert for everyone on contacts"
  ON contacts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable read access for admin on contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Enable update for admin on contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Enable delete for admin on contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));