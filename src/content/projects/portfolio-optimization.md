---
title: "Astro 作品集網站優化專案"
description: "使用 Astro v5 建立高效能、SEO 友好的個人作品集網站，整合 Islands Architecture 和進階動畫效果。"
technologies: ["Astro", "TypeScript", "Tailwind CSS", "GSAP", "Three.js", "React", "Vue"]
githubUrl: "https://github.com/example/astro-portfolio"
liveUrl: "https://portfolio.example.com"
images: ["/images/projects/portfolio-1.jpg", "/images/projects/portfolio-2.jpg"]
featured: true
status: "in-progress"
startDate: 2024-01-01
highlights: [
  "Core Web Vitals 分數達到 95+",
  "完整的 SEO 優化系統",
  "Islands Architecture 多框架整合",
  "GSAP + Three.js 進階動畫效果",
  "Content Collections 內容管理"
]
---

# Astro 作品集網站優化專案

這是一個使用 Astro v5 建立的高效能個人作品集網站，展示了現代前端開發的最佳實踐。

## 專案特色

### 🚀 極致效能優化
- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Islands Architecture**: 選擇性 hydration，最小化 JavaScript bundle
- **圖片優化**: WebP/AVIF 格式，響應式載入
- **字體優化**: font-display: swap，預載入關鍵字體

### 🔍 完整 SEO 系統
- **結構化資料**: JSON-LD 格式，支援 BlogPosting, Person, WebSite schema
- **Meta Tags**: 完整的 Open Graph 和 Twitter Card 支援
- **語義化 HTML**: 正確的標題層級和 ARIA 標籤
- **Sitemap**: 自動生成，整合 Content Collections

### 🎨 進階動畫效果
- **GSAP ScrollTrigger**: 滾動驅動動畫
- **Three.js Canvas**: 3D 粒子系統和互動模型
- **效能優化**: 智慧降級，支援 prefers-reduced-motion

### 🏗️ 技術架構
- **Astro v5**: 最新版本，完整 TypeScript 支援
- **Content Collections**: 類型安全的內容管理
- **多框架整合**: React 和 Vue 元件並存
- **Tailwind CSS**: 響應式設計系統

## 實作亮點

### Content Collections 整合
使用 Astro Content Collections 管理部落格文章、學習筆記和專案展示：

```typescript
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
```

### SEO 優化系統
自動生成結構化資料和 meta tags：

```typescript
export function generatePostMeta(post: BlogPost): SEOProps {
  return {
    title: post.data.seo?.title || post.data.title,
    description: post.data.seo?.description || post.data.description,
    type: 'article',
    publishedTime: post.data.publishedAt.toISOString(),
    tags: post.data.tags,
  };
}
```

### Islands Architecture
選擇性 hydration 策略：

```astro
<!-- 僅在可見時載入 -->
<InteractiveComponent client:visible />

<!-- 僅在閒置時載入 -->
<AnimationComponent client:idle />

<!-- 立即載入關鍵功能 -->
<SearchComponent client:load />
```

## 效能表現

- **Lighthouse 分數**: 95+ (Performance, SEO, Accessibility)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Bundle Size**: < 100KB (gzipped)

## 未來規劃

- [ ] 整合 Golang 後端 API
- [ ] 實作互動式 Like 系統
- [ ] 加入留言和社群功能
- [ ] 建立內容創作工作流程
- [ ] 實作進階分析系統

這個專案展示了如何使用現代前端技術建立一個高效能、功能完整的個人網站。