import React from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Crosshair,
  Focus,
  Info,
  Link2,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  ASSET_COVERAGE_NOTES,
  ATLAS_BY_KEY,
  OPEN_ANATOMY_ATTRIBUTION,
  getAtlasStructureDetails,
} from '../data/openAnatomyData';
import {
  evaluateModeAAnatomyRegion,
  evaluateModeBRecoveryRegion,
} from '../engine/ruleEngine';
import type {
  AtlasSex,
  EarthReadinessResult,
  EnvironmentKey,
  HandoverMetrics,
  InFlightLogEntry,
  RehabPhase,
  SafetyStopResult,
  SubsystemKey,
} from '../types/astral';
import { RECOVERY_TIER_BADGE_CLASS, TRIAGE_BADGE_CLASS } from '../utils/triageStyles';
import type { ClinicalDemoStory } from './three/atlasCameraAndMaterials';

interface AtlasDetailPanelProps {
  mode: 'flight' | 'rehab';
  sex: AtlasSex;
  selectedKey: string;
  activeStory?: ClinicalDemoStory | null;
  isolateSelected: boolean;
  onToggleIsolate: () => void;
  onSelectKey: (key: string) => void;
  onZoomToSelected?: () => void;
  // Mode A props
  environment?: EnvironmentKey;
  subsystemMetrics?: Record<SubsystemKey, Record<string, number>>;
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
}

const IjvCervicalSchematic: React.FC = () => (
  <div className="rounded-lg border border-cyan-500/25 bg-[#070b14] p-2.5">
    <div className="mb-1.5 flex items-center justify-between font-mono text-[10px]">
      <span className="font-bold text-cyan-300">
        Educational Schematic · Cervical IJV Scan Window (C4–C6)
      </span>
      <span className="text-slate-400">Butterfly iQ+ Cross-Section</span>
    </div>
    <svg
      viewBox="0 0 340 104"
      className="h-24 w-full rounded border border-slate-800 bg-[#050811]"
      role="img"
      aria-label="Educational cross-section showing internal jugular vein lateral to common carotid artery"
    >
      <path
        d="M 20 22 Q 170 8 320 22"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <text x="170" y="13" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        Skin &amp; Sternocleidomastoid Muscle
      </text>
      {/* Internal Jugular Vein (engorged lateral oval) */}
      <ellipse cx="94" cy="56" rx="54" ry="24" fill="#1e3a8a" fillOpacity="0.65" stroke="#38bdf8" strokeWidth="1.8" />
      <text x="94" y="53" textAnchor="middle" fill="#e0f2fe" fontSize="9" fontWeight="bold" fontFamily="monospace">
        IJV (Lateral)
      </text>
      <text x="94" y="65" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontFamily="monospace">
        0.0g Stasis Target
      </text>
      {/* Common Carotid Artery (medial pulsatile circle) */}
      <circle cx="204" cy="56" r="24" fill="#7f1d1d" fillOpacity="0.75" stroke="#f87171" strokeWidth="1.8" />
      <text x="204" y="53" textAnchor="middle" fill="#fee2e2" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
        Carotid
      </text>
      <text x="204" y="64" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace">
        Landmark
      </text>
      {/* Trachea reference */}
      <path d="M 256 44 A 24 20 0 0 1 304 44 L 304 78 L 256 78 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
      <text x="280" y="62" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
        Trachea
      </text>
    </svg>
    <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
      Notice: The 3D GLB groups cervical venous drainage into <code className="text-slate-200">veins_thorax</code> beside <code className="text-slate-200">carotid_l/r</code>; standalone upper IJV sub-segments are illustrated here rather than fabricated on the mesh.
    </p>
  </div>
);

