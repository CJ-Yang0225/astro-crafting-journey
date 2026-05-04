## 1. 依賴與基礎設定

- [x] 1.1 安裝後製依賴：`pnpm add @react-three/postprocessing postprocessing`
- [x] 1.2 於 [src/styles/globals.css](../../../src/styles/globals.css) 新增 `--hero-surface` token，於 `:root` 與 `.dark` 兩處選擇器設定相同 dark 值（例：`220 30% 4%`）
- [x] 1.3 備份舊版：複製 [src/components/sections/hero-section.tsx](../../../src/components/sections/hero-section.tsx) 為 `hero-section.legacy.tsx`，作為 rollback 路徑
- [x] 1.4 執行 `pnpm astro:check` 確認新依賴與 token 變動未破壞型別

## 2. Capability hook 與工具函式

- [x] 2.1 新增 `src/hooks/use-hero-capabilities.ts`：偵測 `prefers-reduced-motion`、`pointer: coarse`、`devicePixelRatio`、float texture 支援；回傳 `{ enableCanvas, enableInteraction, particleCount, enablePostFX }`（layer：hook）
- [x] 2.2 新增 `src/lib/seeded-rng.ts`：實作 `mulberry32(seed)`，用於粒子初始分布，避免 hydration 視覺漂移
- [x] 2.3 新增 `src/lib/scroll-progress-ref.ts`：匯出 `createProgressRef()` 工廠，封裝 `useRef<{ value: number }>` 與一個 GSAP `ScrollTrigger.onUpdate` 綁定 helper
- [x] 2.4 撰寫 vitest 單元測試 `seeded-rng.test.ts`（純 node 環境可跑）；執行 `pnpm test:once`

## 3. R3F 場景元件（純 client）

- [x] 3.1 新增 `src/components/sections/hero-particles.tsx`：以 `<Points>` 渲染粒子場，粒子位置使用 seeded RNG 初始化；接收 `progressRef`、`pointerRef` props（layer：section, R3F-only，**不可被任何 SSR 模組 import**）
- [x] 3.2 在 `hero-particles.tsx` 內加入 `useFrame` 邏輯：用 `THREE.MathUtils.damp` 驅動粒子 group `position.y` / `position.z`、material `opacity`，依 `progressRef.current.value` 對應 design.md D3 表格
- [x] 3.3 在 `hero-particles.tsx` 內計算粒子斥力（cursor 投射至粒子平面、半徑 0.5 unit 內外推 + spring back）；行動裝置時跳過
- [x] 3.4 新增 `src/components/sections/hero-constellation.tsx`：以 grid binning 找鄰近粒子、用 `<lineSegments>` 渲染連線；line opacity 隨 progress 由 0.4 漸減至 0
- [x] 3.5 新增 `src/components/sections/hero-scene.tsx`：組合 camera rig（依 `progressRef` 與 `pointerRef` 驅動 `camera.position`）、`<HeroParticles />`、`<HeroConstellation />`、fog/ambient 設定
- [x] 3.6 在 `hero-scene.tsx` 加上 `<EffectComposer>`：依序套用 `<Bloom>` → `<ChromaticAberration>` → `<Noise>` → `<Glitch>`，glitch `active=false` 並透過 ref 手動觸發；強度上限隨 progress 上升
- [x] 3.7 加入 idle glitch 排程（每 8±3s 自動 burst）與 `triggerBurst()` 對外暴露 ref，供 heading hover 呼叫
- [x] 3.8 加入 runtime FPS 監測：FPS 連續 2s < 50 時，停用 EffectComposer

## 4. Canvas island 包裝

- [x] 4.1 新增 `src/components/sections/hero-canvas.tsx`：使用 `React.lazy(() => import("./hero-scene"))` + `<Suspense fallback={null}>` 將 scene 切出 chunk；外層渲染 `<Canvas>` 並設定 `dpr={[1, capabilities.maxDpr]}`、`gl={{ antialias: true, powerPreference: "high-performance" }}`
- [x] 4.2 在 `hero-canvas.tsx` try/catch WebGL context 建立失敗，失敗時 `console.warn` 並向上回傳 `null`（讓 fallback 接管）
- [x] 4.3 監聽 `webglcontextlost` 事件：發生時卸載並回退 fallback
- [x] 4.4 接收 `progressRef`、`pointerRef` 作為 props，傳遞給 scene；island 設定 `immediatelyRender: false`

## 5. 重寫 Hero DOM shell

