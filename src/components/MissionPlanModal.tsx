import React from 'react';
import { ArrowRight, Globe, Printer, Satellite, X } from 'lucide-react';
import { ENVIRONMENT_MULTIPLIERS } from '../data/rulesData';
import type { EnvironmentKey, HandoverMetrics, MissionMode } from '../types/astral';

interface MissionPlanModalProps {
  open: boolean;
  mode: MissionMode;
  handover: HandoverMetrics;
  environment?: EnvironmentKey;
  flightLogsCount?: number;
  onClose: () => void;
}

const FLIGHT_SCHEDULE = [
  {
    time: '07:00 MET',
    title: 'Circadian Awakening & Cephalad Edema Assessment',
    detail: 'Log facial edema grade (1–5) and resting heart rate. Adjust habitat SSLA lighting to 460nm blue spectrum.',
  },
  {
    time: '08:30 MET',
    title: 'ARED Heavy Resistance Mechanical Loading',
    detail: 'Barbell back squats and heel raises (4 sets × 8 @ 85% 1RM). Target ≥ 1,800 microstrain to stimulate osteocytes.',
  },
  {
    time: '11:00 MET',
    title: 'Lower Body Negative Pressure (LBNP) Venous Chuffing',
    detail: '30-minute suction chamber session at -35 mmHg to displace 800 mL stagnant cephalad volume toward lower limbs.',
  },
  {
    time: '14:00 MET',
    title: 'Butterfly iQ+ Ultrasound Self-Surveillance Exam',
    detail: 'Internal Jugular Vein (IJV) Doppler sweep and Transorbital Optic Nerve Sheath (ONSD) SANS check.',
  },
  {
    time: '17:00 MET',
    title: 'T2 Treadmill Vibration-Isolated Aerobic Intervals',
    detail: '35-minute HIIT interval running with bungee harness axial loading (75–85% peak VO2).',
  },
];

export const MissionPlanModal: React.FC<MissionPlanModalProps> = ({
  open,
  mode,
  handover,
  environment = 'microgravity',
  flightLogsCount = 7,
  onClose,
}) => {
  if (!open) return null;

  const isFlight = mode === 'flight';
  const envLabel = ENVIRONMENT_MULTIPLIERS[environment].label;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-modal-title"
    >
      <div
        id="planModalContent"
        className={`relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border bg-[#0b0f19] p-5 pb-8 shadow-2xl custom-scroll md:rounded-2xl md:p-8 ${
          isFlight ? 'border-cyan-500/60' : 'border-emerald-500/60'
        }`}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 md:hidden"
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                isFlight
                  ? 'border-cyan-500/50 bg-cyan-950 text-cyan-300'
                  : 'border-emerald-500/50 bg-emerald-950 text-emerald-300'
              }`}
            >
              {isFlight ? <Satellite className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="text-slate-300 font-semibold">ASTROCARE</span>
                <span aria-hidden="true">·</span>
                <span className={isFlight ? 'text-cyan-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {isFlight ? 'Mode A Plan Generated' : 'Mode B Reconditioning Plan Generated'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Prescription Active</span>
              </div>
              <h2 id="plan-modal-title" className="text-lg font-bold text-white md:text-2xl">
                {isFlight
                  ? 'Autonomous In-Flight Countermeasure & Medical Plan'
                  : 'Personalized 45-Day Earth Reconditioning Plan'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Intelligent Astronaut Health Monitoring and Recovery System.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close plan modal"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-4 text-xs">
          {isFlight ? (
            <>
              <div className="rounded-xl border border-cyan-500/30 bg-[#111827] p-4">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 font-mono">
                  <span className="text-sm font-bold text-white">
                    Target Flight Phase: Mission Day {flightLogsCount} ({envLabel})
                  </span>
                  <span className="text-cyan-300">NASA Medical Directive 44-A</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Autonomous clinical countermeasure prescription to suppress cephalad fluid shifts, prevent internal jugular vein stasis, and arrest bone demineralization in zero gravity.
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  Daily Prescribed Countermeasure Schedule
                </h3>
                {FLIGHT_SCHEDULE.map((item) => (
                  <div
                    key={item.time}
                    className="flex flex-col gap-1.5 rounded-xl border border-slate-800 bg-[#111827] p-3.5 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <span className="shrink-0 font-mono text-xs font-bold text-cyan-300 tabular-nums">
                      {item.time}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <p className="mt-0.5 text-slate-400 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-emerald-500/30 bg-[#111827] p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono">
                  <span className="text-sm font-bold text-white">
                    Mission Handover: {handover.presetName}
                  </span>
                  <span className="text-emerald-300">NASA JSC APTP Protocol</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 font-mono tabular-nums">
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2.5">
                    <span className="block text-[11px] text-slate-400">Atrophy Deficit</span>
                    <span className="text-sm font-bold text-rose-400">
                      {handover.predictedMuscleAtrophyPercent}%
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2.5">
                    <span className="block text-[11px] text-slate-400">Bone Loss</span>
                    <span className="text-sm font-bold text-amber-400">
                      {handover.predictedBoneLossPercent}% BMD
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2.5">
                    <span className="block text-[11px] text-slate-400">Orthostatic Risk</span>
                    <span className="text-sm font-bold text-amber-400">
                      {handover.orthostaticRiskScore} / 100
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-[#0b0f19] p-2.5">
                    <span className="block text-[11px] text-slate-400">Vestibular Lag</span>
                    <span className="text-sm font-bold text-rose-400">
                      {handover.vestibularDisruptionScore} / 100
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  45-Day Phased Recovery Trajectory
                </h3>
                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3.5">
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <span className="font-bold text-cyan-300">
                      Phase 1: Days R+0 to R+7 · Stabilization & Orthostatic Tolerance
                    </span>
                    <span className="text-slate-400">Active</span>
                  </div>
                  <p className="mt-1 text-slate-400 leading-relaxed">
                    45° recumbent cycling, vestibulo-ocular reflex (VOR x1) gaze fixation drills, and diaphragmatic core bracing to prevent standing syncope.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3.5">
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <span className="font-bold text-emerald-300">
                      Phase 2: Days R+8 to R+21 · Strength & Hydrotherapy
                    </span>
                    <span className="text-slate-400">Upcoming</span>
                  </div>
                  <p className="mt-1 text-slate-400 leading-relaxed">
                    Chest-deep aquatic treadmill running (55% buoyancy deloading), kinetic chain rowing, and banded Romanian deadlifts.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#111827] p-3.5">
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <span className="font-bold text-blue-300">
                      Phase 3: Days R+22 to R+45 · Full Earth Readiness
                    </span>
                    <span className="text-slate-400">Clearance</span>
                  </div>
                  <p className="mt-1 text-slate-400 leading-relaxed">
                    Overground track tempo running, agility ladders, hex trap-bar deadlifts, and NHIS Earth baseline re-certification.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-800/70 bg-amber-950/25 p-3 text-amber-200">
                <strong className="font-semibold">Automatic Safety Stop Rule:</strong>{' '}
                If dizziness exceeds 4/10 or pain exceeds 5/10 during training, halt standing drills immediately and transition to 30° recumbent rest with 500 mL electrolyte rehydration.
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs text-slate-400">
            Validated by NASA JSC Medical Directive standards
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-4 py-2 font-mono text-xs font-semibold text-slate-200 whitespace-nowrap hover:bg-slate-800"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2 font-mono text-xs font-bold text-white whitespace-nowrap ${
                isFlight
                  ? 'bg-cyan-600 hover:bg-cyan-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <span>{isFlight ? 'Proceed to In-Flight Co-Pilot' : 'Proceed to Physio Coach'}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
