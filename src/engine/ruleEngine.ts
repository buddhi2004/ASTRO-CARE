import {
  ENVIRONMENT_MULTIPLIERS,
  MISSION_PRESETS,
  POST_FLIGHT_PHASES,
  SUBSYSTEMS_DATA,
} from '../data/rulesData';
import {
  MODE_A_ANATOMY_REGIONS,
  MODE_B_RECOVERY_REGIONS,
} from '../data/anatomyData';
import type {
  EarthReadinessResult,
  EnvironmentKey,
  HandoverMetrics,
  InFlightLogEntry,
  MissionPresetKey,
  ModeAAnatomicalRegionId,
  ModeAAnatomyEvaluation,
  ModeBRecoveryEvaluation,
  ModeBRecoveryRegionId,
  RecoveryStatusTier,
  RehabPhase,
  SafetyStopResult,
  SubsystemKey,
  TriageLevel,
  TriageResult,
} from '../types/astral';

export function evaluateSubsystem(
  subsystemKey: SubsystemKey,
  metrics: Record<string, number>,
  environmentKey: EnvironmentKey = 'microgravity'
): TriageResult {
  const sub = SUBSYSTEMS_DATA[subsystemKey];
  const env = ENVIRONMENT_MULTIPLIERS[environmentKey] || ENVIRONMENT_MULTIPLIERS.microgravity;

  let worstLevel: TriageLevel = 'GREEN';
  let maxRiskScore = 10;

  for (const m of sub.metrics) {
    const rawVal = metrics[m.id] ?? m.defaultValue;
    // Apply subtle environmental weighting to fluid shift / radiation-sensitive markers
    const adjustedVal =
      m.id === 'cephalad_fluid_shift_index' || m.id === 'onsd_diameter'
        ? rawVal * (1 + (env.fluidShiftRisk - 1.0) * 0.08)
        : rawVal;

    let isRed = false;
    let isAmber = false;

    if (m.invertDirection) {
      isRed = adjustedVal <= m.criticalThreshold;
      isAmber = !isRed && adjustedVal <= m.amberThreshold;
    } else {
      isRed = adjustedVal >= m.criticalThreshold;
      isAmber = !isRed && adjustedVal >= m.amberThreshold;
    }

    if (isRed) {
      worstLevel = 'RED';
      maxRiskScore = Math.max(maxRiskScore, 90);
    } else if (isAmber) {
      if (worstLevel !== 'RED') worstLevel = 'AMBER';
      maxRiskScore = Math.max(maxRiskScore, 55);
    }
  }

  return buildSubsystemAdvisory(subsystemKey, worstLevel, maxRiskScore);
}

