import { Html } from '@react-three/drei';
import { useCityStore } from '../store/cityStore';
import { REGIONS, COLS, ROWS } from '@/config';

/**
 * RegionLabels component.
 * Renders 3D HTML labels using @react-three/drei's Html overlay.
 * Controls visibility via CSS to prevent WebGL context resets on mount/unmount.
 */
export default function RegionLabels() {
  const isIntroActive = useCityStore((s) => s.isIntroActive);

  return (
    <>
      {Object.values(REGIONS).map((region) => {
        // Map 2D grid coordinates to 3D space with COLS/ROWS offsets matching the ground & buildings layers
        const x = region.col - COLS / 2;
        const y = 0.5; // Slightly above ground
        const z = region.row - ROWS / 2;

        return (
          <group key={region.id} position={[x, y, z]}>
            <Html
              center
              distanceFactor={15}
            >
              <div
                style={{
                  background: 'rgba(15, 32, 39, 0.95)',
                  border: `1.5px solid #${region.color.toString(16).padStart(6, '0')}`,
                  borderRadius: '12px',
                  padding: '8px 16px',
                  color: '#ffffff',
                  fontFamily: 'Outfit, sans-serif',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  opacity: isIntroActive ? 0 : 1,
                  visibility: isIntroActive ? 'hidden' : 'visible',
                  transition: 'opacity 0.5s ease, visibility 0.5s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{region.emoji}</span>
                  <span style={{ fontWeight: 'bold', letterSpacing: '0.5px', fontSize: '0.9rem' }}>
                    {region.title.toUpperCase()}
                  </span>
                </div>
                {region.sub && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>
                    {region.sub}
                  </span>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
