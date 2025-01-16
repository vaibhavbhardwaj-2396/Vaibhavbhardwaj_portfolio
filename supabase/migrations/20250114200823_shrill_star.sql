/*
  # Add metadata columns to blog_posts table

  1. Changes
    - Add meta_keywords column
    - Add meta_author column
    - Add meta_image column

  2. Notes
    - Preserves existing data
    - Adds new columns with default values
*/

-- Add new metadata columns if they don't exist
DO $$ 
BEGIN
  -- Add meta_keywords column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN meta_keywords text;
  END IF;

  -- Add meta_author column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'meta_author'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN meta_author text DEFAULT 'Vaibhav Bhardwaj';
  END IF;

  -- Add meta_image column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'meta_image'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN meta_image text;
  END IF;
END $$;

-- Update existing posts to set meta_image to featured_image if null
UPDATE blog_posts 
SET 
  meta_image = featured_image,
  meta_keywords = CASE 
    WHEN meta_keywords IS NULL THEN ''
    ELSE meta_keywords
  END
WHERE meta_image IS NULL;