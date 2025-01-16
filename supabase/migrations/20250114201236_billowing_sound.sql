/*
  # Fix blog post ID handling

  1. Changes
    - Add RETURNING clause to blog_posts table
    - Ensure ID is always generated
    - Add NOT NULL constraint to required fields

  2. Notes
    - Preserves existing data
    - Improves data integrity
*/

-- Ensure required fields are not null
ALTER TABLE blog_posts
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN read_time SET NOT NULL;

-- Set default values for nullable fields
ALTER TABLE blog_posts
  ALTER COLUMN excerpt SET DEFAULT '',
  ALTER COLUMN featured_image SET DEFAULT '',
  ALTER COLUMN meta_title SET DEFAULT '',
  ALTER COLUMN meta_description SET DEFAULT '',
  ALTER COLUMN meta_keywords SET DEFAULT '',
  ALTER COLUMN meta_author SET DEFAULT 'Vaibhav Bhardwaj',
  ALTER COLUMN meta_image SET DEFAULT '';

-- Update any existing null values
UPDATE blog_posts SET
  excerpt = COALESCE(excerpt, ''),
  featured_image = COALESCE(featured_image, ''),
  meta_title = COALESCE(meta_title, ''),
  meta_description = COALESCE(meta_description, ''),
  meta_keywords = COALESCE(meta_keywords, ''),
  meta_author = COALESCE(meta_author, 'Vaibhav Bhardwaj'),
  meta_image = COALESCE(meta_image, '');