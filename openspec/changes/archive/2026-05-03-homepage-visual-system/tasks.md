## 1. Setup & Dependencies

- [x] 1.1 確認 `gsap` 與 `@gsap/react` 是否已安裝（`pnpm list gsap`）；若未安裝執行 `pnpm add gsap @gsap/react`
- [x] 1.2 確認 `src/config/landing.ts` 技術棧資料結構，若不存在則建立並定義 `SkillCategory` 型別與分組資料
- [x] 1.3 執行 `pnpm astro:check` 確認現有 type check 通過（baseline 確認）

## 2. Hero Section Island（GSAP ScrollTrigger）

- [x] 2.1 建立 `src/components/sections/hero-section.tsx`（React island）：定義靜態 HTML 結構，含主標題、副標題、兩個 CTA 按鈕（`/projects`、`/blog`），min-height: 100dvh 佈局
- [x] 2.2 使用 `/frontend-design` skill 設計 Hero 視覺系統：全螢幕排版、主標題排印、CTA 按鈕樣式、背景視覺層（需 "distinctive, production-grade, avoid generic AI aesthetics"）
- [x] 2.3 使用 `useGSAP` hook 實作 GSAP ScrollTrigger animation：文字層 `opacity` + `y` 淡出動畫，背景層 0.5x parallax scrub（參考 `gsap.to()` with `ScrollTrigger` plugin）
- [x] 2.4 確保 `useGSAP` cleanup 正確清理 GSAP context 與 ScrollTrigger instances（gsap cleanup on unmount）
- [x] 2.5 在 Hero island 加入 `immediatelyRender: false` 防止 SSR 期間執行 GSAP
- [x] 2.6 驗證：`pnpm astro:check` 型別通過；在 `pnpm dev` 目視確認 ScrollTrigger 動畫與 parallax 效果

## 3. Featured Projects Section（純 Astro）

- [x] 3.1 建立 `src/components/sections/featured-projects.astro`：在 frontmatter 以 `getCollection('projects')` 取得最新 3 筆（依 `startDate` 降序），空集合時整個 section 不渲染
- [x] 3.2 實作專案卡片元件（inline 或抽為 `src/components/ui/project-card.astro`）：顯示封面圖、標題、描述（截斷 120 字）、技術 tags（最多 5 個）、狀態 badge
- [x] 3.3 使用 `/frontend-design` skill 設計卡片 UI：格狀佈局（mobile 單欄 / tablet 雙欄 / desktop 三欄）、hover 效果（純 Tailwind CSS transition，零 JS）
- [x] 3.4 驗證：`pnpm build` 無 type error；確認 section bundle 貢獻零 client JS

## 4. Blog Preview Section（Motion v12 island）

- [x] 4.1 建立 `src/components/sections/blog-preview.tsx`（React island，`client:visible`）：接收 `posts` props（Astro 傳入 build-time 查詢結果），空陣列時 section 不渲染
- [x] 4.2 在 `src/pages/index.astro` frontmatter 合併 `blog` + `notes` collection，取最新 4 筆（統一排序欄位），序列化為 island props
- [x] 4.3 使用 Motion v12 `motion` component 實作 `whileInView` stagger 進場動畫：`opacity` 0→1、`y` 20→0，各項目間隔 80ms（`transition={{ delay: index * 0.08 }}`）
- [x] 4.4 使用 `/frontend-design` skill 設計文章列表 UI：日期、category/type badge、標題、描述摘要排版
- [x] 4.5 驗證：`pnpm astro:check`；目視確認 viewport 進入時 stagger 動畫觸發

## 5. Skills Highlight Section（Motion v12 island）

- [x] 5.1 建立 `src/components/sections/skills-highlight.tsx`（React island，`client:visible`）：接收 `skillGroups` props（從 config 靜態匯入後由 Astro 傳入）
- [x] 5.2 使用 Motion v12 `motion` component 實作分組 stagger 進場動畫：`opacity` 0→1、`scale` 0.9→1、`y` 10→0，每項 50ms stagger，每組間隔 120ms
- [x] 5.3 加入 `whileHover={{ scale: 1.05 }}` hover 互動效果於各技術項目
- [x] 5.4 使用 `/frontend-design` skill 設計技術棧展示 UI：分組標題、技術 pill/badge 樣式、圖示整合（astro-icon / iconify）
- [x] 5.5 驗證：`pnpm astro:check`；目視確認 stagger 動畫與 hover 效果

## 6. 首頁組合與整合

- [x] 6.1 重寫 `src/pages/index.astro`：引入四個 section，移除 `ExampleGrid` 與 `PageHeader` 依賴；Hero 用 `client:load`，Blog Preview 與 Skills Highlight 用 `client:visible`
- [x] 6.2 確認 section 順序：Hero → Featured Projects → Blog Preview → Skills Highlight
- [x] 6.3 執行 `pnpm build` 確認完整建置通過（型別 + build）
- [x] 6.4 執行 `pnpm lint` 確認 ESLint 無錯誤（pre-existing config error，與本次改動無關）
- [x] 6.5 在 `pnpm preview` 目視驗證完整首頁：各 section 正常顯示、動畫觸發正確、CTA 連結可導航、mobile RWD 佈局正常
