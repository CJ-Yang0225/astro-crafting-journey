## MODIFIED Requirements

### Requirement: GSAP ScrollTrigger scroll animation

Hero section SHALL 將 scroll-driven 視差協調為兩層 — DOM 內容層（GSAP）與 WebGL 場景層（R3F）— 由單一共享的 `progress`（0..1）驅動，該值由 GSAP `ScrollTrigger` 搭配 `scrub: true` 產生。視差幅度 SHALL 達到肉眼可辨（不再是現行幾乎察覺不到的 0.5x background translate）。

共享的 progress 至少 SHALL 驅動以下對象：

- DOM 內容層：opacity 淡出與向上 y-translate（保留現有行為）。
- WebGL camera position（z 軸推進、y 軸偏移）。
- WebGL 粒子 group position（z 後退 + y 上漂）與 material opacity 淡出。
- Constellation 連線 opacity 淡出。
- Post-processing 強度 ramp（Glitch strength 與 ChromaticAberration offset 隨 progress 上升以呈現「訊號中斷」）。

跨邊界狀態傳遞 SHALL 使用 `useRef`（不使用 React state）以避免 reconcile 成本。R3F `useFrame` SHALL 使用 `THREE.MathUtils.damp`（frame-rate independent）取代 raw lerp，確保在 60fps / 144fps 顯示器上行為一致。

#### Scenario: 滾動超過 hero 高度的 30%

- **WHEN** 使用者滾動超過 hero section 高度的 30%
- **THEN** DOM headline 開始向上位移並淡出，AND camera 沿 z 軸推進，AND 粒子 group 朝反向位移，AND glitch / chromatic aberration 強度 ramp up

#### Scenario: 滾動 progress 接近 hero 末端

- **WHEN** scroll progress 達到 1.0（hero 底部離開視窗頂端）
- **THEN** glitch strength 達到設定的上限（訊號中斷高峰），粒子 material opacity 達到下限，AND constellation 連線淡至 opacity 0

#### Scenario: 快速滾動 / 滾輪急甩

- **WHEN** 使用者快速滾動造成單一 frame 內 progress delta 過大
- **THEN** R3F 場景數值經 damp 平滑過渡，無 jitter 或 overshoot，AND 不會因 React state reconciliation 掉幀

#### Scenario: 動畫卸載清理

- **WHEN** React island 卸載（route change 或 HMR）
- **THEN** GSAP context、ScrollTrigger 實體、R3F renderer、post-processing composer 全數 revert，無 memory leak 或 WebGL context 殘留

### Requirement: `client:load` island 掛載

Hero island 結構 SHALL 在保留 above-fold 互動性的前提下將 WebGL 與 SSR 隔離。Hero SHALL 渲染為分層結構：

- DOM shell（Astro/React）由 server-side 直接渲染，提供 HUD、heading、CTA markup，以及靜態 fallback 背景（CSS 漸層 + dot grid，視覺上等同 legacy 版本）。
- Canvas island（`hero-canvas.tsx`）以 `client:load` 載入，內部使用 `React.lazy` + `Suspense` 動態 import R3F 場景與 post-processing 模組，使其不進入 critical entry chunk。
- React island root SHALL 設定 `immediatelyRender: false`，符合本專案對 SSR-sensitive island 的規定。

#### Scenario: JavaScript 可用且裝置具備能力

- **WHEN** 瀏覽器載入完成且裝置通過 capability 檢查
- **THEN** GSAP ScrollTrigger 初始化、Canvas island hydrate、dynamic chunk resolve、場景 fade-in 蓋過靜態 fallback

#### Scenario: JavaScript 停用

- **WHEN** 使用者停用 JavaScript
- **THEN** DOM shell 與其靜態 fallback 背景正常渲染、無破版，所有 CTA 連結仍可導航

#### Scenario: dynamic import 失敗

- **WHEN** lazy-loaded 場景 chunk 載入失敗（網路錯誤）
- **THEN** 靜態 fallback 維持顯示，無 uncaught error 外洩至頁面邊界，並透過 `console.warn` 記錄失敗原因

## ADDED Requirements

### Requirement: WebGL background canvas (R3F)

Hero section SHALL 使用 `@react-three/fiber` 的 `<Canvas>` 渲染互動式 WebGL 背景，僅在 client 端掛載。場景 SHALL 包含粒子場（預設 600–1200 個粒子）以及在鄰近粒子間（距離 threshold ≈ 0.4 unit）繪製的 constellation 連線，傳達 data-network 美學。

