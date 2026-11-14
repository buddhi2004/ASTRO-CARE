import React, { useMemo, useState } from 'react';
import { Layers, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { getStructuresForSex } from '../../data/openAnatomyData';
import type { AtlasSex } from '../../types/astral';

interface WebGLFallbackProps {
  mode: 'flight' | 'rehab';
  sex: AtlasSex;
  selectedKey: string;
  reason?: string;
  onSelectKey: (key: string) => void;
  onRetry3D?: () => void;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({
  mode,
  sex,
  selectedKey,
  reason = 'WebGL 3D context unavailable in this browser environment.',
  onSelectKey,
  onRetry3D,
}) => {
  const [query, setQuery] = useState('');
  const structures = useMemo(() => {
    const all = getStructuresForSex(sex);
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 24);
    return all
      .filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.key.toLowerCase().includes(q)
      )
      .slice(0, 24);
  }, [sex, query]);

  return (
    <div
      data-testid={`webgl-fallback-${mode}`}
      className="flex h-full min-h-[480px] w-full flex-col justify-between rounded-xl border border-slate-800 bg-[#060a13] p-4"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-700/40 bg-amber-950/20 p-3 text-xs">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <div className="font-mono font-bold text-amber-300">
                Anatomical Index Fallback Active
              </div>
              <p className="mt-0.5 break-words text-slate-300">
                {reason} Select any anatomical structure below to inspect details and ASTROCARE clinical telemetry.
              </p>
            </div>
          </div>
          {onRetry3D && (
            <button
              type="button"
              onClick={onRetry3D}
              className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-lg border border-amber-600/60 bg-amber-950/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-amber-200 hover:bg-amber-900/60"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry 3D</span>
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter anatomical structures..."
            className="min-h-[38px] w-full rounded-lg border border-slate-700 bg-[#0b0f19] pl-8 pr-3 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="grid max-h-[320px] grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
          {structures.map((item) => {
            const active = selectedKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectKey(item.key)}
                className={`flex min-h-[38px] items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left font-mono text-[11px] transition-colors ${
                  active
                    ? 'border-cyan-400 bg-cyan-950/60 text-white'
                    : 'border-slate-800 bg-[#0b0f19] text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-slate-500">
        <Layers className="h-3.5 w-3.5" />
        <span>Open-Anatomy-3D Catalog Fallback ({sex})</span>
      </div>
    </div>
  );
};
