import React, { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BACKDROP_ASSETS } from '../../data/backdropAssets';
import { ATLAS_BY_KEY } from '../../data/openAnatomyData';
import type { AtlasCameraView, AtlasSex, AtlasSystemFilter } from '../../types/astral';
import {
  AnatomicalAtlasModel,
  type StructureHighlightState,
} from './AnatomicalAtlasModel';
import { WebGLFallback } from './WebGLFallback';
import { detectWebGLCapabilities } from './webglUtils';
import {
  ATLAS_CAMERA_FOV,
  getAtlasCameraTarget,
} from './atlasCameraAndMaterials';

interface WebGLErrorBoundaryProps {
  resetKey: number;
  onError: (message: string) => void;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  state: WebGLErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message || 'WebGL context could not be initialized.');
  }

  componentDidUpdate(prevProps: WebGLErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface AnatomicalAtlasSceneProps {
  mode: 'flight' | 'rehab';
  sex: AtlasSex;
  cameraView: AtlasCameraView;
  viewTrigger: number;
  focusRegion: boolean;
  systemVisibility: Record<AtlasSystemFilter, boolean>;
  skinOpacity: number;
  explodeFactor: number;
  clipRatio: number;
  selectedKey: string;
  isolateSelected: boolean;
  relatedKeys: string[];
  demoAccentKeys: string[];
  highlightStates: Record<string, StructureHighlightState>;
  isFullscreen?: boolean;
  onSelectKey: (key: string) => void;
  onExitIsolation?: () => void;
}

const StudioEnvironment: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envTarget = pmrem.fromScene(room, 0.04);
    const prevEnv = scene.environment;
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.52;

    return () => {
      scene.environment = prevEnv;
      envTarget.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
};

const StudioFloorAndContactShadow: React.FC<{ isSoftwareGl: boolean }> = ({
  isSoftwareGl,
}) => {
  const shadowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(
        size / 2,
        size / 2,
        size * 0.04,
        size / 2,
        size / 2,
        size * 0.48
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.55, 'rgba(2, 6, 14, 0.28)');
      grad.addColorStop(1, 'rgba(2, 6, 14, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      shadowTexture?.dispose();
    };
  }, [shadowTexture]);

  return (
    <group position={[0, -0.002, 0]}>
      {/* Grounded Matte Slate Floor Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={!isSoftwareGl}>
        <circleGeometry args={[0.56, 64]} />
        <meshStandardMaterial color="#0a111f" roughness={0.92} metalness={0.08} />
      </mesh>
      {/* Subtle Border Hairline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.545, 0.555, 64]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.6} />
      </mesh>
      {/* Soft Contact Shadow Beneath Feet */}
      {shadowTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <planeGeometry args={[0.72, 0.72]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

interface CameraRigProps {
  cameraView: AtlasCameraView;
  viewTrigger: number;
  sex: AtlasSex;
  selectedKey: string;
  focusRegion: boolean;
  isSoftwareGl: boolean;
}

const CameraRig: React.FC<CameraRigProps> = ({
  cameraView,
  viewTrigger,
  sex,
  selectedKey,
  focusRegion,
  isSoftwareGl,
}) => {
  const { camera, invalidate } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const animatingRef = useRef<boolean>(false);
  const desiredPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0.16, 0.915, 3.22));
  const desiredTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.875, 0));

  useEffect(() => {
    const spec = getAtlasCameraTarget(cameraView, sex, selectedKey, focusRegion);
    desiredPosRef.current.set(spec.position[0], spec.position[1], spec.position[2]);
    desiredTargetRef.current.set(spec.target[0], spec.target[1], spec.target[2]);

    if (isSoftwareGl && controlsRef.current) {
      camera.position.copy(desiredPosRef.current);
      controlsRef.current.target.copy(desiredTargetRef.current);
      controlsRef.current.update();
      animatingRef.current = false;
    } else {
      animatingRef.current = true;
    }
    invalidate();
  }, [cameraView, viewTrigger, sex, selectedKey, focusRegion, isSoftwareGl, camera, invalidate]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !animatingRef.current) return;

    const dt = Math.min(delta, 0.1);
    const alpha = 1 - Math.exp(-8.5 * dt);

    camera.position.lerp(desiredPosRef.current, alpha);
    controls.target.lerp(desiredTargetRef.current, alpha);
    controls.update();
    invalidate();

    if (
      camera.position.distanceTo(desiredPosRef.current) < 0.008 &&
      controls.target.distanceTo(desiredTargetRef.current) < 0.008
    ) {
      camera.position.copy(desiredPosRef.current);
      controls.target.copy(desiredTargetRef.current);
      controls.update();
      animatingRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={!isSoftwareGl}
      dampingFactor={0.08}
      enableRotate
      enableZoom
      enablePan
      minDistance={0.26}
      maxDistance={4.9}
      minPolarAngle={0.06}
      maxPolarAngle={Math.PI - 0.06}
      onStart={() => {
        animatingRef.current = false;
      }}
      onChange={() => {
        invalidate();
      }}
    />
  );
};

