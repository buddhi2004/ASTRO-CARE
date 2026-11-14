import React, { useState } from 'react';
import { Radio, X } from 'lucide-react';
import { BACKDROP_ASSETS } from '../data/backdropAssets';

interface NasaDonkiModalProps {
  open: boolean;
  currentKey: string;
  onClose: () => void;
  onSaveAndTest: (apiKey: string) => void;
}

export const NasaDonkiModal: React.FC<NasaDonkiModalProps> = ({
  open,
  currentKey,
  onClose,
  onSaveAndTest,
}) => {
  const [keyInput, setKeyInput] = useState(currentKey || 'DEMO_KEY');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nasa-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-cyan-500/30 bg-[#080e1d] p-5 pb-8 shadow-2xl md:rounded-2xl md:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{ backgroundImage: `url("${BACKDROP_ASSETS.deepSpaceNebula}")` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(8, 14, 29, 0.76) 0%, rgba(7, 12, 24, 0.86) 55%, rgba(5, 9, 20, 0.92) 100%)',
            }}
          />
        </div>
        <div className="relative z-10">
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-700 md:hidden"
        />

        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <h3
            id="nasa-modal-title"
            className="flex items-center gap-2 text-base font-bold text-white"
          >
            <Radio className="h-4 w-4 text-cyan-400" />
            <span>NASA Open API (DONKI) Gateway</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close NASA API modal"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-slate-300">
          ASTROCARE queries live space weather feeds from NASA DONKI to alert in-flight crew to solar flare and Coronal Mass Ejection (CME) radiation hazards.
        </p>

        <div className="space-y-3 font-mono text-xs">
          <div>
            <label htmlFor="nasa-api-key-input" className="mb-1.5 block text-slate-400">
              NASA API Key (defaults to DEMO_KEY)
            </label>
            <input
              id="nasa-api-key-input"
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#111827] p-3">
            <span className="block text-[11px] text-slate-400">Resilience Guarantee</span>
            <p className="mt-1 text-emerald-400">
              100% Offline Fallback: if offline or rate-limited, cached orbital space weather simulations keep EVA risk guidance available without interruption.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-slate-700 bg-[#111827] px-4 py-2 font-mono text-xs text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSaveAndTest(keyInput)}
            className="min-h-[44px] rounded-xl bg-cyan-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-cyan-500"
          >
            Save & Test Query
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
