import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEarthReadiness,
  calculateHandoverMetrics,
  evaluateModeAAnatomyRegion,
  evaluateModeBRecoveryRegion,
  evaluateSafetyStop,
  evaluateSubsystem,
  getActiveRehabPhase,
} from './ruleEngine';
import { MODE_A_REGION_LIST, MODE_B_REGION_LIST } from '../data/anatomyData';
import {
  ASSET_COVERAGE_NOTES,
  ATLAS_BY_KEY,
  DEFAULT_SYSTEM_VISIBILITY,
  SYSTEM_FILTER_OPTIONS,
  filterAtlasStructures,
  getAtlasStructureDetails,
  getStructureFilterBucket,
  getStructuresForSex,
} from '../data/openAnatomyData';
import { SUBSYSTEMS_DATA } from '../data/rulesData';
import type { SubsystemKey } from '../types/astral';

function makeDefaultMetrics(): Record<SubsystemKey, Record<string, number>> {
  const result = {} as Record<SubsystemKey, Record<string, number>>;
  (Object.keys(SUBSYSTEMS_DATA) as SubsystemKey[]).forEach((key) => {
    const map: Record<string, number> = {};
    SUBSYSTEMS_DATA[key].metrics.forEach((m) => {
      map[m.id] = m.defaultValue;
    });
    result[key] = map;
  });
  return result;
}

test('Cardiovascular IJV triage classifies nominal, amber, and critical thrombosis risk', () => {
  const nominal = evaluateSubsystem(
    'cardiovascular',
    { ijv_flow_velocity: 26, cephalad_fluid_shift_index: 2, resting_heart_rate: 65 },
    'microgravity'
  );
  assert.equal(nominal.level, 'GREEN');
  assert.equal(nominal.telemedicinePriority, 'NOMINAL_LOG_ONLY');

  const amber = evaluateSubsystem(
    'cardiovascular',
    { ijv_flow_velocity: 11, cephalad_fluid_shift_index: 3, resting_heart_rate: 78 },
    'microgravity'
  );
  assert.equal(amber.level, 'AMBER');

  const critical = evaluateSubsystem(
    'cardiovascular',
    { ijv_flow_velocity: 4.1, cephalad_fluid_shift_index: 4, resting_heart_rate: 105 },
    'microgravity'
  );
  assert.equal(critical.level, 'RED');
  assert.equal(critical.telemedicinePriority, 'URGENT_FLIGHT_SURGEON');
});

test('Ocular SANS triage flags elevated ONSD and Frisen papilledema', () => {
  const nominal = evaluateSubsystem(
    'ocular_sans',
    { onsd_diameter: 4.8, visual_acuity_change: 0.2, frisen_papilledema_grade: 0 },
    'microgravity'
  );
  assert.equal(nominal.level, 'GREEN');

  const critical = evaluateSubsystem(
    'ocular_sans',
    { onsd_diameter: 6.3, visual_acuity_change: 1.8, frisen_papilledema_grade: 3 },
    'microgravity'
  );
  assert.equal(critical.level, 'RED');
});

test('Musculoskeletal and Mood/Sleep triage respect inverted lower-is-worse thresholds', () => {
  const musculoRed = evaluateSubsystem(
    'musculoskeletal',
    { ared_compliance: 58, spinal_pain_score: 7, missed_ared_sessions: 4 },
    'microgravity'
  );
  assert.equal(musculoRed.level, 'RED');

  const sleepGreen = evaluateSubsystem(
    'mood_sleep',
    { sleep_hours: 7.4, pvt_lapses: 1, cabin_co2_mmhg: 2.2 },
    'partial_gravity_mars'
  );
  assert.equal(sleepGreen.level, 'GREEN');

  const sleepRed = evaluateSubsystem(
    'mood_sleep',
    { sleep_hours: 4.6, pvt_lapses: 9, cabin_co2_mmhg: 5.4 },
    'microgravity'
  );
  assert.equal(sleepRed.level, 'RED');
});

