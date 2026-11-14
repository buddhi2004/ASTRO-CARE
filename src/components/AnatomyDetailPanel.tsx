import React from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import type {
  ModeAAnatomyEvaluation,
  ModeBRecoveryEvaluation,
  RehabPhase,
} from '../types/astral';
import { RECOVERY_TIER_BADGE_CLASS, TRIAGE_BADGE_CLASS } from '../utils/triageStyles';

interface ModeAAnatomyPanelProps {
  evaluation: ModeAAnatomyEvaluation;
}

const TrendSparkline: React.FC<{
  points: Array<{ dayLabel: string; value: number; unit: string }>;
  strokeColor: string;
}> = ({ points, strokeColor }) => {
  if (points.length === 0) return null;
  const width = 260;
  const height = 54;
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
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-14 w-full overflow-visible rounded-lg border border-slate-800/80 bg-[#070b14] p-1"
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
            r={idx === coords.length - 1 ? 3.5 : 2.2}
            fill={idx === coords.length - 1 ? '#ffffff' : strokeColor}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-slate-400 tabular-nums">
        {coords.slice(-5).map((c, idx) => (
          <span key={`${c.dayLabel}-${idx}`}>
            {c.dayLabel}: <strong className="text-slate-200">{c.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};

export const ModeAAnatomyPanel: React.FC<ModeAAnatomyPanelProps> = ({ evaluation }) => {
  const { region, level, riskScore, statusTitle, recordedValues, historicalTrend, trendSummary } =
    evaluation;

  const strokeHex =
    level === 'RED' ? '#EF4444' : level === 'AMBER' ? '#F59E0B' : '#06B6D4';

  return (
    <div
      data-testid="mode-a-anatomy-detail"
      className="space-y-3.5 rounded-xl border border-slate-800 bg-[#111827] p-4 text-xs"
    >
      {/* Anatomical Name + Rule-Engine Status */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
            Selected Anatomical Structure
          </span>
          <h4 className="mt-0.5 text-sm font-bold text-white md:text-base">{region.name}</h4>
        </div>
        <div
          className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold ${TRIAGE_BADGE_CLASS[level]}`}
        >
          {level} · {riskScore}/100
        </div>
      </div>

      {/* Biological Function & Spaceflight Concern */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
          <div className="mb-1 font-mono text-[11px] font-semibold text-cyan-300">
            Biological Function
          </div>
          <p className="leading-relaxed text-slate-300">{region.biologicalFunction}</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
          <div className="mb-1 font-mono text-[11px] font-semibold text-amber-300">
            Spaceflight Health Concern
          </div>
          <p className="leading-relaxed text-slate-300">{region.spaceflightConcern}</p>
        </div>
      </div>

      {/* Relevant Measurements & Current Recorded Values */}
      <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
        <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[11px]">
          <span className="font-semibold text-white">
            Relevant Measurements & Current Recorded Values
          </span>
          <span className="text-slate-400">{region.relevantMeasurements.length} Tracked</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 font-mono tabular-nums">
          {recordedValues.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-800/80 bg-[#111827] p-2.5"
            >
              <div className="truncate text-[10px] text-slate-400" title={item.label}>
                {item.label}
              </div>
              <div
                className={`mt-1 text-sm font-bold ${
                  item.isAlert ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {item.value}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                Nominal: {item.nominalRange}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Trends */}
      <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
        <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>Historical Trend ({historicalTrend.length} Points)</span>
          </span>
          <span className="text-cyan-300">{trendSummary}</span>
        </div>
        <TrendSparkline points={historicalTrend} strokeColor={strokeHex} />
      </div>

      {/* Current Rule-Engine Status & Monitoring Recommendations */}
      <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
        <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Rule-Engine Status: {statusTitle}</span>
          </span>
        </div>
        <ul className="mt-2 space-y-1.5 text-slate-300">
          {region.monitoringRecommendations.map((rec) => (
            <li key={rec} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Relevant References */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-800/80 bg-[#070b14] p-2.5 font-mono text-[11px] text-slate-400">
        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <div>
          <span className="font-semibold text-slate-300">References: </span>
          {region.references.join(' · ')}
        </div>
      </div>
    </div>
  );
};

interface ModeBRecoveryPanelProps {
  evaluation: ModeBRecoveryEvaluation;
  activePhase: RehabPhase;
  completedExercises: Set<string>;
}

export const ModeBRecoveryPanel: React.FC<ModeBRecoveryPanelProps> = ({
  evaluation,
  activePhase,
  completedExercises,
}) => {
  const {
    region,
    recoveryPercent,
    vulnerabilityPercent,
    tier,
    tierLabel,
    colorHex,
    loadingClearance,
    atrophyOrLossNote,
  } = evaluation;

  const matchingExercises = activePhase.exercises.filter((ex) =>
    region.linkedExerciseKeywords.some(
      (kw) =>
        ex.name.toLowerCase().includes(kw.toLowerCase()) ||
        ex.targetMuscles.some((tm) => tm.toLowerCase().includes(kw.toLowerCase()))
    )
  );

  return (
    <div
      data-testid="mode-b-anatomy-detail"
      className="space-y-3.5 rounded-xl border border-slate-800 bg-[#111827] p-4 text-xs"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
            {region.category} · Recovery Inspection
          </span>
          <h4 className="mt-0.5 text-sm font-bold text-white md:text-base">{region.name}</h4>
        </div>
        <span
          className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold ${RECOVERY_TIER_BADGE_CLASS[tier]}`}
        >
          {tierLabel}
        </span>
      </div>

      {/* Recovery vs Vulnerability Progress */}
      <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
        <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
          <span className="block text-[11px] text-slate-400">Estimated Recovery</span>
          <span className="mt-1 block text-xl font-bold" style={{ color: colorHex }}>
            {recoveryPercent}%
          </span>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${recoveryPercent}%`, backgroundColor: colorHex }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
          <span className="block text-[11px] text-slate-400">Residual Vulnerability</span>
          <span className="mt-1 block text-xl font-bold text-slate-100">
            {vulnerabilityPercent}%
          </span>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-300"
              style={{ width: `${vulnerabilityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clinical Context */}
      <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3 space-y-2">
        <div>
          <span className="font-mono text-[11px] font-semibold text-cyan-300">
            1.0g Biomechanical Function
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-300">{region.biologicalFunction}</p>
        </div>
        <div className="border-t border-slate-800/80 pt-2">
          <span className="font-mono text-[11px] font-semibold text-amber-300">
            Post-Flight Deconditioning Risk
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-300">{region.postFlightConcern}</p>
        </div>
        <div className="font-mono text-[11px] text-slate-400">{atrophyOrLossNote}</div>
      </div>

      {/* Current Loading Clearance */}
      <div
        className={`flex items-start gap-2.5 rounded-lg border p-3 ${
          tier === 'RED'
            ? 'border-rose-700/70 bg-rose-950/25 text-rose-100'
            : 'border-slate-800 bg-[#0b0f19] text-slate-200'
        }`}
      >
        {tier === 'RED' ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        )}
        <div>
          <div className="font-mono text-[11px] font-bold">
            Current Clearance: {loadingClearance}
          </div>
          <p className="mt-1 text-slate-300 leading-relaxed">{region.loadingGuidance}</p>
        </div>
      </div>

      {/* Linked APTP Exercises */}
      <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[11px]">
          <span className="font-semibold text-white">
            Targeted Drills ({activePhase.dayRange})
          </span>
          <span className="text-emerald-400">{matchingExercises.length} Matched</span>
        </div>
        {matchingExercises.length > 0 ? (
          <ul className="space-y-1.5">
            {matchingExercises.map((ex) => {
              const done = completedExercises.has(ex.id);
              return (
                <li
                  key={ex.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-800 bg-[#111827] px-2.5 py-1.5 font-mono text-[11px]"
                >
                  <span className={done ? 'text-slate-400 line-through' : 'text-slate-200'}>
                    {ex.name}
                  </span>
                  <span className={done ? 'text-emerald-400' : 'text-cyan-300'}>
                    {done ? 'DONE' : ex.duration}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="font-mono text-[11px] text-slate-400">
            Protected under general {activePhase.name} unloading progression.
          </p>
        )}
      </div>

      {/* References */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-800/80 bg-[#070b14] p-2.5 font-mono text-[11px] text-slate-400">
        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <div>
          <span className="font-semibold text-slate-300">Protocol References: </span>
          {region.references.join(' · ')}
        </div>
      </div>
    </div>
  );
};
