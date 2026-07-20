import { useRef, useEffect } from 'react';
import { useCityStore } from '../store/cityStore';

/**
 * Custom hook to handle mouse drag panning, wheel zooming, and two-finger pinch zooming.
 * Translates 2D screen pointer movements into 3D isometric camera offsets.
 *
 * @returns {object} React DOM event handlers to be attached to the canvas wrapper div.
 */
export default function usePointerInteraction() {
  const isIntroActive = useCityStore((s) => s.isIntroActive);
  const currentView = useCityStore((s) => s.currentView);
  const zoomTarget = useCityStore((s) => s.zoomTarget);
  const camTargetOffset = useCityStore((s) => s.camTargetOffset);
  
  const setZoom = useCityStore((s) => s.setZoom);
  const panCamera = useCityStore((s) => s.panCamera);

  // Use refs to avoid stale closures in event handlers without re-creating them
  const isIntroActiveRef = useRef(isIntroActive);
  const currentViewRef = useRef(currentView);
  const zoomTargetRef = useRef(zoomTarget);
  const camTargetOffsetRef = useRef(camTargetOffset);

  useEffect(() => {
    isIntroActiveRef.current = isIntroActive;
  }, [isIntroActive]);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    zoomTargetRef.current = zoomTarget;
  }, [zoomTarget]);

  useEffect(() => {
    camTargetOffsetRef.current = camTargetOffset;
  }, [camTargetOffset]);

  // Drag and pinch state refs
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef(null);
  const initialZoom = useRef(1.0);

  /**
   * Helper to check if interactions are allowed.
   */
  const isInteractionDisabled = () => {
    return isIntroActiveRef.current || currentViewRef.current === 'level';
  };

  // MOUSE / GENERAL POINTER EVENTS
  const handlePointerDown = (e) => {
    if (isInteractionDisabled()) return;
    if (e.pointerType === 'touch') return; // Handled by touch events
    if (e.button !== 0) return; // Only left click drags

    isDragging.current = true;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (isInteractionDisabled()) return;
    if (e.pointerType === 'touch') return;
    if (!isDragging.current) return;

    const dx = e.clientX - previousPointerPosition.current.x;
    const dy = e.clientY - previousPointerPosition.current.y;
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };

    // Isometric world translation mapping screen delta to X/Z coordinates
    // Base sensitivity adjusted by current zoom level
    const sensitivity = 0.015 / zoomTargetRef.current;
    const deltaX = (-dx - dy) * sensitivity;
    const deltaZ = (dx - dy) * sensitivity;

    panCamera(
      camTargetOffsetRef.current.x + deltaX,
      camTargetOffsetRef.current.y,
      camTargetOffsetRef.current.z + deltaZ
    );
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === 'touch') return;
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore potential runtime issues releasing capture
    }
  };

  // TOUCH EVENTS (including pinch-to-zoom)
  const handleTouchStart = (e) => {
    if (isInteractionDisabled()) return;

    if (e.touches.length === 1) {
      // Single finger drag start
      isDragging.current = true;
      previousPointerPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      initialPinchDistance.current = null;
    } else if (e.touches.length === 2) {
      // Two finger pinch start
      isDragging.current = false; // Disable panning when pinching
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      initialZoom.current = zoomTargetRef.current;
    }
  };

  const handleTouchMove = (e) => {
    if (isInteractionDisabled()) return;

    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - previousPointerPosition.current.x;
      const dy = e.touches[0].clientY - previousPointerPosition.current.y;
      previousPointerPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      const sensitivity = 0.015 / zoomTargetRef.current;
      const deltaX = (-dx - dy) * sensitivity;
      const deltaZ = (dx - dy) * sensitivity;

      panCamera(
        camTargetOffsetRef.current.x + deltaX,
        camTargetOffsetRef.current.y,
        camTargetOffsetRef.current.z + deltaZ
      );
    } else if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      if (initialPinchDistance.current > 0) {
        const scale = currentDistance / initialPinchDistance.current;
        const nextZoom = Math.max(0.5, Math.min(3.0, initialZoom.current * scale));
        setZoom(nextZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    initialPinchDistance.current = null;
  };

  // WHEEL ZOOM EVENT
  const handleWheel = (e) => {
    if (isInteractionDisabled()) return;
    
    // Zoom speed based on wheel delta
    const zoomDelta = -e.deltaY * 0.0015;
    const nextZoom = Math.max(0.5, Math.min(3.0, zoomTargetRef.current + zoomDelta));
    setZoom(nextZoom);
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onPointerLeave: handlePointerUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    onWheel: handleWheel,
  };
}
