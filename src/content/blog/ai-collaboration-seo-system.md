---
title: "與 AI 協作重構 Astro 網站的 SEO 系統"
description: "記錄如何與 Kiro AI 和 Claude Code 三方協作，從混亂的內容結構到完整 SEO 優化系統的實戰過程"
publishedAt: "2025-08-14T01:41:00+08:00"
updatedAt: "2025-08-15T01:26:00+08:00"
category: "開發實戰"
tags: ["Astro", "SEO", "AI協作", "Content Collections", "開發日誌", "重構"]
series: "AI協作開發日誌"
difficulty: "intermediate"
featured: true
coverImage: "/images/blog/ai-seo-collaboration.jpg"
seo:
  title: "AI協作實戰：重構 Astro SEO 系統的完整記錄"
  description: "深度記錄與 AI 協作開發的真實過程，從問題發現到系統重構的完整實戰經驗"
  keywords: ["AI協作開發", "Astro SEO", "Content Collections", "系統重構", "開發日誌"]
---

# 與 AI 協作重構 Astro 網站的 SEO 系統

今天決定要好好整理一下個人網站的 SEO 系統。原本的實作有點零散，Content Collections 的結構也不夠一致，是時候來個徹底的重構了。

## 發現問題的契機

最近在檢視網站的搜尋引擎表現時，發現了幾個問題：部落格文章的 meta tags 不夠完整、結構化資料缺失、sitemap 的優先級設定也不太合理。更重要的是，Content Collections 的 schema 設計有些混亂，有些文章用 `pubDate`，有些用 `publishedAt`，這種不一致性讓後續的開發變得困難。

與 Kiro AI 討論後，我們決定採用 Spec 驅動的方式來重構整個 SEO 系統。這樣可以確保需求明確，實作過程也更有條理。

## 重構的核心思路

### Content Collections 統一化

首先要解決的是資料結構不一致的問題。經過討論，我們決定：

- 統一使用 `publishedAt` 和 `updatedAt` 作為日期欄位
- 將 `cover` 改為更語義化的 `coverImage`
- 為所有文章添加 `tags` 陣列，即使舊文章沒有也給預設值
- 新增 `seo` 物件來存放專門的 SEO 設定

這個決定看似簡單，但需要更新所有現有的部落格文章。好在有 AI 協助，這個過程變得相對輕鬆。

### SEO 系統的分層設計

我們將 SEO 功能拆分成幾個獨立的模組：

**基礎層**：`BaseHead` 組件負責所有基本的 meta tags，包含 Open Graph、Twitter Card、canonical URL 等。

**工具層**：`seo.ts` 提供各種 SEO 相關的工具函數，像是生成頁面標題、處理 meta 資料等。

**結構化資料層**：獨立的 `StructuredData` 組件，根據內容類型自動生成對應的 JSON-LD。

**佈局層**：新的 `OptimizedLayout` 整合所有 SEO 功能，提供統一的介面。

## 實作過程中的挑戰

### 向後相容性的考量

最大的挑戰是如何在不破壞現有內容的情況下進行重構。我們採用了漸進式的方法：

首先在 Content Collections 的 schema 中同時支援新舊格式，然後透過 `transform` 函數將資料統一化。這樣既能保持向後相容，又能逐步遷移到新的結構。

不過後來發現這樣會讓程式碼變得複雜，最終還是決定直接更新所有現有文章的 frontmatter。雖然工作量大一些，但長遠來看更乾淨。

### 建置過程的意外

重構過程中遇到了一些建置問題。原來專案中有一些頁面設定了 `prerender = false`，但沒有安裝對應的 adapter，導致建置失敗。

還有 RSS 功能的 API 格式也需要更新，從舊的 `get` 函數改為新的 `GET` 函數。這些看似小問題，但如果沒有及時發現和解決，會影響整個部署流程。

幸好有 Claude Code 的協助，這些技術細節很快就得到了解決。

## 結構化資料的設計思考

這次特別花心思在結構化資料的設計上。我們不只是簡單地加上 JSON-LD，而是根據不同的內容類型提供對應的 schema：

- 部落格文章使用 `BlogPosting`
- 學習筆記使用 `Article`  
- 專案展示使用 `CreativeWork`
- 網站首頁使用 `WebSite` 和 `Person`

每種類型都有對應的欄位映射，確保搜尋引擎能正確理解內容的性質和結構。

## 效果驗證

重構完成後，我們進行了完整的測試：

**建置測試**：確保所有頁面都能正常生成，沒有型別錯誤或建置失敗。

**SEO 檢查**：檢視生成的 HTML，確認 meta tags、結構化資料、canonical URL 等都正確設定。

**Sitemap 驗證**：確認 sitemap 包含所有頁面，並且優先級設定合理。

從最終生成的 HTML 可以看到，每個頁面都有完整的 SEO 設定：完整的 meta tags、正確的 Open Graph 資料、適當的結構化資料，以及優化的字體載入策略。

## 協作過程的反思

這次與 AI 協作的經驗讓我印象深刻。Kiro AI 在需求分析和架構設計上提供了很好的建議，而 Claude Code 則在技術實作的細節上幫了大忙。

特別是在遇到建置問題時，能夠快速定位問題並提供解決方案，大大提升了開發效率。當然，作為開發者，我需要對整個系統有清楚的理解，知道什麼時候該相信 AI 的建議，什麼時候需要自己做判斷。

## 下一步的計畫

SEO 系統的基礎已經建立完成，接下來可以考慮：

- 加入更多互動功能，像是文章的 like 系統
- 實作更精細的效能優化
- 建立內容創作的工作流程
- 加入分析和監控功能

這次重構不只是技術上的提升，更重要的是建立了一個可擴展、可維護的基礎架構。未來無論是加入新功能還是優化現有系統，都會更加容易。

透過這次協作，我也更深刻地體會到 AI 輔助開發的價值。它不是要取代開發者，而是成為一個強大的協作夥伴，讓我們能專注在更有創意和策略性的工作上。