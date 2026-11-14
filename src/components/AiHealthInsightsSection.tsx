import React from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import type {
  AstronautProfile,
  BodySystemFocusKey,
  HealthInsightItem,
  TimeRangeKey,
  TriageLevel,
} from '../types/astral';

interface AiHealthInsightsSectionProps {
  profile: AstronautProfile;
  timeRange: TimeRangeKey;
  insights: HealthInsightItem[];
  onFocusSystem: (focus: BodySystemFocusKey) => void;
}

function getSeverityIcon(level: TriageLevel) {
  if (level === 'RED') return <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />;
  if (level === 'AMBER') return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />;
  return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />;
}

function getSeverityText(level: TriageLevel): { label: string; cls: string } {
  if (level === 'RED') return { label: 'Critical Attention', cls: 'text-rose-400' };
  if (level === 'AMBER') return { label: 'Pattern Watch', cls: 'text-amber-400' };
  return { label: 'Within Baseline', cls: 'text-emerald-400' };
}

export const AiHealthInsightsSection: React.FC<AiHealthInsightsSectionProps> = ({
  profile,
  timeRange,
  insights,
  onFocusSystem,
}) => {
  return (
    <section
      id="section-ai-insights"
      aria-label="AI Health Insights"
      className="scroll-mt-16 md:scroll-mt-20 rounded-2xl border border-violet-500/30 bg-[#0b0f19]/90 p-4 backdrop-blur-md md:p-5"
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-800 pb-3.5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-violet-300">
            <BrainCircuit className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-wider">AI Health Insights</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400">
              {profile.callsign} Baseline Comparison ({timeRange.toUpperCase()})
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-bold text-white md:text-lg">
            Trend Synthesis, Baseline Deviations &amp; Pattern Alerts
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Validated Local Rule-Engine</span>
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-violet-300">
            <Info className="h-3.5 w-3.5" />
            <span>Illustrative Trend Observations</span>
          </span>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {insights.map((item) => {
          const sev = getSeverityText(item.severity);
          const isValidated = item.category === 'VALIDATED_RULE';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onFocusSystem(item.relatedSystem)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                item.severity === 'RED'
                  ? 'border-rose-500/45 bg-[#120b12] hover:border-rose-400'
                  : item.severity === 'AMBER'
                    ? 'border-amber-500/40 bg-[#13100b] hover:border-amber-400'
                    : isValidated
                      ? 'border-cyan-500/35 bg-[#0d1422] hover:border-cyan-400'
                      : 'border-slate-800 bg-[#111827]/90 hover:border-violet-400/60'
              }`}
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
                  <span
                    className={`font-semibold ${
                      isValidated ? 'text-cyan-300' : 'text-violet-300'
                    }`}
                  >
                    {isValidated
                      ? 'VALIDATED HEALTH ASSESSMENT (RULE ENGINE)'
                      : 'ILLUSTRATIVE TELEMETRY OBSERVATION'}
                  </span>
                  <span className={`font-bold ${sev.cls}`}>{sev.label}</span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{getSeverityIcon(item.severity)}</div>
                  <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {item.explanation}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 font-mono text-[10px] text-slate-400 tabular-nums">
                <span>{item.baselineComparison}</span>
                <span className="text-cyan-400">{item.timeframeLabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explicit Non-Diagnostic Disclaimer */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-800 bg-[#070b14] p-3 text-xs text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
        <p className="leading-relaxed">
          <strong className="font-mono text-slate-200">Clinical Decision Support Notice:</strong>{' '}
          Insights labeled <em>Illustrative Telemetry Observation</em> summarize simulated demo curves relative to configured astronaut baselines and are not medical diagnoses. <em>Validated Health Assessments</em> reflect deterministic local rule thresholds (NASA MD 44-A / SANS guidelines) evaluated on your current inputs.
        </p>
      </div>
    </section>
  );
};