test('Handover metrics scale atrophy and bone loss monotonically across 30d, 180d, and 365d presets', () => {
  const logs = [
    { day: 1, daily_ared_load: 94, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.3 },
    { day: 2, daily_ared_load: 90, missed_workouts: 1, cephalad_fluid_shift_index: 3, sleep_duration: 7.0 },
  ];
  const short30 = calculateHandoverMetrics(logs, 'short_mission_30d');
  const iss180 = calculateHandoverMetrics(logs, 'standard_iss_180d');
  const mars365 = calculateHandoverMetrics(logs, 'mars_transit_365d');

  assert.ok(short30.predictedMuscleAtrophyPercent < iss180.predictedMuscleAtrophyPercent);
  assert.ok(iss180.predictedMuscleAtrophyPercent < mars365.predictedMuscleAtrophyPercent);
  assert.ok(short30.predictedBoneLossPercent < iss180.predictedBoneLossPercent);
  assert.ok(iss180.predictedBoneLossPercent < mars365.predictedBoneLossPercent);
});

test('Earth readiness advances from R+0 to R+45 and maps correct APTP phases', () => {
  const handover = calculateHandoverMetrics([], 'standard_iss_180d');
  const r3 = calculateEarthReadiness(3, handover, 1);
  const r25 = calculateEarthReadiness(25, handover, 4);
  const r45 = calculateEarthReadiness(45, handover, 8);

  assert.ok(r3.overallReadinessPercent < r25.overallReadinessPercent);
  assert.ok(r25.overallReadinessPercent < r45.overallReadinessPercent);
  assert.equal(getActiveRehabPhase(3).phaseId, 1);
  assert.equal(getActiveRehabPhase(14).phaseId, 2);
  assert.equal(getActiveRehabPhase(35).phaseId, 3);
});

test('Active Safety Stop triggers RED halt when dizziness > 4 or pain > 5', () => {
  const safe = evaluateSafetyStop(1, 2);
  assert.equal(safe.haltRequired, false);
  assert.equal(safe.level, 'GREEN');

  const caution = evaluateSafetyStop(4, 2);
  assert.equal(caution.haltRequired, false);
  assert.equal(caution.level, 'AMBER');

  const dizzyHalt = evaluateSafetyStop(1, 5);
  assert.equal(dizzyHalt.haltRequired, true);
  assert.equal(dizzyHalt.level, 'RED');

  const painHalt = evaluateSafetyStop(6, 1);
  assert.equal(painHalt.haltRequired, true);
  assert.equal(painHalt.level, 'RED');
});

test('All 10 Mode A anatomical regions evaluate with historical trends and rule-engine linkage', () => {
  assert.equal(MODE_A_REGION_LIST.length, 10);
  const metrics = makeDefaultMetrics();
  metrics.cardiovascular = { ijv_flow_velocity: 4.5, cephalad_fluid_shift_index: 4, resting_heart_rate: 98 };
  const logs = [
    { day: 1, daily_ared_load: 95, missed_workouts: 0, cephalad_fluid_shift_index: 2, sleep_duration: 7.4 },
    { day: 2, daily_ared_load: 91, missed_workouts: 0, cephalad_fluid_shift_index: 3, sleep_duration: 7.1 },
  ];

  for (const reg of MODE_A_REGION_LIST) {
    const evalResult = evaluateModeAAnatomyRegion(reg.id, metrics, 'microgravity', logs);
    assert.equal(evalResult.region.id, reg.id);
    assert.ok(evalResult.recordedValues.length >= 3);
    assert.ok(evalResult.historicalTrend.length === 3);
    assert.ok(evalResult.region.references.length >= 1);
  }

  const ijv = evaluateModeAAnatomyRegion('internal_jugular', metrics, 'microgravity', logs);
  assert.equal(ijv.level, 'RED');
});

