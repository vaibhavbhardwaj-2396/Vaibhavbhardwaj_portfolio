import { Author, Post } from './types';
import heroImage from '../../assets/Hero Image/hero_image.jpeg';

// Demo author
export const demoAuthor: Author = {
  name: 'Vaibhav Bhardwaj',
  role: 'Digital Transformation Consultant',
  avatar: heroImage
};

// Featured post
export const demoFeaturedPost: Post = {
  id: '1',
  slug: 'digital-transformation-2024',
  title: 'Digital Transformation Trends for 2024',
  excerpt: 'Explore the key digital transformation trends that will shape enterprise technology in 2024.',
  content: `
    <h2>The Future of Digital Transformation</h2>
    <p>As we move into 2024, digital transformation continues to be a critical focus for enterprises worldwide. The convergence of emerging technologies and evolving business needs is creating new opportunities and challenges.</p>
    
    <h3>Key Trends</h3>
    <ul>
      <li>AI-Driven Process Automation</li>
      <li>Edge Computing Solutions</li>
      <li>Hybrid Work Technologies</li>
      <li>Blockchain Integration</li>
    </ul>
  `,
  coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
  readTime: 8,
  tags: ['Digital', 'Technology', 'Innovation'],
  author: demoAuthor,
  publishedAt: '2024-01-15'
};

// Regular posts
export const demoRegularPosts: Post[] = [
  {
    id: '2',
    slug: 'ar-vr-enterprise',
    title: 'AR/VR Applications in Enterprise',
    excerpt: 'How AR and VR technologies are transforming enterprise operations and training.',
    content: `
      <h2>The Rise of AR/VR in Enterprise</h2>
      <p>Augmented and Virtual Reality technologies are revolutionizing how enterprises approach training, operations, and customer experience.</p>
      
      <h3>Key Applications</h3>
      <ul>
        <li>Employee Training and Onboarding</li>
        <li>Remote Collaboration</li>
        <li>Product Design and Prototyping</li>
        <li>Customer Experience Enhancement</li>
      </ul>
    `,
    coverImage: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&h=600&fit=crop',
    readTime: 6,
    tags: ['AR/VR', 'Enterprise', 'Technology'],
    author: demoAuthor,
    publishedAt: '2024-01-10'
  },
  {
    id: '3',
    slug: 'leadership-digital-age',
    title: 'Leadership in the Digital Age',
    excerpt: 'Essential leadership skills for navigating digital transformation initiatives.',
    content: `
      <h2>Modern Leadership Challenges</h2>
      <p>Digital transformation requires a new breed of leaders who can navigate both technological and organizational change.</p>
      
      <h3>Critical Skills</h3>
      <ul>
        <li>Digital Literacy and Vision</li>
        <li>Change Management</li>
        <li>Agile Decision Making</li>
        <li>Innovation Mindset</li>
      </ul>
    `,
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
    readTime: 7,
    tags: ['Leadership', 'Management', 'Digital'],
    author: demoAuthor,
    publishedAt: '2024-01-05'
  },
  {
    id: '4',
    slug: 'enterprise-innovation',
    title: 'Driving Enterprise Innovation',
    excerpt: 'Strategies for fostering innovation in large organizations.',
    content: `
      <h2>Innovation at Scale</h2>
      <p>Large organizations face unique challenges in maintaining innovation while managing complexity and risk.</p>
      
      <h3>Key Strategies</h3>
      <ul>
        <li>Innovation Labs and Incubators</li>
        <li>Cross-functional Collaboration</li>
        <li>Rapid Prototyping</li>
        <li>Innovation Metrics and KPIs</li>
      </ul>
    `,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    readTime: 5,
    tags: ['Innovation', 'Enterprise', 'Management'],
    author: demoAuthor,
    publishedAt: '2023-12-28'
  }
];