const SansOcularSchematic: React.FC = () => (
  <div className="rounded-lg border border-cyan-500/25 bg-[#070b14] p-2.5">
    <div className="mb-1.5 flex items-center justify-between font-mono text-[10px]">
      <span className="font-bold text-cyan-300">
        Educational Schematic · SANS Retrobulbar Globe &amp; Optic Disc
      </span>
      <span className="text-slate-400">3 mm Posterior ONSD</span>
    </div>
    <svg
      viewBox="0 0 320 96"
      className="h-24 w-full rounded border border-slate-800 bg-[#050811]"
      role="img"
      aria-label="Educational SANS diagram showing posterior globe flattening, optic disc region, and optic nerve sheath diameter"
    >
      {/* Globe */}
      <circle cx="96" cy="48" r="28" fill="#0f172a" stroke="#93c5fd" strokeWidth="1.8" />
      {/* Cornea bulge */}
      <path d="M 68 38 Q 60 48 68 58" fill="#1e3a8a" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1.6" />
      {/* Posterior flattening indicator */}
      <path d="M 122 33 Q 118 48 122 63" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" />
      {/* Optic Disc / Papilla */}
      <ellipse cx="123" cy="48" rx="3.5" ry="6" fill="#fbbf24" />
      {/* Optic Nerve & CSF Sheath */}
      <rect x="125" y="38" width="94" height="20" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.3" />
      <rect x="125" y="43" width="94" height="10" fill="#ca8a04" fillOpacity="0.65" />
      {/* 3mm ONSD Caliper Marker */}
      <line x1="158" y1="32" x2="158" y2="64" stroke="#22d3ee" strokeWidth="1.4" strokeDasharray="2 2" />
      <text x="158" y="25" textAnchor="middle" fill="#67e8f9" fontSize="7.5" fontFamily="monospace">
        ONSD (3mm post.)
      </text>
      <text x="95" y="88" textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
        Posterior Scleral Flattening
      </text>
      <text x="242" y="45" textAnchor="start" fill="#fde68a" fontSize="8" fontFamily="monospace">
        Optic Nerve (CN II)
      </text>
      <text x="242" y="57" textAnchor="start" fill="#94a3b8" fontSize="7.2" fontFamily="monospace">
        Perioptic CSF Sheath
      </text>
      <text x="127" y="76" textAnchor="start" fill="#fbbf24" fontSize="7.2" fontFamily="monospace">
        Optic Disc Region
      </text>
    </svg>
    <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
      Notice: The 3D GLB renders both globes (<code className="text-slate-200">eye_l/r</code>) and cranial/optic nerves (<code className="text-slate-200">cranial_nerves</code>); internal retinal &amp; optic disc sub-layers are shown schematically above.
    </p>
  </div>
);

