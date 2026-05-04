import {
  Suspense,
  lazy,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Canvas } from "@react-three/fiber";
import type { ProgressRef } from "@/lib/scroll-progress-ref";
import type { PointerRef } from "./hero-particles";
import type { HeroSceneHandle } from "./hero-scene";

const LazyHeroScene = lazy(() => import("./hero-scene"));

export interface HeroCanvasHandle {
  triggerBurst: () => void;
  setChromaHigh: (high: boolean) => void;
}

interface HeroCanvasProps {
  progressRef: ProgressRef;
  pointerRef: PointerRef;
  particleCount?: number;
  enableInteraction?: boolean;
  enablePostFX?: boolean;
  maxDpr?: number;
}

const HeroCanvas = forwardRef<HeroCanvasHandle, HeroCanvasProps>(
  (
    {
      progressRef,
      pointerRef,
      particleCount = 800,
      enableInteraction = true,
      enablePostFX = true,
      maxDpr = 2,
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const [webglFailed, setWebglFailed] = useState(false);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const burstFnRef = useRef<() => void>(() => {});
    const chromaHighFnRef = useRef<(high: boolean) => void>(() => {});
    const sceneRef = useRef<HeroSceneHandle>(null);

    useImperativeHandle(ref, () => ({
      triggerBurst: () => burstFnRef.current(),
      setChromaHigh: (high: boolean) => chromaHighFnRef.current(high),
    }));

    useEffect(() => {
      setMounted(true);
    }, []);

    // Expose scene methods once scene registers itself
    useEffect(() => {
      if (!sceneRef.current) return;
      burstFnRef.current = () => sceneRef.current?.triggerBurst();
      chromaHighFnRef.current = (high) =>
        sceneRef.current?.setChromaHigh(high);
    });

    const handleRegisterBurst = useCallback((fn: () => void) => {
      burstFnRef.current = fn;
    }, []);

    // WebGL context lost handler
    useEffect(() => {
      const container = canvasContainerRef.current;
      if (!container) return;

      const canvas = container.querySelector("canvas");
      if (!canvas) return;

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        console.warn("[HeroCanvas] WebGL context lost — reverting to fallback");
        setWebglFailed(true);
      };

      canvas.addEventListener("webglcontextlost", handleContextLost);
      return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
    }, [mounted]);

    if (!mounted || webglFailed) return null;

    return (
      <div
        ref={canvasContainerRef}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <Canvas
          dpr={[1, maxDpr]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ position: [0, 0, 5], fov: 60 }}
          onCreated={({ gl }) => {
            // Try/catch context creation failure surfaced by R3F
            if (!gl.getContext()) {
              console.warn("[HeroCanvas] WebGL context unavailable");
              setWebglFailed(true);
            }
          }}
        >
          <Suspense fallback={null}>
            <LazyHeroScene
              ref={sceneRef}
              progressRef={progressRef}
              pointerRef={pointerRef}
              particleCount={particleCount}
              enableInteraction={enableInteraction}
              enablePostFX={enablePostFX}
              onRegisterBurst={handleRegisterBurst}
            />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

HeroCanvas.displayName = "HeroCanvas";

export default HeroCanvas;
