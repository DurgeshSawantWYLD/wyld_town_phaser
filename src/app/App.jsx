import { useCityStore, CityCanvas } from '@/features/city';
import TitleOverlay from '@/shared/components/TitleOverlay';
import HUD from '@/shared/components/HUD';
import Panel from '@/shared/components/Panel';

/**
 * App.jsx — Root React application shell.
 * Renders the TitleOverlay if intro is active, and toggles between
 * the city and level views based on the current city store state.
 */
export default function App() {
  const isIntroActive = useCityStore((s) => s.isIntroActive);
  const currentView = useCityStore((s) => s.currentView);

  return (
    <>
      {isIntroActive ? (
        <TitleOverlay />
      ) : (
        <>
          <HUD />
          <Panel />
        </>
      )}



      <div
        id="city-container"
        style={{
          display: currentView === 'city' ? 'block' : 'none',
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <CityCanvas />
      </div>

      <div
        id="level-container"
        style={{
          display: currentView === 'level' ? 'block' : 'none',
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Level Map Canvas feature will mount here in US-16 */}
        <div style={{ color: '#1e3a5f', padding: '24px', fontFamily: 'Outfit, sans-serif' }}>
          <h2>Level Map View Active</h2>
          <p>Candy-crush style level map will mount here.</p>
        </div>
      </div>
    </>
  );
}
