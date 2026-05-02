import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://crafting-journey.vercel.app",
  integrations: [
    react(),
    vue(),
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-dark-dimmed",
      },
      gfm: true,
      remarkPlugins: [remarkReadingTime],
    }),
    sitemap({
      filter: (page) => {
        // 排除管理頁面和 API 路由
        return !page.includes('/admin/') && !page.includes('/api/');
      },
      customPages: [
        // 可以在這裡添加額外的頁面
      ],
      serialize(item) {
        // 根據頁面類型設置不同的優先級和更新頻率
        if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/projects/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/notes/')) {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        } else if (new URL(item.url).pathname === '/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else {
          item.priority = 0.5;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
    icon({
      iconDir: "src/assets/icons",
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
        "~": "/src",
      },
    },
  },
});