function buildSubsystemAdvisory(
  subsystemKey: SubsystemKey,
  level: TriageLevel,
  riskScore: number
): TriageResult {
  if (subsystemKey === 'cardiovascular') {
    if (level === 'RED') {
      return {
        subsystem: subsystemKey,
        level,
        riskScore,
        title: 'Suspected IJV Venous Stasis / Thrombosis Alert',
        clinicalAction:
          'Initiate NASA Medical Directive 44-A: perform bilateral compression ultrasound sweep, begin therapeutic enoxaparin protocol per onboard kit, and restrict high-G Valsalva maneuvers.',
        telemedicinePriority: 'URGENT_FLIGHT_SURGEON',
      };
    }
    if (level === 'AMBER') {
      return {
        subsystem: subsystemKey,
        level,
        riskScore,
        title: 'Moderate Cephalad Venous Engorgement',
        clinicalAction:
          'Schedule daily 30-min Lower Body Negative Pressure (LBNP) session at -35 mmHg. Restrict dietary sodium to 1800 mg and re-scan IJV Doppler flow in 24 hours.',
        telemedicinePriority: 'ROUTINE_FLIGHT_SURGEON',
      };
    }
    return {
      subsystem: subsystemKey,
      level,
      riskScore,
      title: 'Nominal Internal Jugular Venous Flow',
      clinicalAction:
        'Continue baseline hydration (2.5 L/day) and standard LBNP / ARED countermeasure schedule. Next routine Doppler check in 7 days.',
      telemedicinePriority: 'NOMINAL_LOG_ONLY',
    };
  }

  if (subsystemKey === 'ocular_sans') {
    if (level === 'RED') {
      return {
        subsystem: subsystemKey,
        level,
        riskScore,
        title: 'Severe SANS · Elevated Optic Sheath & Papilledema',
        clinicalAction:
          'Deploy V-Veno-occlusive thigh cuffs or LBNP immediately, prescribe acetazolamide review if cleared by flight surgeon, and switch crew corrective Space Anticipation Glasses.',
        telemedicinePriority: 'URGENT_FLIGHT_SURGEON',
      };
    }
    if (level === 'AMBER') {
      return {
        subsystem: subsystemKey,
        level,
        riskScore,
        title: 'Mild-Moderate SANS Hyperopic Progression',
        clinicalAction:
          'Increase LBNP chuffing frequency to 4x/week, lower cabin CO2 below 2.5 mmHg if possible, and repeat OCT / transorbital ONSD scan in 72 hours.',
        telemedicinePriority: 'ROUTINE_FLIGHT_SURGEON',
      };
    }
    return {
      subsystem: subsystemKey,
      level,
      riskScore,
      title: 'Nominal Optic Nerve Sheath & Visual Acuity',
      clinicalAction:
        'No globe flattening or choroidal folds detected. Maintain current Space Anticipation Glasses prescription and monthly ophthalmic screening.',
      telemedicinePriority: 'NOMINAL_LOG_ONLY',
    };
  }

  if (subsystemKey === 'musculoskeletal') {
    if (level === 'RED') {
      return {
        subsystem: subsystemKey,
        level,
        riskScore,
        title: 'Accelerated Deconditioning & Axial Spine Strain',
        clinicalAction:
          'Temporarily pause maximal axial squat loads, substitute supine hip sled / calf raises at 65% load, and add targeted lumbar decompression stretches.',
        telemedicinePriority: 'URGENT_FLIGHT_SURGEON',
      };
    }
    if (level === 'AMBER') {
      return {
        subsystem: subsystemKey,
        level,
        riskScore,
        title: 'Sub-Optimal ARED Osteogenic Stimulus',
        clinicalAction:
          'Make up missed resistance volume across the next 4 sessions focusing on soleus heel raises and deadlifts (target ≥ 1,800 microstrain).',
        telemedicinePriority: 'ROUTINE_FLIGHT_SURGEON',
      };
    }
    return {
      subsystem: subsystemKey,
      level,
      riskScore,
      title: 'Nominal Osteo-Muscular Load Adherence',
      clinicalAction:
        'ARED mechanical loading and vitamin D/calcium intake on target. Continue current resistance and T2 treadmill cadence.',
      telemedicinePriority: 'NOMINAL_LOG_ONLY',
    };
  }

  // mood_sleep
  if (level === 'RED') {
    return {
      subsystem: subsystemKey,
      level,
      riskScore,
      title: 'Critical Circadian Deficit / CO2 Cognitive Fatigue',
      clinicalAction:
        'Activate habitat CO2 scrubber boost, defer complex EVA or robotic arm operations for 24 hours, and initiate blue-wavelength light therapy shift.',
      telemedicinePriority: 'URGENT_FLIGHT_SURGEON',
    };
  }
  if (level === 'AMBER') {
    return {
      subsystem: subsystemKey,
      level,
      riskScore,
      title: 'Mild Sleep Fragmentation & PVT Slowing',
      clinicalAction:
        'Enforce 45-min pre-sleep screen dim-out (2700K warm lighting), check sleep restraint tension, and run morning 460nm alertness exposure.',
      telemedicinePriority: 'ROUTINE_FLIGHT_SURGEON',
    };
  }
  return {
    subsystem: subsystemKey,
    level,
    riskScore,
    title: 'Nominal Circadian Rhythm & Neurocognitive Status',
    clinicalAction:
      'Consolidated sleep duration and PVT reaction speed within Earth pre-flight baseline. Cabin CO2 nominal.',
    telemedicinePriority: 'NOMINAL_LOG_ONLY',
  };
}

