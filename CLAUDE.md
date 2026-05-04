# CLAUDE.md

## Project

Personal portfolio and blog platform built with Astro v6. Goal: showcase technical depth (Edge/Serverless/WebGL/animations) through Islands Architecture with multi-framework integration.

## Target Architecture (in progress)

| Layer                | Tech                                | Responsibility                           |
| -------------------- | ----------------------------------- | ---------------------------------------- |
| `origin_application` | Astro v6 + React 18 + Vue 3         | Public blog, portfolio, admin UI         |
| `edge_auth_layer`    | Hono + Cloudflare Workers (planned) | JWT auth, rate limiting, routing/gateway |
| `distributed_kv`     | Cloudflare KV (planned)             | JWT blacklist, session metadata          |

Request flow: `Browser → CF edge_auth_layer → origin Astro`

## Dev Commands (pnpm)

```bash
pnpm dev          # localhost:4321
pnpm build        # astro check + build
pnpm preview      # preview production build
pnpm astro:check  # type check only
pnpm test:once    # vitest run
pnpm lint         # eslint
pnpm lint:fix     # eslint --fix
pnpm format       # prettier
```

## Current Stack

- **Framework**: Astro v6.2.1, TypeScript 5.9 strict mode
- **UI frameworks**: React 19 (interactive islands), Vue 3.5 (showcase variety)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI primitives), HSL CSS custom properties; configured via `src/styles/globals.css` (`@theme inline`)
- **Content**: MDX + shiki syntax highlighting (github-dark-dimmed theme)
- **Animations**: Motion v12 (`motion/react`); GSAP + Three.js planned as islands
- **Forms**: React Hook Form + Zod v4 + @hookform/resolvers v5
- **Icons**: astro-icon with @iconify-json/lucide, mdi, ri
- **Notifications**: sonner v2
- **Path alias**: `@/*` → `src/*`, `~/*` → `src/*`

## Content Collections

Schema source of truth: `src/content.config.ts`

| Collection  | Purpose                                      |
| ----------- | -------------------------------------------- |
| `blog/`     | Full articles and MDX posts                  |
| `notes/`    | Dev notes, snippets, quick references        |
| `projects/` | Portfolio entries with tech stack and status |

**Required front matter:**

- `blog`: `title`, `description`, `publishedAt`, `coverImage`, `category`
- `notes`: `title`, `createdAt`, `tags`, `category`, `type` (learning\|snippet\|reference)
- `projects`: `title`, `description`, `technologies`, `images`, `status`, `startDate`

## Routes

```
/               index
/blog           unified content entry (articles + notes)
/blog/category/ filter by category
/projects       portfolio
/skills         interactive tech stack visualization
/about          personal profile + timeline
/contact        professional contact form (React Hook Form + Zod)
```

Admin routes (planned): `/admin/login`, `/admin/dashboard`, `/admin/posts`, `/admin/projects`

## Component Conventions

- **`src/components/ui/`** — shadcn/ui base components
- **`src/components/layout/`** — header, footer, nav
- **`src/components/sections/`** — page-level sections
- **`src/components/forms/`** — form islands (React)
- **Islands strategy**: React for interactive/stateful; Vue for framework variety demos; pure Astro for static content
- **`client:*` usage**: `client:load` above-fold interactive; `client:idle` deferred; `client:visible` below-fold

## File Conventions

- Files: kebab-case (`my-component.astro`, `app-input.tsx`)
- TypeScript: `interface` for props/inheritance; `type` for unions/aliases
- Constants: `src/constants/` with `UPPER_SNAKE_CASE`

## Key Directories

```
src/
  config/       site.ts, nav-menu.ts, about.ts, landing.ts
  lib/          utils.ts, seo.ts, fetchers.ts, content-utils.ts, toc.ts
  layouts/      base-layout, main-layout, blog-post, auth-layout
  plugins/      remark-reading-time
  hooks/        use-mounted.ts
astro.config.mjs          # integrations; @tailwindcss/vite in vite.plugins; remarkReadingTime in mdx
```

## Architectural Constraints

- Astro-first: zero-JS default; add JS only via islands
- Vitest v4 runs in `node` environment (no jsdom); browser APIs unavailable in tests
- 3D/animation effects must be encapsulated in islands to prevent SSR pollution
- When edge auth layer is added: JWT issuance at edge; Astro server reads user context from forwarded headers; admin routes validated at both layers
- `immediatelyRender: false` required for any SSR-sensitive React island (e.g. future Tiptap editor)
