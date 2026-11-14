import { ENVIRONMENT_MULTIPLIERS } from './rulesData';
import { evaluateSubsystem } from '../engine/ruleEngine';
import type {
  AstronautProfile,
  AstronautProfileId,
  AstronautTelemetryBundle,
  BodySystemFocusKey,
  BodySystemFocusMeta,
  ChartId,
  DonkiSpaceWeatherEvent,
  EnvironmentKey,
  HealthInsightItem,
  InFlightLogEntry,
  SubsystemKey,
  TelemetryPoint,
  TelemetrySeriesBundle,
  TimeRangeKey,
  TriageLevel,
  VitalOverviewCardData,
} from '../types/astral';

export const ASTRONAUT_PROFILES: AstronautProfile[] = [
  {
    id: 'cdr_vance',
    callsign: 'CDR-01',
    name: 'Elena Vance',
    role: 'Mission Commander (Demo Profile)',
    missionDay: 114,
    sex: 'female',
    baselines: {
      heartRateBpm: 62,
      spo2Percent: 98.4,
      systolicMmHg: 116,
      diastolicMmHg: 74,
      respiratoryRateBpm: 14.4,
      bodyTempC: 36.7,
      dailyRadiationLimitMSv: 1.5,
      missionRadiationLimitMSv: 150,
      cumulativePriorMSv: 61.8,
    },
  },
  {
    id: 'fe_chen',
    callsign: 'FE-02',
    name: 'Marcus Chen',
    role: 'Flight Engineer (Demo Profile)',
    missionDay: 114,
    sex: 'male',
    baselines: {
      heartRateBpm: 68,
      spo2Percent: 97.9,
      systolicMmHg: 122,
      diastolicMmHg: 78,
      respiratoryRateBpm: 15.6,
      bodyTempC: 36.8,
      dailyRadiationLimitMSv: 1.5,
      missionRadiationLimitMSv: 150,
      cumulativePriorMSv: 63.4,
    },
  },
  {
    id: 'ms_nair',
    callsign: 'MS-03',
    name: 'Priya Nair',
    role: 'Medical Officer (Demo Profile)',
    missionDay: 42,
    sex: 'female',
    baselines: {
      heartRateBpm: 59,
      spo2Percent: 98.8,
      systolicMmHg: 112,
      diastolicMmHg: 72,
      respiratoryRateBpm: 13.8,
      bodyTempC: 36.6,
      dailyRadiationLimitMSv: 1.5,
      missionRadiationLimitMSv: 150,
      cumulativePriorMSv: 23.6,
    },
  },
];

export const TIME_RANGE_OPTIONS: Array<{
  key: TimeRangeKey;
  label: string;
  longLabel: string;
}> = [
  { key: '1h', label: '1H', longLabel: 'Last 1 Hour' },
  { key: '6h', label: '6H', longLabel: 'Last 6 Hours' },
  { key: '24h', label: '24H', longLabel: 'Last 24 Hours' },
  { key: '7d', label: '7D', longLabel: 'Last 7 Days' },
];

export function mapStructureKeyToSystemFocus(structureKey: string): BodySystemFocusKey {
  const k = structureKey.toLowerCase();
  if (
    k === 'heart' ||
    k === 'aorta' ||
    k.includes('vena_cava') ||
    k.includes('pulmonary_vessels') ||
    k.includes('coronary') ||
    k.includes('carotid') ||
    k.includes('arteries') ||
    k.includes('veins')
  ) {
    return 'cardiovascular';
  }
  if (
    k.startsWith('lung_') ||
    k === 'trachea' ||
    k === 'bronchi' ||
    k === 'larynx' ||
    k === 'pharynx' ||
    k === 'diaphragm'
  ) {
    return 'respiratory';
  }
  if (
    k === 'brain' ||
    k === 'cerebellum' ||
    k === 'brainstem' ||
    k === 'spinal_cord' ||
    k === 'cranial_nerves' ||
    k.startsWith('eye_') ||
    k === 'pituitary'
  ) {
    return 'neuro_ocular';
  }
  if (
    k.startsWith('spine_') ||
    k.startsWith('femur_') ||
    k.startsWith('calf_') ||
    k.startsWith('quadriceps_') ||
    k.startsWith('hamstrings_') ||
    k.startsWith('back_muscles_') ||
    k === 'abdominal_muscles' ||
    k.startsWith('deltoid_') ||
    k.startsWith('chest_muscles_') ||
    k.startsWith('trapezius_') ||
    k.startsWith('gluteal_') ||
    k.startsWith('shin_muscles_') ||
    k === 'pelvis' ||
    k === 'skull' ||
    k === 'sternum' ||
    k.startsWith('ribs_') ||
    k.startsWith('humerus_') ||
    k.startsWith('forearm_') ||
    k.startsWith('lower_leg_') ||
    k.startsWith('clavicle_') ||
    k.startsWith('scapula_')
  ) {
    return 'musculoskeletal';
  }
  return 'whole_body';
}