test('All 10 Mode B recovery regions progress from early vulnerability toward recovery and respect Safety Stop', () => {
  assert.equal(MODE_B_REGION_LIST.length, 10);
  const handover = calculateHandoverMetrics([], 'mars_transit_365d');

  for (const reg of MODE_B_REGION_LIST) {
    const early = evaluateModeBRecoveryRegion(reg.id, 1, handover, 0, 1, 1);
    const late = evaluateModeBRecoveryRegion(reg.id, 42, handover, 8, 1, 1);
    assert.ok(late.recoveryPercent > early.recoveryPercent);
    assert.ok(early.vulnerabilityPercent > late.vulnerabilityPercent);
  }

  const halted = evaluateModeBRecoveryRegion('soleus', 30, handover, 5, 2, 6);
  assert.equal(halted.tier, 'RED');
  assert.ok(halted.loadingClearance.includes('HALTED'));
});

test('Open-Anatomy-3D catalog loads male/female structures accurately without invented meshes', () => {
  const male = getStructuresForSex('male');
  const female = getStructuresForSex('female');

  assert.ok(male.length >= 120);
  assert.ok(female.length >= 120);
  assert.ok(male.every((item) => item.system !== 'joints'));
  assert.ok(male.some((item) => item.key === 'prostate'));
  assert.ok(!female.some((item) => item.key === 'prostate'));
  assert.ok(female.some((item) => item.key === 'uterus'));
  assert.ok(!male.some((item) => item.key === 'uterus'));
  assert.equal(ATLAS_BY_KEY.jugular_vein, undefined);
  assert.ok(ASSET_COVERAGE_NOTES.length === 6);
});

test('Open-Anatomy-3D system filter buckets cover all 8 systems and support structure search', () => {
  const male = getStructuresForSex('male');
  const seenBuckets = new Set(male.map((m) => getStructureFilterBucket(m)));

  for (const opt of SYSTEM_FILTER_OPTIONS) {
    assert.ok(seenBuckets.has(opt.id), `Missing filter bucket ${opt.id}`);
  }

  const heartMatches = filterAtlasStructures(male, 'heart', DEFAULT_SYSTEM_VISIBILITY, true);
  assert.ok(heartMatches.some((m) => m.key === 'heart'));

  // Muscles are hidden by default, yet search still surfaces them when showHiddenInSearch=true
  const calfMatches = filterAtlasStructures(male, 'calf', DEFAULT_SYSTEM_VISIBILITY, true);
  assert.ok(calfMatches.some((m) => m.key === 'calf_l'));
});

test('Open-Anatomy-3D structure details bind ASTROCARE telemetry honestly and disclose groupings', () => {
  const heart = getAtlasStructureDetails('heart');
  assert.equal(heart.latinName, 'Cor');
  assert.equal(heart.modeASubsystem, 'cardiovascular');
  assert.ok(heart.groupedOrLimitationNote?.includes('chambers'));

  const veinsThorax = getAtlasStructureDetails('veins_thorax');
  assert.equal(veinsThorax.modeASubsystem, 'cardiovascular');
  assert.equal(veinsThorax.modeARegionId, 'internal_jugular');
  assert.ok(veinsThorax.groupedOrLimitationNote?.includes('Internal jugular'));

  const eyeL = getAtlasStructureDetails('eye_l');
  assert.equal(eyeL.modeASubsystem, 'ocular_sans');
  assert.equal(eyeL.modeBFocusArea, 'Balance & Vestibular Rehabilitation');

  const calfL = getAtlasStructureDetails('calf_l');
  assert.equal(calfL.modeBRegionId, 'soleus');
  assert.equal(calfL.modeBFocusArea, 'Lower-Limb Strength');

  const spleen = getAtlasStructureDetails('spleen');
  assert.equal(spleen.modeASubsystem, undefined);
  assert.equal(spleen.modeBRegionId, undefined);
});


