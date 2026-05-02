你現在是「超高階 Web／Edge 架構師 + Astro 專家 + Hono/Cloudflare Workers 專家 + 資安與前端效能專家」，同時非常理解 AI 時代前端開發者如何在作品中凸顯技術深度與獨特性。

## 專案目標與定位

我要打造一個「高效能、SEO 友好、技術特色突出的」個人部落格與作品集平台，並搭配一個有登入驗證機制的後台管理介面。這個平台會是我未來所有 side project 的展示核心，也會成為我技術品牌的主舞台。

重點：

- 內容面：技術部落格、Side Projects Showcase、Case Study、互動 Demo。
- 體驗面：首屏極速、SSR/SSG 友好 SEO、Mobile-first 體驗。
- 技術面：顯示我對 Edge / Serverless / WebGL / 動畫的深度掌握，而不是一般 Next.js + Tailwind 標配模板。

## 目前既有技術選型

### 前端主站 (origin_application)

- Framework：Astro (版本：v6)
- 架構：Astro Islands Architecture
  - HTML-first、預設 zero-JS
  - 透過 islands 引入 React 與 Vue，示範「多框架共存」的實戰能力
- 用途：
  - 公開的 Blog / Portfolio / Project Pages
  - 後台管理介面 (可獨立 layout / route 區段)
  - 各種互動畫面 (GSAP / ScrollTrigger / Three.js / Anime.js)

### Edge 認證與 Gateway

- edge_auth_layer
  - tech: Hono + Cloudflare Workers
  - concerns:
    - authentication
    - authorization
    - rate limiting
    - caching
    - routing / gateway
  - patterns:
    - middleware_pipeline
    - stateless_auth (JWT)
    - edge_caching
- distributed_kv
  - tech: Cloudflare KV (或等價的 edge KV)
  - concerns:
    - ephemeral_data
    - session-like storage
    - JWT blacklist / token revocation metadata
  - constraints:
    - eventual_consistency
    - high_read_low_write

### Cross-cutting Concerns

- security
  - jwt_revocation_strategy: kv_blacklist
  - oauth_state_validation
  - 防重放 / 防 CSRF / 防 XSS
- performance
  - edge_cache_first
  - minimize_origin_calls
- scalability
  - edge_distribution
  - stateless_services

### 後台與編輯器

- 後台管理介面需要登入 (Edge OAuth / SSO)
- 想用 Tiptap 打造專屬的手機友善編輯器：
  - 能在 mobile 上有很好的觸控體驗
  - 針對技術文章、有 code block、callouts、inline components 等擴充
  - 要考慮 SSR / hydration 問題 (例如 React 版本的 Tiptap 會建議使用 `immediatelyRender: false`，避免 SSR mismatch)

## 前端互動與動畫技術堆疊

我不想只是做「視差 + 卡片 hover」這種程度，而是要打造可以慢慢 evolve 的互動基礎：

- 現階段：
  - GSAP
  - ScrollTrigger
  - Three.js
  - Anime.js (視情況補輕量動畫)
- 未來希望逐步加入：
  - WebGL / WebGPU
  - GLSL / WGSL
  - shader transition
  - 液態扭曲
  - 滑鼠流體效果
  - 圖片位移與 displace map
  - 後處理特效 (bloom、DOF、glitch 等)

這些效果會盡量透過 Astro Islands 方式封裝成 React / Vue islands，以保持主體頁面仍然是高效 HTML + 最小 JS。

## 想讓你做的事：重構級「目標架構設計」

請你先用「資深架構師 + DX 顧問」的角度，幫我為 **既有的 Astro v6.2.1 專案** 設計一個 **新的整體架構藍圖**。假設你已經可以檢視專案 repo (例如在 Claude Code 裡開啟專案資料夾)，你會：

1. **從宏觀架構開始**
   - 根據我提供的分層概念，整理成更明確的目標架構：
     - edge_auth_layer (Hono + CF Workers)
     - distributed_kv (KV / Durable Objects / R2 視需要)
     - origin_application (Astro 主站)
   - 描述 Request Flow：
     - Browser → Cloudflare (edge_auth_layer) → origin Astro
     - 對 API / assets / admin route 分流
   - 說明每層的「邊界」與「責任」，避免功能洩漏。

2. **為 Astro 專案設計合理的目錄結構與邊界**
   - 調整/建議：
     - `src/pages` vs `src/routes` (若使用新 routing 模式的話)
     - `src/components` 如何拆分：純 UI、islands、layout、shared partials
     - `src/features` 或 `src/modules` 風格的 domain 封裝方式
   - 把「公開內容」與「管理後台」明確分區：
     - 例如：`src/pages/(public)/...` 與 `src/pages/(admin)/...` 的分區設計
   - 提出適合 Astro + Hono + Edge Auth 的檔案組織方案。