export function calculateHandoverMetrics(
  flightHistory: InFlightLogEntry[],
  presetId: MissionPresetKey = 'standard_iss_180d'
): HandoverMetrics {
  const preset = MISSION_PRESETS[presetId] || MISSION_PRESETS.standard_iss_180d;
  const logs = flightHistory.length > 0 ? flightHistory : [
    { day: 1, daily_ared_load: 94, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.3 },
  ];

  const avgAredWorkload =
    logs.reduce((acc, item) => acc + (item.daily_ared_load || 90), 0) / logs.length;
  const totalMissedWorkouts = logs.reduce((acc, item) => acc + (item.missed_workouts || 0), 0);
  const avgFluidShift =
    logs.reduce((acc, item) => acc + (item.cephalad_fluid_shift_index || 2), 0) / logs.length;

  // Exponential atrophy decay formulation: A(t) = A_max * (1 - e^(-k * t)) modulated by ARED adherence
  const adherenceFactor = Math.max(0.65, Math.min(1.35, (100 - avgAredWorkload) / 40 + 0.95));
  const missedPenalty = Math.min(4.5, (totalMissedWorkouts / Math.max(1, logs.length)) * 3.0);

  const rawAtrophy =
    26 * (1 - Math.exp(-0.0055 * preset.durationDays)) * adherenceFactor * preset.baselineAtrophyMultiplier +
    missedPenalty;
  const predictedMuscleAtrophyPercent = Number(Math.min(34, Math.max(4.5, rawAtrophy)).toFixed(1));

  const rawBoneLoss =
    (preset.durationDays / 30) * 0.95 * adherenceFactor * (preset.gravityFactor >= 1 ? 1.0 : 0.85);
  const predictedBoneLossPercent = Number(Math.min(14.5, Math.max(0.8, rawBoneLoss)).toFixed(1));

  const orthostaticRiskScore = Math.round(
    Math.min(98, Math.max(25, 32 + (preset.durationDays / 365) * 38 + avgFluidShift * 7))
  );

  const vestibularDisruptionScore = Math.round(
    Math.min(98, Math.max(28, 38 + (preset.durationDays / 365) * 42 + missedPenalty * 2))
  );

  return {
    presetId: preset.id,
    presetName: preset.name,
    missionDurationDays: preset.durationDays,
    avgAredWorkload: Number(avgAredWorkload.toFixed(1)),
    totalMissedWorkouts,
    avgFluidShift: Number(avgFluidShift.toFixed(1)),
    predictedMuscleAtrophyPercent,
    predictedBoneLossPercent,
    orthostaticRiskScore,
    vestibularDisruptionScore,
  };
}

export function calculateEarthReadiness(
  day: number,
  handover: HandoverMetrics,
  completedSessionsCount: number = 0
): EarthReadinessResult {
  const clampedDay = Math.max(0, Math.min(45, day));
  const sessionBonus = Math.min(12, completedSessionsCount * 1.5);
  const deficitPenalty = Math.max(0, (handover.predictedMuscleAtrophyPercent - 15) * 0.45);

  const dayRatio = clampedDay / 45;

  const vo2maxRecoveryPercent = Math.round(
    Math.min(100, Math.max(38, 46 + dayRatio * 48 + sessionBonus * 0.4 - deficitPenalty * 0.5))
  );
  const vestibularRecoveryPercent = Math.round(
    Math.min(100, Math.max(28, 35 + Math.pow(dayRatio, 0.82) * 58 + sessionBonus * 0.45 - deficitPenalty * 0.3))
  );
  const orthostaticTolerancePercent = Math.round(
    Math.min(100, Math.max(32, 40 + Math.pow(dayRatio, 0.72) * 54 + sessionBonus * 0.35))
  );

  const overallReadinessPercent = Math.round(
    Math.min(
      100,
      Math.max(
        30,
        vo2maxRecoveryPercent * 0.34 +
          vestibularRecoveryPercent * 0.34 +
          orthostaticTolerancePercent * 0.32
      )
    )
  );

  let gradeLabel = 'EARLY STABILIZATION';
  let gradeColor = '#F59E0B';
  if (overallReadinessPercent >= 90) {
    gradeLabel = 'EARTH FLIGHT CERTIFIED';
    gradeColor = '#10B981';
  } else if (overallReadinessPercent >= 65) {
    gradeLabel = 'PROGRESSIVE ADAPTATION';
    gradeColor = '#06B6D4';
  } else if (overallReadinessPercent >= 48) {
    gradeLabel = 'RECONDITIONING IN PROGRESS';
    gradeColor = '#10B981';
  }

  return {
    overallReadinessPercent,
    vo2maxRecoveryPercent,
    vestibularRecoveryPercent,
    orthostaticTolerancePercent,
    gradeLabel,
    gradeColor,
  };
}

export function evaluateSafetyStop(
  painScore: number,
  dizzinessScore: number
): SafetyStopResult {
  if (dizzinessScore > 4 || painScore > 5) {
    const reasons: string[] = [];
    if (dizzinessScore > 4) reasons.push(`Vestibular dizziness (${dizzinessScore}/10 > 4 limit)`);
    if (painScore > 5) reasons.push(`Joint/muscular pain (${painScore}/10 > 5 limit)`);

    return {
      haltRequired: true,
      level: 'RED',
      message: `SAFETY STOP TRIGGERED: ${reasons.join(' and ')}`,
      action:
        'Halt all standing/upright exercises immediately. Transition to 30° recumbent position, consume 500 mL oral electrolyte solution, and log incident with APTP flight physiotherapist.',
    };
  }

  if (dizzinessScore >= 3 || painScore >= 4) {
    return {
      haltRequired: false,
      level: 'AMBER',
      message: 'Symptom Precaution: Approaching APTP clinical tolerance threshold.',
      action:
        'Reduce resistance load by 25%, keep parallel support rails within reach, and extend rest intervals to 2 minutes between sets.',
    };
  }

  return {
    haltRequired: false,
    level: 'GREEN',
    message: 'Physiological parameters nominal.',
    action: "Full 2-hour exercise prescription authorized for today's reconditioning block.",
  };
}

