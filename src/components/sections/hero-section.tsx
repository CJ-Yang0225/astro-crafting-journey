import { useRef, lazy, Suspense } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeroCapabilities } from "@/hooks/use-hero-capabilities";
import { useMagnetic } from "@/hooks/use-magnetic";
import type { HeroCanvasHandle } from "./hero-canvas";

const HeroCanvas = lazy(() => import("./hero-canvas"));

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const jerryRef = useRef<HTMLSpanElement>(null);
  const yangRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HeroCanvasHandle>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef({ value: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });

  const capabilities = useHeroCapabilities();

  // Magnetic CTAs
  const primaryCtaRef = useMagnetic<HTMLAnchorElement>({
    coefficient: 0.25,
    radius: 100,
  });
  const primaryArrowRef = useMagnetic<HTMLSpanElement>({
    coefficient: 0.4,
    radius: 100,
  });
  const secondaryCtaRef = useMagnetic<HTMLAnchorElement>({
    coefficient: 0.15,
    radius: 100,
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const jerry = jerryRef.current;
      const yang = yangRef.current;
      if (!section || !content || !jerry || !yang) return;

      // ScrambleText entrance
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (!prefersReducedMotion) {
        import("gsap/ScrambleTextPlugin").then(({ ScrambleTextPlugin }) => {
          gsap.registerPlugin(ScrambleTextPlugin);

          const tl = gsap.timeline();
          tl.to(jerry, {
            duration: 1.2,
            scrambleText: {
              text: "JERRY",
              chars: "!<>-_\\/[]{}—=+*^?#",
              speed: 1,
            },
          })
            .to(
              yang,
              {
                duration: 1.0,
                scrambleText: {
                  text: "YANG.",
                  chars: "!<>-_\\/[]{}—=+*^?#",
                  speed: 1,
                },
              },
              "-=0.3"
            )
            .call(
              () => {
                // Fade in canvas, fade out fallback
                gsap.to(fallbackRef.current, {
                  opacity: 0,
                  duration: 0.8,
                  ease: "power2.out",
                });
              },
              [],
              "+=0.3"
            );
        });
      }

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

      // Scroll: write progress to ref (feeds WebGL scene)
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progressRef.current.value = self.progress;
        },
      });
    },
    { scope: sectionRef }
  );

  // Pointer tracking (skip on coarse pointer)
  const handlePointerMove = capabilities.enableInteraction
    ? (e: React.PointerEvent<HTMLElement>) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointerRef.current.x =
          ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerRef.current.y =
          -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }
    : undefined;

  // Heading hover: trigger glitch burst + chroma high
  const handleHeadingEnter = () => {
    canvasRef.current?.triggerBurst();
    canvasRef.current?.setChromaHigh(true);
  };
  const handleHeadingLeave = () => {
    canvasRef.current?.setChromaHigh(false);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        minHeight: "100dvh",
        backgroundColor: "hsl(var(--hero-surface))",
      }}
      onPointerMove={handlePointerMove}
    >
      {/* Static fallback background — always rendered, cross-fades out when Canvas mounts */}
      <div
        ref={fallbackRef}
        className="absolute inset-x-0 -top-[10%] h-[120%]"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #00e5ff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 60% at 50% 50%, transparent 35%, hsl(220 30% 4%) 85%)",
          }}
        />
      </div>

      {/* WebGL Canvas island — client-only, lazy loaded */}
      {capabilities.enableCanvas && (
        <Suspense fallback={null}>
          <HeroCanvas
            ref={canvasRef}
            progressRef={progressRef}
            pointerRef={pointerRef}
            particleCount={capabilities.particleCount}
            enableInteraction={capabilities.enableInteraction}
            enablePostFX={capabilities.enablePostFX}
            maxDpr={capabilities.maxDpr}
          />
        </Suspense>
      )}

      {/* HUD — top left */}
      <div
        className="absolute left-6 top-6 hidden flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.25em] md:flex"
        aria-hidden="true"
        style={{ color: "#4a5568" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: "#00e5ff",
              boxShadow: "0 0 6px #00e5ff",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ color: "#00e5ff" }}>SYS · LIVE</span>
        </div>
        <span>
          {`${String(new Date().getFullYear()).slice(-2)}.${String(new Date().getMonth() + 1).padStart(2, "0")}.${String(new Date().getDate()).padStart(2, "0")}`}
        </span>
      </div>

      {/* HUD — top right */}
      <div
        className="absolute right-6 top-6 hidden font-mono text-[9px] uppercase tracking-[0.25em] md:block"
        aria-hidden="true"
        style={{ color: "#4a5568" }}
      >
        // 01
      </div>

      {/* Main content */}
      <div
        ref={contentRef}
        className="container relative z-10 flex flex-col justify-center py-24"
        style={{ minHeight: "100dvh" }}
      >
        <div className="max-w-5xl">
          {/* Eyebrow */}
          <p
            className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: "#4a5568" }}
          >
            <span className="inline-block h-px w-7 bg-current opacity-50" />
            Frontend Engineer &middot; Portfolio 2026
          </p>

          {/* Heading */}
          <div
            ref={headingRef}
            onPointerEnter={handleHeadingEnter}
            onPointerLeave={handleHeadingLeave}
          >
            <h1
              className="font-heading leading-[0.88] tracking-tight"
              style={{ fontSize: "clamp(4rem, 12vw, 10rem)" }}
            >
              <span
                ref={jerryRef}
                className="block"
                style={{ color: "#e2e8f0" }}
              >
                JERRY
              </span>
              <span
                ref={yangRef}
                className="block"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #00e5ff 0%, #00ff88 50%, #ff00aa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                YANG.
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <p
            className="mt-8 max-w-md text-base leading-relaxed sm:text-lg"
            style={{ color: "#718096" }}
          >
            Crafting Islands of Interaction — Astro, React, GSAP, and the edge
            woven into performant, memorable experiences.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              ref={primaryCtaRef}
              href="/projects"
              className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: "#e2e8f0",
                color: "#0a0f1e",
                display: "inline-flex",
              }}
            >
              View Projects
              <span ref={primaryArrowRef} style={{ display: "inline-flex" }}>
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
              </span>
            </a>
            <a
              ref={secondaryCtaRef}
              href="/blog"
              className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                border: "1px solid #2d3748",
                color: "#a0aec0",
              }}
            >
              Read Blog
            </a>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div
          className="absolute bottom-10 left-8 hidden flex-col items-center gap-2 md:flex"
          aria-hidden="true"
        >
          <div
            className="h-12 w-px"
            style={{
              background:
                "linear-gradient(to bottom, #4a5568, transparent)",
              opacity: 0.5,
            }}
          />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.35em]"
            style={{
              writingMode: "vertical-rl",
              color: "#4a5568",
            }}
          >
            Scroll to explore
          </span>
        </div>

        {/* HUD — bottom right: build ticker */}
        <div
          className="absolute bottom-10 right-8 hidden font-mono text-[9px] uppercase tracking-[0.2em] md:block"
          aria-hidden="true"
          style={{ color: "#4a5568" }}
        >
          build · {new Date().getFullYear()}
        </div>
      </div>

      {/* Bottom gradient transition to next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background)), transparent)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
