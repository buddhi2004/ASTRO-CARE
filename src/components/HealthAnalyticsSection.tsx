import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
} from 'lucide-react';
import { TIME_RANGE_OPTIONS } from '../data/healthTelemetry';
import { ATLAS_BY_KEY } from '../data/openAnatomyData';
import type {
  AstronautTelemetryBundle,
  BodySystemFocusKey,
  BodySystemFocusMeta,
  ChartId,
  TimeRangeKey,
} from '../types/astral';
import { AiHealthInsightsSection } from './AiHealthInsightsSection';
import { ChartVariant, InteractiveTelemetryChart } from './InteractiveTelemetryChart';

export type AnalyticsSystemTab =
  | 'cardiovascular'
  | 'respiratory'
  | 'temperature'
  | 'radiation'
  | 'insights'
  | 'all';

interface HealthAnalyticsSectionProps {
  telemetry: AstronautTelemetryBundle;
  systemFocus: BodySystemFocusKey;
  systemMeta: BodySystemFocusMeta;
  selectedAtlasKey: string;
  activeChartId: ChartId | null;
  timeRange: TimeRangeKey;
  requestedTab?: AnalyticsSystemTab;
  onChangeTimeRange: (range: TimeRangeKey) => void;
  onSelectSystemFocus: (focus: BodySystemFocusKey) => void;
}

const ANALYTICS_TABS: Array<{ key: AnalyticsSystemTab; label: string }> = [
  { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'radiation', label: 'Radiation' },
  { key: 'insights', label: 'AI Insights' },
  { key: 'all', label: 'All 6 Charts' },
];

const CHART_CONFIG: Record<
  ChartId,
  { variant: ChartVariant; primaryColor: string; secondaryColor?: string }
> = {
  heart_rate: { variant: 'line', primaryColor: '#06b6d4' },
  blood_oxygen: { variant: 'area', primaryColor: '#38bdf8' },
  blood_pressure: {
    variant: 'dual-line',
    primaryColor: '#22d3ee',
    secondaryColor: '#a78bfa',
  },
  respiratory_rate: { variant: 'line', primaryColor: '#60a5fa' },
  body_temperature: { variant: 'smooth-line', primaryColor: '#34d399' },
  radiation_exposure: {
    variant: 'radiation-combo',
    primaryColor: '#06b6d4',
    secondaryColor: '#8b5cf6',
  },
};

function mapFocusToAnalyticsTab(focus: BodySystemFocusKey, chartId: ChartId | null): AnalyticsSystemTab {
  if (chartId === 'heart_rate' || chartId === 'blood_pressure') return 'cardiovascular';
  if (chartId === 'blood_oxygen' || chartId === 'respiratory_rate') return 'respiratory';
  if (chartId === 'body_temperature') return 'temperature';
  if (chartId === 'radiation_exposure') return 'radiation';
  if (focus === 'cardiovascular') return 'cardiovascular';
  if (focus === 'respiratory') return 'respiratory';
  if (focus === 'musculoskeletal') return 'radiation';
  return 'cardiovascular';
}

export const HealthAnalyticsSection: React.FC<HealthAnalyticsSectionProps> = ({
  telemetry,
  systemFocus,
  systemMeta,
  selectedAtlasKey,
  activeChartId,
  timeRange,
  requestedTab,
  onChangeTimeRange,
  onSelectSystemFocus,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsSystemTab>(() =>
    requestedTab ?? mapFocusToAnalyticsTab(systemFocus, activeChartId)
  );

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  useEffect(() => {
    if (activeChartId) {
      setActiveTab(mapFocusToAnalyticsTab(systemFocus, activeChartId));
    }
  }, [activeChartId, systemFocus]);

  const selectedAtlasEntry = ATLAS_BY_KEY[selectedAtlasKey];

  const visibleChartIds: ChartId[] =
    activeTab === 'cardiovascular'
      ? ['heart_rate', 'blood_pressure']
      : activeTab === 'respiratory'
        ? ['blood_oxygen', 'respiratory_rate']
        : activeTab === 'temperature'
          ? ['body_temperature']
          : activeTab === 'radiation'
            ? ['radiation_exposure']
            : activeTab === 'all'
              ? [
                  'heart_rate',
                  'blood_oxygen',
                  'blood_pressure',
                  'respiratory_rate',
                  'body_temperature',
                  'radiation_exposure',
                ]
              : [];

  return (
    <div
      id="section-health-analytics"
      className="space-y-4"
    >
      {/* Controls Bar: Health System Tabs + Time Range */}
      <div className="flex flex-col gap-3 border-b border-cyan-500/20 pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Detailed telemetry systems"
          className="flex flex-wrap items-center gap-1.5"
        >
          {ANALYTICS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-[36px] rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                    : 'border-cyan-500/20 bg-[#0b152c]/85 text-slate-300 hover:border-cyan-400/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Telemetry time range"
            className="flex items-center gap-1 rounded-xl border border-cyan-500/20 bg-[#0b152c]/85 p-1 font-mono text-xs"
          >
            <Clock className="ml-1.5 mr-0.5 h-3.5 w-3.5 text-slate-400" />
            {TIME_RANGE_OPTIONS.map((opt) => {
              const active = timeRange === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeTimeRange(opt.key)}
                  className={`min-h-[32px] rounded-lg px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Focused System Context Strip */}
      <div className="flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-[#0b152c]/80 px-3.5 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <span>
            <strong className="text-white">{systemMeta.label}</strong>
            {selectedAtlasEntry ? ` · 3D Target: ${selectedAtlasEntry.label}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
          <span>{telemetry.profile.callsign} · {telemetry.profile.name}</span>
        </div>
      </div>

      {/* Tab Content with lightweight smooth transition */}
      <div key={activeTab} className="astro-page-enter">
        {activeTab === 'insights' ? (
          <AiHealthInsightsSection
            profile={telemetry.profile}
            timeRange={timeRange}
            insights={telemetry.insights}
            onFocusSystem={onSelectSystemFocus}
          />
        ) : (
          <div
            className={`grid grid-cols-1 gap-4 ${
              visibleChartIds.length > 1 ? 'lg:grid-cols-2' : ''
            }`}
          >
            {visibleChartIds.map((chartId) => {
              const chartBundle = telemetry.charts[chartId];
              const cfg = CHART_CONFIG[chartId];
              const isHighlighted = activeChartId === chartId;
              return (
                <InteractiveTelemetryChart
                  key={chartId}
                  bundle={chartBundle}
                  variant={cfg.variant}
                  timeRange={timeRange}
                  isHighlighted={isHighlighted}
                  primaryColor={cfg.primaryColor}
                  secondaryColor={cfg.secondaryColor}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
