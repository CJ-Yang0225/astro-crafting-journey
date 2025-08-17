import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z
      .string()
      .or(z.date())
      .transform((val) => {
        // 支援完整 ISO 8601 格式 (YYYY-MM-DDTHH:mm:ss+TZ, YYYY-MM-DDTHH:mm+TZ) 和簡單日期格式 (YYYY-MM-DD)
        if (typeof val === "string") {
          // 如果只有日期沒有時間，預設為當天的 00:00
          if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return new Date(`${val}T00:00+08:00`);
          }
        }
        return new Date(val);
      }),
    updatedAt: z
      .string()
      .or(z.date())
      .transform((val) => {
        if (typeof val === "string") {
          if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return new Date(`${val}T00:00+08:00`);
          }
        }
        return new Date(val);
      })
      .optional(),
    coverImage: z.string(),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    // TODO:互動數據將由 API 動態載入
    maxLikes: z.number().max(16).default(0),
  }),
});

const notesCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
    tags: z.array(z.string()),
    category: z.string(),
    type: z.enum(["learning", "snippet", "reference"]),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    technologies: z.array(z.string()).optional(),
  }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    images: z.array(z.string()),
    featured: z.boolean().default(false),
    status: z.enum(["completed", "in-progress", "archived"]),
    startDate: z.date(),
    endDate: z.date().optional(),
    highlights: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  notes: notesCollection,
  projects: projectsCollection,
};
