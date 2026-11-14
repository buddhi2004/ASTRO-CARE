import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import type { RehabChecklistStep } from '../../data/rehabActivitiesData';

interface ExerciseChecklistProps {
  steps: RehabChecklistStep[];
  checkedIds: string[];
  onToggleStep: (stepId: string) => void;
  onResetChecklist?: () => void;
  compact?: boolean;
  accentTone?: 'emerald' | 'sky' | 'cyan';
  disabled?: boolean;
}

export const ExerciseChecklist: React.FC<ExerciseChecklistProps> = ({
  steps,
  checkedIds,
  onToggleStep,
  onResetChecklist,
  compact = false,
  accentTone = 'emerald',
  disabled = false,
}) => {
  const checkedSet = new Set(checkedIds);
  const completedCount = steps.filter((s) => checkedSet.has(s.id)).length;
  const totalCount = steps.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const setSteps = steps.filter((s) => s.kind === 'set');
  const completedSets = setSteps.filter((s) => checkedSet.has(s.id)).length;
  const remainingSets = Math.max(0, setSteps.length - completedSets);
  const isAllDone = completedCount === totalCount && totalCount > 0;

  const barGradient =
    accentTone === 'sky'
      ? 'from-sky-400 to-cyan-400'
      : accentTone === 'cyan'
        ? 'from-cyan-400 to-emerald-400'
        : 'from-emerald-500 to-cyan-400';

  const checkFill =
    accentTone === 'sky'
      ? 'border-sky-400 bg-sky-500 text-slate-950'
      : accentTone === 'cyan'
        ? 'border-cyan-400 bg-cyan-500 text-slate-950'
        : 'border-emerald-400 bg-emerald-500 text-slate-950';

  return (
    <div className="space-y-3">
      {/* Progress Bar & Set Counter Header */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span className="font-bold text-white">{percent}% Complete</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              {completedCount}/{totalCount} steps
            </span>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-[11px] tabular-nums">
            {setSteps.length > 0 && (
              <span className={remainingSets === 0 ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                Sets: {completedSets}/{setSteps.length} done · {remainingSets} left
              </span>
            )}
            {onResetChecklist && completedCount > 0 && (
              <button
                type="button"
                onClick={onResetChecklist}
                disabled={disabled}
                title="Reset checklist steps"
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Activity checklist progress"
          className="h-2 w-full overflow-hidden rounded-full bg-slate-800/90"
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-[width] duration-300 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
        {steps.map((step) => {
          const isChecked = checkedSet.has(step.id);
          return (
            <li key={step.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                disabled={disabled}
                onClick={() => onToggleStep(step.id)}
                className={`group flex w-full items-center gap-3 rounded-xl border text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 ${
                  compact ? 'min-h-[40px] px-3 py-2' : 'min-h-[44px] px-3.5 py-2.5'
                } ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-300'
                    : 'border-slate-800 bg-[#0d1320] text-slate-200 hover:border-slate-700 hover:bg-[#11192a]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-transform duration-200 ${
                    isChecked
                      ? `${checkFill} scale-105`
                      : 'border-slate-600 bg-slate-900 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <Check
                    className={`h-3.5 w-3.5 stroke-[3] transition-all duration-200 ${
                      isChecked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                  />
                </span>

                <span
                  className={`flex-1 text-xs leading-snug transition-colors ${
                    isChecked ? 'text-slate-400 line-through' : 'font-medium text-slate-100'
                  }`}
                >
                  {step.label}
                </span>

                {step.kind === 'set' && (
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-wider ${
                      isChecked ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {isChecked ? 'Done' : `Set ${step.setNumber}`}
                  </span>
                )}
                {step.kind === 'finish' && (
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase tracking-wider ${
                      isChecked ? 'text-emerald-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {isChecked ? 'Completed' : 'Final'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {isAllDone && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-2 text-xs text-emerald-200">
          <span className="font-semibold">● COMPLETED — All prescribed steps verified</span>
          <span className="font-mono text-[11px] text-emerald-300">Saved automatically</span>
        </div>
      )}
    </div>
  );
};
