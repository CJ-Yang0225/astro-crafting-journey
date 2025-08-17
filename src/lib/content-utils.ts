import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { ReadingTimeData } from '@/types/reading-time';

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
  const commonTags = post1.data.tags.filter(tag => 
    post2.data.tags.includes(tag)
  ).length;
  const categoryMatch = post1.data.category === post2.data.category ? 1 : 0;
  
  return commonTags * 2 + categoryMatch;
}

// 獲取所有分類
export async function getAllCategories(): Promise<string[]> {
  const posts = await getCollection('blog');
  const categories = new Set(posts.map(post => post.data.category));
  return Array.from(categories).sort();
}

// 獲取所有標籤
export async function getAllTags(): Promise<string[]> {
  const posts = await getCollection('blog');
  const tags = new Set(posts.flatMap(post => post.data.tags));
  return Array.from(tags).sort();
}

// 獲取分類統計
export async function getCategoryStats(): Promise<Record<string, number>> {
  const posts = await getCollection('blog');
  const publishedPosts = filterPublishedPosts(posts);
  
  const stats: Record<string, number> = {};
  publishedPosts.forEach(post => {
    stats[post.data.category] = (stats[post.data.category] || 0) + 1;
  });
  
  return stats;
}

// 獲取標籤統計
export async function getTagStats(): Promise<Record<string, number>> {
  const posts = await getCollection('blog');
  const publishedPosts = filterPublishedPosts(posts);
  
  const stats: Record<string, number> = {};
  publishedPosts.forEach(post => {
    post.data.tags.forEach(tag => {
      stats[tag] = (stats[tag] || 0) + 1;
    });
  });
  
  return stats;
}

// 獲取閱讀時間（從 frontmatter 或計算）
export function getReadingTime(post: BlogPost): ReadingTimeData | null {
  // 嘗試從 frontmatter 獲取（由 remark plugin 注入）
  const frontmatter = post.data as any;
  if (frontmatter.readingTime) {
    return frontmatter.readingTime;
  }
  
  // 如果沒有，返回 null，讓組件處理
  return null;
}

// 格式化日期
export function formatDate(date: Date, includeTime: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.timeZone = 'Asia/Taipei';
  }
  
  return new Intl.DateTimeFormat('zh-TW', options).format(date);
}

// 格式化完整日期時間
export function formatDateTime(date: Date): string {
  return formatDate(date, true);
}

// 智慧日期格式化：如果是今天只顯示時間，否則顯示日期
export function formatSmartDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return new Intl.DateTimeFormat('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Taipei',
    }).format(date);
  }
  
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  return new Intl.DateTimeFormat('zh-TW', {
    year: isThisYear ? undefined : 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Taipei',
  }).format(date);
}

// 格式化相對時間
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: '年', seconds: 31536000 },
    { label: '個月', seconds: 2592000 },
    { label: '週', seconds: 604800 },
    { label: '天', seconds: 86400 },
    { label: '小時', seconds: 3600 },
    { label: '分鐘', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}前`;
    }
  }
  
  return '剛剛';
}

// 生成文章摘要
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // 移除 Markdown 語法
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 標題
    .replace(/\*\*(.*?)\*\*/g, '$1') // 粗體
    .replace(/\*(.*?)\*/g, '$1') // 斜體
    .replace(/`(.*?)`/g, '$1') // 行內程式碼
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 連結
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 圖片
    .replace(/\n+/g, ' ') // 換行
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}