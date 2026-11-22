import { Suspense, lazy, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { northLookout } from './collision';
import type { Point } from './collision';
import { FollowCamera } from './FollowCamera';
import { interiorCameraPreset } from './interiorCamera';
import { InteractionTracker } from './InteractionTracker';
import type { Anchor, SceneId } from './interactions';
import { AssetBoundary } from './AssetBoundary';
import { ObservatoryFallback } from './ObservatoryFallback';
import { Player } from './Player';
import { TownFallback } from './TownFallback';
import { FountainWater } from './Fountain';
import { LookoutMoon } from './LookoutMoon';
import { LookoutHorizon } from './LookoutHorizon';

const TownSource = lazy(() => import('./Town').then((module) => ({ default: module.Town })));
const ObservatorySource = lazy(() => import('./Observatory').then((module) => ({ default: module.Observatory })));
const ModelAsset = lazy(() => import('./ModelAsset').then((module) => ({ default: module.ModelAsset })));
const SketchfabMoon = lazy(() => import('./SketchfabMoon').then((module) => ({ default: module.SketchfabMoon })));

type WorldMetrics = { scene: SceneId; seconds: number; frames: number; fps: number; drawCalls: number; triangles: number; capturedAt: string };

function ReflectionEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const reflection = generator.fromScene(room).texture;
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = reflection;
    scene.environmentIntensity = 0.35;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      reflection.dispose();
    };
  }, [gl, scene]);
  return null;
}

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
    : Math.min(size.width / 9.3, size.height / 8.2);
  const height = scene === 'town' ? 18 : interiorCameraPreset.height;
  const depth = scene === 'town' ? 20 : interiorCameraPreset.depth;
  return (
    <OrthographicCamera
      makeDefault
      zoom={zoom}
      position={scene === 'town' ? [spawn.x, height, spawn.z - 4 + depth] : [0, height, depth]}
      near={0.1}
      far={100}
    />
  );
}

export function WorldCanvas({ scene, spawn, enabled, lookoutActive, onNearestChange, onOpenPanel, onAssetError, onMoonAssetError, onFatalError }: {
  scene: SceneId;
  spawn: Point;
  enabled: boolean;
  lookoutActive: boolean;
  onNearestChange: (anchor: Anchor | null) => void;
  onOpenPanel: (anchor: Anchor) => void;
  onAssetError: () => void;
  onMoonAssetError: () => void;
  onFatalError: () => void;
}) {
  const playerPosition = useRef({ ...spawn });
  const exportMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('asset-export') === scene;

  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#29213F', 0);
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onFatalError();
          }, { once: true });
        }}
      >
        <SceneCamera scene={scene} spawn={spawn} />
        <ReflectionEnvironment />
        <PerformanceProbe scene={scene} />
        <ambientLight intensity={scene === 'town' ? 0.5 : 0.22} color="#B9A8CF" />
        <hemisphereLight args={['#D4C7E1', '#798873', scene === 'town' ? 0.65 : 0.38]} />
        <directionalLight position={[-6, 9, -5]} intensity={scene === 'town' ? 0.3 : 0.38} color="#A9BBD0" />
        <directionalLight
          position={[8, 14, 6]}
          intensity={scene === 'town' ? 1.8 : 0.72}
          color="#F7D9A2"
          castShadow
          shadow-normalBias={0.025}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-camera-near={1}
          shadow-camera-far={45}
        />
        {scene === 'observatory' && <>
          <pointLight position={[1.1, 2, -2]} intensity={1.4} distance={4.5} color="#6FCAEC" />
          <pointLight position={[-2.75, 1.8, -2.9]} intensity={0.55} distance={3.2} color="#EDBC70" />
          <pointLight position={[2.75, 1.8, -2.9]} intensity={0.55} distance={3.2} color="#EDBC70" />
        </>}
        {scene === 'town' ? (
          <AssetBoundary key="town" fallback={<TownFallback />} onError={onAssetError}>
            <Suspense fallback={<TownFallback />}>{exportMode ? <TownSource /> : <ModelAsset file="town.glb" lookoutOnly={lookoutActive} />}</Suspense>
          </AssetBoundary>
        ) : (
          <AssetBoundary key="observatory" fallback={<ObservatoryFallback />} onError={onAssetError}>
            <Suspense fallback={<ObservatoryFallback />}>{exportMode ? <ObservatorySource /> : <ModelAsset file="observatory.glb" />}</Suspense>
          </AssetBoundary>
        )}
        {scene === 'town' && !lookoutActive && <FountainWater />}
        {scene === 'town' && lookoutActive && <LookoutHorizon />}
        {scene === 'town' && lookoutActive && <pointLight position={[northLookout.x, 3, northLookout.z + 1]} intensity={2.4} distance={5} color="#EDBC70" />}
        {scene === 'town' && lookoutActive && <AssetBoundary fallback={<LookoutMoon position={[northLookout.x, 15.3, -32]} />} onError={onMoonAssetError}>
          <Suspense fallback={<LookoutMoon position={[northLookout.x, 15.3, -32]} />}>
            <SketchfabMoon position={[northLookout.x, 15.3, -32]} />
          </Suspense>
        </AssetBoundary>}
        <Player position={playerPosition} spawn={spawn} scene={scene} enabled={enabled} />
        <FollowCamera position={playerPosition} spawn={spawn} scene={scene} lookoutActive={lookoutActive} />
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