export const AnatomicalAtlasScene: React.FC<AnatomicalAtlasSceneProps> = ({
  mode,
  sex,
  cameraView,
  viewTrigger,
  focusRegion,
  systemVisibility,
  skinOpacity,
  explodeFactor,
  clipRatio,
  selectedKey,
  isolateSelected,
  relatedKeys,
  demoAccentKeys,
  highlightStates,
  isFullscreen = false,
  onSelectKey,
  onExitIsolation,
}) => {
  const [capNonce, setCapNonce] = useState(0);
  const caps = useMemo(() => detectWebGLCapabilities(capNonce > 0), [capNonce]);
  const [contextLost, setContextLost] = useState(false);
  const [webglRuntimeError, setWebglRuntimeError] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [meshStats, setMeshStats] = useState<{ meshCount: number; keysCount: number }>({
    meshCount: 0,
    keysCount: 0,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState<number>(0);
  const contextCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      contextCleanupRef.current?.();
      contextCleanupRef.current = null;
    };
  }, []);

  const handleLoadReady = useCallback((info: { meshCount: number; keysCount: number }) => {
    setMeshStats(info);
    setLoadProgress(100);
    setLoadError(null);
    setIsReady(true);
  }, []);

  const handleLoadError = useCallback((msg: string) => {
    setLoadError(msg);
    setIsReady(false);
  }, []);

  const handleRetry = () => {
    setLoadError(null);
    setIsReady(false);
    setLoadProgress(0);
    setReloadNonce((n) => n + 1);
  };

  const handleRetry3D = useCallback(() => {
    setContextLost(false);
    setWebglRuntimeError(null);
    setIsReady(false);
    setLoadError(null);
    setCapNonce((n) => n + 1);
  }, []);

  const fallbackNode = (
    <WebGLFallback
      mode={mode}
      sex={sex}
      selectedKey={selectedKey}
      reason={
        webglRuntimeError ||
        caps.reason ||
        (contextLost
          ? 'WebGL context was interrupted by the browser.'
          : 'WebGL hardware/software context unavailable.')
      }
      onSelectKey={onSelectKey}
      onRetry3D={handleRetry3D}
    />
  );

  if (!caps.supported || contextLost || webglRuntimeError) {
    return fallbackNode;
  }

  const hoveredEntry = hoveredKey ? ATLAS_BY_KEY[hoveredKey] : null;
  const selectedEntry = ATLAS_BY_KEY[selectedKey];
  const initialCam = getAtlasCameraTarget(cameraView, sex, selectedKey, focusRegion);

  return (
    <div
      data-testid="atlas-3d-viewport"
      data-ready={isReady ? 'true' : 'false'}
      data-mesh-count={meshStats.meshCount}
      data-keys-count={meshStats.keysCount}
      data-sex={sex}
      data-camera-view={cameraView}
      data-selected-key={selectedKey}
      data-focus-region={focusRegion ? 'true' : 'false'}
      data-region-label={initialCam.regionLabel}
      className={`relative w-full overflow-hidden rounded-xl border border-slate-800 bg-[#050a16] ${
        isFullscreen ? 'h-full min-h-[600px]' : 'h-[520px] sm:h-[580px] lg:h-[640px]'
      }`}
    >
      {/* Calibrated Studio Backdrop Behind Transparent WebGL Canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-no-repeat opacity-[0.42]"
          style={{
            backgroundImage: `url("${BACKDROP_ASSETS.nasaNeonEmblem}")`,
            backgroundSize: 'auto 88%',
            backgroundPosition: 'center 46%',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 48%, rgba(8, 18, 38, 0.08) 0%, rgba(4, 9, 20, 0.52) 68%, rgba(3, 6, 14, 0.82) 100%)',
          }}
        />
      </div>

      {/* Top Viewport HUD Strip (solid dark background, zero backdrop-blur) */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-slate-700/90 bg-[#070b14] px-2.5 py-1.5 font-mono text-[11px] text-slate-200">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor:
                highlightStates[hoveredKey ?? selectedKey]?.colorHex ?? '#06B6D4',
            }}
          />
          <span className="font-semibold text-white">
            {hoveredEntry
              ? `Hover: ${hoveredEntry.label}`
              : selectedEntry
                ? selectedEntry.label
                : 'Select Anatomical Structure'}
          </span>
          <span className="hidden text-slate-400 sm:inline">
            · {hoveredEntry ? hoveredEntry.category : initialCam.regionLabel}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {isolateSelected && onExitIsolation && (
            <button
              type="button"
              onClick={onExitIsolation}
              className="rounded-lg border border-cyan-500/70 bg-cyan-950 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-200 hover:bg-cyan-900"
            >
              Exit Isolation
            </button>
          )}
          <span className="hidden rounded-lg border border-slate-800 bg-[#070b14] px-2 py-1 font-mono text-[10px] text-slate-400 xl:inline">
            Drag: Orbit · Scroll: Zoom · Right-Drag: Pan
          </span>
        </div>
      </div>

      {/* Loading Progress Overlay */}
      {!isReady && !loadError && (
        <div
          data-testid="atlas-loading-overlay"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060a13]/92 p-6 text-center"
        >
          <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-800 bg-[#0b0f19] p-4 font-mono">
            <div className="text-xs font-bold text-cyan-300">
              Loading Human Anatomy ({sex === 'male' ? 'Male' : 'Female'} GLB)
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${Math.max(8, loadProgress)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
              <span>Meshopt Decompression</span>
              <span>{loadProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Load Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060a13]/95 p-6 text-center">
          <div className="max-w-sm space-y-3 rounded-xl border border-rose-700/60 bg-rose-950/30 p-5 text-xs">
            <AlertTriangle className="mx-auto h-6 w-6 text-rose-400" />
            <div className="font-mono font-bold text-rose-200">
              Failed to Load Anatomical Asset
            </div>
            <p className="text-slate-300">{loadError}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-cyan-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Model Load</span>
            </button>
          </div>
        </div>
      )}

      {/* Three.js / React Three Fiber Canvas guarded by WebGLErrorBoundary */}
      <WebGLErrorBoundary
        resetKey={capNonce}
        onError={(msg) => setWebglRuntimeError(msg)}
        fallback={fallbackNode}
      >
        <Canvas
          fallback={fallbackNode}
          shadows={!caps.isSoftwareGl}
          dpr={caps.isSoftwareGl ? 1 : [1, 2]}
          frameloop={caps.isSoftwareGl ? 'demand' : 'always'}
          camera={{
            position: initialCam.position,
            fov: ATLAS_CAMERA_FOV,
            near: 0.04,
            far: 24,
          }}
          gl={(defaults) => {
            const canvasEl = defaults.canvas as HTMLCanvasElement;
            const ctxAttrs: WebGLContextAttributes = {
              alpha: true,
              antialias: !caps.isSoftwareGl,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false,
            };

            let blockMsg: string | undefined;
            const onErr = (ev: Event) => {
              const msg = (ev as WebGLContextEvent).statusMessage;
              if (msg) blockMsg = msg;
            };
            canvasEl.addEventListener('webglcontextcreationerror', onErr, false);

            const ctx =
              (canvasEl.getContext('webgl2', ctxAttrs) as WebGL2RenderingContext | null) ||
              (canvasEl.getContext('webgl', ctxAttrs) as WebGLRenderingContext | null);

            canvasEl.removeEventListener('webglcontextcreationerror', onErr, false);

            if (!ctx || ctx.isContextLost()) {
              throw new Error(
                blockMsg || 'WebGL context could not be created in this browser.'
              );
            }

            const renderer = new THREE.WebGLRenderer({
              canvas: canvasEl,
              context: ctx,
              antialias: !caps.isSoftwareGl,
              alpha: true,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false,
            });
            renderer.localClippingEnabled = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.06;
            renderer.forceContextLoss = () => {};
            return renderer;
          }}
          onCreated={({ gl }) => {
            const dom = gl.domElement;
            contextCleanupRef.current?.();

            const handleLost = (ev: Event) => {
              ev.preventDefault();
              setContextLost(true);
            };
            const handleRestored = () => {
              setContextLost(false);
            };
            dom.addEventListener('webglcontextlost', handleLost, false);
            dom.addEventListener('webglcontextrestored', handleRestored, false);

            contextCleanupRef.current = () => {
              dom.removeEventListener('webglcontextlost', handleLost, false);
              dom.removeEventListener('webglcontextrestored', handleRestored, false);
            };
          }}
        >
          <StudioEnvironment />

          {/* Medical Atlas Studio 3-Point Lighting */}
          <hemisphereLight args={['#dcebfe', '#0b1220', 0.65]} />
          <directionalLight
            position={[2.4, 3.6, 3.2]}
            intensity={1.85}
            color="#fffaf3"
            castShadow={!caps.isSoftwareGl}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0004}
            shadow-camera-near={0.5}
            shadow-camera-far={10}
            shadow-camera-left={-1.15}
            shadow-camera-right={1.15}
            shadow-camera-top={2.05}
            shadow-camera-bottom={-0.25}
          />
          <directionalLight position={[-2.5, 1.8, 2.2]} intensity={0.82} color="#e2e8f0" />
          <directionalLight position={[-2.0, 2.5, -2.6]} intensity={0.96} color="#bae6fd" />

          <StudioFloorAndContactShadow isSoftwareGl={caps.isSoftwareGl} />

          <AnatomicalAtlasModel
            sex={sex}
            systemVisibility={systemVisibility}
            skinOpacity={skinOpacity}
            explodeFactor={explodeFactor}
            clipRatio={clipRatio}
            selectedKey={selectedKey}
            hoveredKey={hoveredKey}
            isolateSelected={isolateSelected}
            relatedKeys={relatedKeys}
            demoAccentKeys={demoAccentKeys}
            highlightStates={highlightStates}
            isSoftwareGl={caps.isSoftwareGl}
            reloadNonce={reloadNonce}
            onSelectKey={onSelectKey}
            onHoverKey={setHoveredKey}
            onLoadProgress={(pct) => setLoadProgress(pct)}
            onLoadReady={handleLoadReady}
            onLoadError={handleLoadError}
          />

          <CameraRig
            cameraView={cameraView}
            viewTrigger={viewTrigger}
            sex={sex}
            selectedKey={selectedKey}
            focusRegion={focusRegion}
            isSoftwareGl={caps.isSoftwareGl}
          />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
};
