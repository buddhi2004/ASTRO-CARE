import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Crosshair,
  Eye,
  Focus,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Scissors,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import {
  DEFAULT_SYSTEM_VISIBILITY,
  OPEN_ANATOMY_ATTRIBUTION,
  SYSTEM_FILTER_OPTIONS,
  filterAtlasStructures,
  getAtlasStructureDetails,
  getStructureFilterBucket,
  getStructuresForSex,
} from '../../data/openAnatomyData';
import { evaluateModeBRecoveryRegion } from '../../engine/ruleEngine';
import type {
  AtlasCameraView,
  AtlasSex,
  AtlasSystemFilter,
  EarthReadinessResult,
  EnvironmentKey,
  HandoverMetrics,
  InFlightLogEntry,
  RehabPhase,
  SafetyStopResult,
  SubsystemKey,
  TriageLevel,
} from '../../types/astral';
import { TRIAGE_HEX } from '../../utils/triageStyles';
import { AtlasDetailPanel } from '../AtlasDetailPanel';
import { type StructureHighlightState } from './AnatomicalAtlasModel';
import { AnatomicalAtlasScene } from './AnatomicalAtlasScene';
import {
  ATLAS_LAYER_PRESETS,
  type AtlasLayerPresetId,
  type ClinicalDemoStory,
  getDemoStoriesForMode,
} from './atlasCameraAndMaterials';

interface AnatomicalAtlasWorkspaceProps {
  mode: 'flight' | 'rehab';
  // Mode A props
  environment?: EnvironmentKey;
  subsystemMetrics?: Record<SubsystemKey, Record<string, number>>;
  subsystemLevels?: Record<SubsystemKey, TriageLevel>;
  flightLogs?: InFlightLogEntry[];
  onFocusModeASubsystem?: (sub: SubsystemKey) => void;
  // Mode B props
  currentDay?: number;
  activePhase?: RehabPhase;
  handover?: HandoverMetrics;
  readiness?: EarthReadinessResult;
  safetyStop?: SafetyStopResult;
  dizzinessScore?: number;
  painScore?: number;
  completedExercises?: Set<string>;
  completedSessionsCount?: number;
  // External focus trigger (optional)
  requestedStructureKey?: string | null;
  requestedView?: AtlasCameraView | null;
  requestedSex?: AtlasSex | null;
  onSelectStructureKey?: (key: string) => void;
}

const CAMERA_BUTTONS: Array<{
  id: AtlasCameraView;
  label: string;
  orientation: string;
}> = [
  { id: 'front', label: 'Front', orientation: 'Anterior (+Z)' },
  { id: 'back', label: 'Back', orientation: 'Posterior (-Z)' },
  { id: 'left', label: 'Left', orientation: 'Anatomical Left (+X)' },
  { id: 'right', label: 'Right', orientation: 'Anatomical Right (-X)' },
  { id: 'top', label: 'Top', orientation: 'Superior (+Y)' },
  { id: 'bottom', label: 'Bottom', orientation: 'Inferior (-Y)' },
  { id: 'reset', label: 'Reset', orientation: '3/4 Clinical Atlas' },
];