export function getBodySystemMeta(
  focus: BodySystemFocusKey,
  subsystemMetrics: Record<SubsystemKey, Record<string, number>>,
  cumulativeRad: number,
  dailyRad: number,
  currentTemp: number,
  spo2: number,
  respRate: number,
  systolic: number,
  diastolic: number
): BodySystemFocusMeta {
  const hr = subsystemMetrics.cardiovascular?.resting_heart_rate ?? 74;
  const ijv = subsystemMetrics.cardiovascular?.ijv_flow_velocity ?? 12;
  const shift = subsystemMetrics.cardiovascular?.cephalad_fluid_shift_index ?? 2;
  const onsd = subsystemMetrics.ocular_sans?.onsd_diameter ?? 5.7;
  const co2 = subsystemMetrics.mood_sleep?.cabin_co2_mmhg ?? 2.3;
  const sleep = subsystemMetrics.mood_sleep?.sleep_hours ?? 7.2;
  const ared = subsystemMetrics.musculoskeletal?.ared_compliance ?? 94;
  const pain = subsystemMetrics.musculoskeletal?.spinal_pain_score ?? 2;

  switch (focus) {
    case 'cardiovascular':
      return {
        key: 'cardiovascular',
        label: 'Cardiovascular & Vascular System',
        shortLabel: 'Cardiovascular',
        structureKey: 'heart',
        cameraView: 'front',
        summary:
          'Tracks cardiac chronotropic adaptation, cephalad blood volume redistribution, arterial baroreflex tone, and internal jugular venous drainage (NASA MD 44-A).',
        priorityCharts: ['heart_rate', 'blood_pressure'],
        relatedMeasurements: [
          { label: 'Resting Heart Rate', value: `${hr} bpm`, note: 'Live Self-Exam' },
          { label: 'Blood Pressure', value: `${systolic}/${diastolic} mmHg`, note: 'Demo Telemetry' },
          { label: 'IJV Doppler Flow', value: `${ijv} cm/s`, note: `Stasis Grade ${shift}` },
        ],
      };
    case 'respiratory':
      return {
        key: 'respiratory',
        label: 'Respiratory & Gas Exchange System',
        shortLabel: 'Respiratory',
        structureKey: 'lung_l',
        cameraView: 'front',
        summary:
          'Monitors alveolar oxygen saturation (SpO2), ventilatory drive, and spacecraft CO2 partial pressure sensitivity where microgravity eliminates V/Q hydrostatic gradients.',
        priorityCharts: ['blood_oxygen', 'respiratory_rate'],
        relatedMeasurements: [
          { label: 'Blood Oxygen (SpO2)', value: `${spo2.toFixed(1)}%`, note: 'Demo Telemetry' },
          { label: 'Respiratory Rate', value: `${respRate.toFixed(1)} br/min`, note: 'Demo Telemetry' },
          { label: 'Habitat Cabin CO2', value: `${co2} mmHg`, note: 'Live Self-Exam' },
        ],
      };
    case 'neuro_ocular':
      return {
        key: 'neuro_ocular',
        label: 'Neuro-Ocular & Circadian System',
        shortLabel: 'Neuro-Ocular',
        structureKey: 'brain',
        cameraView: 'front',
        summary:
          'Assesses perioptic CSF pressure (SANS), circadian core temperature rhythm under 16 orbital sunrises/day, and sleep-linked autonomic stability.',
        priorityCharts: ['body_temperature', 'heart_rate', 'blood_oxygen'],
        relatedMeasurements: [
          { label: 'Optic Nerve Sheath (ONSD)', value: `${onsd} mm`, note: 'Live Self-Exam' },
          { label: 'Consolidated Sleep', value: `${sleep} hrs`, note: 'Live Self-Exam' },
          { label: 'Core Body Temp', value: `${currentTemp.toFixed(2)} °C`, note: 'Demo Telemetry' },
        ],
      };
    case 'musculoskeletal':
      return {
        key: 'musculoskeletal',
        label: 'Musculoskeletal & Dosimetry System',
        shortLabel: 'Musculoskeletal',
        structureKey: 'spine_lumbar',
        cameraView: 'back',
        summary:
          'Correlates ARED mechanical unloading countermeasures and axial spinal strain with whole-body ionizing radiation dosimetry and metabolic thermoregulation.',
        priorityCharts: ['radiation_exposure', 'body_temperature'],
        relatedMeasurements: [
          { label: 'ARED Resistance Load', value: `${ared}%`, note: 'Live Self-Exam' },
          { label: 'Axial Lumbar Pain', value: `${pain}/10 VAS`, note: 'Live Self-Exam' },
          { label: 'Cumulative Dose', value: `${cumulativeRad.toFixed(1)} mSv`, note: `${dailyRad.toFixed(2)} mSv/d` },
        ],
      };
    case 'whole_body':
    default:
      return {
        key: 'whole_body',
        label: 'Whole-Body Integrated Telemetry',
        shortLabel: 'Whole Body',
        structureKey: 'skin',
        cameraView: 'front',
        summary:
          'Unified multi-system physiological overview combining core thermoregulation, cumulative space radiation exposure, cardiovascular perfusion, and pulmonary oxygenation.',
        priorityCharts: ['body_temperature', 'radiation_exposure', 'heart_rate', 'blood_oxygen'],
        relatedMeasurements: [
          { label: 'Core Body Temp', value: `${currentTemp.toFixed(2)} °C`, note: 'Demo Telemetry' },
          { label: 'Cumulative Radiation', value: `${cumulativeRad.toFixed(1)} mSv`, note: `${dailyRad.toFixed(2)} mSv/d` },
          { label: 'Cardio / Resp', value: `${hr} bpm · ${spo2.toFixed(1)}%`, note: 'Combined Status' },
        ],
      };
  }
}