const TrendSparkline: React.FC<{
  points: Array<{ dayLabel: string; value: number; unit: string }>;
  strokeColor: string;
}> = ({ points, strokeColor }) => {
  if (points.length === 0) return null;
  const width = 260;
  const height = 48;
  const padX = 8;
  const padY = 8;

  const vals = points.map((p) => p.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const span = maxV - minV || 1;

  const coords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? width / 2
        : padX + (idx / (points.length - 1)) * (width - padX * 2);
    const y = height - padY - ((p.value - minV) / span) * (height - padY * 2);
    return { x, y, ...p };
  });

  const polylinePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <div className="space-y-1.5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-12 w-full overflow-visible rounded-lg border border-slate-800/80 bg-[#070b14] p-1"
        role="img"
        aria-label="Historical telemetry trend chart"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polylinePoints}
        />
        {coords.map((c, idx) => (
          <circle
            key={`${c.dayLabel}-${idx}`}
            cx={c.x}
            cy={c.y}
            r={idx === coords.length - 1 ? 3.2 : 2}
            fill={idx === coords.length - 1 ? '#ffffff' : strokeColor}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-slate-400 tabular-nums">
        {coords.slice(-4).map((c, idx) => (
          <span key={`${c.dayLabel}-${idx}`}>
            {c.dayLabel}: <strong className="text-slate-200">{c.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};

export const AtlasDetailPanel: React.FC<AtlasDetailPanelProps> = ({
  mode,
  sex,
  selectedKey,
  activeStory,
  isolateSelected,
  onToggleIsolate,
  onSelectKey,
  onZoomToSelected,
  environment = 'microgravity',
  subsystemMetrics,
  flightLogs = [],
  onFocusModeASubsystem,
  currentDay = 3,
  activePhase,
  handover,
  readiness,
  safetyStop,
  dizzinessScore = 2,
  painScore = 1,
  completedExercises = new Set<string>(),
  completedSessionsCount = 3,
}) => {
  const details = getAtlasStructureDetails(selectedKey);
  const validRelated = details.relatedKeys.filter((k) => {
    const entry = ATLAS_BY_KEY[k];
    return entry && (!entry.sex || entry.sex === sex);
  });

  const modeAEval =
    mode === 'flight' && details.modeARegionId && subsystemMetrics
      ? evaluateModeAAnatomyRegion(
          details.modeARegionId,
          subsystemMetrics,
          environment,
          flightLogs
        )
      : null;

  const modeBEval =
    mode === 'rehab' && details.modeBRegionId && handover
      ? evaluateModeBRecoveryRegion(
          details.modeBRegionId,
          currentDay,
          handover,
          completedSessionsCount,
          painScore,
          dizzinessScore
        )
      : null;

  const strokeHex =
    modeAEval?.level === 'RED'
      ? '#EF4444'
      : modeAEval?.level === 'AMBER'
        ? '#F59E0B'
        : '#06B6D4';

  const vestibularExercises =
    activePhase?.exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes('vestibular') ||
        ex.name.toLowerCase().includes('gaze') ||
        ex.name.toLowerCase().includes('balance') ||
        ex.targetMuscles.some((tm) => tm.toLowerCase().includes('vestibular'))
    ) ?? [];

  const showIjvSchematic =
    activeStory?.hasSchematicDiagram === 'ijv' ||
    selectedKey === 'veins_thorax' ||
    selectedKey === 'carotid_l' ||
    selectedKey === 'carotid_r';

  const showSansSchematic =
    activeStory?.hasSchematicDiagram === 'sans' ||
    selectedKey === 'eye_l' ||
    selectedKey === 'eye_r' ||
    selectedKey === 'cranial_nerves';

  return (
    <div
      data-testid="atlas-detail-panel"
      className="flex min-h-full flex-col gap-3 rounded-xl border border-slate-800 bg-[#111827] p-4 text-xs"
    >
      {/* Header: Anatomical Name, Latin Name, System, Focus & Isolate CTAs */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
              <span>{details.filterBucket}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{details.category}</span>
            </div>
            <h4 className="mt-0.5 text-base font-bold text-white leading-snug">
              {details.label}
            </h4>
            {details.latinName && (
              <div className="font-mono text-[11px] italic text-slate-400">
                {details.latinName}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {onZoomToSelected && (
              <button
                type="button"
                onClick={onZoomToSelected}
                title="Focus camera directly on this structure"
                className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-slate-700 bg-[#0b0f19] px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-200 hover:border-cyan-500/60 hover:text-white"
              >
                <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
                <span>Zoom</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleIsolate}
              className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                isolateSelected
                  ? 'border-cyan-400 bg-cyan-950 text-cyan-200'
                  : 'border-slate-700 bg-[#0b0f19] text-slate-300 hover:border-cyan-500/60 hover:text-white'
              }`}
            >
              <Focus className="h-3.5 w-3.5" />
              <span>{isolateSelected ? 'Isolated' : 'Isolate'}</span>
            </button>
          </div>
        </div>

        {/* Clinical Story Overview when inspecting a demonstration preset */}
        {activeStory && (
          <div className="mt-2.5 rounded-lg border border-cyan-500/20 bg-[#070b14] p-2.5 text-[11px]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Demonstration: {activeStory.title}
            </div>
            <p className="mt-1 leading-relaxed text-slate-300">
              {activeStory.storySummary}
            </p>
          </div>
        )}
      </div>

      {/* Educational Schematic for Grouped / Non-Split Sub-Structures (IJV / SANS) */}
      {showIjvSchematic && <IjvCervicalSchematic />}
      {showSansSchematic && <SansOcularSchematic />}

      {/* Grouped / Asset Coverage Note if applicable */}
      {details.groupedOrLimitationNote && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-950/20 p-2.5 text-[11px] text-amber-100">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="leading-relaxed">{details.groupedOrLimitationNote}</p>
        </div>
      )}

      {/* LIVE ASTROCARE TELEMETRY: MODE A (IN-FLIGHT) */}
      {mode === 'flight' && (
        <div className="space-y-2.5 rounded-lg border border-cyan-500/30 bg-[#0b0f19] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-cyan-300">
              <Activity className="h-3.5 w-3.5" />
              <span>ASTROCARE Mode A Telemetry</span>
            </span>
            {modeAEval && (
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${
                  TRIAGE_BADGE_CLASS[modeAEval.level]
                }`}
              >
                {modeAEval.level} · {modeAEval.riskScore}/100
              </span>
            )}
          </div>

          {modeAEval ? (
            <>
              <div className="font-mono text-[11px] font-bold text-white">
                {modeAEval.statusTitle}
              </div>

              <div className="grid grid-cols-1 gap-1.5 font-mono tabular-nums sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {modeAEval.recordedValues.map((rv) => (
                  <div
                    key={rv.label}
                    className="rounded-md border border-slate-800 bg-[#111827] p-2"
                  >
                    <div className="truncate text-[10px] text-slate-400" title={rv.label}>
                      {rv.label}
                    </div>
                    <div
                      className={`mt-0.5 text-xs font-bold ${
                        rv.isAlert ? 'text-amber-300' : 'text-cyan-300'
                      }`}
                    >
                      {rv.value}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <TrendingUp className="h-3 w-3 text-cyan-400" />
                    Flight Log Trend
                  </span>
                  <span className="truncate text-cyan-300" title={modeAEval.trendSummary}>
                    {modeAEval.historicalTrend.length} pts
                  </span>
                </div>
                <TrendSparkline points={modeAEval.historicalTrend} strokeColor={strokeHex} />
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  {modeAEval.trendSummary}
                </p>
              </div>

              <div className="rounded-md border border-slate-800 bg-[#111827] p-2.5 text-[11px] leading-relaxed text-slate-300">
                <span className="font-mono font-bold text-cyan-300">Action: </span>
                {modeAEval.clinicalAction}
              </div>

              {details.modeASubsystem && onFocusModeASubsystem && (
                <button
                  type="button"
                  onClick={() => onFocusModeASubsystem(details.modeASubsystem!)}
                  className="w-full rounded-lg border border-cyan-700/60 bg-cyan-950/40 px-3 py-2 font-mono text-[11px] font-semibold text-cyan-200 hover:bg-cyan-950/70"
                >
                  Open {details.modeAFocusLabel ?? details.modeASubsystem} in Self-Exam Drawer
                </button>
              )}
            </>
          ) : (
            <div className="rounded-md border border-slate-800 bg-[#111827] p-2.5 text-[11px] text-slate-300">
              <div className="font-mono font-semibold text-slate-200">
                No Direct Onboard Sensor Telemetry
              </div>
              <p className="mt-1 leading-relaxed text-slate-400">
                ASTROCARE&apos;s active in-flight rule engine monitors Cardiovascular/IJV, Ocular/SANS, Musculoskeletal/ARED, and Sleep/Mood. No fabricated readings are generated for uninstrumented structures.
              </p>
            </div>
          )}
        </div>
      )}

      {/* LIVE ASTROCARE TELEMETRY: MODE B (POST-FLIGHT REHAB) */}
      {mode === 'rehab' && (
        <div className="space-y-2.5 rounded-lg border border-emerald-500/30 bg-[#0b0f19] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              <span>ASTROCARE Mode B Rehab</span>
            </span>
            {details.modeBFocusArea && (
              <span className="rounded-md border border-emerald-700/50 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-200">
                {details.modeBFocusArea}
              </span>
            )}
          </div>

          {safetyStop?.haltRequired && (
            <div className="flex items-start gap-2 rounded-md border border-rose-700 bg-rose-950/40 p-2 text-[11px] text-rose-200">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>{safetyStop.message}</span>
            </div>
          )}

          {modeBEval ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-slate-300">
                  Day R+{currentDay} · {modeBEval.region.shortLabel}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${
                    RECOVERY_TIER_BADGE_CLASS[modeBEval.tier]
                  }`}
                >
                  {modeBEval.tierLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                <div className="rounded-md border border-slate-800 bg-[#111827] p-2">
                  <span className="block text-[10px] text-slate-400">Estimated Recovery</span>
                  <span
                    className="text-base font-bold"
                    style={{ color: modeBEval.colorHex }}
                  >
                    {modeBEval.recoveryPercent}%
                  </span>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${modeBEval.recoveryPercent}%`,
                        backgroundColor: modeBEval.colorHex,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-slate-800 bg-[#111827] p-2">
                  <span className="block text-[10px] text-slate-400">Vulnerability</span>
                  <span className="text-base font-bold text-slate-100">
                    {modeBEval.vulnerabilityPercent}%
                  </span>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${modeBEval.vulnerabilityPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-slate-800 bg-[#111827] p-2.5 text-[11px]">
                {modeBEval.tier === 'RED' ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                )}
                <div>
                  <div className="font-mono font-bold text-white">
                    {modeBEval.loadingClearance}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {modeBEval.atrophyOrLossNote}
                  </div>
                </div>
              </div>

              {activePhase && (
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-slate-400">
                    Targeted {activePhase.dayRange} Drills:
                  </div>
                  {activePhase.exercises
                    .filter((ex) =>
                      modeBEval.region.linkedExerciseKeywords.some(
                        (kw) =>
                          ex.name.toLowerCase().includes(kw.toLowerCase()) ||
                          ex.targetMuscles.some((tm) =>
                            tm.toLowerCase().includes(kw.toLowerCase())
                          )
                      )
                    )
                    .map((ex) => {
                      const done = completedExercises.has(ex.id);
                      return (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-[#111827] px-2 py-1 font-mono text-[10px]"
                        >
                          <span className={done ? 'text-slate-500 line-through' : 'text-slate-200'}>
                            {ex.name}
                          </span>
                          <span className={done ? 'text-emerald-400' : 'text-cyan-300'}>
                            {done ? 'DONE' : ex.duration}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          ) : details.modeBFocusArea === 'Balance & Vestibular Rehabilitation' &&
            readiness &&
            handover ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                <div className="rounded-md border border-slate-800 bg-[#111827] p-2">
                  <span className="block text-[10px] text-slate-400">Vestibular Balance</span>
                  <span className="text-base font-bold text-emerald-400">
                    {readiness.vestibularRecoveryPercent}%
                  </span>
                </div>
                <div className="rounded-md border border-slate-800 bg-[#111827] p-2">
                  <span className="block text-[10px] text-slate-400">Dizziness Score</span>
                  <span className="text-base font-bold text-cyan-300">
                    {dizzinessScore} / 10
                  </span>
                </div>
              </div>
              <p className="font-mono text-[10px] text-slate-400">
                Post-flight vestibular disruption index: {handover.vestibularDisruptionScore}/100.{' '}
                {vestibularExercises.length > 0
                  ? `${vestibularExercises.length} gaze/balance drill(s) active in ${activePhase?.name}.`
                  : 'Follow active APTP balance safety limits.'}
              </p>
            </div>
          ) : details.modeBFocusArea && handover && readiness ? (
            <div className="space-y-2 font-mono text-[11px]">
              <div className="grid grid-cols-2 gap-2 tabular-nums">
                <div className="rounded-md border border-slate-800 bg-[#111827] p-2">
                  <span className="block text-[10px] text-slate-400">Earth Readiness</span>
                  <span className="text-base font-bold text-emerald-400">
                    {readiness.overallReadinessPercent}%
                  </span>
                </div>
                <div className="rounded-md border border-slate-800 bg-[#111827] p-2">
                  <span className="block text-[10px] text-slate-400">
                    {details.modeBFocusArea === 'Bone Recovery'
                      ? 'Predicted Bone Loss'
                      : 'Predicted Atrophy'}
                  </span>
                  <span className="text-base font-bold text-amber-300">
                    {details.modeBFocusArea === 'Bone Recovery'
                      ? `-${handover.predictedBoneLossPercent}%`
                      : `-${handover.predictedMuscleAtrophyPercent}%`}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Linked to overall Mode B {details.modeBFocusArea} progression ({activePhase?.name}).
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-800 bg-[#111827] p-2.5 text-[11px] text-slate-400">
              Educational anatomical structure — no direct Mode B musculoskeletal or vestibular metric is assigned to this organ.
            </div>
          )}
        </div>
      )}

      {/* Concise Physiological Function & Spaceflight Relevance */}
      <div className="space-y-2.5 rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
            Physiological Function
          </div>
          <p className="mt-1 leading-relaxed text-slate-200">{details.anatomicalFunction}</p>
        </div>

        <div className="border-t border-slate-800/80 pt-2">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Why It Matters in Spaceflight
          </div>
          <p className="mt-0.5 leading-relaxed text-slate-300">
            {details.spaceflightRelevance}
          </p>
        </div>
      </div>

      {/* Expandable Secondary Details: Location, Related Structures, Attribution */}
      <div className="mt-auto space-y-2 border-t border-slate-800 pt-2.5 text-[11px] text-slate-400">
        <details className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2.5">
          <summary className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] font-semibold text-cyan-300">
            <BookOpen className="h-3.5 w-3.5" />
            <span>More Anatomical Info &amp; Attribution</span>
          </summary>
          <div className="mt-2.5 space-y-2.5 text-[11px] leading-relaxed text-slate-300">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Anatomical Location
              </div>
              <p className="mt-0.5">{details.anatomicalLocation}</p>
            </div>

            {validRelated.length > 0 && (
              <div className="border-t border-slate-800 pt-2">
                <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  <Link2 className="h-3 w-3 text-cyan-400" />
                  <span>Related Structures</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {validRelated.map((relKey) => {
                    const rel = ATLAS_BY_KEY[relKey];
                    if (!rel) return null;
                    return (
                      <button
                        key={relKey}
                        type="button"
                        onClick={() => onSelectKey(relKey)}
                        className="rounded-md border border-slate-700 bg-[#111827] px-2 py-1 font-mono text-[10px] text-cyan-300 hover:border-cyan-400 hover:text-white"
                      >
                        {rel.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400">
              <p className="mb-2">
                <strong className="font-mono text-slate-300">Disclaimer:</strong> Educational and
                research anatomical visualization — not a patient-specific diagnostic digital twin.
              </p>
              <p>{OPEN_ANATOMY_ATTRIBUTION}</p>
              <div className="mt-2 space-y-1.5">
                {ASSET_COVERAGE_NOTES.map((row) => (
                  <div key={row.system} className="rounded border border-slate-800/80 bg-[#111827] p-2">
                    <div className="font-mono font-bold text-white">{row.system}</div>
                    <div className="mt-0.5 text-emerald-300">
                      <strong>Present:</strong> {row.presentSeparately}
                    </div>
                    <div className="mt-0.5 text-amber-300">
                      <strong>Grouped:</strong> {row.groupedInAsset}
                    </div>
                    <div className="mt-0.5 text-slate-400">
                      <strong>Not in asset:</strong> {row.notInAsset}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
