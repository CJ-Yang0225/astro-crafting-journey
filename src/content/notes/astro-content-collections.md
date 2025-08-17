---
title: "Astro Content Collections 完整指南"
description: "學習如何使用 Astro Content Collections 管理內容，包含 schema 定義、類型安全、以及最佳實踐。"
createdAt: 2024-01-10
updatedAt: 2024-01-15
tags: ["Astro", "Content Collections", "TypeScript", "Static Site"]
category: "前端開發"
type: "learning"
difficulty: "intermediate"
technologies: ["Astro", "TypeScript", "Zod"]
---

# Astro Content Collections 完整指南

Astro Content Collections 是 Astro v2.0 引入的強大內容管理系統，提供類型安全的內容處理能力。

## 基礎設置

### 1. 定義 Collection Schema

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  'blog': blogCollection,
};
```

### 2. 內容查詢

```typescript
import { getCollection, getEntry } from 'astro:content';

// 獲取所有文章
const posts = await getCollection('blog');

// 獲取特定文章
const post = await getEntry('blog', 'my-post');

// 條件篩選
const featuredPosts = await getCollection('blog', ({ data }) => {
  return data.featured === true;
});
```

## 進階功能

### 類型安全

Content Collections 提供完整的 TypeScript 支援：

```typescript
import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

function processPost(post: BlogPost) {
  // 完整的類型提示和檢查
  console.log(post.data.title);
  console.log(post.data.publishedAt);
}
```

### 內容驗證

Zod schema 提供運行時驗證：

```typescript
const blogSchema = z.object({
  title: z.string().min(1, "標題不能為空"),
  publishedAt: z.date().refine(
    date => date <= new Date(),
    "發布日期不能是未來時間"
  ),
});
```

## 最佳實踐

1. **使用語義化的 collection 名稱**
2. **定義完整的 schema 驗證**
3. **善用條件篩選功能**
4. **結合 TypeScript 獲得最佳開發體驗**

Content Collections 讓內容管理變得更加簡單和安全！