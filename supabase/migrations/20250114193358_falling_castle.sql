/*
  # Blog Management System Schema

  1. New Tables
    - blog_posts
      - Core post data including content and metadata
      - Support for drafts and published posts
    - blog_categories
      - Categorization system for posts
    - blog_tags
      - Tagging system for posts
    - post_categories
      - Many-to-many relationship between posts and categories
    - post_tags
      - Many-to-many relationship between posts and tags

  2. Security
    - Enable RLS on all tables
    - Public read access for published posts
    - Admin-only write access
    - Protected draft posts
*/

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time integer,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES auth.users(id)
);

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post Categories Junction Table
CREATE TABLE IF NOT EXISTS post_categories (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES blog_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, category_id)
);

-- Post Tags Junction Table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Public can view published posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin can do all on posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

-- RLS Policies for blog_categories
CREATE POLICY "Public can view categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can do all on categories"
  ON blog_categories
  FOR ALL
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

-- RLS Policies for blog_tags
CREATE POLICY "Public can view tags"
  ON blog_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can do all on tags"
  ON blog_tags
  FOR ALL
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

-- RLS Policies for junction tables
CREATE POLICY "Public can view post categories"
  ON post_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can do all on post categories"
  ON post_categories
  FOR ALL
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

CREATE POLICY "Public can view post tags"
  ON post_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can do all on post tags"
  ON post_tags
  FOR ALL
  TO authenticated
  USING (auth.email() = 'vaibhavbhardwaj2396@gmail.com')
  WITH CHECK (auth.email() = 'vaibhavbhardwaj2396@gmail.com');

-- Update Triggers
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
  BEFORE UPDATE ON blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX blog_posts_status_published_at_idx ON blog_posts(status, published_at DESC);
CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX blog_categories_slug_idx ON blog_categories(slug);
CREATE INDEX blog_tags_slug_idx ON blog_tags(slug);