import { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import type { Point } from './collision';
import { FollowCamera } from './FollowCamera';
import { InteractionTracker } from './InteractionTracker';
import type { Anchor, SceneId } from './interactions';
import { InteriorBoundary } from './InteriorBoundary';
import { Observatory, ObservatoryFallback } from './Observatory';
import { Player } from './Player';
import { Town } from './Town';

function SceneCamera({ scene, spawn }: { scene: SceneId; spawn: Point }) {
  const { size } = useThree();
  const zoom = scene === 'town'
    ? Math.min(size.width / 27, size.height / 17)
    : Math.min(size.width / 10, size.height / 11);
  const height = scene === 'town' ? 18 : 9;
  const depth = scene === 'town' ? 20 : 11;

  return (
    <OrthographicCamera
      makeDefault
      zoom={zoom}
      position={[spawn.x, height, spawn.z + depth]}
      near={0.1}
      far={65}
      onUpdate={(camera) => camera.lookAt(spawn.x, 0, spawn.z)}
    />
  );
}

export function WorldCanvas({ scene, spawn, enabled, onNearestChange, onOpenPanel, onInteriorError }: {
  scene: SceneId;
  spawn: Point;
  enabled: boolean;
  onNearestChange: (anchor: Anchor | null) => void;
  onOpenPanel: (anchor: Anchor) => void;
  onInteriorError: () => void;
}) {
  const playerPosition = useRef({ ...spawn });

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#29213F', 0)}
      >
        <SceneCamera scene={scene} spawn={spawn} />
        <ambientLight intensity={1.25} color="#D3C8E8" />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.35}
          color="#EDBC70"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-camera-near={1}
          shadow-camera-far={45}
        />
        {scene === 'town' ? <Town /> : (
          <InteriorBoundary fallback={<ObservatoryFallback />} onError={onInteriorError}>
            <Suspense fallback={<ObservatoryFallback />}>
              <Observatory />
            </Suspense>
          </InteriorBoundary>
        )}
        <Player position={playerPosition} spawn={spawn} scene={scene} enabled={enabled} />
        <FollowCamera position={playerPosition} spawn={spawn} scene={scene} />
        <InteractionTracker
          position={playerPosition}
          scene={scene}
          enabled={enabled}
          onNearestChange={onNearestChange}
          onActivate={onOpenPanel}
        />
      </Canvas>
    </div>
  );
}
