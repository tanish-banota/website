import { useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { townSpawn } from './collision';
import { FollowCamera } from './FollowCamera';
import { InteractionTracker } from './InteractionTracker';
import type { Anchor, PanelId, SceneId } from './interactions';
import { Player } from './Player';
import { Town } from './Town';

function TownCamera() {
  const { size } = useThree();
  const zoom = Math.min(size.width / 27, size.height / 17);

  return (
    <OrthographicCamera
      makeDefault
      zoom={zoom}
      position={[townSpawn.x, 18, townSpawn.z + 20]}
      near={0.1}
      far={65}
      onUpdate={(camera) => camera.lookAt(townSpawn.x, 0, townSpawn.z)}
    />
  );
}

export function WorldCanvas({ scene, panelOpen, onNearestChange, onOpenPanel }: {
  scene: SceneId;
  panelOpen: boolean;
  onNearestChange: (anchor: Anchor | null) => void;
  onOpenPanel: (panel: PanelId) => void;
}) {
  const playerPosition = useRef({ ...townSpawn });

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#29213F', 0)}
      >
        <TownCamera />
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
        <Town />
        <Player position={playerPosition} enabled={!panelOpen} />
        <FollowCamera position={playerPosition} />
        <InteractionTracker
          position={playerPosition}
          scene={scene}
          enabled={!panelOpen}
          onNearestChange={onNearestChange}
          onActivate={onOpenPanel}
        />
      </Canvas>
    </div>
  );
}
