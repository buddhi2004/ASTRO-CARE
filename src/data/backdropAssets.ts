import earthHorizonBackdrop from '../assets/images/earth_orbit_backdrop_1794640515854.jpg';
import type { MissionMode } from '../types/astral';

/**
 * Curated ASTROCARE (ASTRAL-MED) mission background imagery mapped to real workspace assets.
 * Public assets under `/public/assets/aistudio/...` are served from `/assets/aistudio/...`.
 */
export const BACKDROP_ASSETS = {
  /** Widescreen deep-space cosmic nebula & starfield (main dashboard & space weather) */
  deepSpaceNebula: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_13.13.10__1__1b8a6a49.jpeg',
  /** ISS Cupola observation window overlooking Earth (in-flight telemetry & orbital overview) */
  issCupolaOrbit: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_13.13.09_d9d065b7.jpeg',
  /** Vertical neon NASA outline emblem on deep navy (3D anatomy viewport & mission headers) */
  nasaNeonEmblem: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_13.13.10_f8bc2001.jpeg',
  /** Atmospheric Earth limb from low-Earth orbit (post-flight recovery & Earth readiness) */
  earthHorizon: earthHorizonBackdrop,
} as const;

export type BackdropThemeId = 'auto' | 'cupola' | 'nebula' | 'nasa' | 'earth';

export const BACKDROP_OPTIONS: ReadonlyArray<{ id: BackdropThemeId; label: string }> = [
  { id: 'auto', label: 'Backdrop: Auto' },
  { id: 'cupola', label: 'Backdrop: ISS Cupola' },
  { id: 'nebula', label: 'Backdrop: Cosmic Nebula' },
  { id: 'nasa', label: 'Backdrop: NASA Neon' },
  { id: 'earth', label: 'Backdrop: Earth Horizon' },
];

export function resolveDashboardBackdrop(
  theme: BackdropThemeId,
  mode: MissionMode
): { url: string; isPortraitEmblem: boolean } {
  if (theme === 'cupola') {
    return { url: BACKDROP_ASSETS.issCupolaOrbit, isPortraitEmblem: false };
  }
  if (theme === 'nebula') {
    return { url: BACKDROP_ASSETS.deepSpaceNebula, isPortraitEmblem: false };
  }
  if (theme === 'nasa') {
    return { url: BACKDROP_ASSETS.nasaNeonEmblem, isPortraitEmblem: true };
  }
  if (theme === 'earth') {
    return { url: BACKDROP_ASSETS.earthHorizon, isPortraitEmblem: false };
  }
  return mode === 'flight'
    ? { url: BACKDROP_ASSETS.deepSpaceNebula, isPortraitEmblem: false }
    : { url: BACKDROP_ASSETS.issCupolaOrbit, isPortraitEmblem: false };
}
