import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCityStore } from '../store/cityStore';

/**
 * Hook to manage camera positioning, target tracking, and zooming.
 * Listens to cityStore properties (camTargetOffset, zoomTarget) and smoothly
 * interpolates camera parameters in the frame loop.
 */
export default function useCameraController() {
  const camera = useThree((state) => state.camera);
  
  // Select slice of state to avoid unnecessary hook updates
  const camTargetOffset = useCityStore((s) => s.camTargetOffset);
  const zoomTarget = useCityStore((s) => s.zoomTarget);

  // Keep refs for smooth interpolation without triggering React re-renders
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
  const baseZoom = 40; // Default base zoom value from canvas configuration

  useFrame((state, delta) => {
    if (!camera) return;

    // Smooth factor for interpolation (independent of frame rate)
    const lerpFactor = Math.min(delta * 8, 1);

    // 1. Lerp the look-at target towards camTargetOffset
    currentTarget.current.x = THREE.MathUtils.lerp(currentTarget.current.x, camTargetOffset.x, lerpFactor);
    currentTarget.current.y = THREE.MathUtils.lerp(currentTarget.current.y, camTargetOffset.y, lerpFactor);
    currentTarget.current.z = THREE.MathUtils.lerp(currentTarget.current.z, camTargetOffset.z, lerpFactor);

    // 2. Set camera position relative to the target (maintaining isometric angle/distance of [12, 14, 12])
    camera.position.set(
      currentTarget.current.x + 12,
      currentTarget.current.y + 14,
      currentTarget.current.z + 12
    );

    // 3. Make the camera look at the target
    camera.lookAt(currentTarget.current);

    // 4. Smoothly interpolate camera zoom towards the target zoom
    const targetZoomValue = baseZoom * zoomTarget;
    const nextZoom = THREE.MathUtils.lerp(camera.zoom, targetZoomValue, lerpFactor);
    
    // Only update and trigger projection update if the zoom changed significantly
    if (Math.abs(camera.zoom - nextZoom) > 0.001) {
      camera.zoom = nextZoom;
      camera.updateProjectionMatrix();
    }
  });
}