export function getActiveRehabPhase(day: number): RehabPhase {
  return (
    POST_FLIGHT_PHASES.find((p) => day >= p.startDay && day <= p.endDay) ||
    POST_FLIGHT_PHASES[0]
  );
}

export function evaluateModeAAnatomyRegion(
  regionId: ModeAAnatomicalRegionId,
  allMetrics: Record<SubsystemKey, Record<string, number>>,
  environmentKey: EnvironmentKey,
  flightLogs: InFlightLogEntry[]
): ModeAAnatomyEvaluation {
  const region = MODE_A_ANATOMY_REGIONS[regionId];
  const subsystemKey = region.linkedSubsystem;
  const subDef = SUBSYSTEMS_DATA[subsystemKey];
  const subValues = allMetrics[subsystemKey] || {};
  const triage = evaluateSubsystem(subsystemKey, subValues, environmentKey);

  const recordedValues = subDef.metrics.map((m) => {
    const val = subValues[m.id] ?? m.defaultValue;
    const isAlert = m.invertDirection
      ? val <= m.amberThreshold
      : val >= m.amberThreshold;
    return {
      label: m.label,
      value: `${val} ${m.unit}`,
      nominalRange: `${m.normalRange[0]}–${m.normalRange[1]} ${m.unit}`,
      isAlert,
    };
  });

  const logs =
    flightLogs.length > 0
      ? flightLogs.slice(-7)
      : [{ day: 1, daily_ared_load: 94, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.3 }];

  let historicalTrend: Array<{ dayLabel: string; value: number; unit: string }> = [];
  let trendSummary = '';

  if (subsystemKey === 'cardiovascular') {
    const curShift = subValues.cephalad_fluid_shift_index ?? 2;
    historicalTrend = logs.map((entry) => ({
      dayLabel: `D${entry.day}`,
      value: Number(entry.cephalad_fluid_shift_index.toFixed(1)),
      unit: 'grade',
    }));
    historicalTrend.push({ dayLabel: 'Now', value: curShift, unit: 'grade' });
    const first = historicalTrend[0]?.value ?? curShift;
    const delta = Number((curShift - first).toFixed(1));
    trendSummary =
      delta > 0
        ? `Cephalad fluid shift elevated (+${delta} grade vs D${logs[0].day}).`
        : delta < 0
          ? `Venous stasis improving (${delta} grade vs D${logs[0].day}).`
          : `Stable venous stasis trend across ${logs.length} logged days.`;
  } else if (subsystemKey === 'ocular_sans') {
    const curOnsd = subValues.onsd_diameter ?? 5.7;
    historicalTrend = logs.map((entry) => {
      const derivedOnsd = Number((4.7 + entry.cephalad_fluid_shift_index * 0.42).toFixed(2));
      return {
        dayLabel: `D${entry.day}`,
        value: derivedOnsd,
        unit: 'mm',
      };
    });
    historicalTrend.push({ dayLabel: 'Now', value: curOnsd, unit: 'mm' });
    const first = historicalTrend[0]?.value ?? curOnsd;
    const delta = Number((curOnsd - first).toFixed(2));
    trendSummary =
      delta > 0.2
        ? `ONSD widening (+${delta} mm vs D${logs[0].day} baseline); monitor SANS progression.`
        : `ONSD within ${delta >= 0 ? `+${delta}` : delta} mm of multi-day flight baseline.`;
  } else if (subsystemKey === 'musculoskeletal') {
    const curAred = subValues.ared_compliance ?? 94;
    historicalTrend = logs.map((entry) => ({
      dayLabel: `D${entry.day}`,
      value: Number(entry.daily_ared_load.toFixed(1)),
      unit: '%',
    }));
    historicalTrend.push({ dayLabel: 'Now', value: curAred, unit: '%' });
    const avg =
      logs.reduce((acc, item) => acc + item.daily_ared_load, 0) / logs.length;
    trendSummary = `7-day ARED mean load ${avg.toFixed(1)}% vs current ${curAred}%.`;
  } else {
    const curSleep = subValues.sleep_hours ?? 7.2;
    historicalTrend = logs.map((entry) => ({
      dayLabel: `D${entry.day}`,
      value: Number(entry.sleep_duration.toFixed(1)),
      unit: 'hrs',
    }));
    historicalTrend.push({ dayLabel: 'Now', value: curSleep, unit: 'hrs' });
    const avg =
      logs.reduce((acc, item) => acc + item.sleep_duration, 0) / logs.length;
    trendSummary = `Logged sleep mean ${avg.toFixed(1)} hrs/night vs current ${curSleep} hrs.`;
  }

  return {
    region,
    level: triage.level,
    riskScore: triage.riskScore,
    statusTitle: triage.title,
    clinicalAction: triage.clinicalAction,
    recordedValues,
    historicalTrend,
    trendSummary,
  };
}

