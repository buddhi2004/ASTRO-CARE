import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Eye,
  FileText,
  HeartPulse,
  Info,
  Loader2,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BACKDROP_ASSETS,
  BACKDROP_OPTIONS,
  type BackdropThemeId,
} from '../data/backdropAssets';
import {
  ASTRONAUT_PROFILES,
  buildAstronautTelemetryBundle,
  getBodySystemMeta,
  mapStructureKeyToSystemFocus,
} from '../data/healthTelemetry';
import { ENVIRONMENT_MULTIPLIERS, SUBSYSTEMS_DATA } from '../data/rulesData';
import type {
  AstronautProfileId,
  AtlasCameraView,
  AtlasSex,
  BodySystemFocusKey,
  ChartId,
  DonkiSpaceWeatherEvent,
  EnvironmentKey,
  InFlightLogEntry,
  MissionMode,
  SubsystemKey,
  TimeRangeKey,
  TriageLevel,
  TriageResult,
} from '../types/astral';
import { evaluateSubsystem } from '../engine/ruleEngine';
import { TRIAGE_BADGE_CLASS, TRIAGE_TEXT_CLASS } from '../utils/triageStyles';
import { CompactTrendCard } from './CompactTrendCard';
import { AnalyticsSystemTab, HealthAnalyticsSection } from './HealthAnalyticsSection';
import { SpaceflightHealthOverview } from './SpaceflightHealthOverview';
import { AnatomicalAtlasWorkspace } from './three/AnatomicalAtlasWorkspace';
import { AnimatedProgressRing } from './ui/AnimatedProgressRing';
import { ClinicalTooltip } from './ui/ClinicalTooltip';

interface ModeAWorkspaceProps {
  mode: MissionMode;
  environment: EnvironmentKey;
  backdropTheme: BackdropThemeId;
  activeSubsystem: SubsystemKey;
  subsystemMetrics: Record<SubsystemKey, Record<string, number>>;
  subsystemLevels: Record<SubsystemKey, TriageLevel>;
  triageResult: TriageResult;
  flightLogs: InFlightLogEntry[];
  donkiEvents: DonkiSpaceWeatherEvent[];
  donkiSource: 'LIVE' | 'OFFLINE SIMULATION';
  donkiLoading: boolean;
  audioMuted: boolean;
  onSwitchMode: (mode: MissionMode) => void;
  onChangeBackdropTheme: (theme: BackdropThemeId) => void;
  onOpenPlanModal: () => void;
  onOpenNasaModal: () => void;
  onToggleAudio: () => void;
  onChangeEnvironment: (env: EnvironmentKey) => void;
  onSelectSubsystem: (sub: SubsystemKey) => void;
  onMetricChange: (sub: SubsystemKey, metricId: string, val: number) => void;
  onLoadPresetCase: (caseType: 'nominal' | 'amber' | 'critical') => void;
  onEvaluateTriage: () => void;
  onResetNominal: () => void;
  onSaveDailyLog: (entry: Omit<InFlightLogEntry, 'day' | 'timestamp'>) => void;
  onRefreshDonki: () => void;
}

const HEALTH_SUMMARY_CARDS: Array<{
  key: SubsystemKey;
  title: string;
  defaultStructureKey: string;
  defaultView: AtlasCameraView;
  icon: React.ReactNode;
}> = [
  {
    key: 'cardiovascular',
    title: 'Cardiovascular Health',
    defaultStructureKey: 'heart',
    defaultView: 'front',
    icon: <HeartPulse className="h-4 w-4" />,
  },
  {
    key: 'ocular_sans',
    title: 'Ocular Health (SANS)',
    defaultStructureKey: 'eye_l',
    defaultView: 'front',
    icon: <Eye className="h-4 w-4" />,
  },
  {
    key: 'musculoskeletal',
    title: 'Musculoskeletal Health',
    defaultStructureKey: 'spine_lumbar',
    defaultView: 'back',
    icon: <Dumbbell className="h-4 w-4" />,
  },
  {
    key: 'mood_sleep',
    title: 'Sleep & Mental Well-Being',
    defaultStructureKey: 'brain',
    defaultView: 'front',
    icon: <Brain className="h-4 w-4" />,
  },
];

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

