export type PageTab =
  | 'home'
  | 'deployment'
  | 'contact';

export type MissionMode = 'flight' | 'rehab';

export type EnvironmentKey =
  | 'microgravity'
  | 'partial_gravity_lunar'
  | 'partial_gravity_mars'
  | 'eva_rover';

export type SubsystemKey =
  | 'cardiovascular'
  | 'ocular_sans'
  | 'musculoskeletal'
  | 'mood_sleep';

export type MissionPresetKey =
  | 'standard_iss_180d'
  | 'short_mission_30d'
  | 'mars_transit_365d';

export type TriageLevel = 'GREEN' | 'AMBER' | 'RED';

export interface EnvironmentMultiplier {
  key: EnvironmentKey;
  label: string;
  gravityG: number;
  fluidShiftRisk: number;
  muscleAtrophyRatePerDay: number;
  radiationFactor: number;
  description: string;
}

export interface SubsystemMetricDef {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  normalRange: [number, number];
  amberThreshold: number;
  criticalThreshold: number;
  invertDirection?: boolean; // true when lower values are worse (e.g., IJV flow velocity, sleep duration)
}

export interface SubsystemDef {
  key: SubsystemKey;
  shortLabel: string;
  name: string;
  examType: string;
  probePlacement: string;
  targetAnatomy: string;
  metrics: SubsystemMetricDef[];
}

export interface TriageResult {
  subsystem: SubsystemKey;
  level: TriageLevel;
  title: string;
  clinicalAction: string;
  telemedicinePriority: string;
  riskScore: number;
}

export interface InFlightLogEntry {
  day: number;
  daily_ared_load: number;
  missed_workouts: number;
  cephalad_fluid_shift_index: number;
  sleep_duration: number;
  timestamp?: string;
}

export interface MissionPreset {
  id: MissionPresetKey;
  name: string;
  durationDays: number;
  gravityFactor: number;
  baselineAtrophyMultiplier: number;
}

export interface RehabExercise {
  id: string;
  name: string;
  duration: string;
  reps: string;
  targetMuscles: string[];
  instructions: string;
  safetyLimit: string;
}

export interface RehabPhase {
  phaseId: number;
  name: string;
  dayRange: string;
  startDay: number;
  endDay: number;
  theme: string;
  protocolTag: string;
  exercises: RehabExercise[];
}

export interface HandoverMetrics {
  presetId: MissionPresetKey;
  presetName: string;
  missionDurationDays: number;
  avgAredWorkload: number;
  totalMissedWorkouts: number;
  avgFluidShift: number;
  predictedMuscleAtrophyPercent: number;
  predictedBoneLossPercent: number;
  orthostaticRiskScore: number;
  vestibularDisruptionScore: number;
}

export interface EarthReadinessResult {
  overallReadinessPercent: number;
  vo2maxRecoveryPercent: number;
  vestibularRecoveryPercent: number;
  orthostaticTolerancePercent: number;
  gradeLabel: string;
  gradeColor: string;
}

export interface SafetyStopResult {
  haltRequired: boolean;
  level: TriageLevel;
  message: string;
  action: string;
}

export interface DonkiSpaceWeatherEvent {
  activityID: string;
  startTime: string;
  note: string;
  radiationRiskLevel: string;
  evaAdvisory: string;
  instruments: Array<{ displayName: string }>;
}

export interface DonkiFetchResult {
  source: 'LIVE' | 'OFFLINE SIMULATION';
  events: DonkiSpaceWeatherEvent[];
  fetchedAt: string;
}

export type ModeAAnatomicalRegionId =
  | 'brain_nervous'
  | 'eyes_optic'
  | 'heart_cardio'
  | 'lungs_respiratory'
  | 'internal_jugular'
  | 'bones_skeletal'
  | 'spine'
  | 'muscles'
  | 'calves_soleus'
  | 'digestive';

export type ModeBRecoveryRegionId =
  | 'soleus'
  | 'gastrocnemius'
  | 'quadriceps'
  | 'hamstrings'
  | 'multifidus'
  | 'erector_spinae'
  | 'core_stabilizers'
  | 'cervical_extensors'
  | 'femoral_bones'
  | 'spine_b';

export type CameraViewPreset = 'front' | 'back' | 'left' | 'right';

export interface ModeAAnatomyRegionDef {
  id: ModeAAnatomicalRegionId;
  name: string;
  shortLabel: string;
  linkedSubsystem: SubsystemKey;
  biologicalFunction: string;
  spaceflightConcern: string;
  relevantMeasurements: string[];
  monitoringRecommendations: string[];
  references: string[];
  cameraFocus: [number, number, number];
  preferredView: CameraViewPreset;
}

export interface ModeAAnatomyEvaluation {
  region: ModeAAnatomyRegionDef;
  level: TriageLevel;
  riskScore: number;
  statusTitle: string;
  clinicalAction: string;
  recordedValues: Array<{
    label: string;
    value: string;
    nominalRange: string;
    isAlert: boolean;
  }>;
  historicalTrend: Array<{
    dayLabel: string;
    value: number;
    unit: string;
  }>;
  trendSummary: string;
}

export interface ModeBRecoveryRegionDef {
  id: ModeBRecoveryRegionId;
  name: string;
  shortLabel: string;
  category: 'Postural Muscle' | 'Phasic Muscle' | 'Load-Bearing Bone' | 'Axial Spine';
  biologicalFunction: string;
  postFlightConcern: string;
  baselineVulnerabilityWeight: number;
  linkedExerciseKeywords: string[];
  loadingGuidance: string;
  references: string[];
  cameraFocus: [number, number, number];
  preferredView: CameraViewPreset;
}

