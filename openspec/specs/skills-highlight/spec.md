## ADDED Requirements

### Requirement: 技術棧亮點靜態資料
Skills Highlight section SHALL 從 `src/config/` 讀取技術棧靜態資料（於 build time 序列化為 props），展示核心技術分組（Frontend、Backend/Edge、DevOps 等）。

#### Scenario: 資料從 config 載入
- **WHEN** Astro build time 渲染
- **THEN** 技術棧資料從 config 靜態匯入，無 API 呼叫或動態查詢

#### Scenario: 資料結構完整
- **WHEN** 每個技術項目渲染
- **THEN** 顯示技術名稱、類別、圖示（iconify 或 SVG）

### Requirement: Motion v12 stagger 進場動畫
Skills Highlight island（React，`client:visible`）SHALL 使用 Motion v12 `motion` component 實現各技術項目的 stagger 依序浮現動畫（`opacity` 0→1，`scale` 0.9→1，`y` 10→0）。

#### Scenario: viewport 進入觸發 stagger
- **WHEN** Skills Highlight section 進入瀏覽器 viewport
- **THEN** 各技術項目以 stagger 動畫依序顯示（間隔 50ms，分組間隔 120ms）

#### Scenario: `client:visible` 延遲載入
- **WHEN** 頁面初始載入
- **THEN** Skills island JS 不影響初始 bundle，待 viewport 進入後載入

#### Scenario: JavaScript 停用時
- **WHEN** 使用者停用 JavaScript
- **THEN** 所有技術項目靜態顯示，無動畫但佈局完整

### Requirement: 互動 hover 效果
每個技術項目 SHALL 在 hover 時顯示輕微 scale 放大效果，使用 Motion v12 `whileHover` 或 Tailwind CSS transition（不額外增加 JS bundle）。

#### Scenario: hover 觸發
- **WHEN** 使用者 hover 某個技術項目
- **THEN** 該項目 scale 放大至 1.05，動畫時長 150ms

#### Scenario: 鍵盤 focus 狀態
- **WHEN** 使用者以 Tab 鍵聚焦技術項目
- **THEN** 顯示明顯 focus ring，符合 WCAG 2.1 AA 對比度要求

### Requirement: 分組佈局
技術項目 SHALL 依類別分組顯示，每組有標題標籤，佈局採 flex-wrap 或 grid，在 mobile 與 desktop 均正常排列。

#### Scenario: 分組標題顯示
- **WHEN** 渲染 Skills section
- **THEN** 每個技術分組上方顯示類別標題

#### Scenario: responsive 佈局
- **WHEN** 視窗寬度從 mobile 至 desktop
- **THEN** 技術項目自動換行，不發生橫向 overflow
