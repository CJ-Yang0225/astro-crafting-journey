import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bg = bgRef.current;
      const content = contentRef.current;
      if (!section || !bg || !content) return;

      // Entrance: stagger reveal from bottom
      gsap.from(".hero-animate", {
        opacity: 0,
        y: 32,
        stagger: 0.09,
        duration: 0.75,
        ease: "power3.out",
        clearProps: "all",
      });

      // Scroll: text layer fades and moves upward
      gsap.to(content, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "30% top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Scroll: background parallax at 0.5x scroll rate
      gsap.to(bg, {
        y: () => section.offsetHeight * 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background"
      style={{ minHeight: "100dvh" }}
    >
      {/* Parallax background layer */}
      <div
        ref={bgRef}
        className="absolute inset-x-0 -top-[10%] h-[120%]"
        aria-hidden="true"
        style={{ willChange: "transform" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial vignette: fades grid toward edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 50% 50%, transparent 35%, hsl(var(--background)) 85%)",
          }}
        />
        {/* Bottom fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Main content */}
      <div
        ref={contentRef}
        className="container relative z-10 flex flex-col justify-center py-24"
        style={{ minHeight: "100dvh" }}
      >
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p className="hero-animate mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block h-px w-7 bg-current opacity-50" />
            Frontend Engineer &middot; Portfolio 2026
          </p>

          {/* Heading */}
          <h1
            className="font-heading leading-[0.88] tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
          >
            <span className="hero-animate block text-foreground">Jerry</span>
            <span className="hero-animate block text-gradient_indigo-purple">
              Yang.
            </span>
          </h1>

          {/* Subheading */}
          <p className="hero-animate mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Crafting Islands of Interaction — Astro, React, GSAP, and the edge
            woven into performant, memorable experiences.
          </p>

          {/* CTAs */}
          <div className="hero-animate mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/projects"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              View Projects
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="/blog"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Read Blog
            </a>
          </div>
        </div>

        {/* Vertical scroll label */}
        <div
          className="absolute bottom-10 left-8 hidden flex-col items-center gap-2 md:flex"
          aria-hidden="true"
        >
          <div className="h-12 w-px bg-gradient-to-b from-muted-foreground to-transparent opacity-40" />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground opacity-50"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll to explore
          </span>
        </div>
      </div>
    </section>
  );
}
