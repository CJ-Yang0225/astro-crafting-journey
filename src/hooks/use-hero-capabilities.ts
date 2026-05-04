import { useMemo } from "react";

export interface HeroCapabilities {
  enableCanvas: boolean;
  enableInteraction: boolean;
  particleCount: number;
  enablePostFX: boolean;
  maxDpr: number;
}

export function useHeroCapabilities(): HeroCapabilities {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        enableCanvas: false,
        enableInteraction: false,
        particleCount: 0,
        enablePostFX: false,
        maxDpr: 1,
      };
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const dpr = window.devicePixelRatio ?? 1;

    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    const hasFloatTexture = gl
      ? !!gl.getExtension("OES_texture_float")
      : false;

    const isLowEnd = dpr <= 1.5 && !hasFloatTexture;

    return {
      enableCanvas: !prefersReducedMotion,
      enableInteraction: !isCoarsePointer && !prefersReducedMotion,
      particleCount: isLowEnd ? 400 : 800,
      enablePostFX: !isLowEnd,
      maxDpr: isLowEnd ? 1.5 : Math.min(dpr, 2),
    };
  }, []);
}
