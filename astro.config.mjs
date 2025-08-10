import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://astro.build",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    vue(),
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-dark-dimmed",
      },
      gfm: true,
    }),
    sitemap(),
    icon({
      iconDir: "src/assets/icons",
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
        "~": "/src"
      },
    },
  },
});
