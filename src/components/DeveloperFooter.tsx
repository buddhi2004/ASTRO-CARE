import React from 'react';
import { ChevronDown, ChevronUp, Mail, Users } from 'lucide-react';
import type { PageTab } from '../types/astral';

interface DeveloperFooterProps {
  developersExpanded: boolean;
  onToggleDevelopers: () => void;
  onNavigateContact: (tab: PageTab) => void;
}

const RETRO_V_MEMBERS = [
  {
    name: 'Udamgie',
    role: 'AI / Machine Learning Engineer',
    focus: 'Offline clinical decision trees & atrophy models',
  },
  {
    name: 'Rashmi',
    role: 'Frontend Developer & UI/UX',
    focus: 'Mission Control HUD & 3D anatomical visualization',
  },
  {
    name: 'Buddhiprabha',
    role: 'Delivery Lead & Clinical Alignment',
    focus: 'NASA MD 44-A & JSC APTP protocol integration',
  },
  {
    name: 'Vidasni',
    role: 'Full-Stack Web Developer',
    focus: 'Handover bridge, NHIS baselines & telemetry audio',
  },
];

export const DeveloperFooter: React.FC<DeveloperFooterProps> = ({
  developersExpanded,
  onToggleDevelopers,
  onNavigateContact,
}) => {
  return (
    <footer
      id="developer-footer"
      className="border-t border-cyan-500/20 bg-[#040917]/72 px-4 pb-24 pt-6 backdrop-blur-md md:px-6 md:pb-8"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/20 bg-[#070f22]/70 p-5 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-1">
            <h2 className="text-sm font-bold text-white">Developed by RETRO-V</h2>
            <p className="text-xs leading-relaxed text-slate-300">
              RETRO-V is a team of developers passionate about exploring innovative solutions for astronaut health monitoring and supporting safer human space exploration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              aria-expanded={developersExpanded}
              onClick={onToggleDevelopers}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700 bg-[#0b152c] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/60 hover:text-white whitespace-nowrap"
            >
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Meet the Developers</span>
              {developersExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigateContact('contact')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-cyan-500 whitespace-nowrap"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact the Team</span>
            </button>
          </div>
        </div>

        {developersExpanded && (
          <div className="mt-3 rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 p-4 backdrop-blur-md md:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-cyan-300">
                Team RETRO-V · Engineering &amp; Clinical Contributors
              </span>
              <span className="text-xs text-slate-400">
                Contact &amp; social links placeholder — use Contact the Team for direct inquiries
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {RETRO_V_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="rounded-xl border border-slate-800/90 bg-[#0b152c]/90 p-3.5 transition-colors hover:border-cyan-500/40"
                >
                  <div className="text-sm font-bold text-white">{member.name}</div>
                  <div className="mt-0.5 text-xs font-medium text-cyan-400">{member.role}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{member.focus}</p>
                  <div className="mt-2.5 border-t border-slate-800 pt-2 text-[11px] text-slate-500">
                    GitHub · LinkedIn · Profile link placeholder
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
          <span>
            ASTROCARE · Intelligent Astronaut Health Monitoring and Recovery System
          </span>
          <span>NASA Space Apps Challenge 2026 · Team RETRO-V</span>
        </div>
      </div>
    </footer>
  );
};
