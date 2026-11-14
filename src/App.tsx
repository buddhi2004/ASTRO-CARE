import React, { useEffect, useMemo, useState } from 'react';
import {
  type BackdropThemeId,
  resolveDashboardBackdrop,
} from './data/backdropAssets';
import { DeveloperFooter } from './components/DeveloperFooter';
import { HeaderNav } from './components/HeaderNav';
import { MissionPlanModal } from './components/MissionPlanModal';
import { MobileMoreSheet } from './components/MobileMoreSheet';
import { ModeAWorkspace } from './components/ModeAWorkspace';
import { ModeBWorkspace } from './components/ModeBWorkspace';
import { NasaDonkiModal } from './components/NasaDonkiModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SecondaryPages } from './components/SecondaryPages';
import { POST_FLIGHT_PHASES, SUBSYSTEMS_DATA } from './data/rulesData';
import { REHAB_ACTIVITY_PROFILES } from './data/rehabActivitiesData';
import {
  calculateEarthReadiness,
  calculateHandoverMetrics,
  evaluateSafetyStop,
  evaluateSubsystem,
  getActiveRehabPhase,
} from './engine/ruleEngine';
import { missionAudio } from './services/audioService';
import { NasaSpaceWeatherService } from './services/nasaApi';
import type {
  DonkiSpaceWeatherEvent,
  EnvironmentKey,
  InFlightLogEntry,
  MissionMode,
  MissionPresetKey,
  PageTab,
  SubsystemKey,
  TriageLevel,
} from './types/astral';

const FLIGHT_LOGS_STORAGE_KEY = 'astrocare_flight_logs';
const LEGACY_FLIGHT_LOGS_STORAGE_KEY = 'astral_med_flight_logs';
const REHAB_CHECKLIST_STORAGE_KEY = 'astrocare_rehab_checklist_v1';
const BACKDROP_THEME_STORAGE_KEY = 'astrocare_backdrop_theme_v1';

function loadStoredBackdropTheme(): BackdropThemeId {
  try {
    const raw = localStorage.getItem(BACKDROP_THEME_STORAGE_KEY);
    if (
      raw === 'auto' ||
      raw === 'cupola' ||
      raw === 'nebula' ||
      raw === 'nasa' ||
      raw === 'earth'
    ) {
      return raw;
    }
    return 'auto';
  } catch {
    return 'auto';
  }
}

