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
│   │   ├── blog/           # 技術文章與學習筆記
│   │   ├── notes/          # 快速筆記與代碼片段
│   │   └── projects/       # 作品集項目資料
│   ├── layouts/             # 頁面布局模板
│   ├── pages/               # 路由頁面
│   │   ├── blog/           # 部落格相關頁面
│   │   ├── skills.astro    # 技能視覺化頁面
│   │   ├── contact.astro   # 聯絡表單頁面
│   │   └── projects/       # 作品集頁面
│   ├── lib/                 # 工具函數
│   └── config/              # 網站配置
├── .claude/                 # Claude Code 配置與 hooks
└── CLAUDE.md               # 開發指南
```

## 🗺️ 網站架構

### 主要路由結構
```
/              # 首頁 - 個人作品集概覽
├── /blog      # 技術部落格 - 統一內容入口
│   ├── /category/notes      # 學習筆記分類
│   ├── /category/articles   # 技術文章分類
│   └── /tags/{tag}         # 技術標籤頁面
├── /projects  # 作品集 - 個人專案與技術實驗
├── /skills    # 技能視覺化 - 互動式技術堆疊展示
├── /about     # 關於我 - 個人簡介與開發歷程
└── /contact   # 專業聯絡 - 合作諮詢表單
```

### 導航架構設計
- **內容導航**: Blog（文章筆記） + Projects（作品展示）
- **個人檔案**: Skills（技能樹） + About（關於我） + Contact（聯絡方式）

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

## 🎯 開發進度

### ✅ 已完成項目
- **模板清理** - 移除 astro-nomy 遺留檔案 (docs, guides, releases, pricing 等)
- **架構重構** - 更新導航結構為內容導航 + 個人檔案導航
- **Content Collections** - 建立 blog, notes, projects 內容集合
- **智能化 Hooks** - 改善自動追蹤系統，提供有意義的活動描述

### 🚧 進行中項目
- [ ] **Skills 視覺化頁面** - State of JavaScript 風格的技能展示
- [ ] **Contact 表單系統** - React Hook Form + Golang 後端 + Resend 服務
- [ ] **Blog 分類重構** - 統一內容入口，支援 category 和 tags 路由
- [ ] **Projects 頁面整合** - 作品集展示，支援 experimental/showcase/learning 標籤

### 📋 未來規劃
- [ ] **3D 效果整合** - Three.js / react-three-fiber 展示 (Skills 頁面)
- [ ] **視覺化工具** - Visx + Observable Plot 實作互動圖表
- [ ] **互動式範例** - Code Sandbox 嵌入與展示
- [ ] **後端 API 整合** - Golang 開發的互動功能 (likes, comments)
- [ ] **About 頁面優化** - 融入開發時間軸與個人故事

## 🔄 Development Activity

*AI 協作開發活動自動追蹤，記錄專案架構與功能演進*

- **2025-08-18 00:39:12**: 更新頁面架構
- **2025-08-17 23:50:10**: 更新頁面架構
- **2025-08-17 23:49:47**: 更新頁面架構
- **2025-08-17 23:49:24**: 更新頁面架構
- **2025-08-17 23:48:57**: 更新頁面架構
- **2025-08-17 23:38:03**: 更新程式邏輯
- **2025-08-17 23:37:27**: 程式碼結構優化
- **2025-08-17 23:37:04**: 更新 Astro 元件
- **2025-08-17 20:50:55**: 優化工具函數
- **2025-08-17 20:50:07**: 更新頁面架構

