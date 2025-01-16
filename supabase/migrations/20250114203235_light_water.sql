-- Add author profile table
CREATE TABLE IF NOT EXISTS author_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  role text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE author_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for author_profiles
CREATE POLICY "Public can view author profiles"
  ON author_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage author profiles"
  ON author_profiles FOR ALL
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

-- Create trigger for updated_at
CREATE TRIGGER update_author_profiles_updated_at
  BEFORE UPDATE ON author_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert admin author profile
INSERT INTO author_profiles (id, name, role, avatar_url)
SELECT 
  id,
  'Vaibhav Bhardwaj',
  'Digital Transformation Consultant',
  '/hero_image.jpeg'
FROM auth.users 
WHERE email = 'vaibhavbhardwaj2396@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url;

-- Update blog_posts table to properly reference author_profiles
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey,
  ADD CONSTRAINT blog_posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES author_profiles(id)
    ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id);

-- Update existing posts to set author_id
UPDATE blog_posts
SET author_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'vaibhavbhardwaj2396@gmail.com' 
  LIMIT 1
)
WHERE author_id IS NULL;