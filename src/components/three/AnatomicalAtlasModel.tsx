import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  ATLAS_BY_KEY,
  OPEN_ANATOMY_MODEL_URLS,
  getStructureFilterBucket,
} from '../../data/openAnatomyData';
import type { AtlasSex, AtlasSystemFilter } from '../../types/astral';
import {
  getContextOcclusionOpacity,
  resolveMeshHighlightRole,
} from './atlasCameraAndMaterials';

export interface StructureHighlightState {
  colorHex: string;
  isAlert: boolean; // AMBER or RED diagnostic attention
}

interface AnatomicalAtlasModelProps {
  sex: AtlasSex;
  systemVisibility: Record<AtlasSystemFilter, boolean>;
  skinOpacity: number; // 0..1
  explodeFactor: number; // 0..1
  clipRatio: number; // 0 = off, 0.01..1 = transverse axial plane top-to-bottom
  selectedKey: string;
  hoveredKey: string | null;
  isolateSelected: boolean;
  relatedKeys: string[];
  demoAccentKeys: string[];
  highlightStates: Record<string, StructureHighlightState>;
  isSoftwareGl: boolean;
  reloadNonce: number;
  onSelectKey: (key: string) => void;
  onHoverKey: (key: string | null) => void;
  onLoadProgress: (percent: number) => void;
  onLoadReady: (info: { meshCount: number; keysCount: number }) => void;
  onLoadError: (message: string) => void;
}

type ShaderSurfaceKind = 'skin' | 'muscle' | 'bone' | 'organ' | 'vessel' | 'nerve';

interface MeshRecord {
  mesh: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  key: string;
  bucket: AtlasSystemFilter | 'joints';
  surfaceKind: ShaderSurfaceKind;
  baseColor: THREE.Color;
  basePosition: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  origRaycast: THREE.Mesh['raycast'];
  isSkin: boolean;
}

const NOOP_RAYCAST: THREE.Mesh['raycast'] = () => {};

// Cache parsed GLTF scenes per URL so switching back between Male/Female is instant
const gltfSceneCache = new Map<string, Promise<THREE.Group>>();
const progressListeners = new Map<string, Set<(pct: number) => void>>();

function loadGlbScene(url: string, onProgress?: (pct: number) => void): Promise<THREE.Group> {
  if (onProgress) {
    if (!progressListeners.has(url)) progressListeners.set(url, new Set());
    progressListeners.get(url)!.add(onProgress);
  }

  const existing = gltfSceneCache.get(url);
  if (existing) {
    return existing;
  }

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const listeners = progressListeners.get(url);
        listeners?.forEach((cb) => cb(100));
        listeners?.clear();
        resolve(gltf.scene);
      },
      (event) => {
        const pct =
          event.lengthComputable && event.total > 0
            ? Math.min(99, Math.round((event.loaded / event.total) * 100))
            : 50;
        progressListeners.get(url)?.forEach((cb) => cb(pct));
      },
      (err) => {
        gltfSceneCache.delete(url);
        progressListeners.get(url)?.clear();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    );
  });

  gltfSceneCache.set(url, promise);
  return promise;
}

function resolveCatalogKey(obj: THREE.Object3D | null): string | null {
  let curr: THREE.Object3D | null = obj;
  while (curr) {
    if (curr.name && ATLAS_BY_KEY[curr.name]) {
      return curr.name;
    }
    curr = curr.parent;
  }
  return null;
}

function getShaderSurfaceKind(
  key: string,
  bucket: AtlasSystemFilter | 'joints'
): ShaderSurfaceKind {
  if (bucket === 'skin') return 'skin';
  if (bucket === 'muscles' || key === 'diaphragm') return 'muscle';
  if (bucket === 'skeleton') return 'bone';
  if (bucket === 'cardiovascular' || bucket === 'vessels') {
    return key === 'heart' ? 'organ' : 'vessel';
  }
  if (bucket === 'nervous') return 'nerve';
  return 'organ';
}

