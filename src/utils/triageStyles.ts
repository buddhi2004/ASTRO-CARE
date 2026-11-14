import type { RecoveryStatusTier, TriageLevel } from '../types/astral';

export const TRIAGE_HEX: Record<TriageLevel, string> = {
  GREEN: '#10B981',
  AMBER: '#F59E0B',
  RED: '#EF4444',
};

export const TRIAGE_TEXT_CLASS: Record<TriageLevel, string> = {
  GREEN: 'text-emerald-400',
  AMBER: 'text-amber-400',
  RED: 'text-rose-400',
};

export const TRIAGE_BADGE_CLASS: Record<TriageLevel, string> = {
  GREEN: 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300',
  AMBER: 'border-amber-500/50 bg-amber-950/50 text-amber-300',
  RED: 'border-rose-500/50 bg-rose-950/50 text-rose-300',
};

export const RECOVERY_TIER_HEX: Record<RecoveryStatusTier, string> = {
  RED: '#EF4444',
  AMBER: '#F59E0B',
  CYAN: '#06B6D4',
  GREEN: '#10B981',
};

export const RECOVERY_TIER_BADGE_CLASS: Record<RecoveryStatusTier, string> = {
  RED: 'border-rose-500/50 bg-rose-950/50 text-rose-300',
  AMBER: 'border-amber-500/50 bg-amber-950/50 text-amber-300',
  CYAN: 'border-cyan-500/50 bg-cyan-950/50 text-cyan-300',
  GREEN: 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300',
};
