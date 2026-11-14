import React, { useMemo, useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import type { InFlightLogEntry, TelemetrySeriesBundle, TriageLevel } from '../types/astral';

interface CompactTrendCardProps {
  bundle: TelemetrySeriesBundle;
  flightLogs?: InFlightLogEntry[];
  onExpandAnalysis?: () => void;
}

function getStatusDisplay(level: TriageLevel): { label: string; colorClass: string } {
  if (level === 'RED') return { label: 'Critical', colorClass: 'text-rose-400' };
  if (level === 'AMBER') return { label: 'Needs attention', colorClass: 'text-amber-400' };
  return { label: 'Normal', colorClass: 'text-emerald-400' };
}

export const CompactTrendCard: React.FC<CompactTrendCardProps> = ({
  bundle,
  flightLogs = [],
  onExpandAnalysis,
}) => {
  const width = 460;
  const height = 120;
  const padX = 14;
  const padY = 16;

  const points = bundle.points.slice(-16);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [selectedLogDay, setSelectedLogDay] = useState<number | null>(
    flightLogs.length > 0 ? flightLogs[flightLogs.length - 1].day : null
  );

  const vals = points.map((p) => p.value);
  const minVal = vals.length > 0 ? Math.min(...vals) : 0;
  const maxVal = vals.length > 0 ? Math.max(...vals) : 1;
  const span = maxVal - minVal || 1;

  const coords = useMemo(
    () =>
      points.map((p, idx) => {
        const x =
          points.length <= 1
            ? width / 2
            : padX + (idx / (points.length - 1)) * (width - padX * 2);
        const y =
          height - padY - ((p.value - minVal) / span) * (height - padY * 2);
        return { x, y, point: p, idx };
      }),
    [points, minVal, span]
  );

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const first = coords[0];
  const last = coords[coords.length - 1];
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${last.x.toFixed(1)} ${(height - padY).toFixed(1)} L ${first.x.toFixed(1)} ${(height - padY).toFixed(1)} Z`
      : '';

  const strokeColor =
    bundle.status === 'RED'
      ? '#f43f5e'
      : bundle.status === 'AMBER'
        ? '#f59e0b'
        : '#22d3ee';

  const statusInfo = getStatusDisplay(bundle.status);
  const activeCoord =
    selectedPointIdx !== null && coords[selectedPointIdx]
      ? coords[selectedPointIdx]
      : last ?? null;

  const activeLog = useMemo(() => {
    if (flightLogs.length === 0) return null;
    if (selectedLogDay !== null) {
      return flightLogs.find((l) => l.day === selectedLogDay) ?? flightLogs[flightLogs.length - 1];
    }
    return flightLogs[flightLogs.length - 1];
  }, [flightLogs, selectedLogDay]);

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/80 p-4 backdrop-blur-md transition-colors">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>Active System Trend</span>
            <span aria-hidden="true">·</span>
            <span className={`font-semibold ${statusInfo.colorClass}`}>
              {statusInfo.label}
            </span>
          </div>
          <h4 className="mt-0.5 text-sm font-bold text-white">
            {bundle.title} ({bundle.unit})
          </h4>
          <p className="mt-0.5 text-xs text-slate-400">{bundle.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono tabular-nums">
            <div className="text-lg font-bold text-white">
              {activeCoord
                ? `${activeCoord.point.value} ${bundle.unit}`
                : bundle.currentDisplay}
            </div>
            <div className="text-[11px] text-cyan-300/80">
              {activeCoord && selectedPointIdx !== null
                ? `Sample ${activeCoord.point.label}`
                : `Avg ${bundle.stats.avg} ${bundle.unit}`}
            </div>
          </div>
          {onExpandAnalysis && (
            <button
              type="button"
              onClick={onExpandAnalysis}
              className="min-h-[38px] rounded-xl border border-cyan-500/30 bg-[#0b152c]/90 px-3 py-1.5 font-mono text-xs font-semibold text-cyan-300 transition-colors hover:border-cyan-400/60 hover:text-white whitespace-nowrap"
            >
              View Analysis
            </button>
          )}
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-cyan-500/15 bg-[#040917]/90 font-mono text-xs text-slate-400">
          No telemetry samples available for this timeframe.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-28 w-full rounded-xl border border-cyan-500/15 bg-[#040917]/90"
          role="img"
          aria-label={`${bundle.title} interactive trend line`}
          onMouseLeave={() => setSelectedPointIdx(null)}
        >
          <defs>
            <linearGradient id={`compact-grad-${bundle.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.26" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {areaPath && (
            <path d={areaPath} fill={`url(#compact-grad-${bundle.id})`} />
          )}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}
          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={padY / 2}
              x2={activeCoord.x}
              y2={height - padY / 2}
              stroke="rgba(34,211,238,0.28)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          )}
          {coords.map((c) => {
            const isSelected = activeCoord?.idx === c.idx;
            return (
              <g key={c.idx}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isSelected ? 4.5 : c.point.isAnomaly ? 3 : 2}
                  fill={isSelected ? '#ffffff' : c.point.isAnomaly ? '#f59e0b' : strokeColor}
                  stroke={isSelected ? strokeColor : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                  className="transition-all duration-150"
                />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={12}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setSelectedPointIdx(c.idx)}
                  onClick={() => setSelectedPointIdx(c.idx)}
                />
              </g>
            );
          })}
        </svg>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-400 tabular-nums">
        <span>{points[0]?.label ?? '—'}</span>
        <span>
          Range: {bundle.stats.min}–{bundle.stats.max} {bundle.unit}
          {activeCoord?.point.anomalyReason ? ` · ${activeCoord.point.anomalyReason}` : ''}
        </span>
        <span>{points[points.length - 1]?.label ?? '—'}</span>
      </div>

      {/* Interactive Mission Day Explorer Strip */}
      {flightLogs.length > 0 && activeLog && (
        <div className="mt-3.5 border-t border-cyan-500/15 pt-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              <Calendar className="h-3.5 w-3.5" />
              <span>Mission Day Telemetry Explorer</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {flightLogs.slice(-7).map((entry) => {
                const isSelectedDay = activeLog.day === entry.day;
                return (
                  <button
                    key={entry.day}
                    type="button"
                    onClick={() => setSelectedLogDay(entry.day)}
                    className={`min-h-[28px] rounded-lg border px-2 py-0.5 font-mono text-[11px] font-semibold transition-colors tabular-nums ${
                      isSelectedDay
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                        : 'border-cyan-500/20 bg-[#0b152c]/80 text-slate-400 hover:border-cyan-400/40 hover:text-white'
                    }`}
                  >
                    MD {entry.day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-cyan-500/15 bg-[#040917]/75 p-2.5 font-mono text-[11px] tabular-nums sm:grid-cols-4">
            <div>
              <span className="block text-[10px] text-slate-400">ARED Load</span>
              <span className="font-bold text-cyan-300">{activeLog.daily_ared_load}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Fluid Shift Grade</span>
              <span
                className={`font-bold ${
                  activeLog.cephalad_fluid_shift_index >= 4
                    ? 'text-rose-400'
                    : activeLog.cephalad_fluid_shift_index >= 3
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                Grade {activeLog.cephalad_fluid_shift_index}/5
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Missed Workouts</span>
              <span
                className={`font-bold ${
                  activeLog.missed_workouts >= 2 ? 'text-amber-300' : 'text-white'
                }`}
              >
                {activeLog.missed_workouts} (7d)
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Sleep Logged</span>
              <span
                className={`font-bold ${
                  activeLog.sleep_duration < 6 ? 'text-amber-300' : 'text-emerald-300'
                }`}
              >
                {activeLog.sleep_duration} hrs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
