# Astro Crafting Journey

個人作品集與技術部落格，以 Astro v6 搭配 Islands Architecture 建置，透過 React 與 Vue 的共存展示多框架整合能力，並作為個人技術品牌的主要展示平台。

## 技術選型

### 核心框架

| 技術 | 版本 | 用途 |
|---|---|---|
| Astro | 6.2.1 | 靜態網站生成，Islands Architecture |
| React | 19 | 互動式 island 元件 |
| Vue | 3.5 | 多框架展示用 island 元件 |
| TypeScript | 5.9 | 嚴格型別模式 |

### 樣式與 UI

| 技術 | 版本 | 說明 |
|---|---|---|
| Tailwind CSS | 4 | 以 `@theme inline` 設定，整合於 `src/styles/globals.css` |
| shadcn/ui | — | 基於 Radix UI primitives 的元件庫 |
| tw-animate-css | 1.4 | Accordion 等動畫，Tailwind v4 相容替代方案 |
| Motion | 12 | 動畫函式庫（`motion/react` import 路徑） |

### 內容與工具

| 技術 | 版本 | 說明 |
|---|---|---|
| MDX | — | Markdown + JSX，支援元件嵌入 |
| Shiki | — | 程式碼語法高亮（github-dark-dimmed 主題） |
| Zod | 4 | Schema 驗證，用於 Content Collections 與表單 |
| React Hook Form | 7.55+ | 表單狀態管理 |
| @hookform/resolvers | 5 | Zod v4 resolver |
| Vitest | 4 | 單元測試（`node` 環境，無 jsdom） |

## 開發指令

```bash
pnpm dev          # 啟動開發伺服器，預設 localhost:4321
pnpm build        # 型別檢查 + 建置 dist/
pnpm preview      # 預覽 production 建置
pnpm astro:check  # 僅執行 Astro 型別檢查
pnpm test:once    # 執行所有測試
pnpm lint         # ESLint 檢查
pnpm lint:fix     # ESLint 自動修正
pnpm format       # Prettier 格式化
```

## 專案結構

```
src/
├── components/
│   ├── ui/           # shadcn/ui 基礎元件（Radix UI + Tailwind）
│   ├── layout/       # 頁面結構元件（Header、Footer、Nav）
│   ├── sections/     # 各頁面區塊（Hero、Features 等）
│   └── forms/        # 表單 island 元件（React）
├── content/
│   ├── blog/         # 技術文章與 MDX 貼文
│   ├── notes/        # 開發筆記與程式碼片段
│   └── projects/     # 作品集資料
├── layouts/          # 頁面模板（base、main、blog-post、auth）
├── pages/            # 路由頁面
├── config/           # 網站設定（site、nav-menu、about、landing）
├── lib/              # 工具函式（utils、seo、fetchers、toc）
├── plugins/          # Remark 插件（remark-reading-time）
├── hooks/            # React hooks（use-mounted）
└── styles/
    └── globals.css   # Tailwind v4 入口（@import、@theme inline、CSS 變數）

astro.config.mjs      # @tailwindcss/vite 位於 vite.plugins；remarkReadingTime 位於 mdx
```

## 路由架構

```
/               首頁
/blog           技術部落格（文章 + 筆記統一入口）
/blog/category/ 分類頁面
/projects       作品集
/skills         互動式技術堆疊視覺化
/about          個人簡介與開發時間軸
/contact        聯絡表單（React Hook Form + Zod）
```

## Content Collections

Schema 定義位於 `src/content.config.ts`。

**blog** 必填欄位：`title`、`description`、`publishedAt`、`coverImage`、`category`

**notes** 必填欄位：`title`、`createdAt`、`tags`、`category`、`type`（`learning` | `snippet` | `reference`）

**projects** 必填欄位：`title`、`description`、`technologies`、`images`、`status`、`startDate`

## Islands 策略

- **React island**：互動性強、有狀態的元件（表單、動畫、未來的 Tiptap 編輯器）
- **Vue island**：多框架展示用途
- **純 Astro**：靜態內容，預設零 JavaScript
- `client:load`：首屏互動元件；`client:idle`：延遲載入；`client:visible`：捲動至可視區域才載入

## Tailwind v4 注意事項

- 不再使用 `tailwind.config.js`；所有主題設定改在 `src/styles/globals.css` 的 `@theme inline {}` 內
- `@tailwindcss/vite` 作為 Vite plugin 運行（在 `astro.config.mjs` 的 `vite.plugins`）
- Dark mode 以 `@custom-variant dark (&:where(.dark, .dark *))` 宣告
- 使用 `@apply !my-0` 語法（v4 不支援 `@apply ... !important`）
- 自訂 `@utility container` 取代 v3 的 `theme.container` 設定

## 目標架構（規劃中）

```
Browser
  └── Cloudflare Workers (edge_auth_layer)  ← Hono，JWT 驗證 / Rate limiting
        └── Astro origin（本專案）
```

Cloudflare KV 用於 JWT 黑名單與 Session metadata 儲存。後台管理路由（`/admin/*`）將在 edge 層進行第一道驗證。

## Claude Code Hooks

PostToolUse hook：編輯或寫入檔案後自動更新 README 的開發活動紀錄。設定位於 `.claude/settings.json`，腳本為 `.claude/hooks/update-readme.sh`。

---

## 開發活動紀錄

*由 Claude Code Hooks 自動追蹤*

- **2026-05-03**: 更新頁面架構

- **2026-05-03**: 升級套件至最新主要版本（React 19、Tailwind v4、Zod v4、Motion v12 等）

