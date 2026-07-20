import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCityStore } from '../store/cityStore';

/**
 * IntroStarfield component.
 * Renders a rotating starfield using THREE.Points.
 * Automatically rotates during the intro scene and hides when intro is disabled.
 */
export default function IntroStarfield() {
  const isIntroActive = useCityStore((s) => s.isIntroActive);
  const ref = useRef();

  // Create starfield geometry only once
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 50 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (isIntroActive && ref.current) {
      // Rotation matches legacy IntroManager.js: time * 0.00007 (but using delta-based approach for frame-rate independence)
      ref.current.rotation.y += delta * 0.05;
    }
  });

  if (!isIntroActive) {
    return null;
  }

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={0xffffff}
        size={0.08}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}
