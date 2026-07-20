import React, { useState, useEffect } from 'react';
import { useCityStore } from '@/features/city/store/cityStore';
import { useJourneyStore } from '@/features/journey';

/**
 * Tooltip Component
 * Displays a floating tooltip that follows the mouse cursor when hovering over interactive 3D buildings.
 */
function Tooltip() {
  const hoveredMeshId = useCityStore((s) => s.hoveredMeshId);
  const tasks = useJourneyStore((s) => s.tasks);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track the hovered task
  const hoveredTask = tasks.find((task) => task.id === hoveredMeshId);

  useEffect(() => {
    if (!hoveredTask) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredTask]);

  if (!hoveredTask) return null;

  // Render status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span style={{ color: '#4caf50', background: 'rgba(76, 175, 80, 0.15)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Completed</span>;
      case 'unlocked':
        return <span style={{ color: '#00e5ff', background: 'rgba(0, 229, 255, 0.15)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>⚡ Active</span>;
      default:
        return <span style={{ color: '#ff9800', background: 'rgba(255, 152, 0, 0.15)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>🔒 Locked</span>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate3d(${mousePos.x + 16}px, ${mousePos.y + 16}px, 0)`,
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'rgba(15, 32, 39, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        color: '#fff',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        maxWidth: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        animation: 'tooltipFadeIn 0.15s ease-out forwards',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.3px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          {hoveredTask.title}
        </h4>
      </div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#b0bec5', lineHeight: '1.3' }}>
        {hoveredTask.desc}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
        {getStatusBadge(hoveredTask.status)}
        {hoveredTask.rewards && hoveredTask.rewards.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: '#ffd54f', display: 'flex', gap: '2px', alignItems: 'center' }}>
            {hoveredTask.rewards[0].icon} +{hoveredTask.rewards[0].value}
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(Tooltip);
