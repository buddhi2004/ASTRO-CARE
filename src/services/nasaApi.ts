import type { DonkiFetchResult, DonkiSpaceWeatherEvent } from '../types/astral';

const OFFLINE_SIMULATED_EVENTS: DonkiSpaceWeatherEvent[] = [
  {
    activityID: '2026-11-11T08:14:00-CME-001',
    startTime: '2026-11-11T08:14Z',
    note: 'Moderate Earth-directed halo Coronal Mass Ejection (680 km/s). Elevated proton flux monitored for polar & lunar EVA operations.',
    radiationRiskLevel: 'ELEVATED · S1 WATCH',
    evaAdvisory: 'Limit unshielded EVA > 4h; track dosimeter',
    instruments: [{ displayName: 'SOHO: LASCO/C2' }],
  },
  {
    activityID: '2026-11-12T19:40:00-FLR-002',
    startTime: '2026-11-12T19:40Z',
    note: 'M2.4 class solar flare from Active Region AR3889. Minor HF radio blackout on sunlit hemisphere; habitat shielding remains nominal.',
    radiationRiskLevel: 'NOMINAL · MONITORED',
    evaAdvisory: 'Standard EVA Ops · Hydration Check',
    instruments: [{ displayName: 'GOES-18: EXIS' }],
  },
];

export class NasaSpaceWeatherService {
  private apiKey: string;

  constructor(apiKey: string = 'DEMO_KEY') {
    this.apiKey = apiKey.trim() || 'DEMO_KEY';
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim() || 'DEMO_KEY';
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async fetchCMEEvents(): Promise<DonkiFetchResult> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = `https://api.nasa.gov/DONKI/CME?startDate=${fmt(startDate)}&endDate=${fmt(endDate)}&api_key=${encodeURIComponent(this.apiKey)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        return {
          source: 'OFFLINE SIMULATION',
          events: OFFLINE_SIMULATED_EVENTS,
          fetchedAt: new Date().toISOString(),
        };
      }

      const mapped: DonkiSpaceWeatherEvent[] = data.slice(-3).reverse().map((item: any) => {
        const speed = item.cmeAnalyses?.[0]?.speed;
        const elevated = typeof speed === 'number' && speed > 750;
        return {
          activityID: item.activityID || 'NASA-CME-EVENT',
          startTime: item.startTime || new Date().toISOString(),
          note: item.note || 'Coronal Mass Ejection detected by NASA DONKI network.',
          radiationRiskLevel: elevated ? 'ELEVATED · HIGH SPEED' : 'MONITORED · NOMINAL',
          evaAdvisory: elevated ? 'Seek Storm Shelter Protocol' : 'Standard EVA Monitoring',
          instruments: item.instruments?.length ? item.instruments : [{ displayName: 'SOHO / STEREO' }],
        };
      });

      return {
        source: 'LIVE',
        events: mapped,
        fetchedAt: new Date().toISOString(),
      };
    } catch {
      return {
        source: 'OFFLINE SIMULATION',
        events: OFFLINE_SIMULATED_EVENTS,
        fetchedAt: new Date().toISOString(),
      };
    }
  }
}
