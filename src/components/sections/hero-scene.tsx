import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Glitch,
} from "@react-three/postprocessing";
import {
  GlitchMode,
  type GlitchEffect,
  type ChromaticAberrationEffect,
} from "postprocessing";
import { Vector2 } from "three";
import * as THREE from "three";
import HeroParticles from "./hero-particles";
import HeroConstellation from "./hero-constellation";
import type { ProgressRef } from "@/lib/scroll-progress-ref";
import type { PointerRef } from "./hero-particles";

export interface HeroSceneHandle {
  triggerBurst: () => void;
  setChromaHigh: (high: boolean) => void;
}

interface HeroSceneProps {
  progressRef: ProgressRef;
  pointerRef: PointerRef;
  particleCount?: number;
  enableInteraction?: boolean;
  enablePostFX?: boolean;
  onRegisterBurst?: (fn: () => void) => void;
}

const FPS_THRESHOLD = 50;
const FPS_WINDOW_SEC = 2;

function CameraRig({
  progressRef,
  pointerRef,
}: {
  progressRef: ProgressRef;
  pointerRef: PointerRef;
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const progress = progressRef.current.value;
    const { x, y } = pointerRef.current;
    const lambda = 6;

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      x * 0.6,
      lambda,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      progress * 0.8 + y * 0.6,
      lambda,
      delta
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      5 - progress * 3,
      lambda,
      delta
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

const HeroScene = forwardRef<HeroSceneHandle, HeroSceneProps>(
  (
    {
      progressRef,
      pointerRef,
      particleCount = 800,
      enableInteraction = true,
      enablePostFX = true,
      onRegisterBurst,
    },
    ref
  ) => {
    const [postFXEnabled, setPostFXEnabled] = useState(enablePostFX);

    const glitchRef = useRef<GlitchEffect>(null);
    const chromaRef = useRef<ChromaticAberrationEffect>(null);
    const burstAllowedRef = useRef(false);
    const fpsAccumRef = useRef(0);

    const triggerBurst = useCallback(() => {
      const glitch = glitchRef.current;
      if (!burstAllowedRef.current || !glitch) return;
      glitch.mode = GlitchMode.SPORADIC;
      setTimeout(() => {
        if (glitchRef.current) glitchRef.current.mode = GlitchMode.DISABLED;
      }, 180);
    }, []);

    const setChromaHigh = useCallback((high: boolean) => {
      const chroma = chromaRef.current;
      if (!chroma) return;
      const target = high ? new Vector2(0.003, 0.004) : null;
      if (target) chroma.offset.copy(target);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        triggerBurst,
        setChromaHigh,
      }),
      [triggerBurst, setChromaHigh]
    );

    useEffect(() => {
      onRegisterBurst?.(triggerBurst);
    }, [onRegisterBurst, triggerBurst]);

    // Idle glitch: every 8±3s
    useEffect(() => {
      if (!enablePostFX) return;
      let timeoutId: ReturnType<typeof setTimeout>;

      const schedule = () => {
        const delay = (8 + (Math.random() * 6 - 3)) * 1000;
        timeoutId = setTimeout(() => {
          triggerBurst();
          schedule();
        }, delay);
      };

      const initDelay = setTimeout(() => {
        burstAllowedRef.current = true;
        schedule();
      }, 1300);

      return () => {
        clearTimeout(initDelay);
        clearTimeout(timeoutId);
        burstAllowedRef.current = false;
      };
    }, [triggerBurst, enablePostFX]);

    // FPS monitoring + chroma scroll sync (no setState in hot path)
    useFrame((_, delta) => {
      // Chroma offset driven by scroll
      const chroma = chromaRef.current;
      if (chroma) {
        const p = progressRef.current.value;
        chroma.offset.set(0.0008 + p * 0.002, 0.0012 + p * 0.003);
      }

      // FPS watchdog
      if (!postFXEnabled) return;
      const fps = 1 / delta;
      if (fps < FPS_THRESHOLD) {
        fpsAccumRef.current += delta;
        if (fpsAccumRef.current >= FPS_WINDOW_SEC) {
          setPostFXEnabled(false);
        }
      } else {
        fpsAccumRef.current = 0;
      }
    });

    return (
      <>
        <fog attach="fog" args={["#050810", 8, 20]} />
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 2, 3]} intensity={0.5} color="#00e5ff" />

        <CameraRig progressRef={progressRef} pointerRef={pointerRef} />

        <HeroParticles
          progressRef={progressRef}
          pointerRef={pointerRef}
          particleCount={particleCount}
          enableInteraction={enableInteraction}
        />

        <HeroConstellation
          progressRef={progressRef}
          particleCount={particleCount}
        />

        {postFXEnabled && (
          <EffectComposer>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
            />
            <ChromaticAberration
              ref={chromaRef}
              offset={new Vector2(0.0008, 0.0012)}
            />
            <Noise opacity={0.04} premultiply />
            <Glitch
              ref={glitchRef}
              active={false}
              mode={GlitchMode.DISABLED}
              delay={new Vector2(1.5, 3.5)}
              duration={new Vector2(0.08, 0.15)}
              strength={new Vector2(0.05, 0.15)}
            />
          </EffectComposer>
        )}
      </>
    );
  }
);

HeroScene.displayName = "HeroScene";

export default HeroScene;