#### Scenario: 在具備能力的裝置上掛載 canvas

- **WHEN** Hero island 在支援 WebGL 與足夠 dpr 的裝置上 hydrate
- **THEN** `<Canvas>` 元素佔據 hero 背景層，粒子點與 constellation 連線渲染於靜態 fallback 之上，場景建立與暗色表面一致的 fog / 環境

#### Scenario: WebGL context 不可用

- **WHEN** 不支援 WebGL 或 context 建立失敗
- **THEN** Canvas 不掛載、靜態 DOM fallback 保留，無 uncaught error 傳播

#### Scenario: SSR build

- **WHEN** Astro 在 build time 渲染頁面
- **THEN** SSR HTML 輸出中不含任何 R3F 或 `three` 模組，僅輸出 DOM shell + fallback markup

### Requirement: Pointer parallax interaction

Hero 場景 SHALL 對 pointer 移動回應兩層協調動作：

- Camera position 朝 `(pointerX * 0.6, pointerY * 0.6)` scene unit 進行 lerp（lerp factor ≈ 0.05）。
- Cursor 投射到粒子平面後，半徑約 0.5 unit 內的粒子 SHALL 向外位移（force-field 斥力），cursor 離開後 spring back 回原位。

Pointer parallax SHALL 在 `pointer: coarse` 裝置（觸控）上停用。

#### Scenario: 游標橫越 hero

- **WHEN** 使用者將游標從左緣移到右緣
- **THEN** camera 沿 x 軸平滑位移、視差肉眼可辨，AND 游標附近粒子向外位移並回復

#### Scenario: 觸控裝置互動

- **WHEN** Hero 在僅支援觸控的裝置上渲染
- **THEN** Pointer 視差停用；僅 scroll-driven 與進場動畫保留

### Requirement: Post-processing effect chain

Hero 場景 SHALL 透過 `@react-three/postprocessing` 的 `<EffectComposer>` 套用四件套後製，順序為：Bloom → ChromaticAberration → Noise → Glitch。

- Bloom：強化 cyan/magenta 強調色（`luminanceThreshold ≈ 0.4`）。
- ChromaticAberration：預設低 offset；hover heading 與 scroll progress 上升時加重。
- Noise：低 opacity（≈ 0.04，premultiplied）film-grain。
- Glitch：手動觸發模式（`active=false` 加上明確 burst）；每 8±3 秒自動 burst，hover heading 立即觸發；strength 上限隨 scroll progress 上升。

後製 SHALL 僅作用於 `<Canvas>`；DOM 文字（heading、HUD、CTA）MUST NOT 受 chromatic aberration 或其他後製影響。

#### Scenario: 場景以預設效果渲染

- **WHEN** Canvas 在具備能力的裝置上掛載
- **THEN** 四件套依宣告順序套用，glitch 處於 dormant、chromatic aberration 處於預設低 offset

#### Scenario: hover heading 觸發 burst

- **WHEN** 使用者 hover 主標題
- **THEN** glitch 立即觸發一次 burst，chromatic aberration lerp 至 high-offset 值並維持至 hover 結束

#### Scenario: 排程 idle burst

- **WHEN** 距離上次 glitch 事件已過 8±3 秒
- **THEN** 自動觸發一次新的 glitch burst，strength 落在設定範圍內

#### Scenario: DOM 文字可讀性

- **WHEN** 後製處於 scroll-progress 最高強度
- **THEN** Heading、HUD、CTA 文字維持清晰、不出現 RGB 錯位，並達到 WCAG AA 對比（body 4.5:1、large text 3:1）

### Requirement: ScrambleText heading entrance

Hero heading（`JERRY` 與 `YANG.`）SHALL 透過 GSAP ScrambleText 解碼動畫進場，取代純 translate-fade。每行字 SHALL 從亂碼字符集（`"!<>-_\\/[]{}—=+*^?#"`）解碼為最終文字，duration 1.0–1.2s。第一次 glitch burst SHALL 延後至 scramble 完成後至少 0.3s，避免視覺衝突。

#### Scenario: 初次進場

- **WHEN** Hero hydrate 且未啟用 reduced motion
- **THEN** 兩行 heading 依序執行 scramble 解碼，每行於 ~1.2s 內完成

#### Scenario: reduced motion

- **WHEN** `prefers-reduced-motion: reduce` 啟用
- **THEN** 略過 scramble，直接渲染最終 heading 文字

### Requirement: Magnetic CTA hover

