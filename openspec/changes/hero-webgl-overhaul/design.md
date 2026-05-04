## Context

現行 [src/components/sections/hero-section.tsx](../../../src/components/sections/hero-section.tsx) 是純 DOM 結構（dot grid + radial vignette + GSAP `gsap.to(bg, { y: section.offsetHeight * 0.5 })` 平移）。視差幾乎不可察覺，且未動用專案已安裝的 R3F 生態（`three@0.184`、`@react-three/fiber@9.6`、`@react-three/drei@10.7`）。

這次改造需在不破壞 Astro Islands SSR 模型、不犧牲 LCP 的前提下，把 hero 從靜態 DOM 升級為 GPU 驅動的互動場景，同時加入一組可記憶的視覺特徵（粒子場、霓虹後製、scramble 標題、磁吸 CTA）。下游 section 美學基調（最近一輪 homepage-visual-system change）為簡約 light-friendly，因此 hero 採取 theme-locked dark surface 並以漸層帶過渡，避免破壞下游 section 的色調連貫。

**Stakeholders**：portfolio 自身（單一作者）。技術受眾為主（招募方、同行工程師），對效能與細節敏感。

**Constraints**

- Above-fold：必須維持 LCP 目標 < 2.5s。
- SSR：R3F 嚴禁參與 Astro build-time HTML。
- 可訪問性：尊重 `prefers-reduced-motion`、`prefers-reduced-transparency`、鍵盤導航、避免 epilepsy-trigger 閃爍。
- 測試：Vitest 在 node 環境，無 WebGL/jsdom——R3F 元件不可被 collection / utils 模組 import。

## Goals / Non-Goals

**Goals**

- Hero 背景由 R3F `<Canvas>` 提供互動式粒子場景，視差對 cursor 與 scroll 都肉眼可辨。
- 後製鏈（Bloom + ChromaticAberration + Noise + Glitch）營造 cyber broken-signal 美學；glitch 預設低強度、hover 主標題 burst、滑離 hero 時強度往上拉（訊號中斷）。
- DOM 層提供 ScrambleText 標題進場 + Magnetic CTA 兩個微互動驚喜。
- `prefers-reduced-motion` 下完全降級為靜態圖層，hero 仍呈現完整品牌感。
- Theme 切換（light/dark）時 hero 表面恆暗；底部漸層帶平滑過渡到全域 `--background`。
- LCP 不退化：above-fold 靜態 fallback 先 paint，Canvas 後續接管。

**Non-Goals**

- 其他 section 的 WebGL 化。
- 完整 3D 模型（GLB/GLTF）載入或互動 hotspot。
- 自訂 GLSL shader 開發；僅使用 drei 內建 material 與 postprocessing 預設 effect。
- Theme-adaptive WebGL 配色。
- 取代 GSAP（保留 GSAP 作為 timeline / ScrollTrigger / ScrambleText 引擎）。
- Audio reactive、cursor 完全置換、Konami 等遠期 easter egg。

## Decisions

### D1. WebGL 視覺主體：粒子場 + constellation 連線

**Decision**：用 `<Points>` 渲染 ~600–1200 個粒子，並在每個 frame 內用簡化的 grid binning 找鄰近粒子畫淡色 line segment（threshold ~0.4 unit），形成 constellation / network graph 視覺。

**Alternatives considered**

- (a) 自訂 GLSL shader plane — 視覺最強但成本最高，違反 non-goal。
- (b) drei `<MeshDistortMaterial>` 扭曲球 — 觀感偏「液態」、不夠 tech-info。
- (c) 純 `<Points>` 無連線 — 粒子單獨太散漫，缺少網狀結構可讀性。

**Rationale**：粒子 + 連線是 cyberpunk / data-network 視覺的高識別度組合，實作成本可控（instanced points + LineSegments），粒子數量易於依裝置等級降級。

### D2. Pointer parallax — camera lerp + particle force field

**Decision**：

- Camera 在 `useFrame` 內以 lerp(0.05) 朝目標位置移動，目標 = `pointer * (±0.6 unit)`。
- 粒子層另外計算「斥力」：cursor projected 到粒子平面的世界座標附近 0.5 unit 內粒子位移外推，用 spring back 緩慢回正。

**Alternatives considered**

- 純 camera 視差 — 缺乏直接互動感。
- 整層粒子位移 — 缺乏「以 cursor 為中心」的局部互動。

**Rationale**：camera + 粒子雙層回應讓互動有「整體 + 局部」兩種尺度，避免單一回饋過於單調。

### D3. Scroll-driven scene — scrub progress 注入多個 Three 物件

**Decision**：保留現有 GSAP ScrollTrigger，於 `onUpdate` 把 `self.progress`（0..1）寫入 `useRef` 暴露給 R3F；場景 `useFrame` 內以 `THREE.MathUtils.damp`（frame-rate independent）平滑驅動以下對應：

