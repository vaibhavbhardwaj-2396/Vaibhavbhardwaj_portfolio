/*
  # Add category and tag arrays to blog posts

  1. Changes
    - Add post_categories array column
    - Add post_tags array column
    - Update existing posts with empty arrays

  2. Notes
    - Preserves existing data
    - Adds new columns with default empty arrays
*/

-- Add array columns for categories and tags
DO $$ 
BEGIN
  -- Add post_categories column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'post_categories'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN post_categories text[] DEFAULT '{}';
  END IF;

  -- Add post_tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'post_tags'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN post_tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Update existing posts to ensure arrays are not null
UPDATE blog_posts 
SET 
  post_categories = COALESCE(post_categories, '{}'),
  post_tags = COALESCE(post_tags, '{}')
WHERE post_categories IS NULL OR post_tags IS NULL;