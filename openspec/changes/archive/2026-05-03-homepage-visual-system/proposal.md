## Why

首頁目前僅為佔位內容（`ExampleGrid` 導航連結），缺乏視覺衝擊力與敘事結構，無法有效傳達技術深度。作為 portfolio 站台的門面，首頁需要完整的視覺系統來展示技術廣度（Islands Architecture、多框架整合、動畫層），同時作為各核心功能區塊（Projects、Blog、Skills）的入口。

## What Changes

- **新增** Hero section：全螢幕視差滾動區塊，GSAP ScrollTrigger 驅動文字分層動畫與 parallax 背景效果（React island）
- **新增** Featured Projects 區塊：從 `projects` content collection 取得最新 3 筆，靜態 Astro component 渲染卡片格狀佈局
- **新增** Blog Preview 區塊：從 `blog` + `notes` collection 取得最新 4 筆，靜態 Astro component + Motion v12 viewport 進場動畫（React island `client:visible`）
- **新增** Skills Highlight 區塊：互動式技術棧視覺化亮點，Motion v12 stagger 動畫（React island `client:visible`）
- **修改** `src/pages/index.astro`：替換佔位內容為完整 section 組合
- **移除** 首頁對 `ExampleGrid` 與 `PageHeader` 的直接依賴

## Capabilities

### New Capabilities

- `hero-section`: 全螢幕 Hero 區塊，GSAP ScrollTrigger 滾動動畫，React island `client:load`
- `featured-projects`: 精選專案卡片列表，靜態 Astro，從 projects collection 讀取
- `blog-preview`: 最新文章預覽列表，Motion v12 viewport 進場動畫，React island `client:visible`
- `skills-highlight`: 技術棧亮點展示，Motion v12 stagger，React island `client:visible`

### Modified Capabilities

## Impact

- `src/pages/index.astro`：完整重寫
- `src/components/sections/`：新增 4 個 section 元件
- GSAP 需確認是否已安裝（`@gsap/react`、`gsap`）；若未安裝需新增依賴
- Motion v12（`motion/react`）已在 stack 中，可直接使用
- Content collection 查詢：`getCollection('projects')`、`getCollection('blog')`（含 notes）
- 不影響現有 layout、nav、auth 邊界
