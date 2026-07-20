import React, { useMemo, useEffect } from 'react';
import { rebuildCityGround } from '@/world/Ground';
import { REGIONS, COLS, ROWS } from '@/config';

/**
 * GroundLayer presentational component.
 * Builds and renders the grid ground (islands and canals) for the active regions.
 */
function GroundLayer() {
  // Memoize the ground group to avoid rebuilding on every render.
  const groundGroup = useMemo(() => {
    return rebuildCityGround(REGIONS, COLS, ROWS);
  }, []);

  // Clean up geometries and materials when the component unmounts or group changes.
  useEffect(() => {
    return () => {
      if (groundGroup) {
        groundGroup.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
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
  }, [groundGroup]);

  return <primitive object={groundGroup} />;
}

export default React.memo(GroundLayer);
