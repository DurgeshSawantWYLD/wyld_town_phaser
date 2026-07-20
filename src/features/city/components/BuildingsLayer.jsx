import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '@/features/journey';
import { useCityStore } from '@/features/city/store/cityStore';
import { resolveAsset } from '@/shared/utils/assetResolver';
import { COLS, ROWS } from '@/config';

/**
 * TaskBuilding component representing an individual interactive building.
 * Handles hover scale animation and click interaction.
 */
const TaskBuilding = React.memo(({ task }) => {
  const groupRef = useRef();
  const openPanel = useCityStore((s) => s.openPanel);
  const setHovered = useCityStore((s) => s.setHovered);
  const hovered = useCityStore((s) => s.hoveredMeshId === task.id);
  const setActiveTask = useJourneyStore((s) => s.setActiveTask);

  // Position based on grid offsets
  const x = task.col - COLS / 2;
  const z = task.row - ROWS / 2;

  // Resolve the 3D asset Group
  const resolvedAsset = useMemo(() => {
    return resolveAsset(task.asset);
  }, [task.asset]);

  // Clean up geometries and materials on unmount
  useEffect(() => {
    return () => {
      if (resolvedAsset) {
        resolvedAsset.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [resolvedAsset]);

  // Smooth hover scale animation using useFrame
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetScale = hovered ? 1.15 : 1.0;
    // Frame-rate independent lerp
    const speed = 1 - Math.pow(0.001, delta); // Lerp factor
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, speed);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, speed);
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, speed);
  });

  return (
    <group
      ref={groupRef}
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(task.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setActiveTask(task.id);
        openPanel('welcome', task.id);
      }}
    >
      <primitive object={resolvedAsset} />
    </group>
  );
});

TaskBuilding.displayName = 'TaskBuilding';

/**
 * BuildingsLayer component.
 * Renders interactive buildings for all tasks in the current journey.
 */
function BuildingsLayer() {
  const tasks = useJourneyStore((s) => s.tasks);

  return (
    <group name="buildings-layer">
      {tasks.map((task) => (
        <TaskBuilding key={task.id} task={task} />
      ))}
    </group>
  );
}

export default React.memo(BuildingsLayer);