function calibrateMaterialColor(
  key: string,
  bucket: AtlasSystemFilter | 'joints',
  sourceColor?: THREE.Color
): THREE.Color {
  const entry = ATLAS_BY_KEY[key];
  if (bucket === 'skin') return new THREE.Color('#d7a991');
  if (bucket === 'skeleton') {
    if (key.startsWith('spine_')) return new THREE.Color('#e2d7c2');
    return new THREE.Color('#dcd0b8');
  }
  if (bucket === 'muscles') {
    if (key.startsWith('calf') || key.startsWith('back_muscles')) {
      return new THREE.Color('#8f3530');
    }
    if (key.startsWith('quadriceps') || key.startsWith('chest_muscles') || key === 'abdominal_muscles') {
      return new THREE.Color('#a8423b');
    }
    return new THREE.Color('#9b3c35');
  }
  if (bucket === 'nervous') {
    if (key === 'brain' || key === 'cerebellum' || key === 'brainstem') {
      return new THREE.Color('#dbb4aa');
    }
    return new THREE.Color('#e4ce8a');
  }
  if (key === 'heart') return new THREE.Color('#a62832');
  if (key === 'diaphragm') return new THREE.Color('#943c3a');
  if (key === 'liver') return new THREE.Color('#6e2b24');
  if (key === 'stomach') return new THREE.Color('#c26e64');
  if (key === 'spleen') return new THREE.Color('#692836');
  if (key.startsWith('kidney')) return new THREE.Color('#82332f');
  if (key === 'small_intestine' || key === 'colon') return new THREE.Color('#c88a7a');
  if (key === 'lung_l' || key === 'lung_r') return new THREE.Color('#c8797e');
  if (key === 'trachea' || key === 'bronchi' || key === 'larynx') {
    return new THREE.Color('#d8c4bc');
  }
  if (key === 'eye_l' || key === 'eye_r') return new THREE.Color('#dde6f0');
  if (
    key === 'aorta' ||
    key.startsWith('carotid') ||
    key.startsWith('arteries') ||
    key === 'coronary_arteries'
  ) {
    return new THREE.Color('#c62c2e');
  }
  if (key.startsWith('vena_cava') || key.startsWith('veins')) {
    return new THREE.Color('#275d9c');
  }
  if (key === 'pulmonary_vessels') return new THREE.Color('#6b4d8c');
  if (entry?.color) return new THREE.Color(entry.color);
  if (sourceColor) return sourceColor.clone();
  return new THREE.Color('#94a3b8');
}

/**
 * Applies UV-free world-space procedural anatomical micro-variation (muscle fiber
 * striations, cortical bone grain, organic visceral/gyral shading) and Fresnel
 * cutaway sculpting for translucent skin. Shared cache keys keep GPU compile fast.
 */
