/*
  # Add Initial Data

  1. New Data
    - Add sample company (KPMG)
    - Add sample experience
    - Add sample education record
    - Add sample skills
    
  2. Purpose
    - Verify database access and policies are working
    - Provide initial content for testing
*/

-- Add a company
INSERT INTO companies (name, industry, website_url)
VALUES (
  'KPMG',
  'Consulting',
  'https://kpmg.com'
) ON CONFLICT DO NOTHING;

-- Add an experience entry
WITH company_id AS (
  SELECT id FROM companies WHERE name = 'KPMG' LIMIT 1
)
INSERT INTO experiences (
  company_id,
  role,
  start_date,
  is_current,
  description,
  highlights,
  order_index
)
SELECT 
  id,
  'Digital Transformation Consultant',
  '2022-01-01',
  true,
  'Leading digital transformation initiatives',
  ARRAY['IT Cost Optimization initiatives resulting in 25% cost reduction', 'Led AR/VR solution implementation for Fortune 500 client'],
  1
FROM company_id
ON CONFLICT DO NOTHING;

-- Add education
INSERT INTO institutions (name, type, location)
VALUES (
  'NMIMS Mumbai',
  'University',
  'Mumbai, India'
) ON CONFLICT DO NOTHING;

WITH inst_id AS (
  SELECT id FROM institutions WHERE name = 'NMIMS Mumbai' LIMIT 1
)
INSERT INTO education (
  institution_id,
  degree,
  field_of_study,
  start_date,
  end_date,
  achievements,
  order_index
)
SELECT 
  id,
  'MBA',
  'Business Administration',
  '2018-07-01',
  '2020-06-30',
  ARRAY['Dean''s List', 'Student Council Member'],
  1
FROM inst_id
ON CONFLICT DO NOTHING;

-- Add skills
INSERT INTO skills (name, category, proficiency, is_featured, order_index)
VALUES 
  ('Digital Strategy', 'Strategy', 5, true, 1),
  ('IT Advisory', 'Consulting', 5, true, 2),
  ('AR/VR', 'Technology', 4, true, 3),
  ('Team Leadership', 'Management', 5, true, 4)
ON CONFLICT DO NOTHING;