function deterministicNoise(seed: number, step: number): number {
  const x = Math.sin(seed * 12.9898 + step * 78.233) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

function getTimeAxisLabels(timeRange: TimeRangeKey, count: number): Array<{ label: string; timestamp: string }> {
  const now = new Date();
  const totalMinutes =
    timeRange === '1h' ? 60 : timeRange === '6h' ? 360 : timeRange === '24h' ? 1440 : 7 * 1440;
  const stepMinutes = totalMinutes / Math.max(1, count - 1);

  return Array.from({ length: count }, (_, idx) => {
    const minsAgo = Math.round((count - 1 - idx) * stepMinutes);
    const ptDate = new Date(now.getTime() - minsAgo * 60 * 1000);
    const hh = String(ptDate.getHours()).padStart(2, '0');
    const mm = String(ptDate.getMinutes()).padStart(2, '0');
    const monthDay = `${ptDate.toLocaleString('en-US', { month: 'short' })} ${ptDate.getDate()}`;

    if (idx === count - 1) {
      return { label: 'Now', timestamp: `${monthDay} ${hh}:${mm} UTC` };
    }
    if (timeRange === '7d') {
      const daysAgo = Math.round(minsAgo / 1440);
      return {
        label: daysAgo === 0 ? `${hh}:00` : `-${daysAgo}d`,
        timestamp: `${monthDay} ${hh}:${mm} UTC`,
      };
    }
    return {
      label: `${hh}:${mm}`,
      timestamp: `${monthDay} ${hh}:${mm} UTC`,
    };
  });
}

function computeStats(points: TelemetryPoint[]): { min: number; avg: number; max: number } {
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
  return {
    min: Number(min.toFixed(2)),
    avg: Number(avg.toFixed(2)),
    max: Number(max.toFixed(2)),
  };
}

function statusMeta(level: TriageLevel): { level: TriageLevel; label: string } {
  if (level === 'RED') return { level: 'RED', label: 'Critical Threshold' };
  if (level === 'AMBER') return { level: 'AMBER', label: 'Elevated Watch' };
  return { level: 'GREEN', label: 'Nominal' };
}

export function buildAstronautTelemetryBundle(params: {
  profile: AstronautProfile;
  timeRange: TimeRangeKey;
  environment: EnvironmentKey;
  subsystemMetrics: Record<SubsystemKey, Record<string, number>>;
  flightLogs: InFlightLogEntry[];
  donkiEvents: DonkiSpaceWeatherEvent[];
}): AstronautTelemetryBundle {
  const { profile, timeRange, environment, subsystemMetrics, flightLogs, donkiEvents } = params;
  const env = ENVIRONMENT_MULTIPLIERS[environment];
  const seed = profile.id === 'cdr_vance' ? 11 : profile.id === 'fe_chen' ? 23 : 37;

  const hasElevatedDonki = donkiEvents.some((ev) =>
    ev.radiationRiskLevel.toUpperCase().includes('ELEVATED')
  );

  // Extract live user-controlled inputs
  const liveHr = subsystemMetrics.cardiovascular?.resting_heart_rate ?? profile.baselines.heartRateBpm;
  const fluidShift = subsystemMetrics.cardiovascular?.cephalad_fluid_shift_index ?? 2;
  const ijvFlow = subsystemMetrics.cardiovascular?.ijv_flow_velocity ?? 12;
  const cabinCo2 = subsystemMetrics.mood_sleep?.cabin_co2_mmhg ?? 2.3;
  const sleepHours = subsystemMetrics.mood_sleep?.sleep_hours ?? 7.2;
  const onsd = subsystemMetrics.ocular_sans?.onsd_diameter ?? 5.7;
  const aredCompliance = subsystemMetrics.musculoskeletal?.ared_compliance ?? 94;

  // Derived illustrative physiological metrics anchored to live local inputs
  const co2Spo2Penalty = Math.max(0, (cabinCo2 - 2.4) * 0.85);
  const evaSpo2Delta = environment === 'eva_rover' ? -0.6 : 0;
  const liveSpo2 = Number(
    Math.max(88.5, Math.min(99.9, profile.baselines.spo2Percent - co2Spo2Penalty + evaSpo2Delta)).toFixed(1)
  );

  const hrBpOffset = (liveHr - profile.baselines.heartRateBpm) * 0.28;
  const fluidBpOffset = (fluidShift - 2) * 4.5 + (env.fluidShiftRisk - 1) * 5;
  const liveSystolic = Math.round(
    Math.max(88, Math.min(168, profile.baselines.systolicMmHg + hrBpOffset + fluidBpOffset))
  );
  const liveDiastolic = Math.round(
    Math.max(54, Math.min(108, profile.baselines.diastolicMmHg + hrBpOffset * 0.55 + fluidBpOffset * 0.5))
  );

  const co2RespBoost = Math.max(0, (cabinCo2 - 2.2) * 1.45);
  const hrRespBoost = Math.max(-1.2, (liveHr - profile.baselines.heartRateBpm) * 0.08);
  const liveRespRate = Number(
    Math.max(9.0, Math.min(28.0, profile.baselines.respiratoryRateBpm + co2RespBoost + hrRespBoost)).toFixed(1)
  );

  const evaTempOffset = environment === 'eva_rover' ? 0.35 : 0;
  const sleepTempOffset = sleepHours < 5.5 ? 0.22 : 0;
  const liveTemp = Number(
    Math.max(35.6, Math.min(39.0, profile.baselines.bodyTempC + evaTempOffset + sleepTempOffset)).toFixed(2)
  );

  const donkiMultiplier = hasElevatedDonki ? 1.55 : 1.0;
  const dailyRadiationMSv = Number((0.68 * env.radiationFactor * donkiMultiplier).toFixed(2));
  const extraLoggedDays = Math.max(0, flightLogs.length - 7);
  const cumulativeRadiationMSv = Number(
    (profile.baselines.cumulativePriorMSv + dailyRadiationMSv * (1 + extraLoggedDays * 0.35)).toFixed(2)
  );

  const pointCount = timeRange === '1h' ? 24 : timeRange === '6h' ? 24 : timeRange === '24h' ? 24 : 28;
  const axis = getTimeAxisLabels(timeRange, pointCount);

  // 1. Heart Rate Series
  const hrPoints: TelemetryPoint[] = axis.map((ax, i) => {
    const isLast = i === pointCount - 1;
    const wave = Math.sin((i / pointCount) * Math.PI * 3.2 + seed) * 3.8;
    const jitter = (deterministicNoise(seed + 1, i) - 0.5) * 4.2;
    const anomalySpike =
      (i === Math.floor(pointCount * 0.62) && liveHr >= 78) ||
      (i === Math.floor(pointCount * 0.38) && environment === 'eva_rover')
        ? 14
        : 0;
    const blendRatio = i / (pointCount - 1);
    const anchoredBase =
      profile.baselines.heartRateBpm * (1 - blendRatio * 0.65) + liveHr * (blendRatio * 0.65);
    const val = isLast
      ? liveHr
      : Math.round(Math.max(44, Math.min(138, anchoredBase + wave + jitter + anomalySpike)));
    const isAnomaly = val >= 92 || val <= 48 || anomalySpike > 0;
    return {
      index: i,
      timestamp: ax.timestamp,
      label: ax.label,
      value: val,
      isAnomaly,
      anomalyReason: isAnomaly
        ? val >= 102
          ? 'Exceeds critical tachycardia threshold (≥102 bpm)'
          : anomalySpike > 0
            ? 'Transient heart rate elevation spike (+14 bpm vs rolling window)'
            : 'Elevated above nominal resting band'
        : undefined,
    };
  });

  // 2. Blood Oxygen (SpO2) Series
  const spo2Points: TelemetryPoint[] = axis.map((ax, i) => {
    const isLast = i === pointCount - 1;
    const wave = Math.sin((i / pointCount) * Math.PI * 2.4 + seed) * 0.35;
    const jitter = (deterministicNoise(seed + 2, i) - 0.5) * 0.5;
    const transientDip =
      i === Math.floor(pointCount * 0.54) && (cabinCo2 >= 3.2 || environment === 'eva_rover')
        ? -2.4
        : 0;
    const blendRatio = i / (pointCount - 1);
    const anchored = profile.baselines.spo2Percent * (1 - blendRatio * 0.6) + liveSpo2 * (blendRatio * 0.6);
    const val = isLast
      ? liveSpo2
      : Number(Math.max(89.0, Math.min(99.9, anchored + wave + jitter + transientDip)).toFixed(1));
    const isAnomaly = val < 95.0;
    return {
      index: i,
      timestamp: ax.timestamp,
      label: ax.label,
      value: val,
      isAnomaly,
      anomalyReason: isAnomaly
        ? val < 92
          ? 'Critical hypoxemia watch (<92% SpO2)'
          : 'Desaturation dip below 95% nominal threshold'
        : undefined,
    };
  });

  // 3. Blood Pressure Series (Systolic primary, Diastolic secondary)
  const bpPoints: TelemetryPoint[] = axis.map((ax, i) => {
    const isLast = i === pointCount - 1;
    const wave = Math.cos((i / pointCount) * Math.PI * 2.1 + seed) * 3.5;
    const jitter = (deterministicNoise(seed + 3, i) - 0.5) * 4;
    const blendRatio = i / (pointCount - 1);
    const sysAnchored = profile.baselines.systolicMmHg * (1 - blendRatio * 0.6) + liveSystolic * (blendRatio * 0.6);
    const diaAnchored = profile.baselines.diastolicMmHg * (1 - blendRatio * 0.6) + liveDiastolic * (blendRatio * 0.6);
    const sys = isLast ? liveSystolic : Math.round(Math.max(86, Math.min(168, sysAnchored + wave + jitter)));
    const dia = isLast
      ? liveDiastolic
      : Math.round(Math.max(52, Math.min(108, diaAnchored + wave * 0.5 + jitter * 0.5)));
    const isAnomaly = sys >= 130 || dia >= 85 || sys < 95;
    return {
      index: i,
      timestamp: ax.timestamp,
      label: ax.label,
      value: sys,
      secondaryValue: dia,
      isAnomaly,
      anomalyReason: isAnomaly
        ? sys >= 140 || dia >= 90
          ? 'Stage-2 hypertensive reading (≥140/90 mmHg)'
          : sys < 95
            ? 'Low systolic orthostatic warning (<95 mmHg)'
            : 'Elevated arterial pressure above 130/85 mmHg'
        : undefined,
    };
  });

  // 4. Respiratory Rate Series
  const respPoints: TelemetryPoint[] = axis.map((ax, i) => {
    const isLast = i === pointCount - 1;
    const wave = Math.sin((i / pointCount) * Math.PI * 2.8 + seed) * 0.9;
    const jitter = (deterministicNoise(seed + 4, i) - 0.5) * 1.1;
    const blendRatio = i / (pointCount - 1);
    const anchored =
      profile.baselines.respiratoryRateBpm * (1 - blendRatio * 0.65) + liveRespRate * (blendRatio * 0.65);
    const val = isLast
      ? liveRespRate
      : Number(Math.max(9.0, Math.min(28.0, anchored + wave + jitter)).toFixed(1));
    const isAnomaly = val > 20 || val < 11.5;
    return {
      index: i,
      timestamp: ax.timestamp,
      label: ax.label,
      value: val,
      isAnomaly,
      anomalyReason: isAnomaly
        ? val >= 25
          ? 'Tachypnea critical threshold (≥25 br/min)'
          : 'Elevated ventilatory drive (correlated with CO2/stress)'
        : undefined,
    };
  });

  // 5. Body Temperature Series (Circadian oscillation)
  const tempPoints: TelemetryPoint[] = axis.map((ax, i) => {
    const isLast = i === pointCount - 1;
    const circadian = Math.sin((i / pointCount) * Math.PI * 2.0 - 0.8) * 0.24;
    const jitter = (deterministicNoise(seed + 5, i) - 0.5) * 0.12;
    const blendRatio = i / (pointCount - 1);
    const anchored = profile.baselines.bodyTempC * (1 - blendRatio * 0.55) + liveTemp * (blendRatio * 0.55);
    const val = isLast
      ? liveTemp
      : Number(Math.max(35.5, Math.min(39.0, anchored + circadian + jitter)).toFixed(2));
    const isAnomaly = val >= 37.5 || val <= 35.8;
    return {
      index: i,
      timestamp: ax.timestamp,
      label: ax.label,
      value: val,
      isAnomaly,
      anomalyReason: isAnomaly
        ? val >= 38.0
          ? 'Hyperthermia / febrile threshold (≥38.0 °C)'
          : 'Thermal drift outside 36.1–37.4 °C nominal band'
        : undefined,
    };
  });

  // 6. Radiation Exposure Series (Primary = Cumulative mSv, Secondary = Daily Exposure mSv/day)
  const radCount = 14;
  const radPoints: TelemetryPoint[] = Array.from({ length: radCount }, (_, i) => {
    const dayNum = Math.max(1, profile.missionDay - (radCount - 1 - i));
    const isLast = i === radCount - 1;
    const flareDay = hasElevatedDonki && i >= radCount - 3;
    const dailyJitter = (deterministicNoise(seed + 6, i) - 0.45) * 0.22;
    const dailyDose = isLast
      ? dailyRadiationMSv
      : Number(
          Math.max(
            0.35,
            0.66 * env.radiationFactor * (flareDay ? 1.45 : 1.0) + dailyJitter
          ).toFixed(2)
        );
    const daysRemaining = radCount - 1 - i;
    const cumulative = Number(
      Math.max(0, cumulativeRadiationMSv - daysRemaining * (dailyRadiationMSv * 0.86)).toFixed(2)
    );
    const isAnomaly =
      dailyDose >= profile.baselines.dailyRadiationLimitMSv ||
      cumulative >= profile.baselines.missionRadiationLimitMSv * 0.75;
    return {
      index: i,
      timestamp: `Mission Day ${dayNum}`,
      label: isLast ? `MD${dayNum}` : `MD${dayNum}`,
      value: cumulative,
      secondaryValue: dailyDose,
      isAnomaly,
      anomalyReason: isAnomaly
        ? dailyDose >= profile.baselines.dailyRadiationLimitMSv
          ? `Daily dose ${dailyDose} mSv/d exceeds ${profile.baselines.dailyRadiationLimitMSv} mSv/d operational watch`
          : 'Cumulative mission dose approaching configured watch band'
        : undefined,
    };
  });

  // Threshold-supported status evaluations (only GREEN / AMBER / RED when backed by rules)
  const hrLevel: TriageLevel =
    liveHr >= 102 || liveHr <= 41 ? 'RED' : liveHr >= 90 || liveHr <= 49 ? 'AMBER' : 'GREEN';
  const spo2Level: TriageLevel = liveSpo2 < 92 ? 'RED' : liveSpo2 < 95 ? 'AMBER' : 'GREEN';
  const bpLevel: TriageLevel =
    liveSystolic >= 140 || liveDiastolic >= 90 || liveSystolic < 90
      ? 'RED'
      : liveSystolic >= 130 || liveDiastolic >= 85 || liveSystolic < 95
        ? 'AMBER'
        : 'GREEN';
  const respLevel: TriageLevel =
    liveRespRate >= 25 || liveRespRate <= 8
      ? 'RED'
      : liveRespRate >= 21 || liveRespRate <= 11
        ? 'AMBER'
        : 'GREEN';
  const tempLevel: TriageLevel =
    liveTemp >= 38.1 || liveTemp <= 35.4
      ? 'RED'
      : liveTemp >= 37.5 || liveTemp <= 36.0
        ? 'AMBER'
        : 'GREEN';
  const radLevel: TriageLevel =
    dailyRadiationMSv >= 2.0 || cumulativeRadiationMSv >= profile.baselines.missionRadiationLimitMSv
      ? 'RED'
      : dailyRadiationMSv >= 1.0 ||
          cumulativeRadiationMSv >= profile.baselines.missionRadiationLimitMSv * 0.75
        ? 'AMBER'
        : 'GREEN';

  const hrDelta = liveHr - profile.baselines.heartRateBpm;
  const hrPct = ((hrDelta / profile.baselines.heartRateBpm) * 100).toFixed(1);
  const spo2Delta = Number((liveSpo2 - profile.baselines.spo2Percent).toFixed(1));
  const sysDelta = liveSystolic - profile.baselines.systolicMmHg;
  const respDelta = Number((liveRespRate - profile.baselines.respiratoryRateBpm).toFixed(1));
  const tempDelta = Number((liveTemp - profile.baselines.bodyTempC).toFixed(2));
  const radPctOfLimit = ((cumulativeRadiationMSv / profile.baselines.missionRadiationLimitMSv) * 100).toFixed(1);

  const overviewCards: VitalOverviewCardData[] = [
    {
      id: 'heart_rate',
      title: 'Heart Rate',
      valueDisplay: `${liveHr}`,
      unit: 'BPM',
      baselineDisplay: `Base ${profile.baselines.heartRateBpm} bpm`,
      deltaDisplay: `${hrDelta >= 0 ? '+' : ''}${hrDelta} bpm`,
      deltaPercentDisplay: `${hrDelta >= 0 ? '+' : ''}${hrPct}%`,
      trend: Math.abs(hrDelta) < 2 ? 'steady' : hrDelta > 0 ? 'up' : 'down',
      status: hrLevel,
      statusLabel: statusMeta(hrLevel).label,
      systemFocus: 'cardiovascular',
      dataOrigin: 'LIVE_LOCAL',
      subtitle: 'Linked to Self-Exam HR slider',
    },
    {
      id: 'blood_oxygen',
      title: 'Blood Oxygen (SpO2)',
      valueDisplay: `${liveSpo2.toFixed(1)}`,
      unit: '%',
      baselineDisplay: `Base ${profile.baselines.spo2Percent}%`,
      deltaDisplay: `${spo2Delta >= 0 ? '+' : ''}${spo2Delta}%`,
      deltaPercentDisplay: `${spo2Delta >= 0 ? '+' : ''}${spo2Delta} pts`,
      trend: Math.abs(spo2Delta) < 0.3 ? 'steady' : spo2Delta > 0 ? 'up' : 'down',
      status: spo2Level,
      statusLabel: statusMeta(spo2Level).label,
      systemFocus: 'respiratory',
      dataOrigin: 'DEMO_TELEMETRY',
      subtitle: `CO2 modulated (${cabinCo2} mmHg)`,
    },
    {
      id: 'blood_pressure',
      title: 'Blood Pressure',
      valueDisplay: `${liveSystolic}/${liveDiastolic}`,
      unit: 'mmHg',
      baselineDisplay: `Base ${profile.baselines.systolicMmHg}/${profile.baselines.diastolicMmHg}`,
      deltaDisplay: `${sysDelta >= 0 ? '+' : ''}${sysDelta} sys`,
      deltaPercentDisplay: `${((sysDelta / profile.baselines.systolicMmHg) * 100).toFixed(1)}%`,
      trend: Math.abs(sysDelta) < 3 ? 'steady' : sysDelta > 0 ? 'up' : 'down',
      status: bpLevel,
      statusLabel: statusMeta(bpLevel).label,
      systemFocus: 'cardiovascular',
      dataOrigin: 'DEMO_TELEMETRY',
      subtitle: `Fluid shift grade ${fluidShift}`,
    },
    {
      id: 'respiratory_rate',
      title: 'Respiratory Rate',
      valueDisplay: `${liveRespRate.toFixed(1)}`,
      unit: 'br/min',
      baselineDisplay: `Base ${profile.baselines.respiratoryRateBpm} br/m`,
      deltaDisplay: `${respDelta >= 0 ? '+' : ''}${respDelta} br/m`,
      deltaPercentDisplay: `${respDelta >= 0 ? '+' : ''}${((respDelta / profile.baselines.respiratoryRateBpm) * 100).toFixed(1)}%`,
      trend: Math.abs(respDelta) < 0.6 ? 'steady' : respDelta > 0 ? 'up' : 'down',
      status: respLevel,
      statusLabel: statusMeta(respLevel).label,
      systemFocus: 'respiratory',
      dataOrigin: 'DEMO_TELEMETRY',
      subtitle: 'Ventilatory drive index',
    },
    {
      id: 'body_temperature',
      title: 'Body Temperature',
      valueDisplay: `${liveTemp.toFixed(2)}`,
      unit: '°C',
      baselineDisplay: `Base ${profile.baselines.bodyTempC} °C`,
      deltaDisplay: `${tempDelta >= 0 ? '+' : ''}${tempDelta} °C`,
      deltaPercentDisplay: `${tempDelta >= 0 ? '+' : ''}${((tempDelta / profile.baselines.bodyTempC) * 100).toFixed(1)}%`,
      trend: Math.abs(tempDelta) < 0.12 ? 'steady' : tempDelta > 0 ? 'up' : 'down',
      status: tempLevel,
      statusLabel: statusMeta(tempLevel).label,
      systemFocus: 'whole_body',
      dataOrigin: 'DEMO_TELEMETRY',
      subtitle: environment === 'eva_rover' ? 'EVA suit thermal load' : 'Circadian core curve',
    },
    {
      id: 'radiation_exposure',
      title: 'Radiation Exposure',
      valueDisplay: `${cumulativeRadiationMSv.toFixed(1)}`,
      unit: 'mSv',
      baselineDisplay: `Limit ${profile.baselines.missionRadiationLimitMSv} mSv`,
      deltaDisplay: `${dailyRadiationMSv.toFixed(2)} mSv/d`,
      deltaPercentDisplay: `${radPctOfLimit}% cap`,
      trend: hasElevatedDonki || env.radiationFactor > 1.3 ? 'up' : 'steady',
      status: radLevel,
      statusLabel: statusMeta(radLevel).label,
      systemFocus: 'musculoskeletal',
      dataOrigin: 'DEMO_TELEMETRY',
      subtitle: hasElevatedDonki ? 'DONKI Solar Watch active' : `${env.radiationFactor}x env factor`,
    },
  ];

  const charts: Record<ChartId, TelemetrySeriesBundle> = {
    heart_rate: {
      id: 'heart_rate',
      title: 'Heart Rate Monitoring',
      subtitle: 'Chronotropic telemetry & abnormal rate detection',
      unit: 'BPM',
      primaryLabel: 'Heart Rate',
      baselineValue: profile.baselines.heartRateBpm,
      warningThreshold: 90,
      criticalThreshold: 102,
      currentDisplay: `${liveHr} BPM`,
      stats: computeStats(hrPoints),
      status: hrLevel,
      statusLabel: statusMeta(hrLevel).label,
      dataOrigin: 'LIVE_LOCAL',
      points: hrPoints,
    },
    blood_oxygen: {
      id: 'blood_oxygen',
      title: 'Blood Oxygen Saturation (SpO2)',
      subtitle: 'Pulse oximetry area profile & desaturation alerts',
      unit: '%',
      primaryLabel: 'SpO2',
      baselineValue: profile.baselines.spo2Percent,
      warningThreshold: 95,
      criticalThreshold: 92,
      invertThreshold: true,
      currentDisplay: `${liveSpo2.toFixed(1)}%`,
      stats: computeStats(spo2Points),
      status: spo2Level,
      statusLabel: statusMeta(spo2Level).label,
      dataOrigin: 'DEMO_TELEMETRY',
      points: spo2Points,
    },
    blood_pressure: {
      id: 'blood_pressure',
      title: 'Arterial Blood Pressure',
      subtitle: 'Dual-channel systolic & diastolic cuffless trend',
      unit: 'mmHg',
      primaryLabel: 'Systolic',
      secondaryLabel: 'Diastolic',
      baselineValue: profile.baselines.systolicMmHg,
      secondaryBaselineValue: profile.baselines.diastolicMmHg,
      warningThreshold: 130,
      criticalThreshold: 140,
      currentDisplay: `${liveSystolic}/${liveDiastolic} mmHg`,
      stats: computeStats(bpPoints),
      status: bpLevel,
      statusLabel: statusMeta(bpLevel).label,
      dataOrigin: 'DEMO_TELEMETRY',
      points: bpPoints,
    },
    respiratory_rate: {
      id: 'respiratory_rate',
      title: 'Respiratory Rate',
      subtitle: 'Thoracic impedance breaths/min & CO2 coupling',
      unit: 'br/min',
      primaryLabel: 'Respiratory Rate',
      baselineValue: profile.baselines.respiratoryRateBpm,
      warningThreshold: 21,
      criticalThreshold: 25,
      currentDisplay: `${liveRespRate.toFixed(1)} br/min`,
      stats: computeStats(respPoints),
      status: respLevel,
      statusLabel: statusMeta(respLevel).label,
      dataOrigin: 'DEMO_TELEMETRY',
      points: respPoints,
    },
    body_temperature: {
      id: 'body_temperature',
      title: 'Core Body Temperature',
      subtitle: 'Smooth circadian thermoregulation curve',
      unit: '°C',
      primaryLabel: 'Core Temp',
      baselineValue: profile.baselines.bodyTempC,
      warningThreshold: 37.5,
      criticalThreshold: 38.1,
      currentDisplay: `${liveTemp.toFixed(2)} °C`,
      stats: computeStats(tempPoints),
      status: tempLevel,
      statusLabel: statusMeta(tempLevel).label,
      dataOrigin: 'DEMO_TELEMETRY',
      points: tempPoints,
    },
    radiation_exposure: {
      id: 'radiation_exposure',
      title: 'Mission Radiation Exposure',
      subtitle: 'Cumulative dose (mSv) vs daily GCR/SPE exposure bars',
      unit: 'mSv',
      primaryLabel: 'Cumulative Dose (mSv)',
      secondaryLabel: 'Daily Dose (mSv/d)',
      baselineValue: profile.baselines.missionRadiationLimitMSv * 0.75,
      warningThreshold: profile.baselines.missionRadiationLimitMSv * 0.75,
      criticalThreshold: profile.baselines.missionRadiationLimitMSv,
      currentDisplay: `${cumulativeRadiationMSv.toFixed(1)} mSv`,
      stats: computeStats(radPoints),
      status: radLevel,
      statusLabel: statusMeta(radLevel).label,
      dataOrigin: 'DEMO_TELEMETRY',
      points: radPoints,
    },
  };

  // Build AI Health Insights separating Validated Rule-Engine Assessments vs Illustrative Trends
  const cardioTriage = evaluateSubsystem('cardiovascular', subsystemMetrics.cardiovascular, environment);
  const ocularTriage = evaluateSubsystem('ocular_sans', subsystemMetrics.ocular_sans, environment);
  const moodTriage = evaluateSubsystem('mood_sleep', subsystemMetrics.mood_sleep, environment);
  const musculoTriage = evaluateSubsystem('musculoskeletal', subsystemMetrics.musculoskeletal, environment);

  const insights: HealthInsightItem[] = [];

  // 1. Validated Rule-Engine assessment (cardio/IJV or worst subsystem)
  const worstTriage = [cardioTriage, ocularTriage, moodTriage, musculoTriage].sort(
    (a, b) => b.riskScore - a.riskScore
  )[0];
  insights.push({
    id: 'insight-validated-rule',
    category: 'VALIDATED_RULE',
    severity: worstTriage.level,
    title: `Validated Rule-Engine: ${worstTriage.title}`,
    explanation: worstTriage.clinicalAction,
    baselineComparison: `Risk Score ${worstTriage.riskScore}/100 · IJV Flow ${ijvFlow} cm/s · ONSD ${onsd} mm · ARED ${aredCompliance}%`,
    relatedSystem:
      worstTriage.subsystem === 'cardiovascular'
        ? 'cardiovascular'
        : worstTriage.subsystem === 'ocular_sans' || worstTriage.subsystem === 'mood_sleep'
          ? 'neuro_ocular'
          : 'musculoskeletal',
    timeframeLabel: 'Current Local State',
  });

  // 2. Heart Rate & Blood Pressure Trend Observation
  const hrAnomalies = hrPoints.filter((p) => p.isAnomaly).length;
  insights.push({
    id: 'insight-hr-bp',
    category: 'SIMULATED_TREND',
    severity: hrLevel === 'RED' || bpLevel === 'RED' ? 'RED' : hrLevel === 'AMBER' || bpLevel === 'AMBER' ? 'AMBER' : 'GREEN',
    title:
      hrDelta >= 12
        ? `Elevated Resting Heart Rate (+${hrDelta} bpm above ${profile.callsign} baseline)`
        : `Cardiovascular Trend Nominal (${hrPoints[0].value} → ${liveHr} bpm)`,
    explanation:
      hrAnomalies > 0
        ? `Illustrative ${timeRange.toUpperCase()} series flagged ${hrAnomalies} reading(s) outside nominal bounds, paired with arterial pressure at ${liveSystolic}/${liveDiastolic} mmHg under cephalad fluid shift grade ${fluidShift}.`
        : `Heart rate trajectory remains tightly clustered around ${charts.heart_rate.stats.avg} bpm average (range ${charts.heart_rate.stats.min}–${charts.heart_rate.stats.max} bpm) with stable autonomic tone.`,
    baselineComparison: `Baseline ${profile.baselines.heartRateBpm} bpm / ${profile.baselines.systolicMmHg}/${profile.baselines.diastolicMmHg} mmHg`,
    relatedSystem: 'cardiovascular',
    timeframeLabel: TIME_RANGE_OPTIONS.find((t) => t.key === timeRange)?.longLabel ?? timeRange,
  });

  // 3. Respiratory & CO2 coupling observation
  const spo2Anomalies = spo2Points.filter((p) => p.isAnomaly).length;
  insights.push({
    id: 'insight-resp-co2',
    category: 'SIMULATED_TREND',
    severity: spo2Level === 'RED' || respLevel === 'RED' ? 'RED' : spo2Level === 'AMBER' || cabinCo2 >= 3.5 ? 'AMBER' : 'GREEN',
    title:
      cabinCo2 >= 3.5 || spo2Anomalies > 0
        ? `CO2-Coupled Ventilatory & SpO2 Watch (${liveSpo2.toFixed(1)}% · ${liveRespRate.toFixed(1)} br/min)`
        : `Pulmonary Gas Exchange & SpO2 Stable (${liveSpo2.toFixed(1)}%)`,
    explanation:
      cabinCo2 >= 3.5
        ? `Habitat CO2 (${cabinCo2} mmHg) is above 3.0 mmHg nominal target, corresponding to a simulated compensatory rise in respiratory rate (+${respDelta} br/min) and ${spo2Anomalies} transient SpO2 dip(s).`
        : `Simulated SpO2 (${charts.blood_oxygen.stats.min}%–${charts.blood_oxygen.stats.max}%) and respiratory cadence (${charts.respiratory_rate.stats.avg} br/min avg) show no sustained hypercapnic drift.`,
    baselineComparison: `Baseline ${profile.baselines.spo2Percent}% SpO2 · ${profile.baselines.respiratoryRateBpm} br/min`,
    relatedSystem: 'respiratory',
    timeframeLabel: TIME_RANGE_OPTIONS.find((t) => t.key === timeRange)?.longLabel ?? timeRange,
  });

  // 4. Radiation & Thermal Observation
  insights.push({
    id: 'insight-rad-temp',
    category: 'SIMULATED_TREND',
    severity: radLevel === 'RED' || tempLevel === 'RED' ? 'RED' : radLevel === 'AMBER' || hasElevatedDonki || tempLevel === 'AMBER' ? 'AMBER' : 'GREEN',
    title: hasElevatedDonki
      ? `Solar Particle Event Modulating Daily Dose (${dailyRadiationMSv} mSv/day)`
      : `Radiation Budget & Core Temp Within Mission Envelope`,
    explanation: hasElevatedDonki
      ? `Active NASA DONKI space weather alert increases estimated daily shielding dose rate to ${dailyRadiationMSv} mSv/day (${cumulativeRadiationMSv} mSv cumulative). Core temp sits at ${liveTemp.toFixed(2)} °C.`
      : `Cumulative exposure stands at ${cumulativeRadiationMSv} mSv (${radPctOfLimit}% of ${profile.baselines.missionRadiationLimitMSv} mSv mission alert cap). Core temperature follows a smooth ${charts.body_temperature.stats.min}–${charts.body_temperature.stats.max} °C circadian profile.`,
    baselineComparison: `Daily watch limit ${profile.baselines.dailyRadiationLimitMSv} mSv/d · Core temp baseline ${profile.baselines.bodyTempC} °C`,
    relatedSystem: 'whole_body',
    timeframeLabel: '14-Day Dosimetry + Selected Window',
  });

  return {
    profile,
    timeRange,
    overviewCards,
    charts,
    insights,
    hasElevatedDonki,
    cumulativeRadiationMSv,
    dailyRadiationMSv,
  };
}
