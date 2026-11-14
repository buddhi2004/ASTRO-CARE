import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Bone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Dumbbell,
  FileText,
  Radio,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BACKDROP_ASSETS,
  BACKDROP_OPTIONS,
  type BackdropThemeId,
} from '../data/backdropAssets';
import { MISSION_PRESETS, POST_FLIGHT_PHASES } from '../data/rulesData';
import { REHAB_ACTIVITY_PROFILES } from '../data/rehabActivitiesData';
import type {
  AtlasCameraView,
  EarthReadinessResult,
  HandoverMetrics,
  MissionMode,
  MissionPresetKey,
  RehabPhase,
  SafetyStopResult,
  TriageLevel,
} from '../types/astral';
import { AnatomicalAtlasWorkspace } from './three/AnatomicalAtlasWorkspace';
import { ActivitySessionModal } from './rehab/ActivitySessionModal';
import { ExerciseDemoModal } from './rehab/ExerciseDemoModal';
import { RehabActivityCard } from './rehab/RehabActivityCard';
import { AnimatedProgressRing } from './ui/AnimatedProgressRing';
import { ClinicalTooltip } from './ui/ClinicalTooltip';

interface ModeBWorkspaceProps {
  mode: MissionMode;
  missionPreset: MissionPresetKey;
  backdropTheme: BackdropThemeId;
  currentDay: number;
  activePhase: RehabPhase;
  handover: HandoverMetrics;
  readiness: EarthReadinessResult;
  safetyStop: SafetyStopResult;
  flightLogsCount: number;
  dizzinessScore: number;
  painScore: number;
  completedExercises: Set<string>;
  checklistProgress: Record<string, string[]>;
  completedSessionsCount?: number;
  audioMuted: boolean;
  donkiSource?: 'LIVE' | 'OFFLINE SIMULATION';
  onSwitchMode: (mode: MissionMode) => void;
  onChangeBackdropTheme: (theme: BackdropThemeId) => void;
  onOpenPlanModal: () => void;
  onOpenNasaModal: () => void;
  onToggleAudio: () => void;
  onChangePreset: (preset: MissionPresetKey) => void;
  onChangeDay: (day: number) => void;
  onChangeDizziness: (val: number) => void;
  onChangePain: (val: number) => void;
  onToggleExercise: (exerciseId: string) => void;
  onToggleChecklistStep: (exerciseId: string, stepId: string) => void;
  onResetChecklist: (exerciseId: string) => void;
  onCompleteSession: () => void;
}

type RehabSummaryKey = 'muscle' | 'bone' | 'vestibular' | 'readiness';

function getSimpleStatusLabel(level: TriageLevel): string {
  if (level === 'RED') return 'Critical';
  if (level === 'AMBER') return 'Attention';
  return 'Normal';
}

function getStatusColorClasses(level: TriageLevel): {
  badge: string;
  text: string;
  cardBorder: string;
} {
  if (level === 'RED') {
    return {
      badge: 'border-rose-500/50 bg-rose-950/50 text-rose-300',
      text: 'text-rose-400',
      cardBorder: 'border-rose-500/40',
    };
  }
  if (level === 'AMBER') {
    return {
      badge: 'border-amber-500/50 bg-amber-950/50 text-amber-300',
      text: 'text-amber-400',
      cardBorder: 'border-amber-500/40',
    };
  }
  return {
    badge: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    text: 'text-emerald-400',
    cardBorder: 'border-slate-800',
  };
}