export const AnatomicalAtlasWorkspace: React.FC<AnatomicalAtlasWorkspaceProps> = ({
  mode,
  environment = 'microgravity',
  subsystemMetrics,
  subsystemLevels,
  flightLogs = [],
  onFocusModeASubsystem,
  currentDay = 3,
  activePhase,
  handover,
  readiness,
  safetyStop,
  dizzinessScore = 2,
  painScore = 1,
  completedExercises,
  completedSessionsCount = 3,
  requestedStructureKey,
  requestedView,
  requestedSex,
  onSelectStructureKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef<boolean>(false);

  const demoStories = useMemo(() => getDemoStoriesForMode(mode), [mode]);

  const [sex, setSex] = useState<AtlasSex>('male');
  const [activePresetId, setActivePresetId] = useState<AtlasLayerPresetId>(
    mode === 'flight' ? 'clinical_cutaway' : 'muscular_body'
  );
  const [systemVisibility, setSystemVisibility] = useState<Record<AtlasSystemFilter, boolean>>(
    () => ({
      ...DEFAULT_SYSTEM_VISIBILITY,
      muscles: mode === 'rehab',
      skin: mode === 'flight',
    })
  );
  const [skinOpacity, setSkinOpacity] = useState<number>(mode === 'flight' ? 0.28 : 0.08);
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [clipRatio, setClipRatio] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>(
    mode === 'flight' ? 'heart' : 'calf_l'
  );
  const [activeStoryId, setActiveStoryId] = useState<string | null>(
    demoStories[0]?.id ?? null
  );
  const [focusRegion, setFocusRegion] = useState<boolean>(false);
  const [isolateSelected, setIsolateSelected] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<AtlasCameraView>(
    mode === 'flight' ? 'front' : 'back'
  );
  const [viewTrigger, setViewTrigger] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayerControls, setShowLayerControls] = useState<boolean>(false);

  const applyLayerPreset = (presetId: AtlasLayerPresetId) => {
    const preset = ATLAS_LAYER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setSystemVisibility({ ...preset.visibility });
    setSkinOpacity(preset.skinOpacity);
  };

  // When switching Mode A <-> Mode B, switch to the mode-appropriate body layer & full-body showcase
  useEffect(() => {
    const nextStories = getDemoStoriesForMode(mode);
    const firstStory = nextStories[0] ?? null;
    const defaultPresetId: AtlasLayerPresetId =
      mode === 'flight' ? 'clinical_cutaway' : 'muscular_body';
    const preset = ATLAS_LAYER_PRESETS.find((p) => p.id === defaultPresetId)!;

    setActivePresetId(defaultPresetId);
    setSystemVisibility({ ...preset.visibility });
    setSkinOpacity(preset.skinOpacity);
    setSelectedKey(mode === 'flight' ? 'heart' : 'calf_l');
    setActiveStoryId(firstStory?.id ?? null);
    setFocusRegion(false);
    setIsolateSelected(false);
    setCameraView(mode === 'flight' ? 'front' : 'back');
    setViewTrigger((n) => n + 1);
  }, [mode]);

  // Sync external focus requests (e.g. clicking subsystem cards or alerts in Mode A / Mode B)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (requestedStructureKey) {
      setSelectedKey(requestedStructureKey);
      const matchingStory = demoStories.find(
        (s) =>
          s.primaryKey === requestedStructureKey ||
          s.accentKeys.includes(requestedStructureKey)
      );
      setActiveStoryId(matchingStory?.id ?? null);
      if (matchingStory) {
        applyLayerPreset(matchingStory.recommendedPreset);
      } else {
        const details = getAtlasStructureDetails(requestedStructureKey);
        if (details.filterBucket !== 'joints') {
          setSystemVisibility((prev) => ({ ...prev, [details.filterBucket]: true }));
        }
      }
      setFocusRegion(true);
      setViewTrigger((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedStructureKey]);

  useEffect(() => {
    if (requestedView) {
      setCameraView(requestedView);
      setViewTrigger((n) => n + 1);
    }
  }, [requestedView]);

  useEffect(() => {
    if (requestedSex) {
      setSex(requestedSex);
    }
  }, [requestedSex]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const sexStructures = useMemo(() => getStructuresForSex(sex), [sex]);

  useEffect(() => {
    if (!sexStructures.some((s) => s.key === selectedKey)) {
      setSelectedKey(mode === 'flight' ? 'heart' : 'calf_l');
    }
  }, [sexStructures, selectedKey, mode]);

  const filteredStructures = useMemo(
    () => filterAtlasStructures(sexStructures, searchQuery, systemVisibility, true),
    [sexStructures, searchQuery, systemVisibility]
  );

  const selectedDetails = useMemo(
    () => getAtlasStructureDetails(selectedKey),
    [selectedKey]
  );

  const activeStory = useMemo<ClinicalDemoStory | null>(
    () => demoStories.find((s) => s.id === activeStoryId) ?? null,
    [demoStories, activeStoryId]
  );

  const demoAccentKeys = useMemo(() => {
    if (!activeStory) return [];
    return activeStory.accentKeys;
  }, [activeStory]);

  // Compute ASTROCARE clinical highlight states (used ONLY on selected/demo-targeted structures)
  const highlightStates = useMemo(() => {
    const map: Record<string, StructureHighlightState> = {};

    for (const entry of sexStructures) {
      const details = getAtlasStructureDetails(entry.key);

      if (mode === 'flight' && subsystemLevels && details.modeASubsystem) {
        const lvl = subsystemLevels[details.modeASubsystem];
        map[entry.key] = {
          colorHex: lvl === 'GREEN' ? '#06B6D4' : TRIAGE_HEX[lvl],
          isAlert: lvl === 'AMBER' || lvl === 'RED',
        };
      } else if (mode === 'rehab' && handover && details.modeBRegionId) {
        const ev = evaluateModeBRecoveryRegion(
          details.modeBRegionId,
          currentDay,
          handover,
          completedSessionsCount,
          painScore,
          dizzinessScore
        );
        map[entry.key] = {
          colorHex: ev.colorHex,
          isAlert: Boolean(safetyStop?.haltRequired) || ev.tier === 'RED' || ev.tier === 'AMBER',
        };
      } else if (
        mode === 'rehab' &&
        safetyStop?.haltRequired &&
        details.modeBFocusArea === 'Balance & Vestibular Rehabilitation'
      ) {
        map[entry.key] = { colorHex: '#EF4444', isAlert: true };
      } else {
        map[entry.key] = { colorHex: '#06B6D4', isAlert: false };
      }
    }

    return map;
  }, [
    sexStructures,
    mode,
    subsystemLevels,
    handover,
    currentDay,
    completedSessionsCount,
    painScore,
    dizzinessScore,
    safetyStop,
  ]);

  const allSystemsEnabled = SYSTEM_FILTER_OPTIONS.every((opt) => systemVisibility[opt.id]);

  const handleToggleAllSystems = (nextChecked: boolean) => {
    const next = {} as Record<AtlasSystemFilter, boolean>;
    SYSTEM_FILTER_OPTIONS.forEach((opt) => {
      next[opt.id] = nextChecked;
    });
    setSystemVisibility(next);
  };

  const handleToggleSystem = (bucket: AtlasSystemFilter) => {
    setSystemVisibility((prev) => ({ ...prev, [bucket]: !prev[bucket] }));
  };

  const handleSelectStory = (story: ClinicalDemoStory) => {
    setActiveStoryId(story.id);
    setSelectedKey(story.primaryKey);
    onSelectStructureKey?.(story.primaryKey);
    applyLayerPreset(story.recommendedPreset);
    setIsolateSelected(false);
    setFocusRegion(true);
    setCameraView(story.preferredView);
    setViewTrigger((n) => n + 1);
  };

  const handleSelectStructure = (
    key: string,
    preferredView?: AtlasCameraView,
    shouldFocus = false
  ) => {
    setSelectedKey(key);
    onSelectStructureKey?.(key);

    const matchingStory = demoStories.find((s) => s.primaryKey === key);
    setActiveStoryId(matchingStory?.id ?? null);

    const details = getAtlasStructureDetails(key);
    const bucket = details.filterBucket;
    if (bucket !== 'joints' && !systemVisibility[bucket]) {
      setSystemVisibility((prev) => ({ ...prev, [bucket]: true }));
    }
    if (preferredView) {
      setCameraView(preferredView);
    }
    if (shouldFocus) {
      setFocusRegion(true);
    }
    setViewTrigger((n) => n + 1);
  };

  const handleCameraPreset = (view: AtlasCameraView) => {
    setCameraView(view);
    if (view === 'reset') {
      setFocusRegion(false);
      setExplodeFactor(0);
      setClipRatio(0);
      setIsolateSelected(false);
    } else {
      setFocusRegion(false);
    }
    setViewTrigger((n) => n + 1);
  };

  const handleToggleFocusRegion = () => {
    setFocusRegion((prev) => {
      const next = !prev;
      setViewTrigger((n) => n + 1);
      return next;
    });
  };

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch {
        // React fixed fullscreen overlay fallback remains active
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore
      }
    }
  };

  const activeOrientation =
    CAMERA_BUTTONS.find((b) => b.id === cameraView)?.orientation ?? 'Anterior (+Z)';

  return (
    <section
      ref={containerRef}
      id="section-digital-twin"
      data-testid={`atlas-workspace-${mode}`}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#040814] p-4'
          : 'scroll-mt-16 md:scroll-mt-20 rounded-2xl border border-cyan-500/20 bg-[#070f22]/68 p-4 backdrop-blur-md md:p-5'
      }
    >
      {/* Workstation Header + Quick Sex & Layer Presentation Controls */}
      <div className="mb-3 flex flex-col gap-3 border-b border-cyan-500/20 pb-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-sm font-bold text-white md:text-base">
            3D Anatomical Health Atlas · {mode === 'flight' ? 'In-Flight Demonstrations' : 'Post-Flight Recovery'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Select a clinical demonstration below to focus the 3D human body on the relevant organ system, or click any structure directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick Body Layer Presentation Mode */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#0b0f19] p-1">
            {ATLAS_LAYER_PRESETS.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.description}
                  onClick={() => applyLayerPreset(preset.id)}
                  className={`min-h-[30px] rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Quick Male / Female Model Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0b0f19] p-1 font-mono text-[11px]">
            <User className="ml-1.5 h-3.5 w-3.5 text-cyan-400" />
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`min-h-[30px] rounded-md px-2 py-1 font-semibold transition-colors ${
                sex === 'male' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`min-h-[30px] rounded-md px-2 py-1 font-semibold transition-colors ${
                sex === 'female' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Female
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowLayerControls((v) => !v)}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors whitespace-nowrap ${
              showLayerControls
                ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                : 'border-slate-700 bg-[#111827] text-slate-300 hover:border-cyan-500/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showLayerControls ? 'Hide Layers & Search' : 'Layers & Search'}</span>
          </button>
        </div>
      </div>

      {/* Mode A / Mode B Clinical Story Demonstration Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
          {mode === 'flight' ? 'Medical Demos:' : 'Recovery Focus:'}
        </span>
        {demoStories.map((story) => {
          const active = activeStoryId === story.id && focusRegion;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => handleSelectStory(story)}
              className={`min-h-[34px] rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors whitespace-nowrap ${
                active
                  ? 'border-cyan-400 bg-cyan-950/80 text-white'
                  : selectedKey === story.primaryKey
                    ? 'border-cyan-500/50 bg-[#111827] text-cyan-200 hover:border-cyan-400'
                    : 'border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {story.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Balanced Grid: Optional Expandable Controls + Central 3D Stage + Right Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
        {/* LEFT ZONE (On-Demand): System Toggles, Sliders, Search & Structure List */}
        {showLayerControls && (
          <aside className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-[#111827] p-3 lg:col-span-3 lg:h-[640px]">
            {/* Anatomical Systems Checkboxes */}
            <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
              <div className="mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Anatomical Systems</span>
                </span>
                <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-cyan-300">
                  <input
                    type="checkbox"
                    checked={allSystemsEnabled}
                    onChange={(e) => handleToggleAllSystems(e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer accent-cyan-400"
                  />
                  <span>All systems</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-4 lg:grid-cols-2">
                {SYSTEM_FILTER_OPTIONS.map((sys) => (
                  <label
                    key={sys.id}
                    title={sys.description}
                    className="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 font-mono text-[11px] text-slate-200 hover:bg-slate-800/70"
                  >
                    <input
                      type="checkbox"
                      checked={systemVisibility[sys.id]}
                      onChange={() => handleToggleSystem(sys.id)}
                      className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-cyan-400"
                    />
                    <span className="truncate">{sys.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Transparency, Exploded Layers & Cross-Section Clip Sliders */}
            <div className="space-y-2 rounded-lg border border-slate-800 bg-[#0b0f19] p-2 font-mono text-[11px]">
              <div>
                <div className="mb-0.5 flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-cyan-400" />
                    <span>Skin Transparency</span>
                  </span>
                  <span className="font-bold text-cyan-300 tabular-nums">
                    {Math.round(skinOpacity * 100)}%
                  </span>
                </div>
                <input
                  aria-label="Skin transparency"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(skinOpacity * 100)}
                  onChange={(e) => {
                    const val = Number(e.target.value) / 100;
                    setSkinOpacity(val);
                    if (val > 0 && !systemVisibility.skin) {
                      setSystemVisibility((prev) => ({ ...prev, skin: true }));
                    }
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
                />
              </div>

              <div>
                <div className="mb-0.5 flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3 text-cyan-400" />
                    <span>Exploded Layers</span>
                  </span>
                  <span className="font-bold text-cyan-300 tabular-nums">
                    {Math.round(explodeFactor * 100)}%
                  </span>
                </div>
                <input
                  aria-label="Exploded layers"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(explodeFactor * 100)}
                  onChange={(e) => setExplodeFactor(Number(e.target.value) / 100)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
                />
              </div>

              <div>
                <div className="mb-0.5 flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Scissors className="h-3 w-3 text-cyan-400" />
                    <span>Cross-Section Clip</span>
                  </span>
                  <span className="font-bold text-cyan-300 tabular-nums">
                    {clipRatio === 0 ? 'OFF' : `${Math.round(clipRatio * 100)}%`}
                  </span>
                </div>
                <input
                  aria-label="Cross-section clipping plane"
                  type="range"
                  min={0}
                  max={90}
                  step={2}
                  value={Math.round(clipRatio * 100)}
                  onChange={(e) => setClipRatio(Number(e.target.value) / 100)}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
                />
              </div>
            </div>

            {/* Search Anatomical Structures */}
            <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
              <div className="relative mb-1.5">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  aria-label="Search anatomical structures"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search structures (heart, femur, brain)..."
                  className="min-h-[34px] w-full rounded-lg border border-slate-700 bg-[#111827] pl-8 pr-3 font-mono text-[11px] text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>Catalog ({filteredStructures.length} shown)</span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-cyan-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-[220px] min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 lg:max-h-none">
                {filteredStructures.map((item) => {
                  const isSelected = selectedKey === item.key;
                  const bucket = getStructureFilterBucket(item);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectStructure(item.key, undefined, true)}
                      className={`flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1 text-left font-mono text-[11px] transition-colors ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/70 text-white'
                          : 'border-slate-800/80 bg-[#111827] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="shrink-0 text-[9px] uppercase text-slate-500">
                        {bucket.slice(0, 5)}
                      </span>
                    </button>
                  );
                })}
                {filteredStructures.length === 0 && (
                  <div className="py-4 text-center font-mono text-[11px] text-slate-500">
                    No structures match &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* CENTER ZONE: Interactive 3D Human Anatomical Model */}
        <div className={`flex flex-col gap-2 ${showLayerControls ? 'lg:col-span-5' : 'lg:col-span-7'}`}>
          <AnatomicalAtlasScene
            mode={mode}
            sex={sex}
            cameraView={cameraView}
            viewTrigger={viewTrigger}
            focusRegion={focusRegion}
            systemVisibility={systemVisibility}
            skinOpacity={skinOpacity}
            explodeFactor={explodeFactor}
            clipRatio={clipRatio}
            selectedKey={selectedKey}
            isolateSelected={isolateSelected}
            relatedKeys={selectedDetails.relatedKeys}
            demoAccentKeys={demoAccentKeys}
            highlightStates={highlightStates}
            isFullscreen={isFullscreen}
            onSelectKey={(key) => handleSelectStructure(key)}
            onExitIsolation={() => setIsolateSelected(false)}
          />
        </div>

        {/* RIGHT ZONE: Detailed Anatomical Story & Live ASTROCARE Telemetry */}
        <div className={`${showLayerControls ? 'lg:col-span-4' : 'lg:col-span-5'} lg:h-[640px] lg:overflow-y-auto lg:pr-0.5`}>
          <AtlasDetailPanel
            mode={mode}
            sex={sex}
            selectedKey={selectedKey}
            activeStory={activeStory}
            isolateSelected={isolateSelected}
            onToggleIsolate={() => setIsolateSelected((v) => !v)}
            onSelectKey={(key) => handleSelectStructure(key, undefined, true)}
            onZoomToSelected={() => {
              setFocusRegion(true);
              setViewTrigger((n) => n + 1);
            }}
            environment={environment}
            subsystemMetrics={subsystemMetrics}
            flightLogs={flightLogs}
            onFocusModeASubsystem={onFocusModeASubsystem}
            currentDay={currentDay}
            activePhase={activePhase}
            handover={handover}
            readiness={readiness}
            safetyStop={safetyStop}
            dizzinessScore={dizzinessScore}
            painScore={painScore}
            completedExercises={completedExercises}
            completedSessionsCount={completedSessionsCount}
          />
        </div>
      </div>

      {/* BOTTOM ZONE: Camera Orientation, Region Zoom, Isolation & Fullscreen */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-cyan-500/20 bg-[#0b152c]/85 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {CAMERA_BUTTONS.map((btn) => {
            const active = !focusRegion && cameraView === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleCameraPreset(btn.id)}
                className={`inline-flex min-h-[36px] items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                  active
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                    : 'border-slate-700 bg-[#0b0f19] text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {btn.id === 'reset' && <RotateCcw className="h-3 w-3" />}
                <span>{btn.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleToggleFocusRegion}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
              focusRegion
                ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                : 'border-slate-700 bg-[#0b0f19] text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{focusRegion ? 'Full Body View' : 'Focus Region'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsolateSelected((v) => !v)}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
              isolateSelected
                ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                : 'border-slate-700 bg-[#0b0f19] text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            <Focus className="h-3.5 w-3.5" />
            <span>{isolateSelected ? 'Show All Visible' : 'Isolate Selected'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0b0f19] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-slate-300 hover:border-slate-600 hover:text-white"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-0.5 text-[11px] lg:text-right">
          <div className="font-mono text-cyan-300">
            Orientation: <strong className="text-white">{activeOrientation}</strong> ·{' '}
            {focusRegion ? 'Region Zoom' : 'Full Body'} · Mode:{' '}
            <strong className="text-white">
              {mode === 'flight' ? 'In-Flight Telemetry' : `Rehab Day R+${currentDay}`}
            </strong>
          </div>
          <div className="text-[10px] text-slate-400">{OPEN_ANATOMY_ATTRIBUTION}</div>
        </div>
      </div>
    </section>
  );
};
