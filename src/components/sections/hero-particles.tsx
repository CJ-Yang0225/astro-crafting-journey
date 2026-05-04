import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32 } from "@/lib/seeded-rng";
import type { ProgressRef } from "@/lib/scroll-progress-ref";

export interface PointerRef {
  current: { x: number; y: number };
}

interface HeroParticlesProps {
  progressRef: ProgressRef;
  pointerRef: PointerRef;
  particleCount?: number;
  enableInteraction?: boolean;
}

const CYAN = new THREE.Color("#00e5ff");
const MAGENTA = new THREE.Color("#ff00aa");
const LIME = new THREE.Color("#00ff88");

export default function HeroParticles({
  progressRef,
  pointerRef,
  particleCount = 800,
  enableInteraction = true,
}: HeroParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { positions, colors, originalPositions } = useMemo(() => {
    const rng = mulberry32(0xc0de);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (rng() - 0.5) * 12;
      positions[i * 3 + 1] = (rng() - 0.5) * 7;
      positions[i * 3 + 2] = (rng() - 0.5) * 4;

      const rand = rng();
      const color = rand < 0.8 ? CYAN : rand < 0.95 ? MAGENTA : LIME;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors, originalPositions: positions.slice() };
  }, [particleCount]);

  const velocities = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;
    const points = pointsRef.current;
    if (!group || !material || !points) return;

    const progress = progressRef.current.value;
    const lambda = 6;

    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      progress * 1.5,
      lambda,
      delta
    );
    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      progress * -3,
      lambda,
      delta
    );
    material.opacity = THREE.MathUtils.damp(
      material.opacity,
      1.0 - progress * 0.8,
      lambda,
      delta
    );

    if (!enableInteraction) return;

    const geom = points.geometry;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const { x: px, y: py } = pointerRef.current;
    const cursorX = px * 5;
    const cursorY = py * 3;

    for (let i = 0; i < particleCount; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];
      const cx = pos.getX(i);
      const cy = pos.getY(i);

      const dx = cx - cursorX;
      const dy = cy - cursorY;
      const dist2 = dx * dx + dy * dy;

      if (dist2 < 0.25 && dist2 > 0.000001) {
        const dist = Math.sqrt(dist2);
        const force = ((0.5 - dist) / 0.5) * 0.06;
        velocities[i * 3] += (dx / dist) * force;
        velocities[i * 3 + 1] += (dy / dist) * force;
      }

      velocities[i * 3] = (velocities[i * 3] + (ox - cx) * 0.08) * 0.86;
      velocities[i * 3 + 1] =
        (velocities[i * 3 + 1] + (oy - cy) * 0.08) * 0.86;

      pos.setXYZ(
        i,
        cx + velocities[i * 3],
        cy + velocities[i * 3 + 1],
        oz + velocities[i * 3 + 2] * 0.05
      );
    }

    pos.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.03}
          vertexColors
          transparent
          opacity={1.0}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}
