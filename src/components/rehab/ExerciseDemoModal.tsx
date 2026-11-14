import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Pause,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { RehabActivityProfile } from '../../data/rehabActivitiesData';
import type { RehabExercise } from '../../types/astral';
import { ExerciseDemonstrationSvg } from './ExerciseDemonstrationSvg';

interface ExerciseDemoModalProps {
  open: boolean;
  exercise: RehabExercise | null;
  profile: RehabActivityProfile | null;
  onClose: () => void;
  onStartActivity: (exerciseId: string) => void;
}

export const ExerciseDemoModal: React.FC<ExerciseDemoModalProps> = ({
  open,
  exercise,
  profile,
  onClose,
  onStartActivity,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!open || !exercise || !profile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className="custom-scroll relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-cyan-500/40 bg-[#0b0f19] p-5 pb-8 shadow-2xl md:rounded-2xl md:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-cyan-400">
              <span>Visual Demonstration</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">{profile.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">{exercise.duration}</span>
            </div>
            <h2
              id="demo-modal-title"
              className="mt-1 text-lg font-bold text-white md:text-xl"
            >
              {exercise.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Targets: {exercise.targetMuscles.join(', ')} · {exercise.reps}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close demonstration modal"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Animated Biomechanical Demonstration */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-semibold text-cyan-300">
              Movement Cue: {profile.movementCue}
            </span>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 font-mono text-xs font-semibold text-white hover:bg-slate-800"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-cyan-300" /> : <Play className="h-3.5 w-3.5 text-emerald-300" />}
              <span>{isPlaying ? 'Pause Animation' : 'Play Animation'}</span>
            </button>
          </div>

          <ExerciseDemonstrationSvg
            exerciseId={exercise.id}
            isPlaying={isPlaying}
            className="aspect-[16/9] w-full"
          />
        </div>

        {/* Step-by-Step + Posture + Safety */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
              Step-by-Step Instructions
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-200">
              {profile.stepByStep.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-950/60 font-mono text-[11px] font-bold text-emerald-300 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-4">
              <h3 className="mb-2.5 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Posture Reminders</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {profile.postureReminders.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    <span className="leading-relaxed">{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4">
              <h3 className="mb-1.5 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Safety Precautions</span>
              </h3>
              <p className="text-xs leading-relaxed text-amber-100/90">
                {exercise.safetyLimit}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-400">
            Equipment: {profile.equipment.join(' · ')}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] rounded-xl border border-slate-700 bg-[#111827] px-4 py-2 font-mono text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartActivity(exercise.id);
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-mono text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Start Activity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