export const ModeBWorkspace: React.FC<ModeBWorkspaceProps> = ({
  mode,
  missionPreset,
  backdropTheme,
  currentDay,
  activePhase,
  handover,
  readiness,
  safetyStop,
  flightLogsCount,
  dizzinessScore,
  painScore,
  completedExercises,
  checklistProgress,
  completedSessionsCount = 3,
  audioMuted,
  donkiSource = 'OFFLINE SIMULATION',
  onSwitchMode,
  onChangeBackdropTheme,
  onOpenPlanModal,
  onOpenNasaModal,
  onToggleAudio,
  onChangePreset,
  onChangeDay,
  onChangeDizziness,
  onChangePain,
  onToggleChecklistStep,
  onResetChecklist,
  onCompleteSession,
}) => {
  const [selectedSummaryCard, setSelectedSummaryCard] = useState<RehabSummaryKey>('readiness');
  const [expandedSummaryKey, setExpandedSummaryKey] = useState<RehabSummaryKey | null>(null);
  const [requestedStructureKey, setRequestedStructureKey] = useState<string | null>('calf_l');
  const [requestedView, setRequestedView] = useState<AtlasCameraView | null>('back');
  const [showDetailedMetrics, setShowDetailedMetrics] = useState<boolean>(false);
  const [showAllAdvisories, setShowAllAdvisories] = useState<boolean>(false);
  const [activeSessionExerciseId, setActiveSessionExerciseId] = useState<string | null>(null);
  const [demoExerciseId, setDemoExerciseId] = useState<string | null>(null);

  // Prominent Overall Status derived from Safety Stop & Readiness
  const overallStatus = useMemo(() => {
    if (safetyStop.haltRequired) {
      return {
        level: 'RED' as TriageLevel,
        label: 'Critical',
        summary: 'Safety stop active — halt training',
      };
    }
    if (safetyStop.level === 'AMBER') {
      return {
        level: 'AMBER' as TriageLevel,
        label: 'Needs Attention',
        summary: 'Precaution active — scale intensity',
      };
    }
    return {
      level: 'GREEN' as TriageLevel,
      label: 'Normal',
      summary: `Safe to train · ${readiness.overallReadinessPercent}% Earth readiness`,
    };
  }, [safetyStop, readiness.overallReadinessPercent]);

  const overallColors = getStatusColorClasses(overallStatus.level);

  // 4 Interactive Post-Flight Recovery Summary Cards
  const summaryCards: Array<{
    key: RehabSummaryKey;
    title: string;
    value: string;
    ringPercent: number;
    level: TriageLevel;
    structureKey: string;
    view: AtlasCameraView;
    icon: React.ReactNode;
    tooltipTerm?: string;
    details: Array<{ label: string; value: string }>;
  }> = useMemo(() => {
    const muscleLevel: TriageLevel = safetyStop.haltRequired
      ? 'RED'
      : handover.predictedMuscleAtrophyPercent >= 16 || painScore > 5
        ? 'AMBER'
        : 'GREEN';

    const boneLevel: TriageLevel =
      handover.predictedBoneLossPercent >= 5.5
        ? 'RED'
        : handover.predictedBoneLossPercent >= 2.8
          ? 'AMBER'
          : 'GREEN';

    const vestibLevel: TriageLevel =
      dizzinessScore > 4
        ? 'RED'
        : dizzinessScore >= 3 || readiness.vestibularRecoveryPercent < 65
          ? 'AMBER'
          : 'GREEN';

    const readinessLevel: TriageLevel = safetyStop.haltRequired
      ? 'RED'
      : readiness.overallReadinessPercent < 60
        ? 'AMBER'
        : 'GREEN';

    const dayFraction = Math.min(1, Math.max(0, currentDay / 45));
    const muscleRecoveryPct = Math.max(
      20,
      Math.min(
        100,
        Math.round(100 - handover.predictedMuscleAtrophyPercent * (1 - dayFraction * 0.85))
      )
    );
    const boneStabilityPct = Math.max(
      25,
      Math.min(
        100,
        Math.round(100 - handover.predictedBoneLossPercent * 4 * (1 - dayFraction * 0.7))
      )
    );

    return [
      {
        key: 'muscle',
        title: 'Muscle Recovery',
        value: `-${handover.predictedMuscleAtrophyPercent}% deficit`,
        ringPercent: muscleRecoveryPct,
        level: muscleLevel,
        structureKey: 'calf_l',
        view: 'back',
        icon: <Dumbbell className="h-4 w-4" />,
        details: [
          { label: 'Target', value: 'Soleus & Paraspinals' },
          { label: 'Avg ARED Load', value: `${handover.avgAredWorkload}%` },
          { label: 'Pain Score', value: `${painScore}/10` },
        ],
      },
      {
        key: 'bone',
        title: 'Bone Health',
        value: `-${handover.predictedBoneLossPercent}% BMD`,
        ringPercent: boneStabilityPct,
        level: boneLevel,
        structureKey: 'femur_l',
        view: 'front',
        icon: <Bone className="h-4 w-4" />,
        tooltipTerm: 'BMD',
        details: [
          { label: 'Target', value: 'Femoral Neck & Heel' },
          { label: 'Mission Days', value: `${handover.missionDurationDays}d` },
          { label: 'Missed ARED', value: `${handover.totalMissedWorkouts}` },
        ],
      },
      {
        key: 'vestibular',
        title: 'Balance & Vestibular',
        value: `${readiness.vestibularRecoveryPercent}% recovered`,
        ringPercent: readiness.vestibularRecoveryPercent,
        level: vestibLevel,
        structureKey: 'cerebellum',
        view: 'back',
        icon: <Compass className="h-4 w-4" />,
        details: [
          { label: 'Ataxia Score', value: `${handover.vestibularDisruptionScore}/100` },
          { label: 'Dizziness', value: `${dizzinessScore}/10` },
          { label: 'Target', value: '30s Eyes Closed' },
        ],
      },
      {
        key: 'readiness',
        title: 'Overall Earth Readiness',
        value: `${readiness.overallReadinessPercent}%`,
        ringPercent: readiness.overallReadinessPercent,
        level: readinessLevel,
        structureKey: 'back_muscles_l',
        view: 'back',
        icon: <Activity className="h-4 w-4" />,
        tooltipTerm: 'Orthostatic',
        details: [
          { label: 'VO2 Recovery', value: `${readiness.vo2maxRecoveryPercent}%` },
          { label: 'Orthostatic', value: `${readiness.orthostaticTolerancePercent}%` },
          { label: 'Grade', value: readiness.gradeLabel },
        ],
      },
    ];
  }, [handover, readiness, safetyStop, dizzinessScore, painScore, currentDay]);

  // Compact Important Alerts (Warnings & Critical only by default)
  const importantAlerts = useMemo(() => {
    const items: Array<{
      id: string;
      level: TriageLevel;
      title: string;
      detail: string;
      targetSectionId?: string;
    }> = [];

    if (safetyStop.haltRequired || safetyStop.level === 'AMBER') {
      items.push({
        id: 'safety-stop',
        level: safetyStop.level,
        title: safetyStop.message,
        detail: safetyStop.action,
        targetSectionId: 'section-rehab-safety',
      });
    }

    if (handover.orthostaticRiskScore >= 60) {
      items.push({
        id: 'orthostatic-risk',
        level: 'AMBER',
        title: `Elevated Orthostatic Intolerance Risk (${handover.orthostaticRiskScore}/100)`,
        detail: 'Use graded tilt/supine warmup before upright treadmill loading.',
        targetSectionId: 'section-rehab-checklist',
      });
    }

    if (handover.vestibularDisruptionScore >= 65 && dizzinessScore <= 4) {
      items.push({
        id: 'vestibular-lag',
        level: 'AMBER',
        title: `Post-Flight Vestibular Lag (${handover.vestibularDisruptionScore}/100)`,
        detail: 'Maintain spotter assistance during Romberg eyes-closed balance sets.',
        targetSectionId: 'section-rehab-checklist',
      });
    }

    if (showAllAdvisories && items.length === 0) {
      items.push({
        id: 'phase-nominal',
        level: 'GREEN',
        title: `${activePhase.name} Active (${activePhase.dayRange})`,
        detail: `Protocol focus: ${activePhase.theme}.`,
        targetSectionId: 'section-rehab-checklist',
      });
    }

    const rank: Record<TriageLevel, number> = { RED: 0, AMBER: 1, GREEN: 2 };
    return items.sort((a, b) => rank[a.level] - rank[b.level]);
  }, [safetyStop, handover, dizzinessScore, showAllAdvisories, activePhase]);

  const handleSelectSummaryCard = (
    key: RehabSummaryKey,
    structureKey: string,
    view: AtlasCameraView
  ) => {
    setSelectedSummaryCard(key);
    setRequestedStructureKey(structureKey);
    setRequestedView(view);
  };

  // Lookup any exercise across all 3 phases for Demo/Session modals
  const allExercisesMap = useMemo(() => {
    const map = new Map<string, (typeof activePhase.exercises)[number]>();
    POST_FLIGHT_PHASES.forEach((p) => {
      p.exercises.forEach((ex) => map.set(ex.id, ex));
    });
    return map;
  }, []);

  const phaseStepTotals = useMemo(() => {
    let total = 0;
    let done = 0;
    activePhase.exercises.forEach((ex) => {
      const profile = REHAB_ACTIVITY_PROFILES[ex.id];
      if (!profile) return;
      total += profile.checklist.length;
      const checked = checklistProgress[ex.id] || [];
      done += profile.checklist.filter((s) => checked.includes(s.id)).length;
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const completedActivitiesCount = activePhase.exercises.filter((ex) =>
      completedExercises.has(ex.id)
    ).length;
    return { total, done, pct, completedActivitiesCount };
  }, [activePhase, checklistProgress, completedExercises]);

  const activeSessionExercise = activeSessionExerciseId
    ? allExercisesMap.get(activeSessionExerciseId) || null
    : null;
  const activeSessionProfile = activeSessionExerciseId
    ? REHAB_ACTIVITY_PROFILES[activeSessionExerciseId] || null
    : null;

  const demoExercise = demoExerciseId ? allExercisesMap.get(demoExerciseId) || null : null;
  const demoProfile = demoExerciseId ? REHAB_ACTIVITY_PROFILES[demoExerciseId] || null : null;

  return (
    <div className="space-y-6">
      {/* A. MISSION OVERVIEW */}
      <section
        aria-label="Mission Overview"
        className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#060f1e]/80 p-4 shadow-lg backdrop-blur-md md:p-5"
      >
        {/* Earth Horizon Background for Post-Flight Recovery */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 scale-[1.02] bg-cover opacity-68"
            style={{
              backgroundImage: `url("${BACKDROP_ASSETS.earthHorizon}")`,
              backgroundPosition: 'center 62%',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(4, 10, 26, 0.78) 0%, rgba(6, 22, 34, 0.44) 52%, rgba(4, 10, 24, 0.78) 100%)',
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Mode Switcher + Recovery Day + Handover Preset */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="Mission Mode"
                className="inline-grid grid-cols-2 gap-1 rounded-xl border border-cyan-500/20 bg-[#0b152c]/85 p-1"
              >
                <button
                  type="button"
                  onClick={() => onSwitchMode('flight')}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                    mode === 'flight'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  In-Flight Monitoring
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchMode('rehab')}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                    mode === 'rehab'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Post-Flight Recovery
                </button>
              </div>

              <span className="font-mono text-xs text-slate-300 tabular-nums">
                Recovery Day R+{currentDay} of 45 · {activePhase.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                id="preset-selector"
                aria-label="Select mission handover preset"
                value={missionPreset}
                onChange={(e) => onChangePreset(e.target.value as MissionPresetKey)}
                className="min-h-[38px] rounded-xl border border-cyan-500/25 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs text-emerald-300 focus:border-emerald-400 focus:outline-none"
              >
                {Object.values(MISSION_PRESETS).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select dashboard background"
                value={backdropTheme}
                onChange={(e) => onChangeBackdropTheme(e.target.value as BackdropThemeId)}
                className="min-h-[38px] rounded-xl border border-cyan-500/25 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs text-slate-200 focus:border-emerald-400 focus:outline-none"
              >
                {BACKDROP_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span className="font-mono text-xs text-slate-300 tabular-nums">
                Mission {handover.missionDurationDays}d · {flightLogsCount} logs · {completedSessionsCount} blocks done
              </span>
            </div>
          </div>

          {/* Right: Prominent Overall Health Status Indicator + Quiet Utilities */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div
              data-testid="overall-rehab-status"
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2 backdrop-blur-md ${overallColors.badge}`}
            >
              <AnimatedProgressRing
                percent={readiness.overallReadinessPercent}
                level={overallStatus.level}
                size={46}
                strokeWidth={4}
              />
              <div>
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider opacity-85">
                  {overallStatus.level === 'GREEN' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : overallStatus.level === 'AMBER' ? (
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Overall Recovery Status</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-bold text-white">{overallStatus.label}</span>
                  <span className="text-xs opacity-90">{overallStatus.summary}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenPlanModal}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-[#0b152c]/90 px-3 py-2 font-mono text-xs font-semibold text-emerald-300 transition-colors hover:border-emerald-400/60 hover:text-white whitespace-nowrap"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Prescribed Plan</span>
              </button>

              <button
                type="button"
                onClick={onOpenNasaModal}
                aria-label="Configure NASA DONKI space weather key"
                title={`DONKI: ${donkiSource}`}
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0b152c]/90 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-white"
              >
                <Radio className="h-4 w-4 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={onToggleAudio}
                aria-label={audioMuted ? 'Unmute telemetry audio' : 'Mute telemetry audio'}
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0b152c]/90 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-white"
              >
                {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* B. HEALTH SUMMARY (4 Interactive Expandable Cards with Animated Progress Rings) */}
      <section aria-label="Post-Flight Health Summary">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">
              Recovery Summary
            </h2>
            <ClinicalTooltip term="APTP" />
          </div>
          <span className="text-xs text-slate-400">
            Select a recovery area to inspect on the 3D model or expand breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const isSelected = selectedSummaryCard === card.key;
            const isExpanded = expandedSummaryKey === card.key;
            const statusStyle = getStatusColorClasses(card.level);
            const statusSymbol =
              card.level === 'RED' ? '!' : card.level === 'AMBER' ? '▲' : '●';
            return (
              <div
                key={card.key}
                className={`flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-emerald-400/80 bg-[#081a24]/90 shadow-[0_8px_28px_-12px_rgba(16,185,129,0.4)]'
                    : `${statusStyle.cardBorder} bg-[#070f22]/80 hover:border-cyan-400/50`
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSummaryCard(card.key, card.structureKey, card.view)}
                    className="group flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-medium text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md"
                  >
                    <span className="text-emerald-300 shrink-0">{card.icon}</span>
                    <span className="truncate group-hover:text-white">{card.title}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {card.tooltipTerm && <ClinicalTooltip term={card.tooltipTerm} />}
                    <span className={`text-xs font-semibold ${statusStyle.text}`}>
                      <span aria-hidden="true" className="mr-1">{statusSymbol}</span>
                      {getSimpleStatusLabel(card.level)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectSummaryCard(card.key, card.structureKey, card.view)}
                  className="mt-3 flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
                >
                  <div>
                    <div className="font-mono text-lg font-bold text-white tabular-nums">
                      {card.value}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-emerald-300">
                      Focus 3D Anatomy →
                    </div>
                  </div>

                  <AnimatedProgressRing
                    percent={card.ringPercent}
                    level={card.level}
                    size={48}
                    strokeWidth={4}
                  />
                </button>

                <div className="mt-3 flex items-center justify-between border-t border-cyan-500/15 pt-2">
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                    Day R+{currentDay}
                  </span>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedSummaryKey((prev) => (prev === card.key ? null : card.key))
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-300 hover:text-white"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Breakdown'}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 space-y-1.5 rounded-xl border border-cyan-500/20 bg-[#040917]/80 p-2.5 font-mono text-[11px] tabular-nums">
                    {card.details.map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">{row.label}</span>
                        <span className="font-semibold text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* C. IMPORTANT ALERTS (Compact) */}
      <section
        aria-label="Important Alerts"
        className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 p-4 backdrop-blur-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              Important Alerts
            </span>
            {importantAlerts.length > 0 && (
              <span className="font-mono text-xs text-cyan-300/80">
                · {importantAlerts.length} active
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAllAdvisories((v) => !v)}
            className="font-mono text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            {showAllAdvisories ? 'Warnings Only' : 'Show All Advisories'}
          </button>
        </div>

        {importantAlerts.length === 0 ? (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Normal — Safe to train. No dizziness or pain safety stops active.</span>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {importantAlerts.slice(0, 3).map((alert) => {
              const cls = getStatusColorClasses(alert.level);
              return (
                <div
                  key={alert.id}
                  className="flex flex-col gap-2 rounded-xl border border-cyan-500/15 bg-[#0b152c]/85 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-[11px] font-bold ${cls.text}`}>
                        {getSimpleStatusLabel(alert.level)}
                      </span>
                      <span className="text-xs font-semibold text-white">{alert.title}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-300" title={alert.detail}>
                      {alert.detail}
                    </p>
                  </div>

                  {alert.targetSectionId && (
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById(alert.targetSectionId!)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }}
                      className="shrink-0 self-start rounded-lg border border-cyan-500/30 bg-[#070f22] px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-300 hover:border-emerald-400/60 hover:text-white sm:self-center"
                    >
                      Inspect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* D. OVERALL HEALTH VISUALIZATION (Central 3D Body Model + Clean Readiness Progress) */}
      <AnatomicalAtlasWorkspace
        mode="rehab"
        currentDay={currentDay}
        activePhase={activePhase}
        handover={handover}
        readiness={readiness}
        safetyStop={safetyStop}
        dizzinessScore={dizzinessScore}
        painScore={painScore}
        completedExercises={completedExercises}
        completedSessionsCount={completedSessionsCount}
        requestedStructureKey={requestedStructureKey}
        requestedView={requestedView}
        onSelectStructureKey={(key) => setRequestedStructureKey(key)}
      />

      {/* Clean Earth Readiness Progress Indicators + 45-Day Timeline */}
      <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#070f22]/75 p-4 backdrop-blur-md md:p-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover opacity-55"
            style={{
              backgroundImage: `url("${BACKDROP_ASSETS.issCupolaOrbit}")`,
              backgroundPosition: 'center 52%',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(110deg, rgba(6, 13, 30, 0.84) 0%, rgba(7, 17, 36, 0.60) 58%, rgba(5, 11, 24, 0.82) 100%)',
            }}
          />
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left: Earth Readiness Progress Indicators + Animated Ring (5 cols) */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Earth Readiness Trajectory</h3>
                  <ClinicalTooltip term="NHIS" />
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {readiness.gradeLabel}
                </span>
              </div>
              <AnimatedProgressRing
                percent={readiness.overallReadinessPercent}
                size={68}
                strokeWidth={5}
                tone="emerald"
                sublabel="READY"
              />
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/90">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${readiness.overallReadinessPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 font-mono text-xs tabular-nums">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>VO2 Max</span>
                  <span className="font-semibold text-white">{readiness.vo2maxRecoveryPercent}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${readiness.vo2maxRecoveryPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Balance</span>
                  <span className="font-semibold text-white">
                    {readiness.vestibularRecoveryPercent}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${readiness.vestibularRecoveryPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Orthostatic</span>
                  <span className="font-semibold text-white">
                    {readiness.orthostaticTolerancePercent}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${readiness.orthostaticTolerancePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: 45-Day Reconditioning Timeline Slider (7 cols) */}
          <div className="border-t border-cyan-500/15 pt-4 lg:col-span-7 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  45-Day Timeline
                </span>
                <div className="text-sm font-bold text-white">
                  {activePhase.name} ({activePhase.dayRange}) —{' '}
                  <span className="font-normal text-slate-300">{activePhase.theme}</span>
                </div>
              </div>
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 font-mono text-sm font-bold text-emerald-300 tabular-nums">
                Day R+{currentDay}
              </span>
            </div>

            <label htmlFor="timeline-slider" className="sr-only">
              Select post-flight recovery day from R+0 to R+45
            </label>
            <input
              id="timeline-slider"
              type="range"
              min={0}
              max={45}
              value={currentDay}
              onChange={(e) => onChangeDay(Number(e.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500 md:h-2.5"
            />

            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => onChangeDay(3)}
                className={`min-h-[40px] rounded-xl border px-2 py-1.5 transition-colors ${
                  activePhase.phaseId === 1
                    ? 'border-cyan-400 bg-cyan-950/60 font-bold text-cyan-200'
                    : 'border-cyan-500/20 bg-[#0b152c]/85 text-slate-400 hover:text-white'
                }`}
              >
                Phase 1 (R+0–7)
              </button>
              <button
                type="button"
                onClick={() => onChangeDay(14)}
                className={`min-h-[40px] rounded-xl border px-2 py-1.5 transition-colors ${
                  activePhase.phaseId === 2
                    ? 'border-emerald-400 bg-emerald-950/60 font-bold text-emerald-200'
                    : 'border-cyan-500/20 bg-[#0b152c]/85 text-slate-400 hover:text-white'
                }`}
              >
                Phase 2 (R+8–21)
              </button>
              <button
                type="button"
                onClick={() => onChangeDay(35)}
                className={`min-h-[40px] rounded-xl border px-2 py-1.5 transition-colors ${
                  activePhase.phaseId === 3
                    ? 'border-blue-400 bg-blue-950/60 font-bold text-blue-200'
                    : 'border-cyan-500/20 bg-[#0b152c]/85 text-slate-400 hover:text-white'
                }`}
              >
                Phase 3 (R+22–45)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Rehab Controls: Full-Width Safety Gate + Interactive Activity Hub */}
      <div className="space-y-6">
        {/* Safety Stop Check (Full-Width Bar) */}
        <section
          id="section-rehab-safety"
          className={`rounded-2xl border bg-[#070f22]/80 p-4 backdrop-blur-md md:p-5 transition-colors ${
            safetyStop.haltRequired
              ? 'border-rose-600'
              : safetyStop.level === 'AMBER'
                ? 'border-amber-600'
                : 'border-cyan-500/20'
          }`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white md:text-base">
                Pre-Session Symptom Safety Check
              </h3>
              <p className="text-xs text-slate-400">
                Halts standing activities automatically if dizziness &gt; 4/10 or pain &gt; 5/10.
              </p>
            </div>
            <span
              className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold ${
                safetyStop.haltRequired
                  ? 'border-rose-700 bg-rose-950 text-rose-300'
                  : safetyStop.level === 'AMBER'
                    ? 'border-amber-700 bg-amber-950 text-amber-300'
                    : 'border-emerald-700 bg-emerald-950 text-emerald-300'
              }`}
            >
              {safetyStop.haltRequired
                ? 'HALT: SAFETY STOP'
                : safetyStop.level === 'AMBER'
                  ? 'PRECAUTION'
                  : 'SAFE TO TRAIN'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
            <div className="rounded-xl border border-cyan-500/15 bg-[#0b152c]/85 p-3.5 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <label htmlFor="dizziness-slider" className="font-bold text-slate-200">
                  Dizziness
                </label>
                <span className="text-base font-bold text-cyan-400 tabular-nums">
                  {dizzinessScore} / 10
                </span>
              </div>
              <input
                id="dizziness-slider"
                type="range"
                min={0}
                max={10}
                value={dizzinessScore}
                onChange={(e) => onChangeDizziness(Number(e.target.value))}
                className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 md:h-2"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-400">
                <span>0: Clear</span>
                <span className="text-amber-400">&gt;4: Halt</span>
                <span className="text-rose-400">10</span>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/15 bg-[#0b152c]/85 p-3.5 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <label htmlFor="pain-slider" className="font-bold text-slate-200">
                  Joint / Muscle Pain
                </label>
                <span className="text-base font-bold text-amber-400 tabular-nums">
                  {painScore} / 10
                </span>
              </div>
              <input
                id="pain-slider"
                type="range"
                min={0}
                max={10}
                value={painScore}
                onChange={(e) => onChangePain(Number(e.target.value))}
                className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400 md:h-2"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-400">
                <span>0: None</span>
                <span className="text-amber-400">&gt;5: Halt</span>
                <span className="text-rose-400">10</span>
              </div>
            </div>

            <div
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs lg:col-span-6 ${
                safetyStop.haltRequired
                  ? 'border-rose-700 bg-rose-950/30 text-rose-100'
                  : safetyStop.level === 'AMBER'
                    ? 'border-amber-700 bg-amber-950/25 text-amber-100'
                    : 'border-cyan-500/15 bg-[#0b152c]/85 text-slate-300'
              }`}
            >
              {safetyStop.haltRequired ? (
                <AlertOctagon className="h-5 w-5 shrink-0 text-rose-400" />
              ) : safetyStop.level === 'AMBER' ? (
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              )}
              <div>
                <div className="font-bold">{safetyStop.message}</div>
                <p className="mt-0.5 leading-relaxed opacity-90">{safetyStop.action}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Rehabilitation Activity Hub (Full 12 Cols) */}
        <section
          id="section-rehab-checklist"
          className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 p-4 backdrop-blur-md md:p-6"
        >
          {/* Hub Header + Phase Selector + Overall Progress */}
          <div className="mb-5 space-y-4 border-b border-slate-800 pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-emerald-400">
                  <span>{activePhase.protocolTag}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">{activePhase.dayRange}</span>
                </div>
                <h3 className="mt-1 text-base font-bold text-white md:text-lg">
                  Interactive Rehabilitation Activities — {activePhase.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Launch guided timers, check off prescribed sets as you train, and view biomechanical demonstrations.
                </p>
              </div>

              {/* Phase Quick Switcher */}
              <div
                role="tablist"
                aria-label="Rehabilitation Phases"
                className="inline-grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-[#111827] p-1 font-mono text-xs"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePhase.phaseId === 1}
                  onClick={() => onChangeDay(3)}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                    activePhase.phaseId === 1
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Phase 1 · R+0–7
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePhase.phaseId === 2}
                  onClick={() => onChangeDay(14)}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                    activePhase.phaseId === 2
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Phase 2 · R+8–21
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePhase.phaseId === 3}
                  onClick={() => onChangeDay(35)}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                    activePhase.phaseId === 3
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Phase 3 · R+22–45
                </button>
              </div>
            </div>

            {/* Session Overall Progress Strip */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular-nums">
                <span className="font-semibold text-white">
                  Block Progress: {phaseStepTotals.pct}% ({phaseStepTotals.done}/{phaseStepTotals.total} steps)
                </span>
                <span className="font-bold text-emerald-400">
                  {phaseStepTotals.completedActivitiesCount} / {activePhase.exercises.length} Activities Completed
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-[width] duration-300"
                  style={{ width: `${phaseStepTotals.pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2-Column Grid of Interactive Activity Cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {activePhase.exercises.map((ex) => {
              const profile = REHAB_ACTIVITY_PROFILES[ex.id];
              if (!profile) return null;
              return (
                <RehabActivityCard
                  key={ex.id}
                  exercise={ex}
                  profile={profile}
                  checkedIds={checklistProgress[ex.id] || []}
                  safetyHaltRequired={safetyStop.haltRequired}
                  onToggleStep={onToggleChecklistStep}
                  onResetChecklist={onResetChecklist}
                  onStartActivity={(id) => setActiveSessionExerciseId(id)}
                  onWatchDemo={(id) => setDemoExerciseId(id)}
                />
              );
            })}
          </div>

          {/* Submit Completed 2-Hr Rehab Block Bar */}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-xs text-slate-400">
              Completed blocks advance Earth Readiness trajectory ({completedSessionsCount} blocks logged)
            </span>
            <button
              type="button"
              onClick={onCompleteSession}
              disabled={safetyStop.haltRequired}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Submit Completed 2-Hr Rehab Block</span>
            </button>
          </div>
        </section>
      </div>

      {/* Interactive Activity Session & Demonstration Modals */}
      <ActivitySessionModal
        open={Boolean(activeSessionExerciseId)}
        exercise={activeSessionExercise}
        profile={activeSessionProfile}
        checkedIds={activeSessionExerciseId ? checklistProgress[activeSessionExerciseId] || [] : []}
        safetyHaltRequired={safetyStop.haltRequired}
        onToggleStep={onToggleChecklistStep}
        onResetChecklist={onResetChecklist}
        onOpenDemo={(id) => {
          setActiveSessionExerciseId(null);
          setDemoExerciseId(id);
        }}
        onClose={() => setActiveSessionExerciseId(null)}
      />

      <ExerciseDemoModal
        open={Boolean(demoExerciseId)}
        exercise={demoExercise}
        profile={demoProfile}
        onClose={() => setDemoExerciseId(null)}
        onStartActivity={(id) => setActiveSessionExerciseId(id)}
      />

      {/* E. EXPANDABLE DETAILED HANDOVER & CLINICAL METRICS */}
      <section className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 backdrop-blur-md">
        <button
          type="button"
          aria-expanded={showDetailedMetrics}
          onClick={() => setShowDetailedMetrics((v) => !v)}
          className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#0b152c]/70"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <div className="text-sm font-bold text-white">
                View Detailed Handover &amp; Clinical Metrics
              </div>
              <div className="text-xs text-slate-400">
                Mission handover deficit breakdown, 5-stage 2-hr block timing, and NHIS baseline targets
              </div>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs font-semibold text-emerald-300">
            <span>{showDetailedMetrics ? 'Hide' : 'Expand'}</span>
            {showDetailedMetrics ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>

        {showDetailedMetrics && (
          <div className="space-y-5 border-t border-cyan-500/20 p-4 md:p-5">
            {/* Handover Deficit Breakdown */}
            <div className="font-mono text-xs">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-emerald-300">
                  Handover Imported: {handover.presetName} (NASA JSC APTP Protocol)
                </span>
                <span className="text-slate-400 tabular-nums">
                  Duration: {handover.missionDurationDays}d · Logs: {flightLogsCount}d · Avg ARED:{' '}
                  {handover.avgAredWorkload}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 tabular-nums">
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                  <span className="block text-[11px] text-slate-400">Muscle Atrophy</span>
                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <span className="text-lg font-bold text-rose-400 whitespace-nowrap md:text-xl">
                      {handover.predictedMuscleAtrophyPercent}%
                    </span>
                    <span className="text-[10px] text-rose-300 whitespace-nowrap">SOLEUS</span>
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Soleus &amp; Lumbar Paraspinals
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                  <span className="block text-[11px] text-slate-400">Bone Density Loss</span>
                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <span className="text-lg font-bold text-amber-400 whitespace-nowrap md:text-xl">
                      {handover.predictedBoneLossPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">BMD</span>
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Femoral Neck &amp; Calcaneus
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                  <span className="block text-[11px] text-slate-400">Orthostatic Risk</span>
                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <span className="text-lg font-bold text-amber-400 whitespace-nowrap md:text-xl">
                      {handover.orthostaticRiskScore}/100
                    </span>
                    <span className="text-[10px] text-amber-300 whitespace-nowrap">POTS</span>
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Fluid Loss Deficit
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
                  <span className="block text-[11px] text-slate-400">Vestibular Ataxia</span>
                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <span className="text-lg font-bold text-rose-400 whitespace-nowrap md:text-xl">
                      {handover.vestibularDisruptionScore}/100
                    </span>
                    <span className="text-[10px] text-rose-300 whitespace-nowrap">SWAY</span>
                  </div>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Otolith-Ocular Lag
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Stage Block Timing + NHIS Reference Targets */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 lg:col-span-7">
                <div className="mb-2.5 font-mono text-xs font-semibold text-slate-300">
                  Standard 2-Hour Block Stage Allocation
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[11px] text-slate-400 tabular-nums">
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
                    <span className="block font-bold text-white">15m</span>
                    Warmup
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
                    <span className="block font-bold text-white">30m</span>
                    Cardio
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
                    <span className="block font-bold text-white">30m</span>
                    Vestib
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
                    <span className="block font-bold text-white">30m</span>
                    Strength
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2">
                    <span className="block font-bold text-white">15m</span>
                    Cool
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#111827] p-4 font-mono text-xs lg:col-span-5">
                <div className="mb-2 font-semibold text-cyan-300">
                  HealthData.gov NHIS Baseline Targets
                </div>
                <ul className="space-y-1.5 text-slate-300 tabular-nums">
                  <li className="flex justify-between">
                    <span className="text-slate-400">VO2 Max Aerobic</span>
                    <span>48.5 mL/kg/min ({readiness.vo2maxRecoveryPercent}%)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Vestibular Balance</span>
                    <span>30s Eyes Closed ({readiness.vestibularRecoveryPercent}%)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Orthostatic Stability</span>
                    <span>10m Stand Test ({readiness.orthostaticTolerancePercent}%)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
