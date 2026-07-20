import { useRef } from 'react';

/**
 * SceneLights component.
 * Sets up hemisphere light, a key directional sun light with shadows,
 * and a subtle ambient fill light for WYLD Town city view.
 */
export default function SceneLights() {
  const sunRef = useRef();

  return (
    <>
      {/* Sky/ground hemisphere light */}
      <hemisphereLight
        args={[0xfff4dc, 0x241a12, 1.1]}
      />

      {/* Primary directional sun light with shadow support */}
      <directionalLight
        ref={sunRef}
        args={[0xfff1cf, 2.15]}
        position={[-35, 70, 35]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
      />

      {/* Subtle ambient fill light */}
      <ambientLight
        args={[0xffffff, 0.25]}
      />
    </>
  );
}
