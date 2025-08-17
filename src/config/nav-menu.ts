import type { NavMenuConfig } from "@/types";

export const navMenuConfig: NavMenuConfig = {
  contentNav: [
    {
      title: "內容",
      items: [
        {
          title: "Blog",
          href: "/blog",
          description: "技術文章、學習筆記與開發心得分享。",
          image: "/images/examples/changelog.jpg", // TODO: 替換為個人化的 blog 預覽圖
        },
        {
          title: "Projects",
          href: "/projects",
          description: "個人作品集、技術實驗與程式碼展示。",
          image: "/images/examples/static-blog.jpg", // TODO: 替換為 projects 預覽圖
        },
      ],
    },
  ],
  profileNav: [
    {
      title: "關於我",
      items: [
        {
          title: "Skills",
          href: "/skills",
          description: "技能樹與技術堆疊視覺化展示。",
          image: "/images/examples/skills.jpg", // TODO: 創建 skills 預覽圖
        },
        {
          title: "About",
          href: "/about",
          description: "個人經歷、開發歷程與專業背景。",
          image: "/images/examples/about.jpg",
        },
        {
          title: "Contact",
          href: "/contact",
          description: "專業合作諮詢與技術交流聯絡。",
          image: "/images/examples/contact.jpg", // TODO: 創建 contact 預覽圖
        },
      ],
    },
  ],
  links: [
    // 預留給外部連結，如 GitHub, LinkedIn 等
  ],
};
