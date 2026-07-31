import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useJourneyStore } from '@/features/journey';
import { addDynamicRoadCell, removeDynamicRoadCell } from '@/world/Ground';
import { COLS, ROWS, ROAD_SET } from '@/config';

/**
 * RoadsLayer component.
 * Renders the dynamic road network generated from chapter task positions
 * and static predefined road cell connections.
 */
export default function RoadsLayer() {
  const { scene } = useThree();
  const tasks = useJourneyStore((s) => s.tasks);

  // Compute set of road cells: combining static ROAD_SET and task positions
  const roadCells = useMemo(() => {
    const set = new Set(ROAD_SET);
    if (tasks && Array.isArray(tasks)) {
      tasks.forEach((t) => {
        if (t.col !== undefined && t.row !== undefined) {
          set.add(`${t.col},${t.row}`);
        }
      });
    }
    return set;
  }, [tasks]);

  useEffect(() => {
    const addedKeys = [];

    roadCells.forEach((key) => {
      const [colStr, rowStr] = key.split(',');
      const col = parseInt(colStr, 10);
      const row = parseInt(rowStr, 10);
      if (!isNaN(col) && !isNaN(row)) {
        addDynamicRoadCell(scene, col, row, COLS, ROWS);
        addedKeys.push({ col, row });
      }
    });

    return () => {
      addedKeys.forEach(({ col, row }) => {
        removeDynamicRoadCell(scene, col, row);
      });
    };
  }, [scene, roadCells]);

  return null;
}