function applyAnatomicalShaderDetail(
  material: THREE.MeshPhysicalMaterial,
  surfaceKind: ShaderSurfaceKind
): void {
  material.customProgramCacheKey = () => `astrocare-atlas-${surfaceKind}`;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vAtlasWorldPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vAtlasWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );

    let colorInjection = '';
    if (surfaceKind === 'muscle') {
      colorInjection = `
  float fiberWave = sin(vAtlasWorldPos.x * 260.0 + sin(vAtlasWorldPos.y * 55.0) * 2.2) * 0.5 + 0.5;
  float fascicleBand = sin(vAtlasWorldPos.y * 78.0 + vAtlasWorldPos.z * 95.0) * 0.5 + 0.5;
  float striation = mix(0.86, 1.09, fiberWave * 0.65 + fascicleBand * 0.35);
  diffuseColor.rgb *= striation;`;
    } else if (surfaceKind === 'bone') {
      colorInjection = `
  float grainA = sin(vAtlasWorldPos.y * 140.0 + vAtlasWorldPos.x * 60.0) * 0.5 + 0.5;
  float grainB = sin(vAtlasWorldPos.z * 110.0 - vAtlasWorldPos.y * 45.0) * 0.5 + 0.5;
  diffuseColor.rgb *= mix(0.93, 1.05, grainA * 0.55 + grainB * 0.45);`;
    } else if (surfaceKind === 'organ') {
      colorInjection = `
  float orgFold = sin(vAtlasWorldPos.x * 130.0 + cos(vAtlasWorldPos.y * 115.0) * 1.8)
                * cos(vAtlasWorldPos.z * 125.0 + sin(vAtlasWorldPos.y * 90.0) * 1.4);
  diffuseColor.rgb *= (0.94 + orgFold * 0.06);`;
    } else if (surfaceKind === 'skin') {
      colorInjection = `
  float dermalVar = sin(vAtlasWorldPos.x * 90.0) * sin(vAtlasWorldPos.y * 90.0) * 0.025;
  diffuseColor.rgb *= (0.99 + dermalVar);`;
    }

    let fragmentModified = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vAtlasWorldPos;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>${colorInjection}`
      );

    if (surfaceKind === 'skin') {
      fragmentModified = fragmentModified.replace(
        '#include <opaque_fragment>',
        `
  if (diffuseColor.a < 0.72) {
    vec3 viewDirSafe = normalize(vViewPosition);
    float ndv = abs(dot(normalize(normal), viewDirSafe));
    float fresnelContour = pow(1.0 - clamp(ndv, 0.0, 1.0), 2.1);
    float frontClear = clamp(diffuseColor.a * 0.32, 0.03, 0.28);
    float rimAlpha = clamp(frontClear + fresnelContour * (0.48 + diffuseColor.a * 0.65), 0.0, 0.84);
    outgoingLight += vec3(0.32, 0.46, 0.58) * fresnelContour * 0.52;
    diffuseColor.a = rimAlpha;
  }
  #include <opaque_fragment>`
      );
    }

    shader.fragmentShader = fragmentModified;
  };
}