3. **設計 Edge Auth 與 Astro 的整合方式**
   - JWT 驗證模式：
     - 哪邊發 token (edge_auth_layer)
     - 哪邊驗證 token (edge 中間層 + Astro server side)
     - SSR 頁面如何從 request context 取得 user info
   - Cookie / header 設計：
     - 前後台如何安全地攜帶 JWT / session-like 資訊
     - CSRF 防護策略
   - 單一登入 (SSO) 的高階流程：
     - OAuth provider → edge_auth_layer → KV 儲存 state / nonce → redirect back → set cookie/header → redirect 到 Astro admin

4. **針對「Islands Architecture + 多框架整合」給出明確策略**
   - 定義哪些功能要用 React island、哪些用 Vue island、哪些維持純 Astro component：
     - 例如：Tiptap 編輯器用 React island；某些展示型元件用 Vue；其餘靜態內容用 Astro。
   - 建議 `client:*` 指令的使用策略：
     - `client:load` / `client:idle` / `client:visible` 在這個專案上的使用準則
   - 說明如何避免 islands 過度破碎、導致 hydration 開銷過大。

5. **為後台管理介面和 Tiptap editor 設計結構**
   - Route 設計：
     - `/admin/login`, `/admin/dashboard`, `/admin/posts`, `/admin/projects`, `/admin/settings` 等
   - 權限管控：
     - 未登入訪問 admin route 時的 redirect 行為
   - Tiptap 整合：
     - 以 React 為例，如何在 Astro 中包成 island component
     - SSR 注意事項 (e.g. `immediatelyRender: false`、只在 client side 初始化)
     - Mobile-first layout / toolbar 設計的大方向說明

6. **為動畫與 3D 技術堆疊設計「擴展友善」的模組化架構**
   - 把動畫與 3D 效果收斂成幾個層次：
     - 基礎 scroll-based 動畫層：GSAP + ScrollTrigger
     - 2D/3D 視覺層：Three.js + (未來可能的 R3F/Vue 封裝)
     - Shader / 後處理層：把 shader / effect pipeline 以模組方式設計。
   - 為未來加入 WebGL/WebGPU、GLSL/WGSL、流體、shader transition 留出架構上的「插槽」：
     - 例如：`src/lib/graphics/` 或 `src/effects/` 之類的資料夾設計
     - 如何避免這些效果汙染一般頁面的 SSR/SEO。

7. **考慮 DX、可維護性與可演進性**
   - 以「中大型 side projects 集中展示平台」為前提，設計：
     - 清楚的 domain 邊界與模組化
     - 可以慢慢抽出共用 UI / hooks / services 的結構 (例如 `packages/ui`, `packages/auth-client` 等)
   - 若你判斷 monorepo 更適合 (例如：`apps/web` + `apps/edge-auth` + `packages/*`)，也請說明原因與建議的工具 (例如 PNPM workspace / Turborepo 等)。

## 輸出格式要求

請一次給我下面幾個部分：

1. **高階架構說明**
   - 用文字 + 細緻條列，說明各層責任與 Request Flow。
2. **建議的專案資料夾結構 (Astro 專案為主，可延伸到 monorepo)**  
   - 用樹狀結構列出，並在關鍵資料夾旁加上註解說明用途。
3. **關鍵整合點的程式碼骨架**
   - Hono edge_auth_layer 的 middleware pipeline 大致骨架 (JWT, rate limit, logging)。
   - Astro 中如何在 server 端讀取經 edge 處理的 user context (pseudo code 即可)。
   - 一個 Tiptap Astro+React island 的簡化範例骨架 (不用完整實作，但要合理)。
4. **未來 WebGL/WebGPU / shader 擴展的路線圖**
   - 怎麼從現在的 GSAP + ScrollTrigger + Three.js 漸進式演進到：
     - 更抽象化的 effects layer
     - Shader-based transition / 圖片位移 / 滑鼠流體 等效果
   - 以及，這些演進在架構上會影響/需要調整哪些部分。

請你用「會交接給團隊其他工程師閱讀的架構提案文件」風格來回答，重視清晰度、邊界定義與可演進性，而不是只給一堆 snippet。也可以適度指出目前常見的 anti-pattern，提醒我在後續實作時應該避免哪些設計。

如果你需要任何專案結構或實際檔案內容，可以直接告訴我「請在 Claude Code 裡貼出某某檔案」，我會再補充。