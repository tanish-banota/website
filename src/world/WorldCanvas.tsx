import { Suspense, lazy, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import type { Point } from './collision';
import { FollowCamera } from './FollowCamera';
import { InteractionTracker } from './InteractionTracker';
import type { Anchor, SceneId } from './interactions';
import { AssetBoundary } from './AssetBoundary';
import { ObservatoryFallback } from './ObservatoryFallback';
import { Player } from './Player';
import { TownFallback } from './TownFallback';

const TownSource = lazy(() => import('./Town').then((module) => ({ default: module.Town })));
const ObservatorySource = lazy(() => import('./Observatory').then((module) => ({ default: module.Observatory })));
const ModelAsset = lazy(() => import('./ModelAsset').then((module) => ({ default: module.ModelAsset })));

type WorldMetrics = { scene: SceneId; seconds: number; frames: number; fps: number; drawCalls: number; triangles: number; capturedAt: string };

function PerformanceProbe({ scene }: { scene: SceneId }) {
  const { gl } = useThree();
  const sample = useRef({ started: 0, frames: 0, calls: 0, triangles: 0, scene });
  useFrame(() => {
    const now = performance.now();
    if (sample.current.scene !== scene) sample.current = { started: now, frames: 0, calls: 0, triangles: 0, scene };
    if (sample.current.started === Infinity) return;
    if (!sample.current.started) sample.current.started = now;
    sample.current.frames++;
    sample.current.calls += gl.info.render.calls;
    sample.current.triangles += gl.info.render.triangles;
    const seconds = (now - sample.current.started) / 1000;
    if (seconds >= 5) {
      const metrics: WorldMetrics = {
        scene, seconds: Number(seconds.toFixed(1)), frames: sample.current.frames,
        fps: Number((sample.current.frames / seconds).toFixed(1)),
        drawCalls: Math.round(sample.current.calls / sample.current.frames),
        triangles: Math.round(sample.current.triangles / sample.current.frames),
        capturedAt: new Date().toISOString(),
      };
      (window as Window & { __twilightMetrics?: WorldMetrics }).__twilightMetrics = metrics;
      console.info('Twilight Town performance sample', metrics);
      sample.current = { started: Infinity, frames: 0, calls: 0, triangles: 0, scene };
    }
  });
  return null;
}

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

export function WorldCanvas({ scene, spawn, enabled, onNearestChange, onOpenPanel, onAssetError }: {
  scene: SceneId;
  spawn: Point;
  enabled: boolean;
  onNearestChange: (anchor: Anchor | null) => void;
  onOpenPanel: (anchor: Anchor) => void;
  onAssetError: () => void;
}) {
  const playerPosition = useRef({ ...spawn });
  const exportMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('asset-export') === scene;

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#29213F', 0)}
      >
        <SceneCamera scene={scene} spawn={spawn} />
        <PerformanceProbe scene={scene} />
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
        {scene === 'town' ? (
          <AssetBoundary key="town" fallback={<TownFallback />} onError={onAssetError}>
            <Suspense fallback={<TownFallback />}>{exportMode ? <TownSource /> : <ModelAsset file="town.glb" />}</Suspense>
          </AssetBoundary>
        ) : (
          <AssetBoundary key="observatory" fallback={<ObservatoryFallback />} onError={onAssetError}>
            <Suspense fallback={<ObservatoryFallback />}>{exportMode ? <ObservatorySource /> : <ModelAsset file="observatory.glb" />}</Suspense>
          </AssetBoundary>
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
