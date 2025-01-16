export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: number;
  tags: string[];
  author: Author;
  publishedAt: string;
}