function loadStoredChecklistProgress(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(REHAB_CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function deriveCompletedExercisesFromProgress(progress: Record<string, string[]>): Set<string> {
  const completed = new Set<string>();
  Object.entries(REHAB_ACTIVITY_PROFILES).forEach(([exId, profile]) => {
    const checked = progress[exId] || [];
    if (profile.checklist.length > 0 && profile.checklist.every((s) => checked.includes(s.id))) {
      completed.add(exId);
    }
  });
  return completed;
}

const DEFAULT_LOGS: InFlightLogEntry[] = [
  { day: 1, daily_ared_load: 96, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.5 },
  { day: 2, daily_ared_load: 92, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.2 },
  { day: 3, daily_ared_load: 88, missed_workouts: 1, cephalad_fluid_shift_index: 3, sleep_duration: 6.8 },
  { day: 4, daily_ared_load: 95, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.4 },
  { day: 5, daily_ared_load: 90, missed_workouts: 0, cephalad_fluid_shift_index: 3, sleep_duration: 7.1 },
  { day: 6, daily_ared_load: 98, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.8 },
  { day: 7, daily_ared_load: 94, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.3 },
];

function createInitialMetrics(): Record<SubsystemKey, Record<string, number>> {
  const result = {} as Record<SubsystemKey, Record<string, number>>;
  (Object.keys(SUBSYSTEMS_DATA) as SubsystemKey[]).forEach((subKey) => {
    const map: Record<string, number> = {};
    SUBSYSTEMS_DATA[subKey].metrics.forEach((m) => {
      map[m.id] = m.defaultValue;
    });
    result[subKey] = map;
  });
  return result;
}

function loadStoredLogs(): InFlightLogEntry[] {
  try {
    const raw =
      localStorage.getItem(FLIGHT_LOGS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_FLIGHT_LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FLIGHT_LOGS_STORAGE_KEY, JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LOGS;
  } catch {
    return DEFAULT_LOGS;
  }
}

export default function App() {
  const autostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [activeTab, setActiveTab] = useState<PageTab>('home');
  const [mode, setMode] = useState<MissionMode>('flight');
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(!autostart);
  const [planModalOpen, setPlanModalOpen] = useState<boolean>(false);
  const [nasaModalOpen, setNasaModalOpen] = useState<boolean>(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState<boolean>(false);
  const [developersExpanded, setDevelopersExpanded] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backdropTheme, setBackdropTheme] = useState<BackdropThemeId>(loadStoredBackdropTheme);

  // Mode A State
  const [environment, setEnvironment] = useState<EnvironmentKey>('microgravity');
  const [activeSubsystem, setActiveSubsystem] = useState<SubsystemKey>('cardiovascular');
  const [subsystemMetrics, setSubsystemMetrics] = useState<Record<SubsystemKey, Record<string, number>>>(
    createInitialMetrics
  );
  const [flightLogs, setFlightLogs] = useState<InFlightLogEntry[]>(loadStoredLogs);

  // NASA DONKI State
  const [nasaService] = useState(() => new NasaSpaceWeatherService('DEMO_KEY'));
  const [donkiEvents, setDonkiEvents] = useState<DonkiSpaceWeatherEvent[]>([]);
  const [donkiSource, setDonkiSource] = useState<'LIVE' | 'OFFLINE SIMULATION'>('OFFLINE SIMULATION');
  const [donkiLoading, setDonkiLoading] = useState<boolean>(false);

  // Mode B State
  const [missionPreset, setMissionPreset] = useState<MissionPresetKey>('standard_iss_180d');
  const [currentDay, setCurrentDay] = useState<number>(3);
  const [dizzinessScore, setDizzinessScore] = useState<number>(2);
  const [painScore, setPainScore] = useState<number>(1);
  const [checklistProgress, setChecklistProgress] = useState<Record<string, string[]>>(
    loadStoredChecklistProgress
  );
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(() =>
    deriveCompletedExercisesFromProgress(loadStoredChecklistProgress())
  );
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const refreshDonki = async () => {
    setDonkiLoading(true);
    const res = await nasaService.fetchCMEEvents();
    setDonkiEvents(res.events);
    setDonkiSource(res.source);
    setDonkiLoading(false);
  };

  useEffect(() => {
    void refreshDonki();
  }, []);

  // Derived Clinical Computations
  const subsystemLevels = useMemo(() => {
    const levels = {} as Record<SubsystemKey, TriageLevel>;
    (Object.keys(SUBSYSTEMS_DATA) as SubsystemKey[]).forEach((key) => {
      levels[key] = evaluateSubsystem(key, subsystemMetrics[key], environment).level;
    });
    return levels;
  }, [subsystemMetrics, environment]);

  const activeTriageResult = useMemo(
    () => evaluateSubsystem(activeSubsystem, subsystemMetrics[activeSubsystem], environment),
    [activeSubsystem, subsystemMetrics, environment]
  );

  const handoverMetrics = useMemo(
    () => calculateHandoverMetrics(flightLogs, missionPreset),
    [flightLogs, missionPreset]
  );

  const earthReadiness = useMemo(
    () => calculateEarthReadiness(currentDay, handoverMetrics, completedSessionsCount),
    [currentDay, handoverMetrics, completedSessionsCount]
  );

  const activePhase = useMemo(() => getActiveRehabPhase(currentDay), [currentDay]);

  const safetyStop = useMemo(
    () => evaluateSafetyStop(painScore, dizzinessScore),
    [painScore, dizzinessScore]
  );

  // Handlers
  const handleSelectTab = (tab: PageTab) => {
    missionAudio.playBeep(700);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMissionModeFromGate = (selectedMode: MissionMode) => {
    missionAudio.playSuccess();
    setMode(selectedMode);
    setActiveTab('home');
    setOnboardingOpen(false);
    setPlanModalOpen(true);
  };

  const handleQuickSwitchMode = (nextMode: MissionMode) => {
    missionAudio.playBeep(nextMode === 'flight' ? 720 : 880);
    setMode(nextMode);
    setActiveTab('home');
  };

  const handleToggleAudio = () => {
    const nextMuted = missionAudio.toggleMute();
    setAudioMuted(nextMuted);
  };

  const handleSelectSubsystem = (sub: SubsystemKey) => {
    missionAudio.playBeep(850);
    setActiveSubsystem(sub);
  };

  const handleMetricChange = (sub: SubsystemKey, metricId: string, val: number) => {
    setSubsystemMetrics((prev) => ({
      ...prev,
      [sub]: {
        ...prev[sub],
        [metricId]: val,
      },
    }));
  };

  const handleLoadPresetCase = (caseType: 'nominal' | 'amber' | 'critical') => {
    missionAudio.playBeep(740);
    setSubsystemMetrics((prev) => {
      const next = { ...prev };
      if (activeSubsystem === 'cardiovascular') {
        next.cardiovascular =
          caseType === 'nominal'
            ? { ijv_flow_velocity: 26, cephalad_fluid_shift_index: 2, resting_heart_rate: 65 }
            : caseType === 'amber'
              ? { ijv_flow_velocity: 11, cephalad_fluid_shift_index: 3, resting_heart_rate: 78 }
              : { ijv_flow_velocity: 4.1, cephalad_fluid_shift_index: 4, resting_heart_rate: 105 };
      } else if (activeSubsystem === 'ocular_sans') {
        next.ocular_sans =
          caseType === 'nominal'
            ? { onsd_diameter: 4.8, visual_acuity_change: 0.2, frisen_papilledema_grade: 0 }
            : caseType === 'amber'
              ? { onsd_diameter: 5.8, visual_acuity_change: 0.7, frisen_papilledema_grade: 1 }
              : { onsd_diameter: 6.4, visual_acuity_change: 1.8, frisen_papilledema_grade: 3 };
      } else if (activeSubsystem === 'musculoskeletal') {
        next.musculoskeletal =
          caseType === 'nominal'
            ? { ared_compliance: 96, spinal_pain_score: 1, missed_ared_sessions: 0 }
            : caseType === 'amber'
              ? { ared_compliance: 78, spinal_pain_score: 4, missed_ared_sessions: 2 }
              : { ared_compliance: 58, spinal_pain_score: 7, missed_ared_sessions: 4 };
      } else {
        next.mood_sleep =
          caseType === 'nominal'
            ? { sleep_hours: 7.5, pvt_lapses: 1, cabin_co2_mmhg: 2.1 }
            : caseType === 'amber'
              ? { sleep_hours: 5.8, pvt_lapses: 4, cabin_co2_mmhg: 3.9 }
              : { sleep_hours: 4.5, pvt_lapses: 9, cabin_co2_mmhg: 5.4 };
      }
      return next;
    });
  };

  const handleEvaluateTriage = () => {
    if (activeTriageResult.level === 'RED') missionAudio.playSafetyStop();
    else if (activeTriageResult.level === 'AMBER') missionAudio.playWarning();
    else missionAudio.playSuccess();
    showToast(`Local triage evaluated: ${activeTriageResult.level} — ${activeTriageResult.title}`);
  };

  const handleResetNominal = () => {
    missionAudio.playSuccess();
    setSubsystemMetrics(createInitialMetrics());
    handleLoadPresetCase('nominal');
    showToast('Nominal in-flight telemetry baseline restored.');
  };

  const handleSaveDailyLog = (entry: Omit<InFlightLogEntry, 'day' | 'timestamp'>) => {
    missionAudio.playSuccess();
    const newEntry: InFlightLogEntry = {
      ...entry,
      day: flightLogs.length + 1,
      timestamp: new Date().toISOString(),
    };
    const nextLogs = [...flightLogs, newEntry];
    setFlightLogs(nextLogs);
    try {
      localStorage.setItem(FLIGHT_LOGS_STORAGE_KEY, JSON.stringify(nextLogs));
    } catch {
      // Ignore storage quota error
    }
    showToast(`Mission Day ${newEntry.day} saved to handover archive.`);
  };

  const saveChecklistProgress = (nextProgress: Record<string, string[]>) => {
    setChecklistProgress(nextProgress);
    setCompletedExercises(deriveCompletedExercisesFromProgress(nextProgress));
    try {
      localStorage.setItem(REHAB_CHECKLIST_STORAGE_KEY, JSON.stringify(nextProgress));
    } catch {
      // Ignore storage quota error
    }
  };

  const handleToggleChecklistStep = (exerciseId: string, stepId: string) => {
    const prevSteps = checklistProgress[exerciseId] || [];
    const exists = prevSteps.includes(stepId);
    const nextSteps = exists
      ? prevSteps.filter((id) => id !== stepId)
      : [...prevSteps, stepId];

    const profile = REHAB_ACTIVITY_PROFILES[exerciseId];
    const isNowComplete =
      Boolean(profile) && profile.checklist.every((s) => nextSteps.includes(s.id));

    if (isNowComplete && !exists) {
      missionAudio.playSuccess();
      showToast('Activity completed and progress saved.');
    } else {
      missionAudio.playBeep(exists ? 640 : 880);
    }

    saveChecklistProgress({
      ...checklistProgress,
      [exerciseId]: nextSteps,
    });
  };

  const handleResetChecklist = (exerciseId: string) => {
    missionAudio.playBeep(600);
    const next = { ...checklistProgress };
    delete next[exerciseId];
    saveChecklistProgress(next);
  };

  const handleToggleExercise = (exerciseId: string) => {
    missionAudio.playBeep(880);
    const profile = REHAB_ACTIVITY_PROFILES[exerciseId];
    const isDone = completedExercises.has(exerciseId);
    if (profile) {
      const next = { ...checklistProgress };
      if (isDone) {
        delete next[exerciseId];
      } else {
        next[exerciseId] = profile.checklist.map((s) => s.id);
      }
      saveChecklistProgress(next);
    }
  };

  const handleCompleteSession = () => {
    missionAudio.playSuccess();
    setCompletedSessionsCount((c) => c + 1);
    const phaseExercises = activePhase.exercises.map((e) => e.id);
    const next = { ...checklistProgress };
    phaseExercises.forEach((id) => {
      delete next[id];
    });
    saveChecklistProgress(next);
    showToast('2-hour reconditioning block completed. Earth Readiness bonus applied.');
  };

  const handleSaveNasaKey = (key: string) => {
    nasaService.setApiKey(key);
    setNasaModalOpen(false);
    void refreshDonki();
    showToast(`NASA DONKI API key updated (${key || 'DEMO_KEY'}).`);
  };

  const handleChangeBackdropTheme = (nextTheme: BackdropThemeId) => {
    missionAudio.playBeep(760);
    setBackdropTheme(nextTheme);
    try {
      localStorage.setItem(BACKDROP_THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage quota error
    }
  };

  const activeGlobalBackdrop = useMemo(
    () => resolveDashboardBackdrop(backdropTheme, mode),
    [backdropTheme, mode]
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-[#040814] text-slate-100">
      {/* Global Space & Orbital Canvas Backdrop with Measured Scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#040814]"
      >
        <div
          className={`absolute inset-0 bg-no-repeat transition-opacity duration-500 select-none ${
            activeGlobalBackdrop.isPortraitEmblem
              ? 'opacity-65'
              : 'scale-[1.02] bg-cover bg-center opacity-75'
          }`}
          style={{
            backgroundImage: `url("${activeGlobalBackdrop.url}")`,
            ...(activeGlobalBackdrop.isPortraitEmblem
              ? {
                  backgroundSize: 'auto min(86vh, 780px)',
                  backgroundPosition: 'center 48%',
                }
              : {}),
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              mode === 'flight'
                ? 'radial-gradient(ellipse at 75% 20%, rgba(6, 182, 212, 0.10) 0%, rgba(4, 9, 24, 0.56) 52%, rgba(3, 7, 20, 0.80) 100%)'
                : 'radial-gradient(ellipse at 75% 20%, rgba(16, 185, 129, 0.10) 0%, rgba(4, 11, 24, 0.56) 52%, rgba(3, 7, 20, 0.80) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040918]/40 via-[#040a1c]/50 to-[#030714]/76" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <HeaderNav
          activeTab={activeTab}
          mode={mode}
          audioMuted={audioMuted}
          onSelectTab={handleSelectTab}
          onSelectModeAndHome={handleQuickSwitchMode}
          onOpenOnboarding={() => setOnboardingOpen(true)}
          onToggleAudio={handleToggleAudio}
          onOpenMoreSheet={() => setMoreSheetOpen(true)}
        />

        {/* Main Content Container with Smooth Page Transitions */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6">
          <div key={`${activeTab}-${mode}`} className="astro-page-enter">
            {activeTab === 'home' ? (
              mode === 'flight' ? (
                <ModeAWorkspace
                  mode={mode}
                  environment={environment}
                  backdropTheme={backdropTheme}
                  activeSubsystem={activeSubsystem}
                  subsystemMetrics={subsystemMetrics}
                  subsystemLevels={subsystemLevels}
                  triageResult={activeTriageResult}
                  flightLogs={flightLogs}
                  donkiEvents={donkiEvents}
                  donkiSource={donkiSource}
                  donkiLoading={donkiLoading}
                  audioMuted={audioMuted}
                  onSwitchMode={handleQuickSwitchMode}
                  onChangeBackdropTheme={handleChangeBackdropTheme}
                  onOpenPlanModal={() => setPlanModalOpen(true)}
                  onOpenNasaModal={() => setNasaModalOpen(true)}
                  onToggleAudio={handleToggleAudio}
                  onChangeEnvironment={(env) => {
                    missionAudio.playBeep(650);
                    setEnvironment(env);
                  }}
                  onSelectSubsystem={handleSelectSubsystem}
                  onMetricChange={handleMetricChange}
                  onLoadPresetCase={handleLoadPresetCase}
                  onEvaluateTriage={handleEvaluateTriage}
                  onResetNominal={handleResetNominal}
                  onSaveDailyLog={handleSaveDailyLog}
                  onRefreshDonki={() => {
                    missionAudio.playBeep(800);
                    void refreshDonki();
                  }}
                />
              ) : (
                <ModeBWorkspace
                  mode={mode}
                  missionPreset={missionPreset}
                  backdropTheme={backdropTheme}
                  currentDay={currentDay}
                  activePhase={activePhase}
                  handover={handoverMetrics}
                  readiness={earthReadiness}
                  safetyStop={safetyStop}
                  flightLogsCount={flightLogs.length}
                  completedSessionsCount={completedSessionsCount}
                  dizzinessScore={dizzinessScore}
                  painScore={painScore}
                  completedExercises={completedExercises}
                  checklistProgress={checklistProgress}
                  audioMuted={audioMuted}
                  donkiSource={donkiSource}
                  onSwitchMode={handleQuickSwitchMode}
                  onChangeBackdropTheme={handleChangeBackdropTheme}
                  onOpenPlanModal={() => setPlanModalOpen(true)}
                  onOpenNasaModal={() => setNasaModalOpen(true)}
                  onToggleAudio={handleToggleAudio}
                  onChangePreset={(preset) => {
                    missionAudio.playBeep(750);
                    setMissionPreset(preset);
                  }}
                  onChangeDay={setCurrentDay}
                  onChangeDizziness={setDizzinessScore}
                  onChangePain={setPainScore}
                  onToggleExercise={handleToggleExercise}
                  onToggleChecklistStep={handleToggleChecklistStep}
                  onResetChecklist={handleResetChecklist}
                  onCompleteSession={handleCompleteSession}
                />
              )
            ) : (
              <SecondaryPages activeTab={activeTab} onNavigate={handleSelectTab} />
            )}
          </div>
        </main>

        {/* Compact Developer & Contact Footer */}
        <DeveloperFooter
          developersExpanded={developersExpanded}
          onToggleDevelopers={() => setDevelopersExpanded((v) => !v)}
          onNavigateContact={handleSelectTab}
        />
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-cyan-500/50 bg-[#0b0f19]/95 px-4 py-3 font-mono text-xs text-cyan-200 shadow-2xl backdrop-blur md:bottom-6"
        >
          {toastMessage}
        </div>
      )}

      {/* Modals & Mobile Sheets */}
      <OnboardingModal
        open={onboardingOpen}
        onSelectMode={handleSelectMissionModeFromGate}
        onSkipToWorkspace={() => setOnboardingOpen(false)}
        onInspectTeam={() => {
          setOnboardingOpen(false);
          setDevelopersExpanded(true);
          setTimeout(() => {
            document.getElementById('developer-footer')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 80);
        }}
      />

      <MissionPlanModal
        open={planModalOpen}
        mode={mode}
        handover={handoverMetrics}
        environment={environment}
        flightLogsCount={flightLogs.length}
        onClose={() => setPlanModalOpen(false)}
      />

      <NasaDonkiModal
        open={nasaModalOpen}
        currentKey={nasaService.getApiKey()}
        onClose={() => setNasaModalOpen(false)}
        onSaveAndTest={handleSaveNasaKey}
      />

      <MobileMoreSheet
        open={moreSheetOpen}
        mode={mode}
        audioMuted={audioMuted}
        donkiSource={donkiSource}
        onClose={() => setMoreSheetOpen(false)}
        onSelectTab={handleSelectTab}
        onSwitchMode={handleQuickSwitchMode}
        onOpenPlan={() => setPlanModalOpen(true)}
        onOpenNasaModal={() => setNasaModalOpen(true)}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
}