export const AnatomicalAtlasModel: React.FC<AnatomicalAtlasModelProps> = ({
  sex,
  systemVisibility,
  skinOpacity,
  explodeFactor,
  clipRatio,
  selectedKey,
  hoveredKey,
  isolateSelected,
  relatedKeys,
  demoAccentKeys,
  highlightStates,
  isSoftwareGl,
  reloadNonce,
  onSelectKey,
  onHoverKey,
  onLoadProgress,
  onLoadReady,
  onLoadError,
}) => {
  const { invalidate } = useThree();
  const [sourceScene, setSourceScene] = useState<THREE.Group | null>(null);
  const meshRecordsRef = useRef<MeshRecord[]>([]);
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.5), []);
  const wasClippingRef = useRef<boolean>(false);

  const modelUrl = OPEN_ANATOMY_MODEL_URLS[sex];

  useEffect(() => {
    let cancelled = false;
    setSourceScene(null);
    onLoadProgress(5);

    if (reloadNonce > 0) {
      gltfSceneCache.delete(modelUrl);
    }

    loadGlbScene(modelUrl, (pct) => {
      if (!cancelled) onLoadProgress(pct);
    })
      .then((scene) => {
        if (!cancelled) {
          setSourceScene(scene);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          onLoadError(
            err instanceof Error ? err.message : 'Unable to load anatomical GLB model.'
          );
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, reloadNonce]);

  // Clone scene & initialize medical PBR materials + bounding centers for exploded view
  const clonedScene = useMemo(() => {
    if (!sourceScene) return null;
    const root = sourceScene.clone(true);
    root.updateMatrixWorld(true);

    const keyBounds = new Map<string, THREE.Box3>();
    root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const key = resolveCatalogKey(mesh);
        if (!key) return;
        const box = new THREE.Box3().setFromObject(mesh);
        const existing = keyBounds.get(key);
        if (existing) {
          existing.union(box);
        } else {
          keyBounds.set(key, box);
        }
      }
    });

    const records: MeshRecord[] = [];
    const seenKeys = new Set<string>();

    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const key = resolveCatalogKey(mesh) ?? 'unknown';
      const entry = ATLAS_BY_KEY[key];
      const bucket = entry ? getStructureFilterBucket(entry) : 'organs';
      const surfaceKind = getShaderSurfaceKind(key, bucket);
      seenKeys.add(key);

      const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const origStd = origMat as THREE.MeshStandardMaterial | undefined;
      const baseColor = calibrateMaterialColor(key, bucket, origStd?.color);
      const isSkin = bucket === 'skin';

      const roughness =
        bucket === 'skin'
          ? 0.52
          : bucket === 'skeleton'
            ? 0.58
            : bucket === 'muscles'
              ? 0.52
              : bucket === 'cardiovascular' || bucket === 'vessels'
                ? 0.36
                : key === 'eye_l' || key === 'eye_r'
                  ? 0.16
                  : 0.42;

      const clearcoat =
        key === 'eye_l' || key === 'eye_r'
          ? 0.65
          : bucket === 'organs' || bucket === 'respiratory' || bucket === 'cardiovascular'
            ? 0.24
            : bucket === 'skin'
              ? 0.06
              : 0.02;

      const mat = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        roughness,
        metalness: bucket === 'skeleton' ? 0.03 : 0.02,
        clearcoat,
        clearcoatRoughness: key === 'eye_l' || key === 'eye_r' ? 0.14 : 0.42,
        sheen: isSkin ? 0.28 : bucket === 'muscles' ? 0.14 : 0,
        sheenRoughness: isSkin ? 0.65 : 0.72,
        sheenColor: isSkin ? new THREE.Color('#f1c5b3') : new THREE.Color('#c76e66'),
        transparent: isSkin,
        opacity: isSkin ? skinOpacity : 1,
        depthWrite: !isSkin,
        side: isSkin ? THREE.FrontSide : THREE.DoubleSide,
        vertexColors: Boolean(origStd?.vertexColors && mesh.geometry.getAttribute('color')),
      });

      applyAnatomicalShaderDetail(mat, surfaceKind);

      mesh.material = mat;
      mesh.castShadow = !isSkin;
      mesh.receiveShadow = true;

      const center = new THREE.Vector3(0, 0.87, 0);
      keyBounds.get(key)?.getCenter(center);

      const explodeOffset = new THREE.Vector3();
      if (isSkin) {
        explodeOffset.set(-0.56, 0, 0);
      } else if (bucket === 'muscles') {
        const sideSign =
          center.x > 0.015 ? 1 : center.x < -0.015 ? -1 : key.endsWith('_l') ? 1 : key.endsWith('_r') ? -1 : 0;
        explodeOffset.set(
          sideSign * 0.2 + center.x * 0.32,
          (center.y - 0.87) * 0.04,
          center.z >= -0.02 ? 0.16 : -0.18
        );
      } else if (bucket === 'skeleton') {
        if (key.includes('ribs') || key === 'sternum' || key.includes('clavicle')) {
          explodeOffset.set(center.x * 0.42, 0, 0.18);
        } else if (key.includes('scapula')) {
          explodeOffset.set(center.x * 0.45, 0, -0.18);
        } else if (
          key.includes('humerus') ||
          key.includes('forearm') ||
          key.includes('hand') ||
          key.includes('femur') ||
          key.includes('lower_leg') ||
          key.includes('patella') ||
          key.includes('foot')
        ) {
          const sign = center.x >= 0 ? 1 : -1;
          explodeOffset.set(sign * 0.14 + center.x * 0.18, 0, 0);
        } else {
          explodeOffset.set(0, 0, -0.14);
        }
      } else if (bucket === 'respiratory' || bucket === 'organs') {
        explodeOffset.set(center.x * 0.34, 0, 0.1 + center.z * 0.25);
      } else if (bucket === 'cardiovascular' || bucket === 'vessels') {
        explodeOffset.set(center.x * 0.2, 0, 0.14);
      } else if (bucket === 'nervous') {
        explodeOffset.set(0, key === 'brain' ? 0.07 : 0, -0.06);
      }

      records.push({
        mesh,
        material: mat,
        key,
        bucket,
        surfaceKind,
        baseColor,
        basePosition: mesh.position.clone(),
        explodeOffset,
        origRaycast: mesh.raycast,
        isSkin,
      });
    });

    meshRecordsRef.current = records;
    return { root, meshCount: records.length, keysCount: seenKeys.size };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceScene]);

  useEffect(() => {
    if (!clonedScene) return;
    onLoadReady({ meshCount: clonedScene.meshCount, keysCount: clonedScene.keysCount });
    invalidate();
  }, [clonedScene, onLoadReady, invalidate]);

  // Dispose cloned materials on unmount / sex switch
  useEffect(() => {
    return () => {
      meshRecordsRef.current.forEach((rec) => {
        rec.material.dispose();
      });
    };
  }, [clonedScene]);

  // Synchronize visibility, isolation, targeted occlusion ghosting, opacity, clipping plane, and selective highlights
  useEffect(() => {
    const records = meshRecordsRef.current;
    if (records.length === 0) return;

    const isClipping = clipRatio > 0.001;
    const maxHeight = sex === 'female' ? 1.66 : 1.76;
    const clipY = maxHeight - clipRatio * (maxHeight - 0.08);
    clipPlane.constant = clipY;

    const clippingModeChanged = wasClippingRef.current !== isClipping;
    wasClippingRef.current = isClipping;

    const relatedSet = new Set([...relatedKeys, ...demoAccentKeys]);

    for (const rec of records) {
      const systemVisible =
        rec.bucket === 'joints' ? false : Boolean(systemVisibility[rec.bucket]);
      const isSelected = rec.key === selectedKey;
      const isRelated = relatedSet.has(rec.key);

      const occlusionOpacity = getContextOcclusionOpacity(
        rec.key,
        selectedKey,
        demoAccentKeys,
        isolateSelected
      );

      const hideBehindOpaqueSkin =
        !isolateSelected &&
        !rec.isSkin &&
        Boolean(systemVisibility.skin) &&
        skinOpacity >= 0.94;

      if (isolateSelected) {
        const showInIsolation = isSelected || isRelated;
        rec.mesh.visible = showInIsolation;
        rec.material.transparent = !isSelected;
        rec.material.opacity = isSelected ? 1 : 0.2;
        rec.material.depthWrite = isSelected;
        rec.material.side = isSelected ? THREE.DoubleSide : THREE.FrontSide;
      } else {
        const visible = rec.isSkin
          ? systemVisible && skinOpacity > 0.01
          : systemVisible && !hideBehindOpaqueSkin && occlusionOpacity !== 0;
        rec.mesh.visible = visible;
        if (rec.isSkin) {
          const isTranslucentSkin = skinOpacity < 0.94;
          rec.material.transparent = isTranslucentSkin;
          rec.material.opacity = skinOpacity;
          rec.material.depthWrite = !isTranslucentSkin;
          rec.material.side = THREE.FrontSide;
        } else if (occlusionOpacity !== null && occlusionOpacity > 0) {
          rec.material.transparent = true;
          rec.material.opacity = occlusionOpacity;
          rec.material.depthWrite = false;
          rec.material.side = THREE.FrontSide;
        } else {
          rec.material.transparent = false;
          rec.material.opacity = 1;
          rec.material.depthWrite = true;
          rec.material.side = THREE.DoubleSide;
        }
      }

      // Click straight through translucent skin or ghosted occluding shell to internal targets
      if (
        (rec.isSkin && !isolateSelected && skinOpacity < 0.72) ||
        (occlusionOpacity !== null && !isolateSelected)
      ) {
        rec.mesh.raycast = NOOP_RAYCAST;
      } else {
        rec.mesh.raycast = rec.origRaycast;
      }

      rec.material.clippingPlanes = isClipping ? [clipPlane] : null;
      rec.material.clipShadows = isClipping;
      if (clippingModeChanged) {
        rec.material.needsUpdate = true;
      }

      // Selective clinical highlighting: NEVER flood unrelated meshes across the whole body
      const role = resolveMeshHighlightRole(
        rec.key,
        selectedKey,
        hoveredKey,
        demoAccentKeys
      );
      const diag = highlightStates[rec.key];
      const accentHex = diag?.colorHex ?? '#06B6D4';

      if (role === 'selected') {
        rec.material.emissive.set(accentHex);
        rec.material.emissiveIntensity =
          rec.key === 'eye_l' || rec.key === 'eye_r'
            ? 0.22
            : rec.surfaceKind === 'muscle'
              ? 0.24
              : 0.4;
      } else if (role === 'hovered') {
        rec.material.emissive.set('#38bdf8');
        rec.material.emissiveIntensity = rec.surfaceKind === 'muscle' ? 0.16 : 0.24;
      } else if (role === 'accent') {
        rec.material.emissive.set(accentHex);
        rec.material.emissiveIntensity =
          rec.surfaceKind === 'muscle'
            ? diag?.isAlert
              ? 0.14
              : 0.1
            : diag?.isAlert
              ? 0.22
              : 0.14;
      } else {
        rec.material.emissive.set('#000000');
        rec.material.emissiveIntensity = 0;
      }
    }

    invalidate();
  }, [
    clonedScene,
    sex,
    systemVisibility,
    skinOpacity,
    clipRatio,
    clipPlane,
    selectedKey,
    hoveredKey,
    isolateSelected,
    relatedKeys,
    demoAccentKeys,
    highlightStates,
    invalidate,
  ]);

  // Animate exploded layers smoothly + dignified highlight breathing (skipped on software GL)
  useFrame((state, delta) => {
    const records = meshRecordsRef.current;
    if (records.length === 0) return;

    const dt = Math.min(delta, 0.1);
    let needsMoreFrames = false;
    const pulseOffset = Math.sin(state.clock.elapsedTime * 2.4) * 0.05;

    for (const rec of records) {
      const tx = rec.basePosition.x + rec.explodeOffset.x * explodeFactor;
      const ty = rec.basePosition.y + rec.explodeOffset.y * explodeFactor;
      const tz = rec.basePosition.z + rec.explodeOffset.z * explodeFactor;

      if (isSoftwareGl) {
        rec.mesh.position.set(tx, ty, tz);
      } else {
        const dx = Math.abs(rec.mesh.position.x - tx);
        const dy = Math.abs(rec.mesh.position.y - ty);
        const dz = Math.abs(rec.mesh.position.z - tz);

        if (dx > 0.0005 || dy > 0.0005 || dz > 0.0005) {
          rec.mesh.position.x = THREE.MathUtils.damp(rec.mesh.position.x, tx, 8, dt);
          rec.mesh.position.y = THREE.MathUtils.damp(rec.mesh.position.y, ty, 8, dt);
          rec.mesh.position.z = THREE.MathUtils.damp(rec.mesh.position.z, tz, 8, dt);
          needsMoreFrames = true;
        }

        if (rec.key === selectedKey) {
          const base =
            rec.key === 'eye_l' || rec.key === 'eye_r'
              ? 0.22
              : rec.surfaceKind === 'muscle'
                ? 0.24
                : 0.38;
          rec.material.emissiveIntensity = base + pulseOffset;
        }
      }
    }

    if (needsMoreFrames) {
      invalidate();
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    for (const hit of e.intersections) {
      if (!hit.object.visible) continue;
      const key = resolveCatalogKey(hit.object);
      if (key) {
        e.stopPropagation();
        if (hoveredKey !== key) {
          onHoverKey(key);
        }
        document.body.style.cursor = 'pointer';
        return;
      }
    }
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    onHoverKey(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5) return;
    for (const hit of e.intersections) {
      if (!hit.object.visible) continue;
      const key = resolveCatalogKey(hit.object);
      if (key) {
        e.stopPropagation();
        onSelectKey(key);
        return;
      }
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (!clonedScene) return null;

  const maxHeight = sex === 'female' ? 1.66 : 1.76;
  const clipY = maxHeight - clipRatio * (maxHeight - 0.08);

  return (
    <group>
      <primitive
        object={clonedScene.root}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />

      {/* Active Axial Cross-Section Plane Indicator Ring */}
      {clipRatio > 0.001 && (
        <mesh position={[0, clipY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.32, 64]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.68} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
