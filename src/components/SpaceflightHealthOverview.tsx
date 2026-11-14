import React from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Droplets,
  HeartPulse,
  Radiation,
  Thermometer,
  UserCheck,
  Wind,
} from 'lucide-react';
import { ASTRONAUT_PROFILES } from '../data/healthTelemetry';
import type {
  AstronautProfile,
  AstronautProfileId,
  BodySystemFocusKey,
  ChartId,
  TriageLevel,
  VitalOverviewCardData,
} from '../types/astral';

interface SpaceflightHealthOverviewProps {
  profile: AstronautProfile;
  cards: VitalOverviewCardData[];
  activeChartId?: ChartId | null;
  onChangeProfile: (id: AstronautProfileId) => void;
  onSelectCard: (chartId: ChartId, systemFocus: BodySystemFocusKey) => void;
}

const CARD_ICONS: Record<ChartId, React.ReactNode> = {
  heart_rate: <HeartPulse className="h-4 w-4" />,
  blood_oxygen: <Droplets className="h-4 w-4" />,
  blood_pressure: <Activity className="h-4 w-4" />,
  respiratory_rate: <Wind className="h-4 w-4" />,
  body_temperature: <Thermometer className="h-4 w-4" />,
  radiation_exposure: <Radiation className="h-4 w-4" />,
};

function getStatusTextClass(level: TriageLevel): string {
  if (level === 'RED') return 'text-rose-400';
  if (level === 'AMBER') return 'text-amber-400';
  return 'text-emerald-400';
}

function getStatusGlyph(level: TriageLevel): string {
  if (level === 'RED') return '✖';
  if (level === 'AMBER') return '▲';
  return '●';
}

function getCardBorderClass(level: TriageLevel, isActive: boolean): string {
  if (isActive) {
    return 'border-cyan-400/80 bg-[#0b1834]/90 shadow-[0_0_24px_-10px_rgba(34,211,238,0.5)]';
  }
  if (level === 'RED') return 'border-rose-500/40 bg-[#0b152c]/80 hover:border-rose-400/70';
  if (level === 'AMBER') return 'border-amber-500/40 bg-[#0b152c]/80 hover:border-amber-400/70';
  return 'border-cyan-500/20 bg-[#0b152c]/80 hover:border-cyan-400/50';
}

export const SpaceflightHealthOverview: React.FC<SpaceflightHealthOverviewProps> = ({
  profile,
  cards,
  activeChartId,
  onChangeProfile,
  onSelectCard,
}) => {
  return (
    <section
      id="section-health-overview"
      aria-label="Spaceflight Health Overview"
      className="scroll-mt-16 md:scroll-mt-20 rounded-2xl border border-cyan-500/20 bg-[#070f22]/68 p-4 backdrop-blur-md md:p-5"
    >
      {/* Header & Crew Profile Baseline Switcher */}
      <div className="mb-4 flex flex-col gap-3 border-b border-cyan-500/15 pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-cyan-400">
            <span className="font-semibold tracking-wider uppercase">
              Spaceflight Health Overview
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-300">
              Mission Day {profile.missionDay}
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-sky-300">
              Illustrative Demo Telemetry + Live Local Inputs
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-bold text-white md:text-lg">
            Crew Biometric &amp; Dosimetry Summary
          </h3>
        </div>

        {/* Crew Profile Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="crew-profile-select"
            className="flex items-center gap-1.5 font-mono text-xs text-slate-300"
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Crew Profile</span>
          </label>
          <select
            id="crew-profile-select"
            value={profile.id}
            onChange={(e) => onChangeProfile(e.target.value as AstronautProfileId)}
            className="min-h-[40px] rounded-xl border border-cyan-500/25 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs font-semibold text-cyan-200 focus:border-cyan-400 focus:outline-none"
          >
            {ASTRONAUT_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.callsign} · {p.name} (MD {p.missionDay})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const isActive = activeChartId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectCard(card.id, card.systemFocus)}
              className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${getCardBorderClass(
                card.status,
                isActive
              )}`}
            >
              <div>
                {/* Top Row: Icon + Title + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-white">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-[#111827] text-cyan-300">
                      {CARD_ICONS[card.id]}
                    </span>
                    <span className="truncate">{card.title}</span>
                  </span>
                </div>

                {/* Primary Metric Value + Unit */}
                <div className="mt-3 flex items-baseline gap-1.5 font-mono tabular-nums">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    {card.valueDisplay}
                  </span>
                  <span className="text-xs font-medium uppercase text-slate-400">
                    {card.unit}
                  </span>
                </div>

                {/* Trend & Delta */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular-nums">
                  <span
                    className={`inline-flex items-center gap-0.5 font-semibold ${
                      card.status === 'RED'
                        ? 'text-rose-400'
                        : card.status === 'AMBER'
                          ? 'text-amber-300'
                          : 'text-cyan-300'
                    }`}
                  >
                    {card.trend === 'up' ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : card.trend === 'down' ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5" />
                    )}
                    <span>{card.deltaDisplay}</span>
                  </span>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span className="text-slate-400">{card.deltaPercentDisplay}</span>
                </div>
              </div>

              {/* Footer: Threshold Status + Baseline */}
              <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-800/80 pt-2 font-mono text-[10px]">
                <span className={`font-bold ${getStatusTextClass(card.status)}`}>
                  {getStatusGlyph(card.status)} {card.statusLabel}
                </span>
                <span className="truncate text-slate-400" title={card.baselineDisplay}>
                  {card.baselineDisplay}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