| 控制對象                       | progress=0              | progress=1            | 視覺意圖                                     |
| ------------------------------ | ----------------------- | --------------------- | -------------------------------------------- |
| `camera.position.z`            | `5`                     | `2`                   | 鏡頭往粒子場推進，產生「跌進去」縱深         |
| `camera.position.y`            | `0`                     | `0.8`                 | 鏡頭微抬，視線飛離                           |
| 粒子 group `position.z`        | `0`                     | `-3`                  | 粒子整體後退，與 camera 推進形成雙向放大縱深 |
| 粒子 group `position.y`        | `0`                     | `1.5`                 | 粒子上漂，呼應 DOM 文字 `y: -60` fade-up     |
| 粒子 material `opacity`        | `1.0`                   | `0.2`                 | 越往下越淡，銜接下個 section 明色            |
| constellation line `opacity`   | `0.4`                   | `0.0`                 | 連線先消失，讓粒子最後孤立                   |
| `<Glitch>` `strength` 上限     | `0.05`                  | `0.35`                | 滑離 hero 時故障感增強，暗示「訊號中斷」     |
| `<ChromaticAberration>` offset | 微量 `[0.0008, 0.0012]` | 中量 `[0.003, 0.004]` | 與 glitch 同步加重                           |

**跨邊界傳遞**：`progressRef = useRef({ value: 0 })`，從 `hero-section.tsx` 透 prop 傳入 `<HeroCanvas progressRef={progressRef} />`；不使用 React state 以避免 reconcile。`useFrame` 內讀 ref 並用 `MathUtils.damp(current, target, lambda=6, delta)` 平滑插值——避免快速捲動時跳幀。

雙向縱深（camera 推進 + 粒子後退）為初版，實際感受過於暈眩時將粒子層幅度降為 0 或縮為一半。

**Alternatives considered**

- 僅 GSAP 控制 DOM、scene 自走 — 視覺與滾動脫鉤。
- 用 drei `<ScrollControls>` — 它接管捲動容器，與其他 Astro section 衝突。
- 反向 mapping（progress=1 時 glitch 最弱）— 戲劇張力較低，捨棄。

**Rationale**：用 ref 跨 GSAP / R3F 邊界傳遞狀態，避免 React state 重渲染；同時不奪取頁面 scroll；damp 取代 lerp 確保 60fps / 144fps 行為一致。

### D4. Post-processing 鏈：EffectComposer + 4 effects

**Decision**：

- 順序：Bloom → ChromaticAberration → Noise → Glitch。
- Bloom：`intensity 0.6, luminanceThreshold 0.4, luminanceSmoothing 0.9`。
- ChromaticAberration：常駐微量，hover heading 時 lerp 加重，scroll progress 同步上拉（見 D3）。
- Noise：`opacity 0.04, premultiply true`。
- Glitch：`active=false`（手動觸發 mode），strength / duration 受 hover 與 scroll progress 共同調制；每 8±3s 自動 burst；hover heading 立即觸發。
- 新增依賴：`@react-three/postprocessing`、`postprocessing`。

**Rationale**：四件套順序是社群慣例（光暈 → 色散 → 噪點 → 故障）以避免 noise 被 bloom 抹掉。手動觸發 glitch 比 `active=true` 連續更可控。

### D5. SSR 邊界 — `client:load` + dynamic import + static fallback

**Decision**：

- Hero section 拆為三層：
  1. **DOM shell**（`hero-section.tsx`）— Astro 直接渲染，含 HUD / heading / CTA / 靜態 fallback 圖層（CSS 漸層 + dot grid，與目前版本相近）。
  2. **Canvas island**（`hero-canvas.tsx`）— `client:load`，內部 `React.lazy` + `Suspense` 動態 import scene 與 postprocessing 模組。
  3. **Scene 元件**（`hero-scene.tsx`）— 純 R3F 元件，含粒子、constellation、camera rig。
- DOM shell 永遠先 paint，含 fallback；Canvas 在 hydration 後接管並 fade-in 覆蓋 fallback。
- React island 設定 `immediatelyRender: false`（CLAUDE.md 要求）。

**Alternatives considered**

- `client:visible` — hero 是 above-fold，效益等於 `client:load`，但 Astro observer 仍有延遲。
- `client:idle` — 太晚，使用者會先看到無動畫 hero。

**Rationale**：分層降級保證 JS 失敗或 reduced-motion 都還有設計過的 fallback；dynamic import 讓 R3F + postprocessing 不進 critical chunk。

### D6. ScrambleText 標題進場

**Decision**：

- 註冊 GSAP `ScrambleTextPlugin`（club-free，已包在 gsap 主 package）。
- 進場 timeline：`JERRY` 與 `YANG.` 兩段分別 scramble，duration 1.0–1.2s，character set `"!<>-_\\/[]{}—=+*^?#"`。
- 取代既有 `power3.out` y-translate 進場。

**Rationale**：scramble 是 portfolio 圈高識別度的進場動畫，比平移更有 tech 表演性，且 GSAP 原生支援、無額外依賴。

### D7. Magnetic CTA

**Decision**：

- 主 CTA（`View Projects`）監聽 `pointermove`，按鈕 ref 取得位置，cursor 距離 < 100px 時以 `gsap.quickTo` 將按鈕位移至 `(dx * 0.25, dy * 0.25)`，pointerleave 回到原點。
- 內部箭頭 SVG 取 0.4 倍係數，產生「箭頭超前」視覺。
- 次 CTA 採用更弱版（係數 0.15）保持階層感。

