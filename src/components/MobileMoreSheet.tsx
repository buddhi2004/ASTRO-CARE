import React from 'react';
import {
  FileText,
  Mail,
  Radio,
  Rocket,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { MissionMode, PageTab } from '../types/astral';

interface MobileMoreSheetProps {
  open: boolean;
  mode: MissionMode;
  audioMuted: boolean;
  donkiSource: string;
  onClose: () => void;
  onSelectTab: (tab: PageTab) => void;
  onSwitchMode: (mode: MissionMode) => void;
  onOpenPlan: () => void;
  onOpenNasaModal: () => void;
  onToggleAudio: () => void;
}

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({
  open,
  mode,
  audioMuted,
  donkiSource,
  onClose,
  onSelectTab,
  onSwitchMode,
  onOpenPlan,
  onOpenNasaModal,
  onToggleAudio,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mission tools and navigation"
    >
      <div className="w-full rounded-t-3xl border-t border-cyan-500/25 bg-[#060d1f]/95 px-5 pb-8 pt-3 shadow-2xl backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-700"
        />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Mission Tools &amp; Navigation</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Mode Switch */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-cyan-500/20 bg-[#0b152c] p-1.5">
          <button
            type="button"
            onClick={() => {
              onSwitchMode('flight');
              onClose();
            }}
            className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              mode === 'flight'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            In-Flight Monitor
          </button>
          <button
            type="button"
            onClick={() => {
              onSwitchMode('rehab');
              onClose();
            }}
            className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              mode === 'rehab'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Post-Flight Rehab
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 rounded-2xl border border-cyan-500/20 bg-[#0b152c]">
          <button
            type="button"
            onClick={() => {
              onOpenPlan();
              onClose();
            }}
            className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/60"
          >
            <span className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-cyan-400" />
              Prescribed Mission Plan
            </span>
            <span className="text-xs text-slate-400">Open</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('deployment');
              onClose();
            }}
            className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/60"
          >
            <span className="flex items-center gap-3">
              <Rocket className="h-4 w-4 text-cyan-400" />
              Mission Info &amp; Tiers
            </span>
            <span className="text-xs text-slate-400">View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('contact');
              onClose();
            }}
            className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/60"
          >
            <span className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-cyan-400" />
              Contact Team RETRO-V
            </span>
            <span className="text-xs text-slate-400">Open</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenNasaModal();
              onClose();
            }}
            className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/60"
          >
            <span className="flex items-center gap-3">
              <Radio className="h-4 w-4 text-amber-400" />
              NASA DONKI Gateway
            </span>
            <span className="font-mono text-xs text-slate-400">{donkiSource}</span>
          </button>

          <button
            type="button"
            onClick={onToggleAudio}
            className="flex min-h-[52px] w-full items-center justify-between px-4 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/60"
          >
            <span className="flex items-center gap-3">
              {audioMuted ? (
                <VolumeX className="h-4 w-4 text-slate-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-cyan-400" />
              )}
              Telemetry Audio Feedback
            </span>
            <span className="font-mono text-xs text-slate-400">
              {audioMuted ? 'Muted' : 'Active'}
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Offline-First Clinical Assessment · Team RETRO-V</span>
        </div>
      </div>
    </div>
  );
};
