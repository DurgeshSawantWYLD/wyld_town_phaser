import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLevelMap } from '../hooks/useLevelMap';

/**
 * Scene component inside the R3F Canvas for Level Map.
 * Calls useLevelMap to initialize the Three.js LevelMap class,
 * and handles updating/rendering manually each frame.
 */
function LevelMapScene() {
  const levelMapRef = useLevelMap();

  useFrame(({ clock, gl }) => {
    const levelMap = levelMapRef.current;
    if (levelMap && levelMap.isActive) {
      // Update the animations / positioning
      levelMap.update(clock.getElapsedTime());
      // Render the custom scene and camera manually (priority 1 bypasses automatic R3F pass)
      gl.render(levelMap.scene, levelMap.camera);
    }
  }, 1);

  return null;
}

/**
 * LevelMapCanvas component that wraps LevelMapScene inside an R3F Canvas.
 */
export function LevelMapCanvas() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      gl={{ antialias: true }}
    >
      <LevelMapScene />
    </Canvas>
  );
}
