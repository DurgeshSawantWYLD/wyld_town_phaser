import React, { useRef } from 'react';
import { useCityStore } from '@/features/city';
import { useJourneyStore } from '@/features/journey';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * HUD Component
 * Displays exploration progress and provides controls for camera zoom/reset and view switching.
 * Automatically fades in when mounted (after intro finishes).
 */
const HUD = React.memo(() => {
  const currentView = useCityStore((s) => s.currentView);
  const setView = useCityStore((s) => s.setView);
  const zoomTarget = useCityStore((s) => s.zoomTarget);
  const setZoom = useCityStore((s) => s.setZoom);
  const panCamera = useCityStore((s) => s.panCamera);

  const totalTasks = useJourneyStore((s) => s.tasks.length);
  const completedTasks = useJourneyStore((s) => s.completedTaskIds.length);

  const hudRef = useRef(null);
  const controlsRef = useRef(null);

  // Animate HUD and controls in on mount
  useGSAP(() => {
    gsap.to(hudRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(controlsRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, []);

  const handleZoomIn = () => {
    setZoom(Math.min(3.0, zoomTarget + 0.25));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, zoomTarget - 0.25));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
    panCamera(0, 0, 0);
  };

  const handleToggleView = () => {
    setView(currentView === 'city' ? 'level' : 'city');
  };

  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Top-Left Progress & Info HUD */}
      <div id="hud" ref={hudRef}>
        <div className="hud-card">
          <h1>🏙 WYLD Town Map</h1>
          <p>Explore districts & unlocked campaign nodes</p>
        </div>
        <div className="hud-card">
          <div className="progress-label">
            <span>Explored Progress</span>
            <span id="prog-pct">{progressPct}%</span>
          </div>
          <div className="progress-track">
            <div id="prog-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Bottom-Left Controls HUD */}
      <div id="controls" ref={controlsRef}>
        <button onClick={handleZoomIn} aria-label="Zoom In">+</button>
        <div className="sep" />
        <button onClick={handleZoomOut} aria-label="Zoom Out">−</button>
        <div className="sep" />
        <button
          onClick={handleZoomReset}
          style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.3px' }}
          aria-label="Reset Camera"
        >
          RESET
        </button>
        <div className="sep" />
        <button
          id="btn-toggle-view"
          onClick={handleToggleView}
          style={{ fontSize: '12px', fontWeight: 800, color: '#ff44aa' }}
          aria-label="Toggle View"
        >
          {currentView === 'city' ? '🍭 Level Map' : '🏙 City Map'}
        </button>
      </div>
    </>
  );
});

HUD.displayName = 'HUD';

export default HUD;