export type RecoveryStatusTier = 'RED' | 'AMBER' | 'CYAN' | 'GREEN';

export interface ModeBRecoveryEvaluation {
  region: ModeBRecoveryRegionDef;
  recoveryPercent: number;
  vulnerabilityPercent: number;
  tier: RecoveryStatusTier;
  tierLabel: string;
  colorHex: string;
  loadingClearance: string;
  atrophyOrLossNote: string;
}

export type AtlasSex = 'male' | 'female';

export type AtlasAssetSystem =
  | 'skin'
  | 'skeleton'
  | 'joints'
  | 'muscles'
  | 'organs'
  | 'vessels'
  | 'nerves';

export type AtlasSystemFilter =
  | 'skin'
  | 'skeleton'
  | 'muscles'
  | 'cardiovascular'
  | 'respiratory'
  | 'nervous'
  | 'organs'
  | 'vessels';

export type AtlasCameraView =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'reset';

export interface OpenAnatomyCatalogEntry {
  key: string;
  label: string;
  system: AtlasAssetSystem;
  category: string;
  color: string;
  anchor?: [number, number, number];
  anchorFemale?: [number, number, number];
  sex?: AtlasSex;
}

export interface AtlasStructureDetails {
  key: string;
  label: string;
  latinName: string | null;
  assetSystem: AtlasAssetSystem;
  filterBucket: AtlasSystemFilter | 'joints';
  category: string;
  color: string;
  anatomicalFunction: string;
  anatomicalLocation: string;
  relatedKeys: string[];
  spaceflightRelevance: string;
  groupedOrLimitationNote?: string;
  modeASubsystem?: SubsystemKey;
  modeARegionId?: ModeAAnatomicalRegionId;
  modeAFocusLabel?: string;
  modeBRegionId?: ModeBRecoveryRegionId;
  modeBFocusArea?:
    | 'Muscle Recovery'
    | 'Bone Recovery'
    | 'Balance & Vestibular Rehabilitation'
    | 'Spine & Posture Recovery'
    | 'Lower-Limb Strength'
    | 'Core Stability';
}

export type TimeRangeKey = '1h' | '6h' | '24h' | '7d';

export type BodySystemFocusKey =
  | 'whole_body'
  | 'cardiovascular'
  | 'respiratory'
  | 'neuro_ocular'
  | 'musculoskeletal';

export type AstronautProfileId = 'cdr_vance' | 'fe_chen' | 'ms_nair';

export type ChartId =
  | 'heart_rate'
  | 'blood_oxygen'
  | 'blood_pressure'
  | 'respiratory_rate'
  | 'body_temperature'
  | 'radiation_exposure';

export interface AstronautProfile {
  id: AstronautProfileId;
  callsign: string;
  name: string;
  role: string;
  missionDay: number;
  sex: AtlasSex;
  baselines: {
    heartRateBpm: number;
    spo2Percent: number;
    systolicMmHg: number;
    diastolicMmHg: number;
    respiratoryRateBpm: number;
    bodyTempC: number;
    dailyRadiationLimitMSv: number;
    missionRadiationLimitMSv: number;
    cumulativePriorMSv: number;
  };
}

export interface TelemetryPoint {
  index: number;
  timestamp: string;
  label: string;
  value: number;
  secondaryValue?: number;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface VitalOverviewCardData {
  id: ChartId;
  title: string;
  valueDisplay: string;
  unit: string;
  baselineDisplay: string;
  deltaDisplay: string;
  deltaPercentDisplay: string;
  trend: 'up' | 'down' | 'steady';
  status: TriageLevel;
  statusLabel: string;
  systemFocus: BodySystemFocusKey;
  dataOrigin: 'LIVE_LOCAL' | 'DEMO_TELEMETRY';
  subtitle: string;
}

export interface TelemetrySeriesBundle {
  id: ChartId;
  title: string;
  subtitle: string;
  unit: string;
  primaryLabel: string;
  secondaryLabel?: string;
  baselineValue: number;
  secondaryBaselineValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  invertThreshold?: boolean;
  currentDisplay: string;
  stats: {
    min: number;
    avg: number;
    max: number;
  };
  status: TriageLevel;
  statusLabel: string;
  dataOrigin: 'LIVE_LOCAL' | 'DEMO_TELEMETRY';
  points: TelemetryPoint[];
}

export interface HealthInsightItem {
  id: string;
  category: 'VALIDATED_RULE' | 'SIMULATED_TREND';
  severity: TriageLevel;
  title: string;
  explanation: string;
  baselineComparison: string;
  relatedSystem: BodySystemFocusKey;
  timeframeLabel: string;
}

export interface BodySystemFocusMeta {
  key: BodySystemFocusKey;
  label: string;
  shortLabel: string;
  structureKey: string;
  cameraView: AtlasCameraView;
  summary: string;
  priorityCharts: ChartId[];
  relatedMeasurements: Array<{ label: string; value: string; note: string }>;
}

export interface AstronautTelemetryBundle {
  profile: AstronautProfile;
  timeRange: TimeRangeKey;
  overviewCards: VitalOverviewCardData[];
  charts: Record<ChartId, TelemetrySeriesBundle>;
  insights: HealthInsightItem[];
  hasElevatedDonki: boolean;
  cumulativeRadiationMSv: number;
  dailyRadiationMSv: number;
}

