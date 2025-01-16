/*
  # Populate Website Data with Proper Date Handling
  
  1. Companies Data
    - Add all companies with name as unique constraint
  2. Experience Data
    - Add all work experiences with proper date formatting
  3. Education Data
    - Add all education entries with proper date formatting
  4. Skills Data
    - Add all skills with unique names
  5. Certifications Data
    - Add all certifications with proper date formatting
*/

-- Add unique constraint to companies name
ALTER TABLE companies ADD CONSTRAINT companies_name_key UNIQUE (name);

-- Companies
INSERT INTO companies (name, industry, website_url) VALUES
  ('KPMG', 'Consulting', 'https://kpmg.com'),
  ('Infosys Consulting', 'Consulting', 'https://www.infosys.com/consulting'),
  ('Infosys', 'Technology', 'https://www.infosys.com')
ON CONFLICT (name) DO NOTHING;

-- Add unique constraint to institutions name
ALTER TABLE institutions ADD CONSTRAINT institutions_name_key UNIQUE (name);

-- Institutions
INSERT INTO institutions (name, type, location) VALUES
  ('NMIMS Mumbai', 'University', 'Mumbai, India'),
  ('GGSIPU', 'University', 'Delhi, India')
ON CONFLICT (name) DO NOTHING;

-- Add unique constraint to experiences composite key
ALTER TABLE experiences 
  ADD CONSTRAINT experiences_company_role_dates_key 
  UNIQUE (company_id, role, start_date);

-- Experiences
WITH company_ids AS (
  SELECT id, name FROM companies
)
INSERT INTO experiences (company_id, role, start_date, end_date, is_current, description, highlights, order_index)
SELECT 
  c.id,
  'Digital Transformation Consultant',
  DATE '2022-01-01',
  NULL,
  true,
  'Leading digital transformation initiatives and strategic consulting',
  ARRAY[
    'IT Cost Optimization initiatives resulting in 25% cost reduction',
    'Led AR/VR solution implementation for Fortune 500 client',
    'Drove strategic business growth through digital initiatives'
  ],
  1
FROM company_ids c
WHERE c.name = 'KPMG'
UNION ALL
SELECT 
  c.id,
  'Senior Consultant',
  DATE '2020-01-01',
  DATE '2021-12-31',
  false,
  'Led digital transformation projects and process improvements',
  ARRAY[
    'Led digital transformation projects for banking clients',
    'Implemented AI-driven process automation solutions',
    'Managed cross-functional teams of 15+ members'
  ],
  2
FROM company_ids c
WHERE c.name = 'Infosys Consulting'
UNION ALL
SELECT 
  c.id,
  'Technology Analyst',
  DATE '2018-01-01',
  DATE '2019-12-31',
  false,
  'Developed and optimized enterprise solutions',
  ARRAY[
    'Developed enterprise solutions for Fortune 500 clients',
    'Optimized system performance by 40%',
    'Mentored junior developers and interns'
  ],
  3
FROM company_ids c
WHERE c.name = 'Infosys'
ON CONFLICT (company_id, role, start_date) DO NOTHING;

-- Add unique constraint to education composite key
ALTER TABLE education 
  ADD CONSTRAINT education_institution_degree_dates_key 
  UNIQUE (institution_id, degree, start_date);

-- Education
WITH inst_ids AS (
  SELECT id, name FROM institutions
)
INSERT INTO education (institution_id, degree, field_of_study, start_date, end_date, grade, achievements, order_index)
SELECT 
  i.id,
  'MBA',
  'Business Administration',
  DATE '2018-07-01',
  DATE '2020-06-30',
  'Distinction',
  ARRAY['Dean''s List', 'Student Council Member'],
  1
FROM inst_ids i
WHERE i.name = 'NMIMS Mumbai'
UNION ALL
SELECT 
  i.id,
  'B.Tech',
  'Computer Science',
  DATE '2014-07-01',
  DATE '2018-06-30',
  'First Class',
  ARRAY['Technical Committee Lead', 'Programming Contest Winner'],
  2
FROM inst_ids i
WHERE i.name = 'GGSIPU'
ON CONFLICT (institution_id, degree, start_date) DO NOTHING;

-- Add unique constraint to skills name
ALTER TABLE skills ADD CONSTRAINT skills_name_key UNIQUE (name);

-- Skills
INSERT INTO skills (name, category, proficiency, is_featured, order_index) VALUES
  ('Digital Strategy', 'Strategy', 5, true, 1),
  ('IT Advisory', 'Consulting', 5, true, 2),
  ('AR/VR', 'Technology', 4, true, 3),
  ('Team Leadership', 'Management', 5, true, 4),
  ('Stakeholder Management', 'Management', 4, true, 5),
  ('Process Optimization', 'Operations', 4, true, 6),
  ('Change Management', 'Management', 4, true, 7),
  ('Data Analytics', 'Technology', 4, true, 8)
ON CONFLICT (name) DO NOTHING;

-- Add unique constraint to certifications composite key
ALTER TABLE certifications 
  ADD CONSTRAINT certifications_name_issuer_key 
  UNIQUE (name, issuing_organization);

-- Certifications
INSERT INTO certifications (name, issuing_organization, issue_date, credential_url) VALUES
  ('Enterprise Architecture', 'TOGAF', DATE '2022-01-01', 'https://example.com/cert/togaf'),
  ('Lean Six Sigma', 'ASQ', DATE '2021-06-01', 'https://example.com/cert/sixsigma'),
  ('Python Bootcamp', 'DataCamp', DATE '2021-01-01', 'https://example.com/cert/python')
ON CONFLICT (name, issuing_organization) DO NOTHING;