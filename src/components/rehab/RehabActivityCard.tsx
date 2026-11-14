import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Dumbbell,
  Eye,
  HeartPulse,
  Play,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import type { RehabActivityProfile } from '../../data/rehabActivitiesData';
import type { RehabExercise } from '../../types/astral';
import { ExerciseChecklist } from './ExerciseChecklist';

interface RehabActivityCardProps {
  exercise: RehabExercise;
  profile: RehabActivityProfile;
  checkedIds: string[];
  safetyHaltRequired: boolean;
  onToggleStep: (exerciseId: string, stepId: string) => void;
  onResetChecklist: (exerciseId: string) => void;
  onStartActivity: (exerciseId: string) => void;
  onWatchDemo: (exerciseId: string) => void;
}

function getCategoryIcon(category: RehabActivityProfile['category']) {
  switch (category) {
    case 'Hydrotherapy':
      return <Waves className="h-4 w-4" />;
    case 'Cardiovascular':
      return <HeartPulse className="h-4 w-4" />;
    case 'Vestibular':
      return <Compass className="h-4 w-4" />;
    case 'Certification':
      return <ShieldCheck className="h-4 w-4" />;
    case 'Core & Spine':
      return <Activity className="h-4 w-4" />;
    default:
      return <Dumbbell className="h-4 w-4" />;
  }
}

export const RehabActivityCard: React.FC<RehabActivityCardProps> = ({
  exercise,
  profile,
  checkedIds,
  safetyHaltRequired,
  onToggleStep,
  onResetChecklist,
  onStartActivity,
  onWatchDemo,
}) => {
  const [infoExpanded, setInfoExpanded] = useState(false);

  const isHydro = exercise.id === 'p2_aquatic_treadmill';
  const totalSteps = profile.checklist.length;
  const checkedCount = profile.checklist.filter((s) => checkedIds.includes(s.id)).length;
  const isCompleted = totalSteps > 0 && checkedCount === totalSteps;
  const isInProgress = checkedCount > 0 && !isCompleted;

  const statusMeta = isCompleted
    ? {
        symbol: '●',
        label: 'COMPLETED',
        colorClass: 'text-emerald-300',
      }
    : isInProgress
      ? {
          symbol: '▲',
          label: 'IN PROGRESS',
          colorClass: 'text-cyan-300',
        }
      : {
          symbol: '○',
          label: 'READY',
          colorClass: 'text-slate-400',
        };

  return (
    <article
      data-testid={`activity-card-${exercise.id}`}
      className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors md:p-5 ${
        isCompleted
          ? 'border-emerald-500/50 bg-[#0a1714]'
          : isHydro
            ? 'border-sky-500/40 bg-gradient-to-b from-[#09192b] to-[#0b0f19]'
            : 'border-slate-800 bg-[#0d1320] hover:border-slate-700'
      }`}
    >
      <div className="space-y-4">
        {/* Card Header: Icon + Name + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isCompleted
                  ? 'border-emerald-500/50 bg-emerald-950/70 text-emerald-300'
                  : isHydro
                    ? 'border-sky-400/50 bg-sky-950/80 text-sky-300'
                    : 'border-slate-700 bg-[#111827] text-cyan-300'
              }`}
            >
              {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : getCategoryIcon(profile.category)}
            </div>

            <div className="min-w-0">
              <h4 className="text-base font-bold leading-snug text-white">
                {exercise.name}
              </h4>
              {/* Unboxed Clean Metadata Line */}
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                <span className="font-medium text-slate-200">
                  {exercise.targetMuscles.join(', ')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-cyan-300 tabular-nums">{exercise.duration}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-300 tabular-nums">{exercise.reps}</span>
              </div>
            </div>
          </div>

          <span
            data-testid={`activity-status-${exercise.id}`}
            className={`shrink-0 font-mono text-[11px] font-bold tracking-wide whitespace-nowrap ${statusMeta.colorClass}`}
          >
            <span aria-hidden="true" className="mr-1">
              {statusMeta.symbol}
            </span>
            {statusMeta.label}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs leading-relaxed text-slate-300">
          {profile.shortDescription}
        </p>

        {/* Interactive Step Checklist */}
        <div className="border-t border-slate-800/80 pt-3.5">
          <ExerciseChecklist
            steps={profile.checklist}
            checkedIds={checkedIds}
            onToggleStep={(stepId) => onToggleStep(exercise.id, stepId)}
            onResetChecklist={() => onResetChecklist(exercise.id)}
            compact
            accentTone={isHydro ? 'sky' : 'emerald'}
          />
        </div>
      </div>

      {/* Action Buttons + Expandable Additional Information */}
      <div className="mt-4 space-y-3 border-t border-slate-800/80 pt-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={safetyHaltRequired}
            onClick={() => onStartActivity(exercise.id)}
            className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold text-white transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-45 ${
              isHydro
                ? 'bg-sky-600 hover:bg-sky-500'
                : isCompleted
                  ? 'bg-emerald-700 hover:bg-emerald-600'
                  : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <Play className="h-3.5 w-3.5 shrink-0" />
            <span>
              {isCompleted
                ? 'Review Activity'
                : isInProgress
                  ? 'Resume Activity'
                  : 'Start Activity'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onWatchDemo(exercise.id)}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-[#111827] px-3.5 py-2 font-mono text-xs font-semibold text-cyan-300 transition-colors whitespace-nowrap hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
          >
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span>Watch Demonstration</span>
          </button>

          <button
            type="button"
            aria-expanded={infoExpanded}
            onClick={() => setInfoExpanded((v) => !v)}
            className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl border border-slate-800 bg-[#0b0f19] px-3 py-2 font-mono text-xs text-slate-300 transition-colors whitespace-nowrap hover:border-slate-700 hover:text-white"
          >
            <span>Details</span>
            {infoExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Expandable Additional Information */}
        {infoExpanded && (
          <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0b0f19] p-3.5 text-xs">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                Clinical Protocol &amp; Instructions
              </div>
              <p className="mt-1 leading-relaxed text-slate-300">
                {exercise.instructions}
              </p>
              <p className="mt-1.5 leading-relaxed text-slate-400">
                {profile.clinicalRationale}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-300">
              <span className="font-mono text-[11px] font-semibold text-slate-400">Equipment:</span>
              <span>{profile.equipment.join(' · ')}</span>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-950/20 p-2.5 text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>
                <strong className="font-semibold">Safety Limit:</strong> {exercise.safetyLimit}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
