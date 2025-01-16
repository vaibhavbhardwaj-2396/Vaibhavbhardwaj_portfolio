/*
  # Newsletter Subscribers Table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `status` (text) - active/unsubscribed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public can subscribe
    - Admin can view and manage subscribers
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Enable insert for everyone on newsletter_subscribers"
  ON newsletter_subscribers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable read access for admin on newsletter_subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

CREATE POLICY "Enable update for admin on newsletter_subscribers"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

CREATE POLICY "Enable delete for admin on newsletter_subscribers"
  ON newsletter_subscribers FOR DELETE
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

-- Create index for better performance
CREATE INDEX newsletter_subscribers_email_idx ON newsletter_subscribers(email);
CREATE INDEX newsletter_subscribers_status_idx ON newsletter_subscribers(status);