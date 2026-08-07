import React, { useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createTree,
  createLampPost,
  createBench,
  updateWindSway,
} from '@/world/Props';
import { COLS, ROWS, ROAD_SET } from '@/config';
import { useJourneyStore } from '@/features/journey';

/**
 * PropsLayer component.
 * Generates decorative environment props (trees, streetlamps, benches)
 * placed strategically around roads and empty cells, with wind sway animations.
 */
function PropsLayer() {
  const tasks = useJourneyStore((s) => s.tasks);

  // Calculate building positions set to avoid collision
  const buildingSet = useMemo(() => {
    const set = new Set();
    if (tasks && Array.isArray(tasks)) {
      tasks.forEach((t) => {
        if (t.col !== undefined && t.row !== undefined) {
          set.add(`${t.col},${t.row}`);
        }
      });
    }
    return set;
  }, [tasks]);

  // Construct props scene group
  const propsGroup = useMemo(() => {
    const group = new THREE.Group();
    group.name = 'city-props-group';

    // Dummy scene object expected by Props.js factory functions
    const fakeScene = {
      add: (obj) => group.add(obj),
    };

    const treeTypes = ['lollipop', 'oak', 'pine', 'palm', 'bush', 'autumn'];

    // Iterate through grid cells with padding
    const margin = 2;
    for (let c = -margin; c < COLS + margin; c++) {
      for (let r = -margin; r < ROWS + margin; r++) {
        const key = `${c},${r}`;
        if (ROAD_SET.has(key) || buildingSet.has(key)) {
          continue; // skip road and building cells
        }

        // Deterministic pseudo-random seed based on col/row
        const seed = (c * 37 + r * 17) % 100;

        // Check distance to any building to ensure buildings stay clear and prominent
        let nearBuilding = false;
        if (tasks && Array.isArray(tasks)) {
          for (const t of tasks) {
            if (t.col !== undefined && t.row !== undefined) {
              const dist = Math.abs(c - t.col) + Math.abs(r - t.row);
              if (dist <= 1) {
                nearBuilding = true;
                break;
              }
            }
          }
        }

        if (nearBuilding) continue; // Keep space around buildings clean!

        // Neighbor check: is it adjacent to a road cell?
        const isRoadNeighbor =
          ROAD_SET.has(`${c + 1},${r}`) ||
          ROAD_SET.has(`${c - 1},${r}`) ||
          ROAD_SET.has(`${c},${r + 1}`) ||
          ROAD_SET.has(`${c},${r - 1}`);

        if (isRoadNeighbor) {
          // Roadside props (lamp posts, benches)
          if (seed < 18) {
            const prop = createLampPost(fakeScene, c, r, COLS, ROWS);
            prop.scale.set(0.9, 0.9, 0.9);
          } else if (seed < 32) {
            const prop = createBench(fakeScene, c, r, COLS, ROWS);
            prop.scale.set(0.9, 0.9, 0.9);
          }
        } else {
          // Lush foliage assets across open city fields (~35% density)
          if (seed < 35) {
            const type = treeTypes[seed % treeTypes.length];
            const tree = createTree(fakeScene, c, r, COLS, ROWS, type);
            tree.scale.set(0.85 + (seed % 10) * 0.03, 0.85 + (seed % 10) * 0.03, 0.85 + (seed % 10) * 0.03);
          }
        }
      }
    }

    return group;
  }, [buildingSet, tasks]);

  // Clean up memory on unmount
  useEffect(() => {
    return () => {
      if (propsGroup) {
        propsGroup.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [propsGroup]);

  // Animate tree wind sway on frame update
  useFrame((state) => {
    updateWindSway(state.clock.getElapsedTime() * 1000);
  });

  return <primitive object={propsGroup} />;
}

export default React.memo(PropsLayer);
