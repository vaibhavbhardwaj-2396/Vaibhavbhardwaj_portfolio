/*
  # Update admin email

  1. Changes
    - Update admin email in is_admin function from admin@example.com to vaibhavbhardwaj2396@gmail.com

  2. Security
    - Maintains existing security policies
    - Only updates the admin email check
*/

CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND email IN ('vaibhavbhardwaj2396@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;