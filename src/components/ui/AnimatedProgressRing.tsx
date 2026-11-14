import React from 'react';
import type { TriageLevel } from '../../types/astral';

interface AnimatedProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'sky';
  level?: TriageLevel;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  percent,
  size = 56,
  strokeWidth = 5,
  tone,
  level,
  label,
  sublabel,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  const resolvedTone =
    tone ??
    (level === 'RED'
      ? 'rose'
      : level === 'AMBER'
        ? 'amber'
        : 'emerald');

  const strokeColor =
    resolvedTone === 'rose'
      ? '#f43f5e'
      : resolvedTone === 'amber'
        ? '#f59e0b'
        : resolvedTone === 'cyan'
          ? '#22d3ee'
          : resolvedTone === 'sky'
            ? '#38bdf8'
            : '#10b981';

  const trackColor = 'rgba(30, 58, 95, 0.45)';

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? `${Math.round(clamped)}%`}${sublabel ? ` ${sublabel}` : ''}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 550ms cubic-bezier(0.16, 1, 0.3, 1), stroke 250ms ease',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="font-mono text-xs font-bold text-white tabular-nums">
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel && (
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
