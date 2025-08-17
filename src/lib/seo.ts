import type { CollectionEntry } from 'astro:content';
import { siteConfig } from '@/config/site';

export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
  canonicalUrl?: string;
}

export type BlogPost = CollectionEntry<'blog'>;
export type Note = CollectionEntry<'notes'>;
export type Project = CollectionEntry<'projects'>;

// 內容篩選工具
export function filterPublishedPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter(post => !post.data.draft);
}

export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => 
    b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
}

export function getPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  return posts.filter(post => post.data.category === category);
}

export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter(post => post.data.tags && post.data.tags.includes(tag));
}

export function getFeaturedPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter(post => post.data.featured);
}

// 相關文章推薦
export function getRelatedPosts(
  currentPost: BlogPost, 
  allPosts: BlogPost[], 
  limit: number = 3
): BlogPost[] {
  const related = allPosts
    .filter(post => post.id !== currentPost.id)
    .filter(post => !post.data.draft)
    .map(post => ({
      post,
      score: calculateSimilarity(currentPost, post)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
  
  return related;
}

function calculateSimilarity(post1: BlogPost, post2: BlogPost): number {
  const tags1 = post1.data.tags || [];
  const tags2 = post2.data.tags || [];
  const commonTags = tags1.filter(tag => tags2.includes(tag)).length;
  const categoryMatch = post1.data.category === post2.data.category ? 1 : 0;
  
  return commonTags * 2 + categoryMatch;
}

// SEO 工具
export function generatePostMeta(post: BlogPost): SEOProps {
  return {
    title: post.data.seo?.title || post.data.title,
    description: post.data.seo?.description || post.data.description,
    image: post.data.coverImage,
    type: 'article',
    publishedTime: post.data.publishedAt.toISOString(),
    modifiedTime: post.data.updatedAt?.toISOString(),
    tags: post.data.tags || [],
  };
}

export function generateNoteMeta(note: Note): SEOProps {
  return {
    title: note.data.title,
    description: note.data.description || `${note.data.type} note about ${note.data.category}`,
    type: 'article',
    publishedTime: note.data.createdAt.toISOString(),
    modifiedTime: note.data.updatedAt?.toISOString(),
    tags: note.data.tags,
  };
}

export function generateProjectMeta(project: Project): SEOProps {
  return {
    title: project.data.title,
    description: project.data.description,
    image: project.data.images && project.data.images.length > 0 ? project.data.images[0] : undefined,
    type: 'article',
    publishedTime: project.data.startDate.toISOString(),
    modifiedTime: project.data.endDate?.toISOString(),
    tags: project.data.technologies,
  };
}

// 生成頁面標題
export function generatePageTitle(title: string): string {
  return title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
}

// 生成規範 URL
export function generateCanonicalUrl(pathname: string, site: URL): string {
  return new URL(pathname, site).toString();
}