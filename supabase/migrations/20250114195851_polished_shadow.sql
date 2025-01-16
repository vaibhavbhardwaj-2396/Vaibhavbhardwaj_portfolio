/*
  # Seed Blog Categories and Tags

  1. Initial Data
    - Add default blog categories
    - Add default blog tags
    - Add sample blog post

  2. Changes
    - Insert initial categories for Digital Transformation, Technology, Innovation, etc.
    - Insert initial tags for common topics
    - Insert a sample blog post with proper relationships
*/

-- Insert Blog Categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Digital Transformation', 'digital-transformation', 'Articles about digital transformation strategies and implementation'),
  ('Technology', 'technology', 'Latest technology trends and insights'),
  ('Innovation', 'innovation', 'Innovation in business and technology'),
  ('Leadership', 'leadership', 'Thoughts on leadership and management'),
  ('Enterprise', 'enterprise', 'Enterprise technology and solutions')
ON CONFLICT (slug) DO NOTHING;

-- Insert Blog Tags
INSERT INTO blog_tags (name, slug) VALUES
  ('Digital', 'digital'),
  ('Technology', 'technology'),
  ('Innovation', 'innovation'),
  ('AR/VR', 'ar-vr'),
  ('Enterprise', 'enterprise'),
  ('Leadership', 'leadership'),
  ('Management', 'management')
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Blog Post
WITH new_post AS (
  INSERT INTO blog_posts (
    title,
    slug,
    excerpt,
    content,
    featured_image,
    status,
    read_time,
    meta_title,
    meta_description,
    published_at,
    author_id
  ) VALUES (
    'Digital Transformation Trends for 2024',
    'digital-transformation-2024',
    'Explore the key digital transformation trends that will shape enterprise technology in 2024.',
    '
<h2>The Future of Digital Transformation</h2>
<p>As we move into 2024, digital transformation continues to be a critical focus for enterprises worldwide. The convergence of emerging technologies and evolving business needs is creating new opportunities and challenges.</p>

<h3>Key Trends</h3>
<ul>
  <li>AI-Driven Process Automation</li>
  <li>Edge Computing Solutions</li>
  <li>Hybrid Work Technologies</li>
  <li>Blockchain Integration</li>
</ul>

<h2>Strategic Implementation</h2>
<p>Success in digital transformation requires a well-planned approach that considers both technological capabilities and organizational readiness. Here are some key considerations:</p>

<ul>
  <li>Assess current digital maturity</li>
  <li>Identify high-impact opportunities</li>
  <li>Develop a clear roadmap</li>
  <li>Focus on change management</li>
</ul>

<h3>Looking Ahead</h3>
<p>The pace of digital transformation shows no signs of slowing. Organizations that can effectively leverage these trends while maintaining security and scalability will be best positioned for success in the coming years.</p>
    ',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
    'published',
    8,
    'Digital Transformation Trends 2024',
    'Key digital transformation trends and strategies for enterprise success in 2024',
    NOW(),
    (SELECT id FROM auth.users WHERE email = 'vaibhavbhardwaj2396@gmail.com' LIMIT 1)
  )
  RETURNING id
)
INSERT INTO post_categories (post_id, category_id)
SELECT 
  new_post.id,
  blog_categories.id
FROM new_post, blog_categories
WHERE blog_categories.slug IN ('digital-transformation', 'technology')
ON CONFLICT DO NOTHING;

-- Add tags to the sample post
WITH post_id AS (
  SELECT id FROM blog_posts WHERE slug = 'digital-transformation-2024' LIMIT 1
)
INSERT INTO post_tags (post_id, tag_id)
SELECT 
  post_id.id,
  blog_tags.id
FROM post_id, blog_tags
WHERE blog_tags.slug IN ('digital', 'technology', 'innovation')
ON CONFLICT DO NOTHING;