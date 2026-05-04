## Why

目前 [src/components/sections/hero-section.tsx](../../../src/components/sections/hero-section.tsx) 的 hero 過於簡約（單層 dot grid + 幾乎察覺不到的 GSAP scroll fade），無法承載 portfolio 想傳達的「技術深度 / 科技感」。專案已導入 `three`、`@react-three/fiber`、`@react-three/drei`，但尚未實際使用——hero 是最適合首次展示 WebGL 能力、同時建立整站視覺基調的位置。

## What Changes

把 hero 背景從 DOM/CSS 圖層升級為 R3F `<Canvas>` island，加入真正可感知的滑鼠 + 滾輪互動視差，並疊加一組「broken signal」後製效果作為記憶點。

- **WebGL background island**：以 R3F `<Canvas>` 取代現行 dot grid + radial gradient；場景含粒子場 + 鄰近粒子 constellation 連線。Canvas 必須 client-only 掛載並提供 `<noscript>` / 靜態 fallback。
- **Pointer parallax**：camera 與粒子層隨 `pointermove`（normalized -1..1）平滑插值（lerp），位移幅度肉眼可辨。粒子對 cursor 產生斥力反應。
- **Scroll-driven depth**：保留 GSAP ScrollTrigger，並把 scroll progress（0..1）餵給 R3F scene 觸發明顯的縱深位移與粒子密度變化（與目前 0.5x 平移相比，幅度顯著加大）。
- **Post-processing 四件套**：`@react-three/postprocessing` 的 EffectComposer 套用 Bloom + Chromatic Aberration + Noise + Glitch（drei `<Glitch>`），Glitch 採低強度持續 + hover 主標題時 burst 觸發。
- **DOM-layer 驚喜**：標題進場使用 GSAP ScrambleText decode 效果；CTA 按鈕加入 magnetic hover（cursor 靠近時微幅位移吸引）。
- **Reduced-motion / 效能 fallback**：尊重 `prefers-reduced-motion: reduce`——關閉 glitch、scramble、pointer 視差、磁吸，並降低 dpr。低階裝置（dpr 上限 1.5、無浮點紋理支援）自動降級。
- **Theme-locked dark surface**：hero 鎖定暗色表面（不跟隨 light/dark 切換），底部以 12rem 漸層帶過渡到 `hsl(var(--background))`，避免淺色模式與下個 section 產生硬邊。
- **HUD 視覺升級**：oversized name、cyan/lime/magenta 強調色、mono 字距、邊角狀態列（SYS · LIVE · 座標 / 編號 / build ticker / vertical scroll indicator）由 DOM 層負責。

**Out of scope**：其他 section 的 WebGL 化、完整 3D 模型載入、自訂 shader 開發、改寫 GSAP 為其他庫、theme-adaptive WebGL 配色。

## Capabilities

### New Capabilities

（無新 capability——所有變更都收斂在既有的 `hero-section` spec 內）

### Modified Capabilities

- `hero-section`: 既有的 GSAP-only scroll animation requirement 擴充為 GSAP + R3F 雙層 scroll-driven parallax；新增 WebGL background、pointer parallax、post-processing 後製、DOM 驚喜效果（ScrambleText / Magnetic CTA）、reduced-motion fallback、theme-locked dark surface 等 requirements。

## Impact

**Affected code**

- [src/components/sections/hero-section.tsx](../../../src/components/sections/hero-section.tsx) — 拆出 DOM hero 結構（HUD、heading、CTAs）
- 新檔 `src/components/sections/hero-canvas.tsx` — R3F Canvas + Scene + EffectComposer（client-only island）
- 新檔 `src/components/sections/hero-scene.tsx` — 粒子場 + constellation 連線元件
- [src/pages/index.astro](../../../src/pages/index.astro) — 島嶼掛載指令調整（`client:load` 含 fallback）
- 視需要 [src/styles/globals.css](../../../src/styles/globals.css) — 新增 `--hero-surface` token

**Dependencies**

- 新增 `@react-three/postprocessing` + `postprocessing`（drei `<Glitch>` 與 EffectComposer 必需）
- GSAP `ScrambleTextPlugin` 註冊（GSAP 已在 dependencies 中）

**Architectural constraints affected**

- **Islands / SSR boundary**：R3F 屬於 SSR-sensitive，必須以 React island + dynamic import 包裝；`<Canvas>` 不可參與 build-time HTML 輸出。`<noscript>` fallback 須提供等效視覺。
- **Above-fold performance**：`client:load` 會把 R3F + drei + postprocessing chunk 加進 critical path，需用 dynamic import 切出 `hero-canvas` chunk，確保 LCP 仍 < 2.5s（目標）。Canvas 初次 paint 之前以靜態 fallback 圖層佔位避免 CLS。
- **Test environment**：Vitest node 環境無 WebGL，新元件須以 island 邊界隔離，避免 collection / utils 層 import canvas 元件。