export function evaluateModeBRecoveryRegion(
  regionId: ModeBRecoveryRegionId,
  currentDay: number,
  handover: HandoverMetrics,
  completedSessionsCount: number,
  painScore: number,
  dizzinessScore: number
): ModeBRecoveryEvaluation {
  const region = MODE_B_RECOVERY_REGIONS[regionId];
  const clampedDay = Math.max(0, Math.min(45, currentDay));
  const dayRatio = clampedDay / 45;

  const baseDeficit =
    region.category === 'Load-Bearing Bone'
      ? handover.predictedBoneLossPercent * 3.1
      : region.category === 'Axial Spine'
        ? handover.predictedMuscleAtrophyPercent * 1.45 + handover.predictedBoneLossPercent * 1.2
        : handover.predictedMuscleAtrophyPercent * 1.65;

  const weightedDeficit = baseDeficit * region.baselineVulnerabilityWeight;
  const sessionRecoveryBoost = Math.min(14, completedSessionsCount * 1.6);
  const symptomPenalty =
    painScore > 5 || dizzinessScore > 4
      ? 14
      : painScore >= 4 || dizzinessScore >= 3
        ? 6
        : 0;

  // Non-linear 45-day adaptation curve: bone & deep postural muscles recover more slowly early on
  const recoveryCurveExponent =
    region.category === 'Load-Bearing Bone' || region.category === 'Axial Spine' ? 1.15 : 0.85;

  const initialVulnerability = Math.min(92, Math.max(18, weightedDeficit));
  const recoveredFraction = Math.min(
    1,
    Math.pow(dayRatio, recoveryCurveExponent) * 0.88 + sessionRecoveryBoost / 100
  );

  const rawVulnerability = Math.max(
    6,
    initialVulnerability * (1 - recoveredFraction) + symptomPenalty
  );
  const vulnerabilityPercent = Math.round(Math.min(96, Math.max(5, rawVulnerability)));
  const recoveryPercent = Math.round(Math.min(100, Math.max(4, 100 - vulnerabilityPercent)));

  let tier: RecoveryStatusTier = 'GREEN';
  let tierLabel = 'RESTORED / READY';
  let colorHex = '#10B981';

  if (vulnerabilityPercent >= 52 || painScore > 5 || dizzinessScore > 4) {
    tier = 'RED';
    tierLabel = 'HIGH VULNERABILITY';
    colorHex = '#EF4444';
  } else if (vulnerabilityPercent >= 32) {
    tier = 'AMBER';
    tierLabel = 'GUARDED LOADING';
    colorHex = '#F59E0B';
  } else if (vulnerabilityPercent >= 18) {
    tier = 'CYAN';
    tierLabel = 'PROGRESSIVE ADAPTATION';
    colorHex = '#06B6D4';
  }

  let loadingClearance = 'Full 1.0g Osteogenic & Dynamic Load Cleared';
  if (painScore > 5 || dizzinessScore > 4) {
    loadingClearance = 'HALTED — Active Safety Stop (30° Recumbent Rest)';
  } else if (clampedDay <= 7) {
    loadingClearance = 'Guarded Phase 1 — Recumbent / Non-Axial Stabilization Only';
  } else if (clampedDay <= 21) {
    loadingClearance = 'Progressive Phase 2 — Aquatic Offload & Banded Hinge';
  }

  const atrophyOrLossNote =
    region.category === 'Load-Bearing Bone'
      ? `Estimated flight BMD deficit: -${handover.predictedBoneLossPercent}% (${handover.presetName})`
      : `Projected flight muscle atrophy: -${handover.predictedMuscleAtrophyPercent}% · Missed ARED sessions: ${handover.totalMissedWorkouts}`;

  return {
    region,
    recoveryPercent,
    vulnerabilityPercent,
    tier,
    tierLabel,
    colorHex,
    loadingClearance,
    atrophyOrLossNote,
  };
}

