import React from 'react';
import { ArrowRight, Globe, Satellite, X } from 'lucide-react';
import { BACKDROP_ASSETS } from '../data/backdropAssets';
import type { MissionMode } from '../types/astral';

interface OnboardingModalProps {
  open: boolean;
  onSelectMode: (mode: MissionMode) => void;
  onSkipToWorkspace: () => void;
  onInspectTeam: () => void;
}

const ROSTER = [
  { role: 'AI / ML Engineer', name: 'Udamgie' },
  { role: 'Frontend Dev', name: 'Rashmi' },
  { role: 'Delivery Lead', name: 'Buddhiprabha' },
  { role: 'Web Developer', name: 'Vidasni' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  open,
  onSelectMode,
  onSkipToWorkspace,
  onInspectTeam,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="custom-scroll relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-cyan-500/40 bg-[#0b0f19] p-5 pb-8 shadow-2xl md:rounded-2xl md:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-t-3xl md:rounded-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url("${BACKDROP_ASSETS.deepSpaceNebula}")` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10, 15, 28, 0.78) 0%, rgba(10, 14, 26, 0.90) 60%, rgba(8, 12, 22, 0.95) 100%)',
            }}
          />
        </div>
        <div className="relative z-10">
        {/* Mobile Sheet Grabber */}
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 md:hidden"
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-950 font-mono text-base font-bold text-cyan-300">
              AC
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-cyan-400">
                <span>NASA Space Apps Challenge 2026</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Offline-First</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                ASTROCARE
              </h1>
              <p className="text-xs text-slate-300">
                Intelligent Astronaut Health Monitoring and Recovery System.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkipToWorkspace}
            aria-label="Skip setup and open dashboard"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="my-5 text-center">
          <h2
            id="onboarding-title"
            className="text-balance text-xl font-bold text-white md:text-2xl"
          >
            Select Your Mission Phase
          </h2>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            Choose a monitoring mode to view astronaut health status, body systems, and daily recovery guidance.
          </p>
        </div>

        {/* Dual Mode Selection Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectMode('flight')}
            className="group relative flex min-h-[44px] flex-col justify-between overflow-hidden rounded-xl border border-cyan-500/40 bg-[#0b1325] p-5 text-left transition-colors hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity duration-200 group-hover:opacity-75"
                style={{ backgroundImage: `url("${BACKDROP_ASSETS.issCupolaOrbit}")` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(8, 15, 32, 0.76) 0%, rgba(10, 20, 42, 0.56) 55%, rgba(7, 13, 28, 0.86) 100%)',
                }}
              />
            </div>
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/90 text-cyan-300">
                  <Satellite className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  In-Flight
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300">
                Currently On Mission
              </h3>
              <p className="mt-0.5 font-mono text-xs text-cyan-400">
                LEO · Lunar · Mars Transit
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Monitor cardiovascular, ocular, musculoskeletal, and sleep health during spaceflight.
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center gap-1.5 border-t border-slate-700/70 pt-3 font-mono text-xs font-semibold text-cyan-300">
              <span>Open In-Flight Monitoring</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('rehab')}
            className="group relative flex min-h-[44px] flex-col justify-between overflow-hidden rounded-xl border border-emerald-500/40 bg-[#0b1325] p-5 text-left transition-colors hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
              <div
                className="absolute inset-0 bg-cover opacity-60 transition-opacity duration-200 group-hover:opacity-75"
                style={{
                  backgroundImage: `url("${BACKDROP_ASSETS.earthHorizon}")`,
                  backgroundPosition: 'center 62%',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(7, 17, 30, 0.76) 0%, rgba(8, 26, 36, 0.54) 55%, rgba(6, 14, 26, 0.86) 100%)',
                }}
              />
            </div>
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-950/90 text-emerald-300">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-300">
                  Post-Flight
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300">
                Already Landed on Earth
              </h3>
              <p className="mt-0.5 font-mono text-xs text-emerald-400">
                45-Day Earth Recovery · R+0 to R+45
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Track muscle, bone, balance recovery, and daily 2-hour physical reconditioning.
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center gap-1.5 border-t border-slate-700/70 pt-3 font-mono text-xs font-semibold text-emerald-300">
              <span>Open Post-Flight Recovery</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>

        {/* Compact Developer Credit */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-[#111827] p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Developed by RETRO-V</span>
            <button
              type="button"
              onClick={onInspectTeam}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              Meet the Developers
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ROSTER.map((member) => (
              <div
                key={member.name}
                className="rounded-lg border border-slate-800 bg-[#0b0f19] px-2.5 py-1.5 text-left"
              >
                <span className="block text-[11px] text-slate-400">{member.role}</span>
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {member.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>You can switch between In-Flight and Post-Flight anytime.</span>
          <button
            type="button"
            onClick={onSkipToWorkspace}
            className="min-h-[40px] px-2 font-mono text-xs font-medium text-slate-300 underline hover:text-white"
          >
            Skip to Dashboard
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
