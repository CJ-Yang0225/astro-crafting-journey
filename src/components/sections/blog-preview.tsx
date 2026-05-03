import { motion } from "motion/react";

export interface PostPreview {
  slug: string;
  title: string;
  date: string;
  badge: string;
  badgeVariant: "category" | "type";
  description: string;
  href: string;
}

interface Props {
  posts: PostPreview[];
}

const STAGGER_MS = 0.08;

export default function BlogPreview({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Latest Writing
            </p>
            <h2 className="font-heading text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              Blog & Notes
            </h2>
          </div>
          <a
            href="/blog"
            className="hidden shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            View all →
          </a>
        </div>

        <ul className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
          {posts.map((post, i) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * STAGGER_MS }}
            >
              <a
                href={post.href}
                className="group flex h-full flex-col gap-3 bg-background p-6 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-center gap-2">
                  <time
                    dateTime={post.date}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {post.date}
                  </time>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {post.badge}
                  </span>
                </div>

                <h3 className="font-heading text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h3>

                {post.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                )}

                <span className="mt-auto font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
                  Read →
                </span>
              </a>
            </motion.li>
          ))}
        </ul>

        <div className="mt-8 text-center sm:hidden">
          <a
            href="/blog"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            View all posts →
          </a>
        </div>
      </div>
    </section>
  );
}