export const ModeAWorkspace: React.FC<ModeAWorkspaceProps> = ({
  mode,
  environment,
  backdropTheme,
  activeSubsystem,
  subsystemMetrics,
  subsystemLevels,
  triageResult,
  flightLogs,
  donkiEvents,
  donkiSource,
  donkiLoading,
  audioMuted,
  onSwitchMode,
  onChangeBackdropTheme,
  onOpenPlanModal,
  onOpenNasaModal,
  onToggleAudio,
  onChangeEnvironment,
  onSelectSubsystem,
  onMetricChange,
  onLoadPresetCase,
  onEvaluateTriage,
  onResetNominal,
  onSaveDailyLog,
  onRefreshDonki,
}) => {
  const [aredInput, setAredInput] = useState<number>(94);
  const [missedInput, setMissedInput] = useState<number>(1);
  const [fluidInput, setFluidInput] = useState<number>(2);
  const [sleepInput, setSleepInput] = useState<number>(7.4);

  const [requestedStructureKey, setRequestedStructureKey] = useState<string | null>('heart');
  const [requestedView, setRequestedView] = useState<AtlasCameraView | null>('front');
  const [requestedSex, setRequestedSex] = useState<AtlasSex | null>(null);

  // Progressive disclosure expandable panels (simple by default, rich on demand)
  const [expandedCardKey, setExpandedCardKey] = useState<SubsystemKey | null>(null);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState<boolean>(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState<boolean>(false);
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [showAllAdvisories, setShowAllAdvisories] = useState<boolean>(false);

  // Telemetry & Analytics State
  const [selectedProfileId, setSelectedProfileId] = useState<AstronautProfileId>('cdr_vance');
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('24h');
  const [bodySystemFocus, setBodySystemFocus] = useState<BodySystemFocusKey>('cardiovascular');
  const [selectedAtlasKey, setSelectedAtlasKey] = useState<string>('heart');
  const [activeChartId, setActiveChartId] = useState<ChartId | null>(null);
  const [requestedAnalyticsTab, setRequestedAnalyticsTab] = useState<AnalyticsSystemTab>('cardiovascular');

  const selectedProfile = useMemo(
    () => ASTRONAUT_PROFILES.find((p) => p.id === selectedProfileId) ?? ASTRONAUT_PROFILES[0],
    [selectedProfileId]
  );

  const telemetryBundle = useMemo(
    () =>
      buildAstronautTelemetryBundle({
        profile: selectedProfile,
        timeRange,
        environment,
        subsystemMetrics,
        flightLogs,
        donkiEvents,
      }),
    [selectedProfile, timeRange, environment, subsystemMetrics, flightLogs, donkiEvents]
  );

  const activeSystemMeta = useMemo(() => {
    const bpChart = telemetryBundle.charts.blood_pressure;
    const latestBp = bpChart.points[bpChart.points.length - 1];
    const spo2Chart = telemetryBundle.charts.blood_oxygen;
    const latestSpo2 = spo2Chart.points[spo2Chart.points.length - 1]?.value ?? 98.4;
    const respChart = telemetryBundle.charts.respiratory_rate;
    const latestResp = respChart.points[respChart.points.length - 1]?.value ?? 14.5;
    const tempChart = telemetryBundle.charts.body_temperature;
    const latestTemp = tempChart.points[tempChart.points.length - 1]?.value ?? 36.7;
    return getBodySystemMeta(
      bodySystemFocus,
      subsystemMetrics,
      telemetryBundle.cumulativeRadiationMSv,
      telemetryBundle.dailyRadiationMSv,
      latestTemp,
      latestSpo2,
      latestResp,
      latestBp?.value ?? 116,
      latestBp?.secondaryValue ?? 74
    );
  }, [bodySystemFocus, subsystemMetrics, telemetryBundle]);

  // Subsystem evaluations & Overall Health Stability Score
  const subsystemEvals = useMemo(() => {
    const map = {} as Record<SubsystemKey, TriageResult>;
    (Object.keys(SUBSYSTEMS_DATA) as SubsystemKey[]).forEach((subKey) => {
      map[subKey] = evaluateSubsystem(subKey, subsystemMetrics[subKey], environment);
    });
    return map;
  }, [subsystemMetrics, environment]);

  // Overall Health Status (1 prominent indicator + stability score)
  const overallStatus = useMemo(() => {
    const allLevels = Object.values(subsystemLevels);
    const redCount = allLevels.filter((l) => l === 'RED').length;
    const amberCount = allLevels.filter((l) => l === 'AMBER').length;
    const avgRisk =
      Object.values(subsystemEvals).reduce((acc, ev) => acc + ev.riskScore, 0) /
      Math.max(1, Object.values(subsystemEvals).length);
    const stabilityPercent = Math.max(5, Math.min(100, Math.round(100 - avgRisk)));

    if (redCount > 0) {
      return {
        level: 'RED' as TriageLevel,
        label: 'Critical',
        summary: `${redCount} system requires immediate attention`,
        stabilityPercent,
      };
    }
    if (amberCount > 0) {
      return {
        level: 'AMBER' as TriageLevel,
        label: 'Needs Attention',
        summary: `${amberCount} system flagged for monitoring`,
        stabilityPercent,
      };
    }
    return {
      level: 'GREEN' as TriageLevel,
      label: 'Normal',
      summary: 'All 4 monitored systems nominal',
      stabilityPercent,
    };
  }, [subsystemLevels, subsystemEvals]);

  // Compact Important Alerts (only warnings / critical notifications by default)
  const importantAlerts = useMemo(() => {
    const items: Array<{
      id: string;
      level: TriageLevel;
      title: string;
      detail: string;
      subsystem?: SubsystemKey;
      isDonki?: boolean;
    }> = [];

    (Object.keys(SUBSYSTEMS_DATA) as SubsystemKey[]).forEach((subKey) => {
      const ev = evaluateSubsystem(subKey, subsystemMetrics[subKey], environment);
      if (ev.level === 'RED' || ev.level === 'AMBER' || showAllAdvisories) {
        items.push({
          id: `sub-${subKey}`,
          level: ev.level,
          title: ev.title,
          detail: ev.clinicalAction,
          subsystem: subKey,
        });
      }
    });

    const elevatedDonki = donkiEvents.filter((ev) =>
      ev.radiationRiskLevel.toUpperCase().includes('ELEVATED')
    );
    elevatedDonki.slice(0, 1).forEach((ev) => {
      items.push({
        id: `donki-${ev.activityID}`,
        level: 'AMBER',
        title: `Space Weather Watch: ${ev.radiationRiskLevel}`,
        detail: ev.evaAdvisory,
        isDonki: true,
      });
    });

    // Sort RED before AMBER before GREEN
    const rank: Record<TriageLevel, number> = { RED: 0, AMBER: 1, GREEN: 2 };
    return items.sort((a, b) => rank[a.level] - rank[b.level]);
  }, [subsystemMetrics, environment, donkiEvents, showAllAdvisories]);

  // Primary compact trend chart corresponding to active body focus
  const compactTrendChart = useMemo(() => {
    if (bodySystemFocus === 'respiratory') return telemetryBundle.charts.blood_oxygen;
    if (bodySystemFocus === 'musculoskeletal') return telemetryBundle.charts.radiation_exposure;
    if (bodySystemFocus === 'whole_body') return telemetryBundle.charts.body_temperature;
    return telemetryBundle.charts.heart_rate;
  }, [bodySystemFocus, telemetryBundle]);

  const envInfo = ENVIRONMENT_MULTIPLIERS[environment];
  const activeSubDef = SUBSYSTEMS_DATA[activeSubsystem];
  const activeValues = subsystemMetrics[activeSubsystem];

  const getSummaryMetricDisplay = (key: SubsystemKey): string => {
    const m = subsystemMetrics[key];
    if (key === 'cardiovascular') return `${m.resting_heart_rate ?? 74} bpm`;
    if (key === 'ocular_sans') return `${m.onsd_diameter ?? 5.7} mm ONSD`;
    if (key === 'musculoskeletal') return `${m.ared_compliance ?? 94}% ARED`;
    return `${m.sleep_hours ?? 7.2} hrs sleep`;
  };

  const handleSelectSummaryCard = (key: SubsystemKey, structureKey: string, view: AtlasCameraView) => {
    onSelectSubsystem(key);
    setRequestedStructureKey(structureKey);
    setRequestedView(view);
    setSelectedAtlasKey(structureKey);
    setBodySystemFocus(mapStructureKeyToSystemFocus(structureKey));
  };

  const handleFocusFromAtlas = (sub: SubsystemKey) => {
    onSelectSubsystem(sub);
    setShowDetailedMetrics(true);
    setTimeout(() => {
      document.getElementById('section-triage-drawer')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

  const handleAtlasStructureSelected = (key: string) => {
    setSelectedAtlasKey(key);
    setBodySystemFocus(mapStructureKeyToSystemFocus(key));
    setActiveChartId(null);
  };

  const handleSelectSystemFocus = (focus: BodySystemFocusKey) => {
    setBodySystemFocus(focus);
    setActiveChartId(null);
    const target = getBodySystemMeta(
      focus,
      subsystemMetrics,
      telemetryBundle.cumulativeRadiationMSv,
      telemetryBundle.dailyRadiationMSv,
      36.7,
      98.4,
      14.5,
      116,
      74
    );
    setRequestedStructureKey(target.structureKey);
    setRequestedView(target.cameraView);
    setSelectedAtlasKey(target.structureKey);
  };

  const handleSelectOverviewCard = (chartId: ChartId, focus: BodySystemFocusKey) => {
    setActiveChartId(chartId);
    handleSelectSystemFocus(focus);
    const tabMap: Record<ChartId, AnalyticsSystemTab> = {
      heart_rate: 'cardiovascular',
      blood_pressure: 'cardiovascular',
      blood_oxygen: 'respiratory',
      respiratory_rate: 'respiratory',
      body_temperature: 'temperature',
      radiation_exposure: 'radiation',
    };
    setRequestedAnalyticsTab(tabMap[chartId]);
    setShowDetailedAnalysis(true);
    setTimeout(() => {
      document.getElementById('section-health-analytics')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

  const handleChangeProfile = (id: AstronautProfileId) => {
    setSelectedProfileId(id);
    const prof = ASTRONAUT_PROFILES.find((p) => p.id === id);
    if (prof) {
      setRequestedSex(prof.sex);
    }
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDailyLog({
      daily_ared_load: aredInput,
      missed_workouts: missedInput,
      cephalad_fluid_shift_index: fluidInput,
      sleep_duration: sleepInput,
    });
  };

  const overallColors = getStatusColorClasses(overallStatus.level);

  return (
    <div className="space-y-6">
      {/* A. MISSION OVERVIEW */}
      <section
        aria-label="Mission Overview"
        className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#060d1f]/80 p-4 shadow-lg backdrop-blur-md md:p-5"
      >
        {/* ISS Cupola Orbital Observation Window Background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 scale-[1.02] bg-cover bg-center opacity-70"
            style={{ backgroundImage: `url("${BACKDROP_ASSETS.issCupolaOrbit}")` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(4, 10, 26, 0.78) 0%, rgba(6, 15, 36, 0.42) 52%, rgba(4, 9, 24, 0.76) 100%)',
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Mode Switcher + Context */}
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
                Mission Day {selectedProfile.missionDay} · {selectedProfile.callsign} {selectedProfile.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Select crew profile"
                value={selectedProfileId}
                onChange={(e) => handleChangeProfile(e.target.value as AstronautProfileId)}
                className="min-h-[38px] rounded-xl border border-cyan-500/25 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                {ASTRONAUT_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.callsign} · {p.name} (MD {p.missionDay})
                  </option>
                ))}
              </select>

              <select
                id="env-selector"
                aria-label="Select mission environment"
                value={environment}
                onChange={(e) => onChangeEnvironment(e.target.value as EnvironmentKey)}
                className="min-h-[38px] rounded-xl border border-cyan-500/25 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs text-cyan-300 focus:border-cyan-400 focus:outline-none"
              >
                {Object.values(ENVIRONMENT_MULTIPLIERS).map((env) => (
                  <option key={env.key} value={env.key}>
                    {env.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select dashboard background"
                value={backdropTheme}
                onChange={(e) => onChangeBackdropTheme(e.target.value as BackdropThemeId)}
                className="min-h-[38px] rounded-xl border border-cyan-500/25 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                {BACKDROP_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Prominent Overall Health Status Indicator + Quiet Utilities */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div
              data-testid="overall-health-status"
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2 backdrop-blur-md ${overallColors.badge}`}
            >
              <AnimatedProgressRing
                percent={overallStatus.stabilityPercent}
                level={overallStatus.level}
                size={46}
                strokeWidth={4}
              />
              <div>
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider opacity-85">
                  {overallStatus.level === 'GREEN' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Overall Health Status</span>
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
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-[#0b152c]/90 px-3 py-2 font-mono text-xs font-semibold text-cyan-300 transition-colors hover:border-cyan-400/60 hover:text-white whitespace-nowrap"
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
      <section aria-label="Health Summary">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">
              Health Summary
            </h2>
            <ClinicalTooltip term="IJV" />
          </div>
          <span className="text-xs text-slate-400">
            Click a card to inspect on the 3D body model or expand measurements
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {HEALTH_SUMMARY_CARDS.map((card) => {
            const level = subsystemLevels[card.key];
            const ev = subsystemEvals[card.key];
            const stabilityPct = Math.max(5, Math.min(100, Math.round(100 - ev.riskScore)));
            const isSelected = activeSubsystem === card.key;
            const isExpanded = expandedCardKey === card.key;
            const statusStyle = getStatusColorClasses(level);
            const statusSymbol = level === 'RED' ? '!' : level === 'AMBER' ? '▲' : '●';
            const subDef = SUBSYSTEMS_DATA[card.key];
            const subValues = subsystemMetrics[card.key];
            const tooltipTerm =
              card.key === 'cardiovascular'
                ? 'IJV'
                : card.key === 'ocular_sans'
                  ? 'SANS'
                  : card.key === 'musculoskeletal'
                    ? 'ARED'
                    : null;

            return (
              <div
                key={card.key}
                className={`flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-cyan-400/80 bg-[#0b1834]/80 shadow-[0_8px_28px_-12px_rgba(34,211,238,0.45)]'
                    : `${statusStyle.cardBorder} bg-[#070f22]/68 hover:border-cyan-400/50`
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSummaryCard(card.key, card.defaultStructureKey, card.defaultView)
                    }
                    className="group flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-medium text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
                  >
                    <span className="text-cyan-300 shrink-0">{card.icon}</span>
                    <span className="truncate group-hover:text-white">{card.title}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {tooltipTerm && <ClinicalTooltip term={tooltipTerm} />}
                    <span className={`text-xs font-semibold ${statusStyle.text}`}>
                      <span aria-hidden="true" className="mr-1">{statusSymbol}</span>
                      {getSimpleStatusLabel(level)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectSummaryCard(card.key, card.defaultStructureKey, card.defaultView)
                  }
                  className="mt-3 flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
                >
                  <div>
                    <div className="font-mono text-lg font-bold text-white tabular-nums">
                      {getSummaryMetricDisplay(card.key)}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-cyan-300">
                      Focus 3D Anatomy →
                    </div>
                  </div>

                  <AnimatedProgressRing
                    percent={stabilityPct}
                    level={level}
                    size={48}
                    strokeWidth={4}
                    sublabel="STAB"
                  />
                </button>

                <div className="mt-3 flex items-center justify-between border-t border-cyan-500/15 pt-2">
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                    Risk {ev.riskScore}/100
                  </span>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedCardKey((prev) => (prev === card.key ? null : card.key))
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-cyan-300 hover:text-white"
                  >
                    <span>{isExpanded ? 'Hide Metrics' : 'Measurements'}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 space-y-1.5 rounded-xl border border-cyan-500/20 bg-[#040917]/80 p-2.5 font-mono text-[11px] tabular-nums">
                    {subDef.metrics.map((m) => {
                      const val = subValues[m.id] ?? m.defaultValue;
                      const outOfNormal = val < m.normalRange[0] || val > m.normalRange[1];
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-2">
                          <span className="truncate text-slate-400" title={m.label}>
                            {m.label}
                          </span>
                          <span
                            className={`shrink-0 font-bold ${
                              outOfNormal ? 'text-amber-300' : 'text-emerald-300'
                            }`}
                          >
                            {val} {m.unit}
                          </span>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleFocusFromAtlas(card.key)}
                      className="mt-1.5 w-full rounded-lg border border-cyan-500/30 bg-[#0b152c] py-1 text-center font-mono text-[10px] font-semibold text-cyan-300 hover:border-cyan-400 hover:text-white"
                    >
                      Adjust Sliders in Self-Exam Controls
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* C. IMPORTANT ALERTS (Compact, Warnings & Critical Only by Default) */}
      <section
        aria-label="Important Alerts"
        className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/68 p-4 backdrop-blur-md"
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
            className="font-mono text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            {showAllAdvisories ? 'Warnings Only' : 'Show All Advisories'}
          </button>
        </div>

        {importantAlerts.length === 0 ? (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Normal — No warnings or critical alerts detected across monitored systems.</span>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {importantAlerts.slice(0, showAllAdvisories ? 5 : 3).map((alert) => {
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

                  <button
                    type="button"
                    onClick={() => {
                      if (alert.isDonki) {
                        setShowMoreInfo(true);
                        setTimeout(() => {
                          document.getElementById('section-space-weather')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }, 60);
                      } else if (alert.subsystem) {
                        handleFocusFromAtlas(alert.subsystem);
                      }
                    }}
                    className="shrink-0 self-start rounded-lg border border-cyan-500/30 bg-[#070f22] px-3 py-1.5 font-mono text-[11px] font-semibold text-cyan-300 hover:border-cyan-400/60 hover:text-white sm:self-center"
                  >
                    Inspect
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* D. OVERALL HEALTH VISUALIZATION (Central 3D Human Body Model + 1 Clean Compact Trend) */}
      <AnatomicalAtlasWorkspace
        mode="flight"
        environment={environment}
        subsystemMetrics={subsystemMetrics}
        subsystemLevels={subsystemLevels}
        flightLogs={flightLogs}
        onFocusModeASubsystem={handleFocusFromAtlas}
        requestedStructureKey={requestedStructureKey}
        requestedView={requestedView}
        requestedSex={requestedSex}
        onSelectStructureKey={handleAtlasStructureSelected}
      />

      <CompactTrendCard
        bundle={compactTrendChart}
        flightLogs={flightLogs}
        onExpandAnalysis={() => {
          setShowDetailedAnalysis(true);
          setTimeout(() => {
            document.getElementById('section-health-analytics')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 60);
        }}
      />

      {/* E. ON-DEMAND EXPANDABLE SECTIONS */}
      <div className="space-y-3">
        {/* 1. Expandable: View Detailed Metrics & Self-Exam Controls */}
        <section className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 backdrop-blur-md">
          <button
            type="button"
            aria-expanded={showDetailedMetrics}
            onClick={() => setShowDetailedMetrics((v) => !v)}
            className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#0b152c]/70"
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">
                  View Detailed Metrics &amp; Self-Exam Controls
                </div>
                <div className="text-xs text-slate-400">
                  Ultrasound probe placement, manual telemetry sliders, triage rules, and daily flight logger
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300 shrink-0">
              <span>{showDetailedMetrics ? 'Hide' : 'Expand'}</span>
              {showDetailedMetrics ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          {showDetailedMetrics && (
            <div className="border-t border-cyan-500/20 p-4 md:p-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                {/* Self-Exam & Triage Drawer (6 Cols) */}
                <section
                  id="section-triage-drawer"
                  className="scroll-mt-16 md:scroll-mt-20 rounded-2xl border border-cyan-500/20 bg-[#040917]/90 p-4 md:p-5 lg:col-span-6"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        {activeSubDef.examType}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-white md:text-lg">
                        {activeSubDef.name}
                      </h3>
                    </div>
                    <div
                      className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold ${
                        TRIAGE_BADGE_CLASS[triageResult.level]
                      }`}
                    >
                      {getSimpleStatusLabel(triageResult.level)} ({triageResult.level})
                    </div>
                  </div>

                  {/* 4 Subsystem Filter Buttons */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {HEALTH_SUMMARY_CARDS.map((btn) => {
                      const isSelected = activeSubsystem === btn.key;
                      const lvl = subsystemLevels[btn.key];
                      return (
                        <button
                          key={btn.key}
                          type="button"
                          onClick={() =>
                            handleSelectSummaryCard(btn.key, btn.defaultStructureKey, btn.defaultView)
                          }
                          className={`flex min-h-[44px] items-center justify-between gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium transition-colors sm:px-3 sm:text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/60 text-white'
                              : 'border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            {btn.icon}
                            <span className="truncate">{btn.title}</span>
                          </span>
                          <span
                            className={`shrink-0 font-mono text-[10px] font-bold ${TRIAGE_TEXT_CLASS[lvl]}`}
                          >
                            {lvl}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Probe Placement Guide */}
                  <div className="mb-4 rounded-xl border border-slate-800 bg-[#111827] p-3.5 text-xs">
                    <div className="font-mono font-semibold text-cyan-300">
                      Non-Physician Guidance &amp; Probe Placement
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-300">
                      {activeSubDef.probePlacement}. Target anatomy: {activeSubDef.targetAnatomy}.
                    </p>
                  </div>

                  {/* Metric Sliders */}
                  <div className="mb-5 space-y-3.5">
                    {activeSubDef.metrics.map((m) => {
                      const currentVal = activeValues[m.id] ?? m.defaultValue;
                      const inputId = `metric-${activeSubsystem}-${m.id}`;
                      return (
                        <div
                          key={m.id}
                          className="rounded-xl border border-slate-800 bg-[#111827] p-3.5"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2 font-mono text-xs">
                            <label htmlFor={inputId} className="font-semibold text-slate-200">
                              {m.label}
                            </label>
                            <span className="font-bold text-cyan-300 tabular-nums">
                              {currentVal} {m.unit}
                            </span>
                          </div>
                          <input
                            id={inputId}
                            type="range"
                            min={m.min}
                            max={m.max}
                            step={m.step}
                            value={currentVal}
                            onChange={(e) =>
                              onMetricChange(activeSubsystem, m.id, Number(e.target.value))
                            }
                            className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 md:h-2"
                          />
                          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-400 tabular-nums">
                            <span>
                              Nominal: {m.normalRange[0]}–{m.normalRange[1]} {m.unit}
                            </span>
                            <span className="text-rose-400">
                              Critical: {m.invertDirection ? '≤' : '≥'} {m.criticalThreshold}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sample Case Presets + Evaluate CTA */}
                  <div className="flex flex-col gap-3 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
                      <button
                        type="button"
                        onClick={() => onLoadPresetCase('nominal')}
                        className="min-h-[44px] rounded-xl border border-slate-700 bg-[#111827] px-3 font-mono text-xs text-slate-200 hover:bg-slate-800"
                      >
                        Nominal
                      </button>
                      <button
                        type="button"
                        onClick={() => onLoadPresetCase('amber')}
                        className="min-h-[44px] rounded-xl border border-amber-700/60 bg-[#111827] px-3 font-mono text-xs text-amber-300 hover:bg-slate-800"
                      >
                        Precaution
                      </button>
                      <button
                        type="button"
                        onClick={() => onLoadPresetCase('critical')}
                        className="min-h-[44px] rounded-xl border border-rose-700/60 bg-[#111827] px-3 font-mono text-xs text-rose-300 hover:bg-slate-800"
                      >
                        Critical
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onEvaluateTriage}
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-cyan-500"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Evaluate Local Triage</span>
                    </button>
                  </div>

                  {/* Advisory Box */}
                  <div
                    className={`mt-4 rounded-xl border p-4 text-xs ${
                      triageResult.level === 'RED'
                        ? 'border-rose-700/70 bg-rose-950/25 text-rose-100'
                        : triageResult.level === 'AMBER'
                          ? 'border-amber-700/70 bg-amber-950/25 text-amber-100'
                          : 'border-emerald-700/70 bg-emerald-950/25 text-emerald-100'
                    }`}
                  >
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 font-mono">
                      <span className="font-bold">{triageResult.title}</span>
                      <span className="text-[11px] opacity-90">
                        Risk Score: {triageResult.riskScore}/100
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-200">{triageResult.clinicalAction}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
                    <span>NASA Medical Directive 44-A Compliant</span>
                    <button
                      type="button"
                      onClick={onResetNominal}
                      className="inline-flex min-h-[40px] items-center gap-1.5 font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Nominal Baseline</span>
                    </button>
                  </div>
                </section>

                {/* Daily In-Flight Biomechanical & Sleep Logger (6 Cols) */}
                <section
                  id="section-daily-logger"
                  className="scroll-mt-16 md:scroll-mt-20 rounded-2xl border border-cyan-500/20 bg-[#040917]/90 p-4 md:p-5 lg:col-span-6"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white md:text-base">
                        Daily In-Flight Biomechanical &amp; Sleep Logger
                      </h3>
                      <p className="text-xs text-slate-400">
                        Metrics saved here automatically calibrate post-flight Earth recovery.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                      {flightLogs.length} Days Logged
                    </span>
                  </div>

                  <form onSubmit={handleLogSubmit}>
                    <div className="mb-4 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
                      <div>
                        <label htmlFor="log-ared" className="mb-1 block text-slate-400">
                          ARED Load (%)
                        </label>
                        <input
                          id="log-ared"
                          type="number"
                          min={40}
                          max={120}
                          value={aredInput}
                          onChange={(e) => setAredInput(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-white tabular-nums focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="log-missed" className="mb-1 block text-slate-400">
                          Missed (7d)
                        </label>
                        <input
                          id="log-missed"
                          type="number"
                          min={0}
                          max={10}
                          value={missedInput}
                          onChange={(e) => setMissedInput(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-white tabular-nums focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="log-fluid" className="mb-1 block text-slate-400">
                          Fluid Shift (1–5)
                        </label>
                        <input
                          id="log-fluid"
                          type="number"
                          min={1}
                          max={5}
                          value={fluidInput}
                          onChange={(e) => setFluidInput(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-white tabular-nums focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="log-sleep" className="mb-1 block text-slate-400">
                          Sleep (hrs)
                        </label>
                        <input
                          id="log-sleep"
                          type="number"
                          step={0.1}
                          min={3}
                          max={12}
                          value={sleepInput}
                          onChange={(e) => setSleepInput(Number(e.target.value))}
                          className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-white tabular-nums focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-mono text-xs text-slate-400">
                        Syncs locally to handover archive
                      </span>
                      <button
                        type="submit"
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-emerald-500"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Log to Flight Archive</span>
                      </button>
                    </div>
                  </form>

                  {/* Recent Logged Days Strip */}
                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <div className="mb-2 font-mono text-[11px] text-slate-400">
                      Recent Archive Entries
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums sm:grid-cols-4">
                      {flightLogs.slice(-4).map((entry) => (
                        <div
                          key={entry.day}
                          className="rounded-lg border border-slate-800 bg-[#111827] p-2"
                        >
                          <div className="font-bold text-cyan-300">Day {entry.day}</div>
                          <div className="text-slate-300">ARED {entry.daily_ared_load}%</div>
                          <div className="text-slate-400">
                            FS {entry.cephalad_fluid_shift_index} · {entry.sleep_duration}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </section>

        {/* 2. Expandable: View Analysis & Telemetry Charts */}
        <section className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 backdrop-blur-md">
          <button
            type="button"
            aria-expanded={showDetailedAnalysis}
            onClick={() => setShowDetailedAnalysis((v) => !v)}
            className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#0b152c]/70"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">
                  View Analysis &amp; Telemetry Charts
                </div>
                <div className="text-xs text-slate-400">
                  Interactive time-series graphs (HR, SpO2, BP, Resp, Temp, Radiation) and AI trend insights
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300 shrink-0">
              <span>{showDetailedAnalysis ? 'Hide' : 'Expand'}</span>
              {showDetailedAnalysis ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          {showDetailedAnalysis && (
            <div className="space-y-5 border-t border-cyan-500/20 p-4 md:p-5">
              <SpaceflightHealthOverview
                profile={selectedProfile}
                cards={telemetryBundle.overviewCards}
                activeChartId={activeChartId}
                onChangeProfile={handleChangeProfile}
                onSelectCard={handleSelectOverviewCard}
              />

              <HealthAnalyticsSection
                telemetry={telemetryBundle}
                systemFocus={bodySystemFocus}
                systemMeta={activeSystemMeta}
                selectedAtlasKey={selectedAtlasKey}
                activeChartId={activeChartId}
                timeRange={timeRange}
                requestedTab={requestedAnalyticsTab}
                onChangeTimeRange={setTimeRange}
                onSelectSystemFocus={handleSelectSystemFocus}
              />
            </div>
          )}
        </section>

        {/* 3. Expandable: More Information (NASA DONKI Space Weather & Environment Specs) */}
        <section className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 backdrop-blur-md">
          <button
            type="button"
            aria-expanded={showMoreInfo}
            onClick={() => setShowMoreInfo((v) => !v)}
            className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#0b152c]/70"
          >
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">
                  More Information · Space Weather (DONKI) &amp; Environment
                </div>
                <div className="text-xs text-slate-400">
                  Live NASA DONKI solar events ({donkiSource}) and environmental physiological multipliers
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300 shrink-0">
              <span>{showMoreInfo ? 'Hide' : 'Expand'}</span>
              {showMoreInfo ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>

          {showMoreInfo && (
            <div className="space-y-4 border-t border-cyan-500/20 p-4 md:p-5">
              <div className="rounded-xl border border-cyan-500/20 bg-[#0b152c]/85 p-3.5 font-mono text-xs text-slate-300 tabular-nums">
                <span className="font-bold text-cyan-300">Active Environment:</span> {envInfo.description} · Daily muscle atrophy baseline: {envInfo.muscleAtrophyRatePerDay}%/day · Radiation factor: {envInfo.radiationFactor}x
              </div>

              <section
                id="section-space-weather"
                className="relative overflow-hidden scroll-mt-16 md:scroll-mt-20 rounded-2xl border border-cyan-500/25 bg-[#040917] p-4 md:p-5"
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                  <div
                    className="absolute inset-0 scale-[1.02] bg-cover bg-center opacity-65"
                    style={{ backgroundImage: `url("${BACKDROP_ASSETS.deepSpaceNebula}")` }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(4, 9, 23, 0.78) 0%, rgba(6, 14, 34, 0.50) 55%, rgba(3, 7, 20, 0.80) 100%)',
                    }}
                  />
                </div>
                <div className="relative z-10">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white md:text-base">
                      NASA DONKI Space Weather Radar
                    </h3>
                    <ClinicalTooltip term="DONKI" />
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-400">{donkiSource}</span>
                    <button
                      type="button"
                      onClick={onRefreshDonki}
                      disabled={donkiLoading}
                      className="inline-flex min-h-[40px] items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${donkiLoading ? 'animate-spin' : ''}`} />
                      <span>{donkiLoading ? 'Syncing' : 'Refresh Live'}</span>
                    </button>
                  </div>
                </div>

                {donkiLoading ? (
                  <div className="flex items-center justify-center gap-2.5 rounded-xl border border-cyan-500/15 bg-[#0b152c]/70 py-8 font-mono text-xs text-cyan-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synchronizing NASA DONKI solar flare &amp; CME telemetry...</span>
                  </div>
                ) : donkiEvents.length === 0 ? (
                  <div className="rounded-xl border border-cyan-500/15 bg-[#0b152c]/70 py-6 text-center font-mono text-xs text-slate-300">
                    No active coronal mass ejection alerts detected in the current orbital window.
                  </div>
                ) : (
                  <div className="space-y-2.5 font-mono text-xs">
                    {donkiEvents.map((ev) => (
                      <div
                        key={ev.activityID}
                        className="rounded-xl border border-cyan-500/15 bg-[#0b152c]/85 p-3.5"
                      >
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-white">{ev.activityID}</span>
                          <span
                            className={
                              ev.radiationRiskLevel.includes('ELEVATED')
                                ? 'font-semibold text-amber-400'
                                : 'font-semibold text-cyan-300'
                            }
                          >
                            {ev.radiationRiskLevel}
                          </span>
                        </div>
                        <p className="mb-2 leading-relaxed text-slate-300">{ev.note}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cyan-500/15 pt-2 text-[11px] text-slate-400">
                          <span>Instrument: {ev.instruments[0]?.displayName || 'GOES/SOHO'}</span>
                          <span className="text-amber-300">Advisory: {ev.evaAdvisory}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
