## ADDED Requirements

### Requirement: 精選專案靜態渲染

Featured Projects section SHALL 使用純 Astro component（無 client JS），在 build time 以 `getCollection('projects')` 取得最多 3 筆最新專案，以卡片格狀佈局呈現。

#### Scenario: 有專案資料時

- **WHEN** `projects` collection 有至少 1 筆資料
- **THEN** 顯示最多 3 筆最新專案卡片，依 `startDate` 降序排列

#### Scenario: 無專案資料時

- **WHEN** `projects` collection 為空
- **THEN** 整個 Featured Projects section 不渲染（條件渲染隱藏）

#### Scenario: 零 client JS

- **WHEN** 頁面 JavaScript bundle 分析
- **THEN** Featured Projects section 貢獻零 client-side JavaScript

### Requirement: 專案卡片資訊展示

每張專案卡片 SHALL 顯示：專案標題、描述摘要（最多 120 字）、技術棧 tags（最多 5 個）、專案狀態（active / completed / archived）、封面圖片（若有）、連結至 `/projects` 專案詳細頁。

#### Scenario: 卡片內容完整

- **WHEN** 專案資料包含所有必填欄位
- **THEN** 卡片顯示標題、描述、技術標籤、狀態 badge、封面圖

#### Scenario: 卡片點擊導航

- **WHEN** 使用者點擊任何一張專案卡片
- **THEN** 導向對應專案詳細頁面

### Requirement: 響應式格狀佈局

卡片佈局 SHALL 在不同斷點自適應：mobile 單欄、tablet 雙欄、desktop 三欄。

#### Scenario: mobile viewport（< 768px）

- **WHEN** 視窗寬度小於 768px
- **THEN** 卡片單欄堆疊排列

#### Scenario: desktop viewport（≥ 1024px）

- **WHEN** 視窗寬度大於等於 1024px
- **THEN** 卡片三欄格狀排列
