import React from 'react';
import {
  Activity,
  Compass,
  HeartPulse,
  Mail,
  Menu,
  Rocket,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { MissionMode, PageTab } from '../types/astral';

interface HeaderNavProps {
  activeTab: PageTab;
  mode: MissionMode;
  audioMuted: boolean;
  onSelectTab: (tab: PageTab) => void;
  onSelectModeAndHome: (mode: MissionMode) => void;
  onOpenOnboarding: () => void;
  onToggleAudio: () => void;
  onOpenMoreSheet: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  mode,
  audioMuted,
  onSelectTab,
  onSelectModeAndHome,
  onOpenOnboarding,
  onToggleAudio,
  onOpenMoreSheet,
}) => {
  const desktopItems: Array<{
    key: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = [
    {
      key: 'flight',
      label: 'In-Flight',
      isActive: activeTab === 'home' && mode === 'flight',
      onClick: () => onSelectModeAndHome('flight'),
    },
    {
      key: 'rehab',
      label: 'Post-Flight',
      isActive: activeTab === 'home' && mode === 'rehab',
      onClick: () => onSelectModeAndHome('rehab'),
    },
    {
      key: 'deployment',
      label: 'Mission Info',
      isActive: activeTab === 'deployment',
      onClick: () => onSelectTab('deployment'),
    },
    {
      key: 'contact',
      label: 'Contact',
      isActive: activeTab === 'contact',
      onClick: () => onSelectTab('contact'),
    },
  ];

  return (
    <>
      {/* Desktop & Mobile Top App Bar */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#040917]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-16 md:gap-8 md:px-6">
          {/* Zone 1: Single-Line Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex min-h-[44px] items-center gap-2.5 rounded-lg text-left whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="ASTROCARE Dashboard"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/50 bg-[#0a1933] font-mono text-xs font-bold text-cyan-300 shadow-[0_0_16px_-6px_rgba(34,211,238,0.6)]">
              AC
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              ASTROCARE
            </span>
          </button>

          {/* Zone 2: Desktop Single-Line Functional Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 text-sm font-medium md:flex"
          >
            {desktopItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`group relative rounded py-2 whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  item.isActive
                    ? 'font-semibold text-cyan-300'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-transform duration-200 origin-center ${
                    item.isActive
                      ? 'scale-x-100 bg-cyan-400'
                      : 'scale-x-0 bg-cyan-400/60 group-hover:scale-x-100'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={audioMuted ? 'Unmute telemetry audio' : 'Mute telemetry audio'}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:hidden"
            >
              {audioMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={onOpenOnboarding}
              className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                mode === 'flight'
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_18px_-6px_rgba(6,182,212,0.65)]'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_18px_-6px_rgba(16,185,129,0.65)]'
              }`}
            >
              Mission Setup
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="pb-safe fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-500/20 bg-[#040917]/90 backdrop-blur-xl md:hidden"
      >
        <div className="grid h-[60px] grid-cols-5 items-center">
          <button
            type="button"
            onClick={() => onSelectModeAndHome('flight')}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeTab === 'home' && mode === 'flight'
                ? 'text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>In-Flight</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectModeAndHome('rehab')}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeTab === 'home' && mode === 'rehab'
                ? 'text-emerald-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartPulse className="h-5 w-5" />
            <span>Recovery</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('deployment')}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeTab === 'deployment' ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rocket className="h-5 w-5" />
            <span>Mission</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('contact')}
            className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              activeTab === 'contact' ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="h-5 w-5" />
            <span>Contact</span>
          </button>

          <button
            type="button"
            onClick={onOpenMoreSheet}
            aria-label="More monitoring tools and settings"
            className="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-white"
          >
            {activeTab === 'home' ? (
              <Menu className="h-5 w-5" />
            ) : (
              <Compass className="h-5 w-5" />
            )}
            <span>Tools</span>
          </button>
        </div>
      </nav>
    </>
  );
};