**Rationale**：`gsap.quickTo` 比 `gsap.to` 更省 CPU，適合 pointermove 高頻率呼叫。

### D8. Reduced-motion / 低階裝置降級策略

**Decision**：

| 條件                                      | 處理                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `prefers-reduced-motion: reduce`          | 不掛載 Canvas island；停用 ScrambleText（直接顯示完整字）；停用 Magnetic CTA |
| `dpr` 上限 1.5 / 不支援浮點紋理           | 粒子數量降為 400、關閉 Bloom、Noise opacity 降至 0.02                        |
| Canvas WebGL context lost / 初始化失敗    | catch 後維持 fallback，`console.warn` 上報                                   |
| 行動裝置（`pointer: coarse` / `< 768px`） | 停用 pointer 視差與 magnetic CTA；保留 scroll + glitch                       |

抽出 `useHeroCapabilities` hook 統一回傳 `{ enableCanvas, enableInteraction, particleCount, enablePostFX }`，所有降級判斷集中於此。

### D9. Theme-locked dark surface + 過渡帶

**Decision**：

- Hero `<section>` 強制以 `var(--hero-surface)` 上色，`--hero-surface` 在 `:root` 與 `.dark` 都定義為相同 dark 值（`#05060A` 或對應 HSL）。
- 底部 12rem 高度的漸層 `<div>`：`background: linear-gradient(to top, hsl(var(--background)), transparent)`——天然跟著 theme 切換。
- HUD / heading / CTA 配色全部使用 hard-coded dark-mode 色值（不走 `--foreground`），確保不論 light/dark 都呈現相同視覺。

**Rationale**：theme-locked 比 theme-adaptive 維護成本低 50%+，且 neon glow 在淺色背景下視覺品質明顯下降。漸層帶讓 light mode 也有平滑過渡。

## Risks / Trade-offs

- **R1: LCP 退化** → static fallback 先 paint；R3F + postprocessing 用 dynamic import 切 chunk（預估 ~150–200 KB gzipped）；Canvas mount 後 cross-fade 覆蓋 fallback（非阻塞 LCP 量測對象）。
- **R2: 行動裝置效能** → D8 降級；FPS < 50 連續 2s 自動關閉 postprocessing。
- **R3: WebGL context lost / iOS Safari 兼容** → try/catch + `onError` 回退 DOM fallback；測試矩陣涵蓋 iOS Safari 17+。
- **R4: 後製疊加可讀性** → postprocessing 套在 `<Canvas>` 上而非整個 hero，DOM 文字不受 chromatic aberration 影響；CTA 與 heading 對比度滿足 WCAG AA（4.5:1 / 大型文字 3:1）。
- **R5: 包大小** → `postprocessing` ~60KB、`@react-three/postprocessing` ~10KB；只 dynamic import 進 hero chunk，不進 entry。
- **R6: Glitch 引發癲癇敏感** → reduced-motion 完全關閉；強度上限保守；不使用紅藍高速閃爍模式。
- **R7: ScrambleText 與後製疊加干擾** → scramble 在 DOM 層，bloom 只作用於 Canvas；ScrambleText 完成後 0.3s 才允許首次 glitch burst，避免進場混亂。
- **R8: 雙向縱深暈眩** → 預設保守幅度（camera ±3、粒子 ±3）；若實測過暈，將粒子位移幅度降為 0，僅留 camera 推進。

## Migration Plan

1. 安裝新依賴：`pnpm add @react-three/postprocessing postprocessing`。
2. 新增 `--hero-surface` token 於 `src/styles/globals.css`。
3. 拆檔順序：先建 `hero-canvas.tsx`（lazy wrapper） + `hero-scene.tsx`（純 R3F），通過獨立 dev preview 驗證；再改 `hero-section.tsx` 整合。
4. Roll-out：本地 `pnpm dev` 視覺驗收 → `pnpm build` 確認 SSR 無錯 → 手動驗收四種環境（dark / light / reduced-motion / mobile）。
5. **Rollback**：`hero-section.tsx` 在改動前先建 `hero-section.legacy.tsx` 備份；如效能或視覺出現嚴重 regression，[src/pages/index.astro](../../../src/pages/index.astro) 切回 import legacy 即可一行 revert。

## Open Questions

- **Q1**：粒子顏色是單色（cyan）還是漸層（cyan/lime/magenta 隨機分布）？建議：80% cyan + 15% magenta + 5% lime（accent 比例符合 60-30-10 法則）。
- **Q2**：constellation 連線是否要在 hover 主標題時加亮 / 加密？建議：先不加，避免效果疊加過載；hover 集中於 glitch burst。
- **Q3**：是否在 HUD 加入「即時 FPS / pointer 座標」 readout？對技術受眾是驚喜，但增加維護負擔——建議延後至下個 change。
- **Q4**：`hero-scene.tsx` 的粒子初始分布是否考慮 seed 化（避免每次 hydration 視覺不一致）？建議：是，使用 `mulberry32(0xC0DE)` seeded RNG。