- [x] 5.1 改寫 [src/components/sections/hero-section.tsx](../../../src/components/sections/hero-section.tsx)：移除舊的 GSAP `gsap.to(bg, ...)` 平移，但保留 ScrollTrigger 並改為寫入 `progressRef`
- [x] 5.2 在 hero shell 中加入靜態 fallback 圖層（`<div aria-hidden>` 內 CSS 漸層 + dot grid，視覺等同 legacy 觀感，Canvas 掛載後 cross-fade 蓋過）
- [x] 5.3 透過 `useHeroCapabilities()` 條件渲染 `<HeroCanvas client:load>`：`enableCanvas === false` 時保留 fallback
- [x] 5.4 在 hero shell 加入 HUD 元素（top-left SYS · LIVE 脈衝點 + 座標、top-right `// 01` 編號、bottom-left vertical scroll indicator、bottom-right build ticker），使用 `font-mono` 與 hard-coded dark-mode 色值
- [x] 5.5 改寫 heading：兩行（`JERRY` / `YANG.`），第二行套用 cyan→lime→magenta linear-gradient 文字
- [x] 5.6 加入底部 12rem 過渡漸層 `<div>`：`linear-gradient(to top, hsl(var(--background)), transparent)`
- [x] 5.7 hero `<section>` 設定 `style={{ backgroundColor: 'var(--hero-surface)' }}` 鎖定暗色

## 6. ScrambleText 標題進場

- [x] 6.1 在 `hero-section.tsx` 動態 import `gsap/ScrambleTextPlugin` 並 `gsap.registerPlugin(ScrambleTextPlugin)`
- [x] 6.2 進場 timeline：`JERRY` 與 `YANG.` 各 scramble 1.0–1.2s，char set `"!<>-_\\/[]{}—=+*^?#"`
- [x] 6.3 進場結束後 0.3s 才允許首次 glitch burst（透過 timeline `.call()` 設定 flag）
- [x] 6.4 `prefers-reduced-motion: reduce` 時跳過 scramble，直接顯示最終文字

## 7. Heading hover glitch burst

- [x] 7.1 在 heading 容器綁定 `pointerenter` 事件，呼叫 `<HeroCanvas>` 暴露的 `triggerBurst()`
- [x] 7.2 hover 期間 `<ChromaticAberration>` offset lerp 至 high-offset；`pointerleave` 回到預設

## 8. Magnetic CTA

- [x] 8.1 抽出 `src/hooks/use-magnetic.ts` hook：接 `{ ref, coefficient, radius }`，內部以 `gsap.quickTo` 驅動 transform
- [x] 8.2 主 CTA：套用 `useMagnetic({ coefficient: 0.25, radius: 100 })`；內部箭頭再套 `useMagnetic({ coefficient: 0.4, radius: 100 })`
- [x] 8.3 次 CTA：`useMagnetic({ coefficient: 0.15, radius: 100 })`
- [x] 8.4 `pointer: coarse` 與 `prefers-reduced-motion` 時 hook 內部 short-circuit、不掛載事件

## 9. Pointer 視差 wiring

- [x] 9.1 在 `hero-section.tsx` 建立 `pointerRef = useRef({ x: 0, y: 0 })`，於 `<section>` 監聽 `pointermove`，正規化為 -1..1 寫入 ref
- [x] 9.2 將 `pointerRef` 透 prop 傳給 `<HeroCanvas>`；scene 用於 camera lerp 與粒子斥力（D2）
- [x] 9.3 `pointer: coarse` 時不掛載 listener

## 10. 頁面整合與 island 指令

- [x] 10.1 [src/pages/index.astro](../../../src/pages/index.astro) 確認 `<HeroSection client:load />`，並加上 `<HeroSection.Fallback />`（若採 named export 模式）
- [x] 10.2 確認其他 section（projects / skills / blog）匯入路徑未受影響

## 11. 測試與驗收

- [x] 11.1 執行 `pnpm astro:check` 確認 SSR 型別與 `client:*` 邊界正確（0 errors）
- [x] 11.2 執行 `pnpm build` 確認 build 過程 R3F / postprocessing chunk 不進 critical entry，無 SSR 報錯（hero-canvas chunk 870K 獨立，hero-section 121K 為 DOM shell）
- [x] 11.3 執行 `pnpm lint` 與 `pnpm format`（lint: @typescript-eslint plugin 缺少為既有 config 問題；format: prettier-plugin-tailwindcss@0.8.0 + prettier@3.6.2 在全專案 .ts/.tsx 皆有 e.charAt bug，非本次引入）
- [ ] 11.4 `pnpm dev` 視覺驗收：dark mode、light mode、`prefers-reduced-motion: reduce`、行動視窗（DevTools touch emulation）四種狀態
- [ ] 11.5 Lighthouse 跑首頁，確認 LCP < 2.5s、CLS ≈ 0、Performance ≥ 90
- [ ] 11.6 真實裝置驗收：iOS Safari 17+、Android Chrome；確認 WebGL 不黑屏、後製不糊文字
- [ ] 11.7 鍵盤導航驗收：Tab → Enter 啟動 CTA、focus ring 可見、無被磁吸偏移

## 12. 收尾

- [ ] 12.1 依 conventional commits 拆 commit（建議：`chore(deps)` → `feat(styles)` → `feat(hooks)` → `feat(hero)` → `refactor(hero)` → `docs`）
- [ ] 12.2 在 README dev activity 區塊新增本次條目（由 PostToolUse hook 自動處理；若失敗手動補）
- [ ] 12.3 待人工確認上線後，執行 `/opsx:archive` 歸檔此 change
