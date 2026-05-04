## ADDED Requirements

### Requirement: 最新文章預覽列表

Blog Preview section SHALL 顯示最新 4 筆內容（`blog` + `notes` collection 合併，依發布時間降序），資料在 Astro build time 查詢並序列化為 props 傳入 island。

#### Scenario: 有文章資料時

- **WHEN** `blog` 或 `notes` collection 合計有至少 1 筆資料
- **THEN** 顯示最多 4 筆，依 `publishedAt`（blog）或 `createdAt`（notes）降序排列

#### Scenario: 無文章資料時

- **WHEN** 兩個 collection 均為空
- **THEN** Blog Preview section 不渲染

#### Scenario: 文章項目點擊

- **WHEN** 使用者點擊任意文章預覽項目
- **THEN** 導向對應 `/blog/[slug]` 頁面

### Requirement: Motion v12 viewport 進場動畫

Blog Preview island（React，`client:visible`）SHALL 使用 Motion v12 `motion` component 的 `whileInView` 屬性，實現 stagger 列表進場動畫（`opacity` 0→1，`y` 20→0）。

#### Scenario: viewport 進入觸發

- **WHEN** Blog Preview section 進入瀏覽器 viewport
- **THEN** 文章列表各項目依序以 stagger 動畫淡入（間隔 80ms）

#### Scenario: `client:visible` 延遲載入

- **WHEN** 頁面初始載入，Blog Preview section 在 below-fold
- **THEN** island JS 不包含在初始 bundle，待 section 進入 viewport 再載入

#### Scenario: JavaScript 停用時

- **WHEN** 使用者停用 JavaScript
- **THEN** 文章列表靜態顯示，無動畫但內容完整

### Requirement: 文章預覽項目資訊

每個文章預覽項目 SHALL 顯示：標題、發布日期（格式：YYYY-MM-DD）、分類 tag、描述摘要（最多 100 字）。Notes 類型顯示 `type` 標籤。

#### Scenario: blog 文章項目

- **WHEN** 項目來自 `blog` collection
- **THEN** 顯示 `category`、`publishedAt`、`title`、`description`

#### Scenario: notes 項目

- **WHEN** 項目來自 `notes` collection
- **THEN** 顯示 `type` badge（learning / snippet / reference）、`createdAt`、`title`
