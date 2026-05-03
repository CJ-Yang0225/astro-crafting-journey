## Context

首頁目前為佔位結構，使用 `ExampleGrid` 列舉導覽項目。本次設計引入四個視覺區塊，每個區塊依互動程度決定渲染策略：純靜態用 Astro component，需 JS 的動畫效果封裝為 React island。

現有基礎設施可直接沿用：Tailwind CSS v4 樣式系統、shadcn/ui 元件、`motion/react` v12、content collection 查詢工具。GSAP 需確認安裝狀態。

## Goals / Non-Goals

**Goals:**
- 首頁呈現完整視覺敘事：Hero → Projects → Blog → Skills
- 正確示範 Astro Islands Architecture 分層策略
- GSAP ScrollTrigger 滾動動畫（Hero，`client:load`）
- Motion v12 viewport 進場動畫（Blog Preview、Skills Highlight，`client:visible`）
- Featured Projects 純靜態 Astro（無 JS overhead）
- `pnpm build` 通過，型別檢查無誤

**Non-Goals:**
- 管理後台、auth 邊界變動
- Three.js / WebGL 效果（規劃為後續 island）
- CMS 整合或動態資料更新
- 深色/淺色主題切換（沿用現有主題設定）

## Decisions

### 決策 1：Hero 動畫選用 GSAP ScrollTrigger（React island）

**選擇**：`hero-section.tsx` 以 `client:load` 掛載，內部使用 `@gsap/react` 的 `useGSAP` hook 管理動畫生命週期。

**原因**：ScrollTrigger 需要 DOM 測量，必須在 browser 環境執行；`useGSAP` 自動清理 context，避免 SSR 污染與 React StrictMode double-mount 問題。Motion v12 沒有 ScrollTrigger 等效的 pin/scrub API，無法替代。

**替代方案**：純 CSS scroll-driven animations — 瀏覽器支援度尚不足（Safari 17.2+），且無法達到 pin 效果。

### 決策 2：Featured Projects 使用純 Astro component

**選擇**：`featured-projects.astro`，在 build time 以 `getCollection('projects')` 取得資料，無 client JS。

**原因**：專案卡片為靜態展示，無互動狀態需求。純 Astro 零 JS bundle，符合 Astro-first 原則。Hover 效果以 Tailwind CSS transition 實現。

### 決策 3：Blog Preview 進場動畫使用 Motion v12（React island，`client:visible`）

**選擇**：`blog-preview.tsx` 接收 Astro 在 build time 取好的文章資料（props 傳入），island 只負責動畫。

**原因**：將資料查詢留在 Astro build step，island 接收序列化 props，無額外 API call。Motion v12 的 `whileInView` / `useInView` 語法簡潔，適合 stagger 列表進場。

### 決策 4：Skills Highlight 使用 Motion v12（React island，`client:visible`）

**選擇**：`skills-highlight.tsx`，技術棧資料從 `src/config/` 靜態匯入，Motion `AnimatePresence` + stagger 實現依序浮現。

**原因**：無伺服器資料依賴，純前端展示。`client:visible` 確保 below-fold 不佔用初始 bundle 解析時間。

### 決策 5：GSAP 安裝策略

若 `gsap` 尚未安裝，執行 `pnpm add gsap @gsap/react`。所有 GSAP import 限於 island 檔案內，防止 SSR 期間執行。

## Risks / Trade-offs

- **[Risk] GSAP ScrollTrigger resize 殘留** → Mitigation：`useGSAP` return cleanup，`ScrollTrigger.refresh()` 掛在 ResizeObserver。
- **[Risk] 序列化 props 型別不符** → Mitigation：Astro 端用 `CollectionEntry<'projects'>['data']` 型別，island 端定義對應 interface，build time 即報錯。
- **[Trade-off] Hero 為 `client:load`** → 增加初始 JS bundle；但 Hero 是 above-fold 主視覺，延遲載入會造成 CLS，此 trade-off 可接受。
- **[Risk] 無 blog/projects 內容時 UI 空白** → Mitigation：各區塊加入 empty state 條件渲染（`items.length === 0` 時隱藏該 section）。

## Migration Plan

1. 確認 / 安裝 `gsap @gsap/react`
2. 新增 section 元件至 `src/components/sections/`
3. 更新 `src/pages/index.astro`，移除 `ExampleGrid` 依賴
4. 執行 `pnpm astro:check` 確認型別
5. 執行 `pnpm build` 確認建置

**Rollback**：直接還原 `src/pages/index.astro` 至 `ExampleGrid` 版本；section 元件為新增檔案，不影響其他頁面。

## Open Questions

- `src/config/landing.ts` 是否已有 Skills 資料結構可沿用？（實作前確認）
- 設計風格細節（配色、排版）由 `/frontend-design` skill 執行時決定。
