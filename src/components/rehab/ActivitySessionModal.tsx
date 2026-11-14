import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Eye,
  Footprints,
  Gauge,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  Waves,
  X,
} from 'lucide-react';
import type { RehabActivityProfile } from '../../data/rehabActivitiesData';
import type { RehabExercise } from '../../types/astral';
import { missionAudio } from '../../services/audioService';
import { ExerciseChecklist } from './ExerciseChecklist';
import { ExerciseDemonstrationSvg } from './ExerciseDemonstrationSvg';

interface ActivitySessionModalProps {
  open: boolean;
  exercise: RehabExercise | null;
  profile: RehabActivityProfile | null;
  checkedIds: string[];
  safetyHaltRequired: boolean;
  onToggleStep: (exerciseId: string, stepId: string) => void;
  onResetChecklist: (exerciseId: string) => void;
  onOpenDemo: (exerciseId: string) => void;
  onClose: () => void;
}

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ActivitySessionModal: React.FC<ActivitySessionModalProps> = ({
  open,
  exercise,
  profile,
  checkedIds,
  safetyHaltRequired,
  onToggleStep,
  onResetChecklist,
  onOpenDemo,
  onClose,
}) => {
  const totalSeconds = (profile?.durationMinutes ?? 20) * 60;

  // Countdown timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [fastPreview, setFastPreview] = useState<boolean>(false);

  // Exercise-specific interactive states
  const [hydroSpeedMph, setHydroSpeedMph] = useState<number>(3.8);
  const [hydroStridePhase, setHydroStridePhase] = useState<'left' | 'right'>('left');
  const [cycleRpm, setCycleRpm] = useState<number>(70);
  const [vorAxis, setVorAxis] = useState<'horizontal' | 'vertical'>('horizontal');
  const [vorBeat, setVorBeat] = useState<'L' | 'R'>('L');
  const [holdElapsed, setHoldElapsed] = useState<number>(0);
  const [holdActive, setHoldActive] = useState<boolean>(false);
  const [repCount, setRepCount] = useState<number>(0);
  const [rowIntervalIdx, setRowIntervalIdx] = useState<number>(1);
  const [rowPhase, setRowPhase] = useState<'work' | 'rest'>('work');
  const [rowClock, setRowClock] = useState<number>(180);
  const [oneRmKg, setOneRmKg] = useState<number>(100);
  const [oneRmPct, setOneRmPct] = useState<number>(75);
  const [agilityDrillIdx, setAgilityDrillIdx] = useState<number>(0);
  const [nhisTrialTimer, setNhisTrialTimer] = useState<number>(0);
  const [nhisTrialRunning, setNhisTrialRunning] = useState<boolean>(false);
  const [nhisRestingHr, setNhisRestingHr] = useState<number>(64);
  const [nhisStandingHr, setNhisStandingHr] = useState<number>(76);

  // Reset per-session controls when opening a different exercise
  useEffect(() => {
    if (!open || !exercise || !profile) return;
    setSecondsLeft(profile.durationMinutes * 60);
    setTimerRunning(false);
    setFastPreview(false);
    setHydroSpeedMph(3.8);
    setCycleRpm(70);
    setHoldElapsed(0);
    setHoldActive(false);
    setRepCount(0);
    setRowIntervalIdx(1);
    setRowPhase('work');
    setRowClock(180);
    setNhisTrialTimer(0);
    setNhisTrialRunning(false);
  }, [open, exercise?.id]);

  // Main countdown ticker
  useEffect(() => {
    if (!open || !timerRunning) return;
    const step = fastPreview ? 10 : 1;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= step) {
          setTimerRunning(false);
          missionAudio.playSuccess();
          return 0;
        }
        return prev - step;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, timerRunning, fastPreview]);

  // Hydrotherapy alternating foot-strike indicator synced to mph
  useEffect(() => {
    if (!open || exercise?.id !== 'p2_aquatic_treadmill') return;
    const stepMs = Math.round(1800 / hydroSpeedMph);
    const interval = setInterval(() => {
      setHydroStridePhase((p) => (p === 'left' ? 'right' : 'left'));
    }, stepMs);
    return () => clearInterval(interval);
  }, [open, exercise?.id, hydroSpeedMph]);

  // VOR 1 Hz beat indicator
  useEffect(() => {
    if (!open || exercise?.id !== 'p1_vor_gaze' || !timerRunning) return;
    const interval = setInterval(() => {
      setVorBeat((b) => (b === 'L' ? 'R' : 'L'));
    }, 500);
    return () => clearInterval(interval);
  }, [open, exercise?.id, timerRunning]);

  // Core 10s / Tandem 45s hold stopwatch
  useEffect(() => {
    if (!open || !holdActive) return;
    const maxHold = exercise?.id === 'p2_tandem_balance' ? 45 : 10;
    const interval = setInterval(() => {
      setHoldElapsed((prev) => {
        if (prev + 1 >= maxHold) {
          setHoldActive(false);
          missionAudio.playSuccess();
          return maxHold;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, holdActive, exercise?.id]);

  // Concept2 Rowing interval ticker (3:00 work / 1:30 rest)
  useEffect(() => {
    if (!open || exercise?.id !== 'p2_erg_rowing' || !timerRunning) return;
    const step = fastPreview ? 10 : 1;
    const interval = setInterval(() => {
      setRowClock((prev) => {
        if (prev <= step) {
          missionAudio.playBeep(860);
          if (rowPhase === 'work') {
            setRowPhase('rest');
            return 90;
          } else {
            setRowPhase('work');
            setRowIntervalIdx((idx) => Math.min(5, idx + 1));
            return 180;
          }
        }
        return prev - step;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, exercise?.id, timerRunning, fastPreview, rowPhase]);

  // NHIS 30s unipedal stopwatch
  useEffect(() => {
    if (!open || !nhisTrialRunning) return;
    const interval = setInterval(() => {
      setNhisTrialTimer((prev) => {
        if (prev + 1 >= 30) {
          setNhisTrialRunning(false);
          missionAudio.playSuccess();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, nhisTrialRunning]);

  const checklistCompleted = useMemo(() => {
    if (!profile) return false;
    return profile.checklist.every((step) => checkedIds.includes(step.id));
  }, [profile, checkedIds]);

  if (!open || !exercise || !profile) return null;

  const isHydro = exercise.id === 'p2_aquatic_treadmill';
  const elapsedPct = Math.round(((totalSeconds - secondsLeft) / Math.max(1, totalSeconds)) * 100);
  const animationSpeed = isHydro
    ? hydroSpeedMph / 3.8
    : exercise.id === 'p1_recumbent_cycle'
      ? cycleRpm / 70
      : 1;

  const pulseDelta = nhisStandingHr - nhisRestingHr;
  const agilityDrills = [
    'Two-Foot Quick Run',
    'Lateral High-Knee Shuffle',
    'In-In-Out-Out',
    'Single-Leg Hop & Stick',
    'Icky Shuffle Cross-Step',
    '180° Visual-Cut Deceleration',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/88 backdrop-blur-md md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-session-title"
    >
      <div
        className={`custom-scroll relative max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border p-5 pb-8 shadow-2xl md:rounded-2xl md:p-7 ${
          isHydro
            ? 'border-sky-500/50 bg-gradient-to-b from-[#071829] via-[#07111e] to-[#060b14]'
            : 'border-emerald-500/40 bg-[#0b0f19]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className={isHydro ? 'font-bold text-sky-300' : 'font-bold text-emerald-300'}>
                {isHydro ? 'Hydrotherapy Interactive Console' : 'Guided Activity Session'}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">{profile.category}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{exercise.duration}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{exercise.reps}</span>
            </div>
            <h2 id="activity-session-title" className="mt-1 text-lg font-bold text-white md:text-2xl">
              {exercise.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">
              {profile.shortDescription}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDemo(exercise.id)}
              className="hidden min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 font-mono text-xs font-semibold text-cyan-300 hover:bg-slate-800 sm:inline-flex"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Watch Demo</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close activity session"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Safety Stop Banner if active */}
        {safetyHaltRequired && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-600/60 bg-rose-950/30 p-3.5 text-xs text-rose-100">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <div className="font-bold">Safety Stop Active</div>
              <p className="mt-0.5 opacity-90">
                Pre-session dizziness (&gt;4/10) or pain (&gt;5/10) is flagged. Pause upright loading until cleared.
              </p>
            </div>
          </div>
        )}

        {/* Main 2-Column Interactive Workspace */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* LEFT 7 COLS: Exercise-Specific Interactive Experience + Demonstration */}
          <div className="space-y-4 lg:col-span-7">
            {/* Timer & Session Controls Bar */}
            <div
              className={`rounded-2xl border p-4 ${
                isHydro
                  ? 'border-sky-500/35 bg-[#091c30]/80'
                  : 'border-slate-800 bg-[#111827]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                      isHydro
                        ? 'border-sky-400/40 bg-sky-950 text-sky-300'
                        : 'border-emerald-500/40 bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {isHydro ? <Waves className="h-5 w-5" /> : <Timer className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      Session Countdown Timer
                    </div>
                    <div className="flex items-baseline gap-2.5">
                      <span
                        data-testid="session-countdown"
                        className="font-mono text-3xl font-bold text-white tabular-nums"
                      >
                        {formatClock(secondsLeft)}
                      </span>
                      <span className="font-mono text-xs text-slate-400 tabular-nums">
                        / {profile.durationMinutes}:00 ({elapsedPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={safetyHaltRequired}
                    onClick={() => {
                      missionAudio.playBeep(timerRunning ? 620 : 880);
                      setTimerRunning((r) => !r);
                    }}
                    className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-xs font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      timerRunning
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : isHydro
                          ? 'bg-sky-600 hover:bg-sky-500'
                          : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{timerRunning ? 'Pause' : secondsLeft === 0 ? 'Restart' : 'Start Timer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setSecondsLeft(totalSeconds);
                    }}
                    aria-label="Reset session timer"
                    className="inline-flex min-h-[42px] items-center gap-1 rounded-xl border border-slate-700 bg-[#0b0f19] px-3 py-2 font-mono text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFastPreview((f) => !f)}
                    title="Toggle 10x timer speed for quick simulation"
                    className={`min-h-[42px] rounded-xl border px-2.5 py-2 font-mono text-[11px] font-semibold transition-colors ${
                      fastPreview
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                        : 'border-slate-700 bg-[#0b0f19] text-slate-400 hover:text-white'
                    }`}
                  >
                    {fastPreview ? '10x Sim' : '1x Real'}
                  </button>
                </div>
              </div>
            </div>

            {/* EXERCISE-SPECIFIC INTERACTIVE EXPERIENCE PANELS */}

            {/* A. CHEST-DEEP HYDROTHERAPY TREADMILL GAIT */}
            {isHydro && (
              <div className="space-y-4 rounded-2xl border border-sky-500/40 bg-gradient-to-br from-sky-950/40 via-[#0a1b2e] to-[#08121f] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-200">
                    <Droplets className="h-4 w-4 text-sky-400" />
                    <span>Aquatic Buoyancy &amp; Gait Telemetry</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-sky-300 tabular-nums">
                    Pool Temp 33°C · Chest-Deep
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Speed Indicator (3.2 - 4.5 mph) */}
                  <div className="rounded-xl border border-sky-500/30 bg-[#071422] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-sky-300">
                        Belt Speed Target
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">3.2–4.5 mph</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span
                        data-testid="hydro-speed-value"
                        className="font-mono text-2xl font-bold text-white tabular-nums"
                      >
                        {hydroSpeedMph.toFixed(1)}{' '}
                        <span className="text-xs font-normal text-sky-300">mph</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Decrease belt speed"
                          onClick={() => setHydroSpeedMph((s) => Math.max(3.2, Number((s - 0.1).toFixed(1))))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Increase belt speed"
                          onClick={() => setHydroSpeedMph((s) => Math.min(4.5, Number((s + 0.1).toFixed(1))))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      aria-label="Hydrotherapy treadmill speed in mph"
                      min={3.2}
                      max={4.5}
                      step={0.1}
                      value={hydroSpeedMph}
                      onChange={(e) => setHydroSpeedMph(Number(e.target.value))}
                      className="mt-2.5 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-sky-400"
                    />
                  </div>

                  {/* 55% Bodyweight Offload Indicator */}
                  <div className="rounded-xl border border-sky-500/30 bg-[#071422] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-sky-300">
                        Buoyancy Support
                      </span>
                      <span className="font-mono text-[11px] text-emerald-300">Joint-Safe</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span className="font-mono text-2xl font-bold text-sky-300 tabular-nums">
                        55% <span className="text-xs font-normal text-slate-300">Offload</span>
                      </span>
                      <span className="font-mono text-xs text-slate-400 tabular-nums">
                        45% Effective Load
                      </span>
                    </div>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-[55%] rounded-full bg-gradient-to-r from-sky-500 to-cyan-300" />
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
                      <span>Water Buoyancy (55%)</span>
                      <span>Axial Load (45%)</span>
                    </div>
                  </div>
                </div>

                {/* Foot-Strike Symmetry & Lateral Sway Monitor */}
                <div className="rounded-xl border border-sky-500/30 bg-[#071422] p-3.5">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-sky-200">
                      <Footprints className="h-4 w-4 text-sky-400" />
                      <span>Foot-Strike Symmetry &amp; Sway Cue</span>
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300 tabular-nums">
                      ● 98% Symmetric · Minimal Lateral Sway
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                        hydroStridePhase === 'left'
                          ? 'border-emerald-400/70 bg-emerald-950/40 text-white'
                          : 'border-slate-800 bg-[#0b1524] text-slate-400'
                      }`}
                    >
                      <span>Left Heel-Toe</span>
                      <span className="font-bold">
                        {hydroStridePhase === 'left' ? 'STRIKE' : 'SWING'}
                      </span>
                    </div>
                    <div
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
                        hydroStridePhase === 'right'
                          ? 'border-sky-400/70 bg-sky-950/40 text-white'
                          : 'border-slate-800 bg-[#0b1524] text-slate-400'
                      }`}
                    >
                      <span>Right Heel-Toe</span>
                      <span className="font-bold">
                        {hydroStridePhase === 'right' ? 'STRIKE' : 'SWING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. 45° SEMI-RECUMBENT ERG CYCLING */}
            {exercise.id === 'p1_recumbent_cycle' && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-cyan-300 font-semibold">Pedal Cadence Target</span>
                    <span className="text-slate-400">65–75 RPM</span>
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                    {cycleRpm} <span className="text-xs text-slate-400">RPM</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Target cycling cadence RPM"
                    min={55}
                    max={85}
                    value={cycleRpm}
                    onChange={(e) => setCycleRpm(Number(e.target.value))}
                    className="mt-2 h-2.5 w-full cursor-pointer rounded-lg bg-slate-800 accent-cyan-400"
                  />
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0b0f19] p-3">
                  <div className="font-mono text-[11px] text-slate-400">Seat Angle &amp; BP Guard</div>
                  <div className="mt-1 font-mono text-sm font-bold text-emerald-300">
                    45° Reclined · Systolic BP &gt; 95 mmHg
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Prevents lower-limb venous pooling during early 1.0g stabilization.
                  </p>
                </div>
              </div>
            )}

            {/* C. VOR x1 GAZE FIXATION */}
            {exercise.id === 'p1_vor_gaze' && (
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#111827] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-cyan-300">
                    1 Hz Head Oscillation Pacer (±20°)
                  </span>
                  <div className="inline-flex rounded-lg border border-slate-700 bg-[#0b0f19] p-0.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setVorAxis('horizontal')}
                      className={`rounded-md px-2.5 py-1 ${vorAxis === 'horizontal' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                      Horizontal
                    </button>
                    <button
                      type="button"
                      onClick={() => setVorAxis('vertical')}
                      className={`rounded-md px-2.5 py-1 ${vorAxis === 'vertical' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                    >
                      Vertical
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0b0f19] px-4 py-3 font-mono text-xs">
                  <span className={vorBeat === 'L' ? 'font-bold text-cyan-300' : 'text-slate-500'}>
                    {vorAxis === 'horizontal' ? '← TURN LEFT 20°' : '↑ NOD UP 20°'}
                  </span>
                  <span className="rounded-full border border-emerald-500/50 bg-emerald-950/50 px-3 py-1 font-bold text-emerald-300">
                    EYE TARGET LOCK
                  </span>
                  <span className={vorBeat === 'R' ? 'font-bold text-cyan-300' : 'text-slate-500'}>
                    {vorAxis === 'horizontal' ? 'TURN RIGHT 20° →' : 'NOD DOWN 20° ↓'}
                  </span>
                </div>
              </div>
            )}

            {/* D. DIAPHRAGM CORE / TANDEM BALANCE HOLD PACER */}
            {(exercise.id === 'p1_diaphragm_core' || exercise.id === 'p2_tandem_balance') && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4">
                <div>
                  <div className="font-mono text-xs font-semibold text-emerald-300">
                    {exercise.id === 'p2_tandem_balance'
                      ? '45-Second Tandem Stance Timer'
                      : '10-Second Isometric Hold Timer'}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                    {holdElapsed}s{' '}
                    <span className="text-xs text-slate-400">
                      / {exercise.id === 'p2_tandem_balance' ? '45s' : '10s'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (holdElapsed >= (exercise.id === 'p2_tandem_balance' ? 45 : 10)) {
                        setHoldElapsed(0);
                      }
                      setHoldActive((a) => !a);
                    }}
                    className="min-h-[40px] rounded-xl bg-emerald-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    {holdActive ? 'Pause Hold' : 'Start Hold'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHoldActive(false);
                      setHoldElapsed(0);
                    }}
                    className="min-h-[40px] rounded-xl border border-slate-700 bg-[#0b0f19] px-3 py-2 font-mono text-xs text-slate-300 hover:text-white"
                  >
                    Zero
                  </button>
                </div>
              </div>
            )}

            {/* E. REP COUNTER FOR ANKLE PUMP & BANDED RDL */}
            {(exercise.id === 'p1_ankle_pump' || exercise.id === 'p2_banded_rdl') && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4">
                <div>
                  <div className="font-mono text-xs font-semibold text-emerald-300">
                    {exercise.id === 'p2_banded_rdl'
                      ? '3-1-1 Eccentric Tempo · Set Rep Counter (Target: 12)'
                      : 'Slow Eccentric Calf Pump Counter (Target: 20)'}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                    {repCount}{' '}
                    <span className="text-xs text-slate-400">
                      / {exercise.id === 'p2_banded_rdl' ? '12 reps' : '20 reps'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      missionAudio.playBeep(840);
                      setRepCount((c) => c + 1);
                    }}
                    className="min-h-[40px] rounded-xl bg-emerald-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    +1 Rep
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepCount(0)}
                    className="min-h-[40px] rounded-xl border border-slate-700 bg-[#0b0f19] px-3 py-2 font-mono text-xs text-slate-300 hover:text-white"
                  >
                    Reset Set
                  </button>
                </div>
              </div>
            )}

            {/* F. CONCEPT2 ROWING INTERVAL TRACKER */}
            {exercise.id === 'p2_erg_rowing' && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:grid-cols-3">
                <div>
                  <div className="font-mono text-[11px] text-slate-400">Active Interval</div>
                  <div className="font-mono text-lg font-bold text-cyan-300 tabular-nums">
                    {rowIntervalIdx} / 5 · {rowPhase === 'work' ? 'WORK 3:00' : 'REST 1:30'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-slate-400">Interval Clock</div>
                  <div className="font-mono text-lg font-bold text-white tabular-nums">
                    {formatClock(rowClock)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-slate-400">Drive Sequence</div>
                  <div className="font-mono text-xs font-semibold text-emerald-300">
                    Legs → Body → Arms (HR ≤ 82%)
                  </div>
                </div>
              </div>
            )}

            {/* G. PHASE 3 TRACK / TRAPBAR / AGILITY / NHIS */}
            {exercise.id === 'p3_track_run' && (
              <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-semibold text-emerald-300">Osteogenic Microstrain Target</span>
                  <span className="font-bold text-white tabular-nums">&gt; 2,000 με (1.0g Impact)</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Check each 800m tempo lap on the right as you finish it. Monitor Achilles/plantar tendon feel after every lap.
                </p>
              </div>
            )}

            {exercise.id === 'p3_trapbar_deadlift' && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-xs text-slate-300">
                    Pre-Flight 1RM (kg): <strong className="text-white tabular-nums">{oneRmKg} kg</strong>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    step={5}
                    value={oneRmKg}
                    onChange={(e) => setOneRmKg(Number(e.target.value))}
                    className="mt-1.5 h-2 w-full cursor-pointer rounded-lg bg-slate-800 accent-emerald-500"
                  />
                </div>
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0b0f19] p-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Prescribed Load ({oneRmPct}%)</span>
                    <div className="flex gap-1">
                      {[75, 80].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setOneRmPct(pct)}
                          className={`rounded px-2 py-0.5 ${oneRmPct === pct ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-1 text-xl font-bold text-emerald-300 tabular-nums">
                    {Math.round((oneRmKg * oneRmPct) / 100)} kg × 6 reps
                  </div>
                </div>
              </div>
            )}

            {exercise.id === 'p3_agility_ladder' && (
              <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
                <div className="mb-2 font-mono text-xs font-semibold text-amber-300">
                  Active Ladder Drill ({agilityDrillIdx + 1}/6)
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {agilityDrills.map((d, idx) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAgilityDrillIdx(idx)}
                      className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                        agilityDrillIdx === idx
                          ? 'border-amber-400 bg-amber-950/40 text-white'
                          : 'border-slate-800 bg-[#0b0f19] text-slate-400 hover:text-white'
                      }`}
                    >
                      {idx + 1}. {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {exercise.id === 'p3_nhis_check' && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#0b0f19] p-3">
                  <div className="font-mono text-[11px] text-slate-400">
                    30s Eyes-Closed Trial Timer
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                      {nhisTrialTimer}s / 30s
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (nhisTrialTimer >= 30) setNhisTrialTimer(0);
                        setNhisTrialRunning((r) => !r);
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white"
                    >
                      {nhisTrialRunning ? 'Stop' : 'Start 30s'}
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-[#0b0f19] p-3">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">10m Stand Pulse Delta</span>
                    <span className={pulseDelta <= 15 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {pulseDelta} bpm (≤15 target)
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs">
                    <label className="block text-slate-400">
                      Rest HR
                      <input
                        type="number"
                        value={nhisRestingHr}
                        onChange={(e) => setNhisRestingHr(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                    <label className="block text-slate-400">
                      Stand HR
                      <input
                        type="number"
                        value={nhisStandingHr}
                        onChange={(e) => setNhisStandingHr(Number(e.target.value))}
                        className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Embedded Live Movement Visual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-300">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Live Biomechanical Guide</span>
                </span>
                <span className="text-slate-400">{profile.movementCue}</span>
              </div>
              <ExerciseDemonstrationSvg
                exerciseId={exercise.id}
                isPlaying={!safetyHaltRequired}
                speedMultiplier={animationSpeed}
                className="aspect-[16/9] w-full"
              />
            </div>
          </div>

          {/* RIGHT 5 COLS: Interactive Session Checklist + Safety Limit */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
              <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>Activity Checklist</span>
                </h3>
                <span className="font-mono text-[11px] text-slate-400">Auto-saved</span>
              </div>

              <ExerciseChecklist
                steps={profile.checklist}
                checkedIds={checkedIds}
                onToggleStep={(stepId) => onToggleStep(exercise.id, stepId)}
                onResetChecklist={() => onResetChecklist(exercise.id)}
                accentTone={isHydro ? 'sky' : 'emerald'}
              />
            </div>

            <div className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-4 text-xs">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Clinical Safety Guardrail
              </div>
              <p className="mt-1 leading-relaxed text-amber-100/90">
                {exercise.safetyLimit}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-mono text-xs font-bold text-white transition-colors ${
                checklistCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'border border-slate-700 bg-[#111827] hover:bg-slate-800'
              }`}
            >
              {checklistCompleted && <CheckCircle2 className="h-4 w-4" />}
              <span>
                {checklistCompleted ? 'Finish & Return to Recovery Hub' : 'Save Progress & Return'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
