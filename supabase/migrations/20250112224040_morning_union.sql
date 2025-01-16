/*
  # Add order_index to certifications table

  1. Changes
    - Add order_index column to certifications table
    - Update existing records with sequential order_index values
    - Add NOT NULL constraint to ensure order_index is always set
*/

-- Add order_index column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'certifications' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE certifications ADD COLUMN order_index integer;
  END IF;
END $$;

-- Update existing records with sequential order_index values
WITH numbered_certs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY issue_date DESC) as row_num
  FROM certifications
)
UPDATE certifications c
SET order_index = n.row_num
FROM numbered_certs n
WHERE c.id = n.id;

-- Make order_index NOT NULL after setting values
ALTER TABLE certifications ALTER COLUMN order_index SET NOT NULL;