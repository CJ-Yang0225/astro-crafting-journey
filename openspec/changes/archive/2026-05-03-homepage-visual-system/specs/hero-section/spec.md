## ADDED Requirements

### Requirement: Hero section 全螢幕顯示

Hero section SHALL 佔滿視窗高度（min-height: 100dvh），包含主標題、副標題、CTA 按鈕群組，以及視差背景層。

#### Scenario: 初始渲染

- **WHEN** 使用者首次載入首頁
- **THEN** Hero section 立即顯示，不發生 CLS（Cumulative Layout Shift）

#### Scenario: SSR 輸出

- **WHEN** Astro 在 build time 渲染頁面
- **THEN** Hero 的靜態 HTML 結構完整輸出，無 GSAP 相關 JS 在 SSR 期間執行

### Requirement: GSAP ScrollTrigger scroll animation

Hero island SHALL trigger layered parallax animation on scroll: text layers fade out with y-offset, background layer moves at 0.5x scroll rate.

#### Scenario: scroll down past 30%

- **WHEN** user scrolls past 30% of Hero height
- **THEN** headline begins fading out with upward y movement, background parallax layer moves at half speed

#### Scenario: animation cleanup on unmount

- **WHEN** React island unmounts (route change or HMR)
- **THEN** GSAP context and ScrollTrigger instances are fully reverted with no memory leaks

### Requirement: CTA 按鈕導航

Hero section SHALL 提供至少兩個 CTA 連結：主要（導向 `/projects`）與次要（導向 `/blog`）。

#### Scenario: 點擊主要 CTA

- **WHEN** 使用者點擊主要 CTA 按鈕
- **THEN** 導向 `/projects` 頁面

#### Scenario: 鍵盤導航

- **WHEN** 使用者以 Tab 鍵聚焦 CTA 按鈕並按 Enter
- **THEN** 導向對應頁面，符合 WCAG 2.1 AA keyboard accessibility

### Requirement: `client:load` island 掛載

Hero island SHALL 使用 `client:load` 指令，確保 above-fold 互動立即可用。

#### Scenario: JavaScript 可用時

- **WHEN** 瀏覽器載入完成
- **THEN** GSAP 動畫初始化，ScrollTrigger 開始監聽 scroll 事件

#### Scenario: JavaScript 停用時

- **WHEN** 使用者停用 JavaScript
- **THEN** Hero 靜態 HTML 仍正常顯示，無破版
