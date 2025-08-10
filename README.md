# Astro Crafting Journey

> 編譯邏輯與程式碼的 commit，封存從靈感到部署的記憶，開發旅途中各式札記，刻劃著我持續淬鍊的工匠之心。

個人作品集與部落格，使用 Astro v5 建立，基於 astro-nomy 開源主題，透過 Astro Islands Architecture 展示不同框架的技術整合。

## ✨ 專案特色

- **🚀 Astro v5** - 採用內容優先的靜態網站生成器
- **🏝️ Islands Architecture** - 選擇性互動，實現極致效能
- **⚡ 多框架整合** - React + Vue 共存展示不同技術範例  
- **📝 MDX 支持** - Markdown 寫作 + 元件嵌入
- **🎨 現代化 UI** - Tailwind CSS + shadcn/ui 設計系統
- **🌙 深色模式** - 完整的主題切換支持
- **📱 響應式設計** - 跨裝置完美體驗

## 🚀 專案結構

```
├── public/                    # 靜態資源
├── src/
│   ├── components/           # 可重用元件
│   │   ├── ui/              # UI 基礎元件 (shadcn/ui)
│   │   ├── layout/          # 布局元件
│   │   └── sections/        # 頁面區塊元件
│   ├── content/             # 內容集合
│   │   └── blog/           # 部落格文章
│   ├── layouts/             # 頁面布局模板
│   ├── pages/               # 路由頁面
│   ├── lib/                 # 工具函數
│   └── config/              # 網站配置
├── .claude/                 # Claude Code 配置與 hooks
└── CLAUDE.md               # 開發指南
```

## 🧞 開發指令

本專案使用 **pnpm** 作為套件管理器：

| 指令 | 動作 |
| :--- | :--- |
| `pnpm install` | 安裝依賴套件 |
| `pnpm dev` | 啟動開發伺服器 `localhost:4321` |
| `pnpm build` | 建置生產版本到 `./dist/` |
| `pnpm preview` | 預覽建置結果 |
| `pnpm astro:check` | TypeScript 類型檢查 |

## 🛠️ 技術堆疊

### 核心框架
- **Astro v5** - 靜態網站生成器
- **TypeScript** - 類型安全開發
- **Tailwind CSS** - 原子化 CSS 框架

### UI 與元件
- **React 18** - 互動元件開發
- **Vue 3** - 多框架技術展示
- **shadcn/ui** - 現代化元件庫
- **Radix UI** - 無障礙 UI 基礎元件
- **Framer Motion** - 動畫效果

### 內容管理
- **MDX** - Markdown + JSX 混合內容
- **Astro Content Collections** - 類型安全的內容管理
- **Shiki** - 程式碼語法高亮

### 開發工具
- **Claude Code Hooks** - 自動化開發流程
- **ESLint** - 程式碼規範檢查
- **Prettier** - 程式碼格式化

## 🎯 未來規劃

- [ ] **作品展示頁面** - 新增 projects 或 examples 頁面
- [ ] **3D 效果整合** - Three.js / react-three-fiber 展示
- [ ] **互動式範例** - Code Sandbox 嵌入
- [ ] **後端 API 整合** - Golang 開發的互動功能
- [ ] **內容管理優化** - 更豐富的文章分類和標籤

## 🔄 Development Activity

*Recent code changes tracked automatically*

- **2025-08-11 01:21:33**: Code modifications detected
- **2025-08-11 01:15:08**: Code modifications detected
- **2025-08-11 01:03:40**: Code modifications detected
- **2025-08-10 03:57:35**: Code modifications detected
- **2025-08-10 03:57:27**: Code modifications detected
- **2025-08-10 03:57:16**: Code modifications detected