主要與次要 CTA SHALL 具備磁吸 hover 行為：當游標進入按鈕約 100px 半徑內，按鈕朝游標位移（主要係數 0.25、次要係數 0.15）。主 CTA 內部的箭頭 SVG SHALL 採用更高係數（0.4），形成「箭頭超前」視覺。`pointerleave` 時按鈕 SHALL 動畫回到原位。實作 SHALL 使用 `gsap.quickTo` 維持 `pointermove` 高頻處理效率。

磁吸行為 SHALL 在 `pointer: coarse` 裝置與 `prefers-reduced-motion: reduce` 時停用。

#### Scenario: 游標靠近主 CTA

- **WHEN** 游標進入主 CTA 的磁吸半徑
- **THEN** 按鈕以係數 0.25 朝游標位移、箭頭以係數 0.4 位移

#### Scenario: 游標離開 CTA 區域

- **WHEN** 游標離開磁吸半徑
- **THEN** 按鈕與箭頭平滑回到原位

#### Scenario: 鍵盤聚焦路徑

- **WHEN** 使用者透過 Tab 鍵抵達 CTA
- **THEN** Focus styles 可見、CTA 位置不受磁吸邏輯影響、Enter 觸發導航

### Requirement: Reduced-motion 與低階裝置降級

Hero SHALL 提供分層自動降級，由集中式 `useHeroCapabilities` hook 決定。Hook SHALL 回傳 `{ enableCanvas, enableInteraction, particleCount, enablePostFX }`，依據 media queries、裝置能力與 runtime 檢查推導。

行為：

- `prefers-reduced-motion: reduce` → Canvas island 不掛載；ScrambleText 略過；Magnetic CTA 停用；靜態 fallback 為唯一背景。
- 低階裝置（`devicePixelRatio` clamp 至 1.5、無 float texture 支援等）→ 粒子數降至 ~400、Bloom 停用、Noise opacity 減半。
- Runtime FPS 連續 2 秒低於 50 → 後製鏈於 runtime 停用。
- WebGL context lost 或初始化失敗 → 回退靜態圖層，`console.warn` 記錄原因。
- 觸控裝置 / `pointer: coarse` → 停用 pointer 視差與 magnetic CTA；保留 scroll-driven 動畫與 glitch。

#### Scenario: prefers-reduced-motion

- **WHEN** User agent 回報 `prefers-reduced-motion: reduce`
- **THEN** Canvas 不掛載，scramble 與 magnetic 效果停用，hero 僅顯示靜態 DOM fallback

#### Scenario: 低 DPR 行動裝置

- **WHEN** 裝置 dpr clamp 至 1.5 且偵測不到 float texture 支援
- **THEN** 粒子數設為 ~400、Bloom 停用、Noise opacity 減半

#### Scenario: 持續低 FPS

- **WHEN** 量測 FPS 連續 2 秒低於 50
- **THEN** 後製鏈於 runtime 停用，場景續行渲染但無後製效果

#### Scenario: 中途 WebGL context lost

- **WHEN** WebGL context 中途遺失（例如 GPU reset）
- **THEN** Canvas 優雅卸載、靜態 fallback 變為可見，`console.warn` 記錄事件

### Requirement: Theme-locked dark surface 與過渡漸層

Hero section SHALL 渲染為固定暗色表面，與全域 theme（light / dark / system）無關。固定表面 SHALL 透過 `--hero-surface` CSS custom property 表達，且在 `:root` 與 `.dark` 兩處選擇器中定義為相同值。HUD、heading 與 CTA 顏色 SHALL 採用 dark-mode 友善的固定色值，不參考 `--foreground` / `--background` token。

Hero SHALL 提供底部過渡漸層（高度 ≈ 12rem）由固定暗色表面內插至 `hsl(var(--background))`，確保不論 theme 為何，hero 與下個 section 之間都不出現硬邊。

#### Scenario: light mode 啟用

- **WHEN** `<html>` 無 `dark` class 且系統偏好 `light`
- **THEN** Hero 背景維持暗色；底部 12rem 漸層內插至 `hsl(var(--background))`，平滑銜接下個 section

#### Scenario: dark mode 啟用

- **WHEN** `<html>` 帶有 `dark` class
- **THEN** 底部漸層終點為 dark theme background token；過渡無縫

#### Scenario: runtime theme 切換

- **WHEN** 使用者於不重新整理頁面的情況下切換 theme
- **THEN** 僅底部漸層終點更新（透過 `--background` token）；WebGL 場景、HUD palette、heading 顏色不閃爍、不改變
