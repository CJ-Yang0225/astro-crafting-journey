import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32 } from "@/lib/seeded-rng";
import type { ProgressRef } from "@/lib/scroll-progress-ref";

interface HeroConstellationProps {
  progressRef: ProgressRef;
  particleCount?: number;
}

const THRESHOLD = 0.4;
const THRESHOLD_SQ = THRESHOLD * THRESHOLD;
const CELL_SIZE = 0.5;

export default function HeroConstellation({
  progressRef,
  particleCount = 800,
}: HeroConstellationProps) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  const particlePositions = useMemo(() => {
    const rng = mulberry32(0xc0de);
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (rng() - 0.5) * 12;
      pos[i * 3 + 1] = (rng() - 0.5) * 7;
      pos[i * 3 + 2] = (rng() - 0.5) * 4;
    }
    return pos;
  }, [particleCount]);

  const linePositions = useMemo(() => {
    const grid = new Map<string, number[]>();

    const cellKey = (cx: number, cy: number, cz: number) =>
      `${cx},${cy},${cz}`;

    for (let i = 0; i < particleCount; i++) {
      const cx = Math.floor(particlePositions[i * 3] / CELL_SIZE);
      const cy = Math.floor(particlePositions[i * 3 + 1] / CELL_SIZE);
      const cz = Math.floor(particlePositions[i * 3 + 2] / CELL_SIZE);
      const key = cellKey(cx, cy, cz);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(i);
    }

    const lines: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const ax = particlePositions[i * 3];
      const ay = particlePositions[i * 3 + 1];
      const az = particlePositions[i * 3 + 2];
      const cx = Math.floor(ax / CELL_SIZE);
      const cy = Math.floor(ay / CELL_SIZE);
      const cz = Math.floor(az / CELL_SIZE);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const neighbors = grid.get(cellKey(cx + dx, cy + dy, cz + dz));
            if (!neighbors) continue;
            for (const j of neighbors) {
              if (j <= i) continue;
              const bx = particlePositions[j * 3];
              const by = particlePositions[j * 3 + 1];
              const bz = particlePositions[j * 3 + 2];
              const distSq =
                (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;
              if (distSq < THRESHOLD_SQ) {
                lines.push(ax, ay, az, bx, by, bz);
              }
            }
          }
        }
      }
    }

    return new Float32Array(lines);
  }, [particlePositions, particleCount]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const progress = progressRef.current.value;
    material.opacity = THREE.MathUtils.damp(
      material.opacity,
      Math.max(0, 0.4 - progress * 0.4),
      6,
      delta
    );
  });

  if (linePositions.length === 0) return null;

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={materialRef}
        color="#00e5ff"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </lineSegments>
  );
}
