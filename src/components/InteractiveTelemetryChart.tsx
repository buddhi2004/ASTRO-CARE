import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ChartId, TelemetryPoint, TelemetrySeriesBundle, TimeRangeKey, TriageLevel } from '../types/astral';

export type ChartVariant = 'line' | 'area' | 'dual-line' | 'smooth-line' | 'radiation-combo';

interface InteractiveTelemetryChartProps {
  bundle: TelemetrySeriesBundle;
  variant: ChartVariant;
  timeRange: TimeRangeKey;
  isHighlighted?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

const CHART_HEIGHT = 215;
const PAD = { top: 18, right: 16, bottom: 28, left: 44 };

function buildSmoothPath(coords: Array<{ x: number; y: number }>): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  if (coords.length === 2) {
    return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)} L ${coords[1].x.toFixed(1)} ${coords[1].y.toFixed(1)}`;
  }

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function buildPolylinePath(coords: Array<{ x: number; y: number }>): string {
  if (coords.length === 0) return '';
  return coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
}

function getStatusStyles(level: TriageLevel): { text: string; glyph: string } {
  if (level === 'RED') return { text: 'text-rose-400', glyph: '✖' };
  if (level === 'AMBER') return { text: 'text-amber-400', glyph: '▲' };
  return { text: 'text-emerald-400', glyph: '●' };
}

function formatTickValue(val: number, chartId: ChartId): string {
  if (chartId === 'body_temperature') return val.toFixed(1);
  if (chartId === 'blood_oxygen' || chartId === 'respiratory_rate') return val.toFixed(1);
  if (chartId === 'radiation_exposure') return val.toFixed(0);
  return Math.round(val).toString();
}

export const InteractiveTelemetryChart: React.FC<InteractiveTelemetryChartProps> = ({
  bundle,
  variant,
  timeRange,
  isHighlighted = false,
  primaryColor = '#06b6d4',
  secondaryColor = '#8b5cf6',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [svgWidth, setSvgWidth] = useState<number>(560);

  // Zoom & Pan window indices into bundle.points
  const totalPts = bundle.points.length;
  const [windowRange, setWindowRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: Math.max(0, totalPts - 1),
  });

  // Reset zoom cleanly when time range or point count changes
  useEffect(() => {
    setWindowRange({ start: 0, end: Math.max(0, totalPts - 1) });
    setHoverIndex(null);
  }, [timeRange, totalPts]);

  // Interactive legend toggles
  const [showPrimary, setShowPrimary] = useState<boolean>(true);
  const [showSecondary, setShowSecondary] = useState<boolean>(true);
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [showThreshold, setShowThreshold] = useState<boolean>(true);

  // Hover & drag pan state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; start: number; end: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Responsive ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 120) {
          setSvgWidth(Math.round(entry.contentRect.width));
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visiblePoints = useMemo(() => {
    const s = Math.max(0, Math.min(totalPts - 1, windowRange.start));
    const e = Math.max(s, Math.min(totalPts - 1, windowRange.end));
    return bundle.points.slice(s, e + 1);
  }, [bundle.points, totalPts, windowRange]);

  const isZoomed = windowRange.start > 0 || windowRange.end < totalPts - 1;
  const spanCount = windowRange.end - windowRange.start + 1;

  const handleZoomIn = () => {
    if (spanCount <= 6) return;
    const step = Math.max(2, Math.floor(spanCount * 0.22));
    const nextStart = Math.min(windowRange.end - 5, windowRange.start + Math.floor(step / 2));
    const nextEnd = Math.max(nextStart + 5, windowRange.end - Math.ceil(step / 2));
    setWindowRange({ start: nextStart, end: nextEnd });
  };

  const handleZoomOut = () => {
    if (!isZoomed) return;
    const step = Math.max(2, Math.floor(spanCount * 0.3));
    const nextStart = Math.max(0, windowRange.start - Math.floor(step / 2));
    const nextEnd = Math.min(totalPts - 1, windowRange.end + Math.ceil(step / 2));
    setWindowRange({ start: nextStart, end: nextEnd });
  };

  const handlePan = (dir: -1 | 1) => {
    if (!isZoomed) return;
    const shift = Math.max(1, Math.floor(spanCount * 0.25)) * dir;
    let nextStart = windowRange.start + shift;
    let nextEnd = windowRange.end + shift;
    if (nextStart < 0) {
      nextEnd += -nextStart;
      nextStart = 0;
    }
    if (nextEnd > totalPts - 1) {
      const over = nextEnd - (totalPts - 1);
      nextStart = Math.max(0, nextStart - over);
      nextEnd = totalPts - 1;
    }
    setWindowRange({ start: nextStart, end: nextEnd });
  };

  const handleResetZoom = () => {
    setWindowRange({ start: 0, end: Math.max(0, totalPts - 1) });
  };

  // Compute Y domain across visible points & visible series
  const { yMin, yMax } = useMemo(() => {
    const vals: number[] = [];
    visiblePoints.forEach((p) => {
      if (showPrimary) vals.push(p.value);
      if (
        showSecondary &&
        typeof p.secondaryValue === 'number' &&
        variant === 'dual-line'
      ) {
        vals.push(p.secondaryValue);
      }
    });
    if (showBaseline && variant !== 'radiation-combo') {
      vals.push(bundle.baselineValue);
    }
    if (showThreshold && typeof bundle.warningThreshold === 'number') {
      // Only include threshold in Y-scale if reasonably close so chart doesn't flatten
      const avg = bundle.stats.avg;
      if (Math.abs(bundle.warningThreshold - avg) < Math.max(20, avg * 0.35)) {
        vals.push(bundle.warningThreshold);
      }
    }
    if (vals.length === 0) {
      vals.push(0, 100);
    }
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const rawSpan = rawMax - rawMin || 1;
    const pad = rawSpan * 0.16;
    return {
      yMin: rawMin - pad,
      yMax: rawMax + pad,
    };
  }, [visiblePoints, showPrimary, showSecondary, showBaseline, showThreshold, variant, bundle]);

  const plotW = Math.max(100, svgWidth - PAD.left - PAD.right);
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const mapX = (localIdx: number) =>
    visiblePoints.length <= 1
      ? PAD.left + plotW / 2
      : PAD.left + (localIdx / (visiblePoints.length - 1)) * plotW;

  const mapY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin || 1);
    return PAD.top + plotH - Math.max(0, Math.min(1, ratio)) * plotH;
  };

  const primaryCoords = useMemo(
    () =>
      visiblePoints.map((p, idx) => ({
        x: mapX(idx),
        y: mapY(p.value),
        point: p,
      })),
    [visiblePoints, svgWidth, yMin, yMax]
  );

  const secondaryCoords = useMemo(
    () =>
      variant === 'dual-line'
        ? visiblePoints.map((p, idx) => ({
            x: mapX(idx),
            y: mapY(p.secondaryValue ?? p.value),
            point: p,
          }))
        : [],
    [visiblePoints, variant, svgWidth, yMin, yMax]
  );

  // Secondary scale for Radiation daily bars (mSv/day)
  const dailyBarScaleMax = useMemo(() => {
    if (variant !== 'radiation-combo') return 2;
    const maxDaily = Math.max(
      1.8,
      ...visiblePoints.map((p) => p.secondaryValue ?? 0)
    );
    return maxDaily * 1.25;
  }, [variant, visiblePoints]);

  const useSmoothCurve = variant === 'smooth-line' || variant === 'area' || variant === 'radiation-combo';
  const primaryPath = useSmoothCurve
    ? buildSmoothPath(primaryCoords)
    : buildPolylinePath(primaryCoords);
  const secondaryPath = buildPolylinePath(secondaryCoords);

  const areaPath = useMemo(() => {
    if (primaryCoords.length === 0) return '';
    const baseY = PAD.top + plotH;
    const first = primaryCoords[0];
    const last = primaryCoords[primaryCoords.length - 1];
    return `${primaryPath} L ${last.x.toFixed(1)} ${baseY.toFixed(1)} L ${first.x.toFixed(1)} ${baseY.toFixed(1)} Z`;
  }, [primaryPath, primaryCoords, plotH]);

  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => {
      const val = yMin + ((yMax - yMin) * i) / count;
      return { val, y: mapY(val) };
    });
  }, [yMin, yMax]);

  const xTickIndices = useMemo(() => {
    if (visiblePoints.length <= 5) return visiblePoints.map((_, i) => i);
    const step = Math.max(1, Math.floor((visiblePoints.length - 1) / 4));
    const indices: number[] = [];
    for (let i = 0; i < visiblePoints.length; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== visiblePoints.length - 1) {
      indices.push(visiblePoints.length - 1);
    }
    return indices;
  }, [visiblePoints]);

  const updateHoverFromClientX = (clientX: number, rect: DOMRect) => {
    const relX = clientX - rect.left - PAD.left;
    const clamped = Math.max(0, Math.min(plotW, relX));
    const ratio = clamped / (plotW || 1);
    const idx = Math.round(ratio * (visiblePoints.length - 1));
    setHoverIndex(Math.max(0, Math.min(visiblePoints.length - 1, idx)));
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isZoomed) {
      dragStartRef.current = {
        x: e.clientX,
        start: windowRange.start,
        end: windowRange.end,
      };
      setIsDragging(true);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    updateHoverFromClientX(e.clientX, rect);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (isDragging && dragStartRef.current && isZoomed) {
      const dx = e.clientX - dragStartRef.current.x;
      const ptsPerPx = spanCount / (plotW || 1);
      const shift = Math.round(-dx * ptsPerPx);
      let nextStart = dragStartRef.current.start + shift;
      let nextEnd = dragStartRef.current.end + shift;
      if (nextStart < 0) {
        nextEnd += -nextStart;
        nextStart = 0;
      }
      if (nextEnd > totalPts - 1) {
        const over = nextEnd - (totalPts - 1);
        nextStart = Math.max(0, nextStart - over);
        nextEnd = totalPts - 1;
      }
      setWindowRange({ start: nextStart, end: nextEnd });
    }
    updateHoverFromClientX(e.clientX, rect);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const activePoint: TelemetryPoint | null =
    hoverIndex !== null && visiblePoints[hoverIndex] ? visiblePoints[hoverIndex] : null;
  const activeCoord = hoverIndex !== null && primaryCoords[hoverIndex] ? primaryCoords[hoverIndex] : null;
  const statusInfo = getStatusStyles(bundle.status);
  const glowFilterId = `glow-${bundle.id}`;
  const areaGradId = `area-${bundle.id}`;

  const baselineY = mapY(bundle.baselineValue);
  const warningY =
    typeof bundle.warningThreshold === 'number' ? mapY(bundle.warningThreshold) : null;

  return (
    <article
      id={`chart-card-${bundle.id}`}
      data-testid={`telemetry-chart-${bundle.id}`}
      className={`flex flex-col rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 ${
        isHighlighted
          ? 'border-cyan-400/75 bg-[#0c1424]/95 shadow-[0_0_28px_-10px_rgba(6,182,212,0.45)]'
          : 'border-slate-800/90 bg-[#0b0f19]/90 hover:border-slate-700'
      }`}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <span className={`font-bold ${statusInfo.text}`}>
              {statusInfo.glyph} {bundle.statusLabel}
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400">
              {bundle.dataOrigin === 'LIVE_LOCAL' ? 'Live Self-Exam' : 'Illustrative Demo'}
            </span>
          </div>
          <h4 className="mt-0.5 text-sm font-bold text-white md:text-base">{bundle.title}</h4>
          <p className="text-[11px] text-slate-400">{bundle.subtitle}</p>
        </div>

        <div className="text-right font-mono tabular-nums">
          <div className="text-xl font-bold text-white md:text-2xl">{bundle.currentDisplay}</div>
          <div className="text-[10px] text-slate-400">
            Min {bundle.stats.min} · Avg {bundle.stats.avg} · Max {bundle.stats.max}
          </div>
        </div>
      </div>

      {/* Controls Row: Interactive Legend + Zoom/Pan Controls */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Interactive Legend */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setShowPrimary((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors ${
              showPrimary
                ? 'border-slate-700 bg-[#111827] text-slate-200'
                : 'border-slate-800/70 bg-transparent text-slate-500 line-through'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: showPrimary ? primaryColor : '#475569' }}
            />
            <span>{bundle.primaryLabel}</span>
          </button>

          {bundle.secondaryLabel && (
            <button
              type="button"
              onClick={() => setShowSecondary((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors ${
                showSecondary
                  ? 'border-slate-700 bg-[#111827] text-slate-200'
                  : 'border-slate-800/70 bg-transparent text-slate-500 line-through'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: showSecondary ? secondaryColor : '#475569' }}
              />
              <span>{bundle.secondaryLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowBaseline((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-colors ${
              showBaseline
                ? 'border-slate-700 bg-[#111827] text-slate-300'
                : 'border-slate-800/70 bg-transparent text-slate-500 line-through'
            }`}
          >
            <span className="h-0.5 w-2.5 bg-slate-400" />
            <span>Baseline</span>
          </button>

          {typeof bundle.warningThreshold === 'number' && (
            <button
              type="button"
              onClick={() => setShowThreshold((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-colors ${
                showThreshold
                  ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                  : 'border-slate-800/70 bg-transparent text-slate-500 line-through'
              }`}
            >
              <span className="h-0.5 w-2.5 bg-amber-400" />
              <span>Limit</span>
            </button>
          )}
        </div>

        {/* Zoom & Scroll Controls */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => handlePan(-1)}
            disabled={!isZoomed || windowRange.start === 0}
            aria-label={`Pan ${bundle.title} left`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-[#111827] text-slate-300 hover:border-cyan-500/50 hover:text-white disabled:opacity-35"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handlePan(1)}
            disabled={!isZoomed || windowRange.end === totalPts - 1}
            aria-label={`Pan ${bundle.title} right`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-[#111827] text-slate-300 hover:border-cyan-500/50 hover:text-white disabled:opacity-35"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={spanCount <= 6}
            aria-label={`Zoom in ${bundle.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-[#111827] text-slate-300 hover:border-cyan-500/50 hover:text-white disabled:opacity-35"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={!isZoomed}
            aria-label={`Zoom out ${bundle.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-[#111827] text-slate-300 hover:border-cyan-500/50 hover:text-white disabled:opacity-35"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          {isZoomed && (
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label={`Reset zoom ${bundle.title}`}
              className="flex h-7 items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-950/40 px-2 text-cyan-300 hover:bg-cyan-950/70"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Interactive SVG Canvas */}
      <div
        ref={containerRef}
        className="relative mt-2 w-full select-none rounded-xl border border-slate-800/80 bg-[#060a14] p-1"
      >
        <svg
          width={svgWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${svgWidth} ${CHART_HEIGHT}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            handlePointerUp();
            setHoverIndex(null);
          }}
          onDoubleClick={handleResetZoom}
          className={`w-full overflow-visible ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
          role="img"
          aria-label={`${bundle.title} interactive telemetry chart`}
        >
          <defs>
            <filter id={glowFilterId} x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="2.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.34" />
              <stop offset="85%" stopColor={primaryColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Ticks */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={PAD.left}
                x2={svgWidth - PAD.right}
                y1={tick.y}
                y2={tick.y}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeDasharray="3 4"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 7}
                y={tick.y + 3.5}
                textAnchor="end"
                className="fill-slate-500 font-mono text-[10px]"
              >
                {formatTickValue(tick.val, bundle.id)}
              </text>
            </g>
          ))}

          {/* Baseline Reference Line */}
          {showBaseline &&
            variant !== 'radiation-combo' &&
            baselineY >= PAD.top &&
            baselineY <= PAD.top + plotH && (
              <line
                x1={PAD.left}
                x2={svgWidth - PAD.right}
                y1={baselineY}
                y2={baselineY}
                stroke="rgba(148, 163, 184, 0.45)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            )}

          {/* Warning Threshold Line */}
          {showThreshold &&
            warningY !== null &&
            warningY >= PAD.top &&
            warningY <= PAD.top + plotH && (
              <g>
                <line
                  x1={PAD.left}
                  x2={svgWidth - PAD.right}
                  y1={warningY}
                  y2={warningY}
                  stroke="rgba(245, 158, 11, 0.65)"
                  strokeDasharray="6 3"
                  strokeWidth="1.2"
                />
                <text
                  x={svgWidth - PAD.right - 4}
                  y={warningY - 4}
                  textAnchor="end"
                  className="fill-amber-400 font-mono text-[9px]"
                >
                  Alert {bundle.warningThreshold} {bundle.unit}
                </text>
              </g>
            )}

          {/* Radiation Daily Dose Bars (Combo Variant) */}
          {variant === 'radiation-combo' &&
            showSecondary &&
            visiblePoints.map((p, idx) => {
              const cx = mapX(idx);
              const daily = p.secondaryValue ?? 0;
              const barH = Math.min(plotH * 0.65, (daily / dailyBarScaleMax) * (plotH * 0.65));
              const barW = Math.max(6, Math.min(18, plotW / visiblePoints.length - 6));
              const isHigh = daily >= 1.2;
              return (
                <rect
                  key={`bar-${p.index}`}
                  x={cx - barW / 2}
                  y={PAD.top + plotH - barH}
                  width={barW}
                  height={barH}
                  rx={2}
                  fill={isHigh ? 'rgba(245, 158, 11, 0.55)' : 'rgba(139, 92, 246, 0.45)'}
                  stroke={isHigh ? '#f59e0b' : '#8b5cf6'}
                  strokeWidth="1"
                />
              );
            })}

          {/* Area Fill (Area & Radiation-Combo Variants) */}
          {showPrimary && (variant === 'area' || variant === 'radiation-combo') && areaPath && (
            <path d={areaPath} fill={`url(#${areaGradId})`} />
          )}

          {/* Secondary Line (Blood Pressure Diastolic) */}
          {variant === 'dual-line' && showSecondary && secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowFilterId})`}
            />
          )}

          {/* Primary Glowing Line */}
          {showPrimary && primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowFilterId})`}
            />
          )}

          {/* Unusual Reading / Anomaly Markers */}
          {showPrimary &&
            primaryCoords.map((c) =>
              c.point.isAnomaly ? (
                <g key={`anom-${c.point.index}`}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={5.5}
                    fill="rgba(245, 158, 11, 0.2)"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <circle cx={c.x} cy={c.y} r={2.3} fill="#fbbf24" />
                </g>
              ) : null
            )}

          {/* Latest Value Endpoint Dot */}
          {showPrimary && primaryCoords.length > 0 && (
            <circle
              cx={primaryCoords[primaryCoords.length - 1].x}
              cy={primaryCoords[primaryCoords.length - 1].y}
              r={3.5}
              fill="#ffffff"
              stroke={primaryColor}
              strokeWidth="2"
            />
          )}

          {/* X-Axis Labels */}
          {xTickIndices.map((idx) => {
            const pt = visiblePoints[idx];
            if (!pt) return null;
            const x = mapX(idx);
            const anchor =
              idx === 0 ? 'start' : idx === visiblePoints.length - 1 ? 'end' : 'middle';
            return (
              <text
                key={`xtick-${pt.index}`}
                x={x}
                y={CHART_HEIGHT - 8}
                textAnchor={anchor}
                className="fill-slate-400 font-mono text-[10px]"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Hover Crosshair & Active Point Ring */}
          {activePoint && activeCoord && (
            <g>
              <line
                x1={activeCoord.x}
                x2={activeCoord.x}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke="rgba(34, 211, 238, 0.5)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {showPrimary && (
                <circle
                  cx={activeCoord.x}
                  cy={activeCoord.y}
                  r={5}
                  fill="#0b0f19"
                  stroke={primaryColor}
                  strokeWidth="2.5"
                />
              )}
              {variant === 'dual-line' &&
                showSecondary &&
                hoverIndex !== null &&
                secondaryCoords[hoverIndex] && (
                  <circle
                    cx={secondaryCoords[hoverIndex].x}
                    cy={secondaryCoords[hoverIndex].y}
                    r={4.5}
                    fill="#0b0f19"
                    stroke={secondaryColor}
                    strokeWidth="2.5"
                  />
                )}
            </g>
          )}
        </svg>

        {/* Floating Glass Tooltip */}
        {activePoint && activeCoord && (
          <div
            className="pointer-events-none absolute top-2 z-20 min-w-[168px] rounded-lg border border-cyan-500/50 bg-[#070b14]/95 px-2.5 py-2 font-mono text-[11px] shadow-xl backdrop-blur"
            style={{
              left:
                activeCoord.x > svgWidth * 0.56
                  ? Math.max(8, activeCoord.x - 180)
                  : Math.min(svgWidth - 180, activeCoord.x + 12),
            }}
          >
            <div className="text-[10px] text-slate-400">{activePoint.timestamp}</div>
            <div className="mt-1 flex items-center justify-between gap-3 font-bold text-white tabular-nums">
              <span style={{ color: primaryColor }}>{bundle.primaryLabel}</span>
              <span>
                {activePoint.value} {bundle.unit}
              </span>
            </div>
            {typeof activePoint.secondaryValue === 'number' && bundle.secondaryLabel && (
              <div className="flex items-center justify-between gap-3 font-bold text-white tabular-nums">
                <span style={{ color: secondaryColor }}>{bundle.secondaryLabel}</span>
                <span>
                  {activePoint.secondaryValue}{' '}
                  {variant === 'radiation-combo' ? 'mSv/d' : bundle.unit}
                </span>
              </div>
            )}
            {activePoint.isAnomaly && activePoint.anomalyReason && (
              <div className="mt-1 border-t border-slate-800 pt-1 text-[10px] leading-snug text-amber-300">
                ▲ {activePoint.anomalyReason}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Zoom Scrubber Status (when zoomed) */}
      {isZoomed && (
        <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] text-slate-400">
          <span>
            Window: {visiblePoints[0]?.label} → {visiblePoints[visiblePoints.length - 1]?.label} (
            {visiblePoints.length}/{totalPts} pts)
          </span>
          <input
            type="range"
            aria-label={`Scroll ${bundle.title} timeline`}
            min={0}
            max={Math.max(0, totalPts - spanCount)}
            value={windowRange.start}
            onChange={(e) => {
              const s = Number(e.target.value);
              setWindowRange({ start: s, end: Math.min(totalPts - 1, s + spanCount - 1) });
            }}
            className="h-1.5 w-32 cursor-pointer accent-cyan-400"
          />
        </div>
      )}
    </article>
  );
};
