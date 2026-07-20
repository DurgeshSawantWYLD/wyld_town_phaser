import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import SceneLights from './SceneLights';
import GroundLayer from './GroundLayer';
import BuildingsLayer from './BuildingsLayer';
import useCameraController from '../hooks/useCameraController';
import usePointerInteraction from '../hooks/usePointerInteraction';
import IntroStarfield from './IntroStarfield';
import RegionLabels from './RegionLabels';


/**
 * CameraController sub-component.
 * Invokes the useCameraController hook inside the R3F Canvas context.
 */
function CameraController() {
  useCameraController();
  return null;
}

/**
 * CityCanvas component.
 * Renders the main React Three Fiber canvas for the city view,
 * setting up the background, fog, orthographic camera, lights,
 * and postprocessing effects (bloom).
 */
export default function CityCanvas() {
  const pointerHandlers = usePointerInteraction();

  return (
    <div
      {...pointerHandlers}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        }}
      >
        {/* Background color matching requirements */}
        <color attach="background" args={['#c8e6f5']} />

        {/* FogExp2 matching requirements */}
        <fogExp2 attach="fog" args={['#c8e6f5', 0.012]} />

        {/* Isometric/Orthographic camera looking at origin (0, 0, 0) */}
        <OrthographicCamera
          makeDefault
          position={[12, 14, 12]}
          zoom={40}
          near={0.1}
          far={1000}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />

        {/* Camera controller to handle panning/zooming */}
        <CameraController />

        {/* Lighting setup */}
        <SceneLights />

        {/* Intro starfield */}
        <IntroStarfield />

        {/* Region Labels */}
        <RegionLabels />

        {/* Ground islands/canals */}
        <GroundLayer />

        {/* Task buildings */}
        <BuildingsLayer />

        {/* Postprocessing Bloom effect */}
        <EffectComposer>
          <Bloom
            threshold={0.85}
            strength={0.18}
            radius={0.3}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

