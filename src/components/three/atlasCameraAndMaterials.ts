import type {
  AtlasCameraView,
  AtlasSex,
  AtlasSystemFilter,
  SubsystemKey,
} from '../../types/astral';

export type AtlasLayerPresetId =
  | 'clinical_cutaway'
  | 'muscular_body'
  | 'natural_body'
  | 'deep_organs';

export interface AtlasLayerPreset {
  id: AtlasLayerPresetId;
  label: string;
  description: string;
  skinOpacity: number;
  visibility: Record<AtlasSystemFilter, boolean>;
}

export const ATLAS_LAYER_PRESETS: AtlasLayerPreset[] = [
  {
    id: 'clinical_cutaway',
    label: 'Clinical Cutaway',
    description: 'Sculpted translucent human silhouette over internal organs, vessels & skeleton',
    skinOpacity: 0.28,
    visibility: {
      skin: true,
      skeleton: true,
      muscles: false,
      cardiovascular: true,
      respiratory: true,
      nervous: true,
      organs: true,
      vessels: true,
    },
  },
  {
    id: 'muscular_body',
    label: 'Muscular Body',
    description: 'Full striated human musculature over skeletal and vascular anatomy',
    skinOpacity: 0.08,
    visibility: {
      skin: false,
      skeleton: true,
      muscles: true,
      cardiovascular: true,
      respiratory: true,
      nervous: true,
      organs: false,
      vessels: true,
    },
  },
  {
    id: 'natural_body',
    label: 'Natural Body',
    description: 'Realistic outer human skin surface showing natural anatomical proportions',
    skinOpacity: 1.0,
    visibility: {
      skin: true,
      skeleton: true,
      muscles: false,
      cardiovascular: true,
      respiratory: true,
      nervous: true,
      organs: true,
      vessels: true,
    },
  },
  {
    id: 'deep_organs',
    label: 'Organs & Vessels',
    description: 'Focused internal thoracic, cranial, respiratory, and vascular atlas',
    skinOpacity: 0,
    visibility: {
      skin: false,
      skeleton: true,
      muscles: false,
      cardiovascular: true,
      respiratory: true,
      nervous: true,
      organs: true,
      vessels: true,
    },
  },
];

export interface ClinicalDemoStory {
  id: string;
  mode: 'flight' | 'rehab';
  shortLabel: string;
  title: string;
  primaryKey: string;
  accentKeys: string[];
  preferredView: AtlasCameraView;
  recommendedPreset: AtlasLayerPresetId;
  subsystem?: SubsystemKey;
  storySummary: string;
  whyItMatters: string;
  hasSchematicDiagram?: 'ijv' | 'sans' | 'spinal_cord';
}

export const MODE_A_DEMO_STORIES: ClinicalDemoStory[] = [
  {
    id: 'demo-a-cardio',
    mode: 'flight',
    shortLabel: 'Cardiovascular',
    title: 'Heart & Central Great Vessels',
    primaryKey: 'heart',
    accentKeys: ['heart', 'aorta', 'vena_cava_superior', 'vena_cava_inferior', 'pulmonary_vessels'],
    preferredView: 'front',
    recommendedPreset: 'clinical_cutaway',
    subsystem: 'cardiovascular',
    storySummary:
      'Focuses on the heart, aortic arch, and superior/inferior vena cava within the translucent thoracic cage.',
    whyItMatters:
      'Microgravity removes hydrostatic blood pooling, shrinking plasma volume by 10–15% and reducing cardiac stroke workload unless mitigated.',
  },
  {
    id: 'demo-a-ijv',
    mode: 'flight',
    shortLabel: 'IJV Neck',
    title: 'Cervical Venous Return & IJV Window',
    primaryKey: 'veins_thorax',
    accentKeys: ['veins_thorax', 'carotid_l', 'carotid_r', 'vena_cava_superior'],
    preferredView: 'front',
    recommendedPreset: 'clinical_cutaway',
    subsystem: 'cardiovascular',
    storySummary:
      'Zooms to the neck and superior thoracic inlet highlighting cervical/thoracic venous drainage beside the common carotid arteries.',
    whyItMatters:
      'Headward fluid shift causes internal jugular vein (IJV) engorgement and stagnant or retrograde venous flow monitored under NASA Medical Directive 44-A.',
    hasSchematicDiagram: 'ijv',
  },
  {
    id: 'demo-a-sans',
    mode: 'flight',
    shortLabel: 'SANS Ocular',
    title: 'Eyes & Optic Nerve Region (SANS)',
    primaryKey: 'eye_l',
    accentKeys: ['eye_l', 'eye_r', 'cranial_nerves'],
    preferredView: 'front',
    recommendedPreset: 'clinical_cutaway',
    subsystem: 'ocular_sans',
    storySummary:
      'Zooms closely into the orbits with the frontal skull ghosted to reveal both globes and cranial/optic nerve pathways.',
    whyItMatters:
      'Elevated perioptic CSF pressure in microgravity flattens the posterior sclera, distends the optic nerve sheath (ONSD), and drives hyperopic visual shifts.',
    hasSchematicDiagram: 'sans',
  },
  {
    id: 'demo-a-musculo',
    mode: 'flight',
    shortLabel: 'Musculoskeletal',
    title: 'Spine, Weight-Bearing Bones & Antigravity Muscles',
    primaryKey: 'spine_lumbar',
    accentKeys: [
      'spine_lumbar',
      'spine_thoracic',
      'pelvis',
      'femur_l',
      'femur_r',
      'quadriceps_l',
      'quadriceps_r',
      'calf_l',
      'calf_r',
      'abdominal_muscles',
    ],
    preferredView: 'reset',
    recommendedPreset: 'muscular_body',
    subsystem: 'musculoskeletal',
    storySummary:
      'Displays sculpted skeletal musculature and axial load-bearing bones (lumbar spine, pelvis, femora, quadriceps, calves, core).',
    whyItMatters:
      'Without 1.0g loading, trabecular bone loses 1.0–1.5%/month and slow-twitch antigravity muscles atrophy rapidly without high-load ARED training.',
  },
  {
    id: 'demo-a-respiratory',
    mode: 'flight',
    shortLabel: 'Respiratory',
    title: 'Lungs, Trachea, Bronchi & Diaphragm',
    primaryKey: 'lung_l',
    accentKeys: ['lung_l', 'lung_r', 'trachea', 'bronchi', 'diaphragm'],
    preferredView: 'front',
    recommendedPreset: 'deep_organs',
    subsystem: 'mood_sleep',
    storySummary:
      'Frames the thoracic airways from trachea and main bronchi into both lungs resting above the dome of the diaphragm.',
    whyItMatters:
      'Microgravity homogenizes ventilation-perfusion gradients while localized spacecraft CO2 pockets impair crew sleep and psychomotor vigilance.',
  },
  {
    id: 'demo-a-nervous',
    mode: 'flight',
    shortLabel: 'Brain & Spine',
    title: 'Brain & Upper Spinal Cord',
    primaryKey: 'brain',
    accentKeys: ['brain', 'cerebellum', 'brainstem', 'spinal_cord'],
    preferredView: 'left',
    recommendedPreset: 'clinical_cutaway',
    subsystem: 'mood_sleep',
    storySummary:
      'Ghosts the cranium to inspect the cerebrum, cerebellum, brainstem, and cervical spinal cord transition.',
    whyItMatters:
      'Upward brain shift and narrowed superior CSF spaces alter vestibular integration, sleep consolidation, and cognitive endurance.',
    hasSchematicDiagram: 'spinal_cord',
  },
];

export const MODE_B_DEMO_STORIES: ClinicalDemoStory[] = [
  {
    id: 'demo-b-calves',
    mode: 'rehab',
    shortLabel: 'Calves / Soleus',
    title: 'Calves & Antigravity Venous Pump',
    primaryKey: 'calf_l',
    accentKeys: ['calf_l', 'calf_r'],
    preferredView: 'back',
    recommendedPreset: 'muscular_body',
    storySummary:
      'Zooms posteriorly onto the gastrocnemius-soleus calf complex responsible for upright balance and venous return.',
    whyItMatters:
      'The soleus suffers the steepest 0.0g fiber atrophy and requires progressive seated-to-aquatic-to-overground loading after landing.',
  },
  {
    id: 'demo-b-thighs',
    mode: 'rehab',
    shortLabel: 'Quads & Hamstrings',
    title: 'Quadriceps & Posterior Thigh Chain',
    primaryKey: 'quadriceps_l',
    accentKeys: ['quadriceps_l', 'quadriceps_r', 'hamstrings_l', 'hamstrings_r'],
    preferredView: 'front',
    recommendedPreset: 'muscular_body',
    storySummary:
      'Frames the anterior quadriceps and posterior hamstrings across both thighs during 1.0g gait restoration.',
    whyItMatters:
      'Restoring eccentric knee and hip torque prevents landing-week knee buckling and enables safe trap-bar and ergometer progression.',
  },
  {
    id: 'demo-b-core',
    mode: 'rehab',
    shortLabel: 'Core & Diaphragm',
    title: 'Abdominal Canister & Breathing Brace',
    primaryKey: 'abdominal_muscles',
    accentKeys: ['abdominal_muscles', 'diaphragm'],
    preferredView: 'front',
    recommendedPreset: 'muscular_body',
    storySummary:
      'Focuses on the anterolateral abdominal wall and diaphragm that generate stabilizing intra-abdominal pressure.',
    whyItMatters:
      'Deep core activation stabilizes hydrated post-flight lumbar discs and supports venous return during upright standing.',
  },
  {
    id: 'demo-b-spine',
    mode: 'rehab',
    shortLabel: 'Spine & Back',
    title: 'Vertebral Column & Paraspinal Muscles',
    primaryKey: 'back_muscles_l',
    accentKeys: ['back_muscles_l', 'back_muscles_r', 'spine_lumbar', 'spine_thoracic'],
    preferredView: 'back',
    recommendedPreset: 'muscular_body',
    storySummary:
      'Inspects the posterior thoracolumbar back musculature protecting the lumbar and thoracic spine.',
    whyItMatters:
      'Post-flight disc super-hydration plus multifidus atrophy elevates lumbar herniation risk across Days R+0 to R+21.',
  },
  {
    id: 'demo-b-femur',
    mode: 'rehab',
    shortLabel: 'Pelvis & Femur BMD',
    title: 'Pelvic Ring & Femoral Load-Bearing Bones',
    primaryKey: 'femur_l',
    accentKeys: ['femur_l', 'femur_r', 'pelvis'],
    preferredView: 'front',
    recommendedPreset: 'clinical_cutaway',
    storySummary:
      'Highlights the pelvis and bilateral femora under ghosted soft tissue to track trabecular/cortical bone recovery.',
    whyItMatters:
      'Femoral neck BMD drops ~1.0–1.5% per flight month, requiring aquatic buoyancy offloading before high-impact Phase 3 osteogenic loads.',
  },
  {
    id: 'demo-b-vestibular',
    mode: 'rehab',
    shortLabel: 'Vestibular CNS',
    title: 'Cerebellum, Brainstem & Cervical Balance',
    primaryKey: 'cerebellum',
    accentKeys: ['cerebellum', 'brainstem', 'spine_cervical'],
    preferredView: 'back',
    recommendedPreset: 'clinical_cutaway',
    storySummary:
      'Zooms to the posterior cranial fossa and upper neck with the skull ghosted to visualize balance coordination centers.',
    whyItMatters:
      'Recalibrates vestibulo-ocular reflex (VOR) gaze stability and postural sway during the transition back to 1.0g gravity.',
  },
];

export function getDemoStoriesForMode(mode: 'flight' | 'rehab'): ClinicalDemoStory[] {
  return mode === 'flight' ? MODE_A_DEMO_STORIES : MODE_B_DEMO_STORIES;
}

export interface CameraTargetSpec {
  position: [number, number, number];
  target: [number, number, number];
  regionLabel: string;
}

export const ATLAS_CAMERA_FOV = 34;

/**
 * Full-body anatomical preset viewpoints calibrated against verified male (1.719m)
 * and female (1.620m) GLB bounds so the adult human occupies ~84–86% of canvas height.
 */
export function getFullBodyCameraVectors(
  view: AtlasCameraView,
  sex: AtlasSex
): CameraTargetSpec {
  const targetY = sex === 'female' ? 0.82 : 0.87;
  const dist = sex === 'female' ? 2.96 : 3.14;

  switch (view) {
    case 'back':
      return {
        position: [0, targetY + 0.03, -dist],
        target: [0, targetY, 0],
        regionLabel: 'Full Body · Posterior',
      };
    case 'left':
      return {
        position: [dist, targetY + 0.03, 0],
        target: [0, targetY, 0],
        regionLabel: 'Full Body · Left Lateral',
      };
    case 'right':
      return {
        position: [-dist, targetY + 0.03, 0],
        target: [0, targetY, 0],
        regionLabel: 'Full Body · Right Lateral',
      };
    case 'top':
      return {
        position: [0, targetY + 2.35, 0.14],
        target: [0, targetY + 0.35, 0],
        regionLabel: 'Full Body · Superior',
      };
    case 'bottom':
      return {
        position: [0, targetY - 2.25, 0.22],
        target: [0, targetY - 0.25, 0],
        regionLabel: 'Full Body · Inferior',
      };
    case 'reset':
      return {
        position: [0.58, targetY + 0.12, dist - 0.12],
        target: [0, targetY, 0],
        regionLabel: 'Full Body · 3/4 Clinical Atlas',
      };
    case 'front':
    default:
      return {
        position: [0.16, targetY + 0.04, dist],
        target: [0, targetY, 0],
        regionLabel: 'Full Body · Anterior',
      };
  }
}

function rotateViewDirection(
  baseOffset: [number, number, number],
  view: AtlasCameraView
): [number, number, number] {
  const dist = Math.hypot(baseOffset[0], baseOffset[1], baseOffset[2]) || 1;
  switch (view) {
    case 'back':
      return [baseOffset[0] * 0.45, baseOffset[1], -Math.abs(baseOffset[2])];
    case 'left':
      return [dist * 0.94, baseOffset[1], dist * 0.18];
    case 'right':
      return [-dist * 0.94, baseOffset[1], dist * 0.18];
    case 'top':
      return [0, dist * 0.96, 0.14];
    case 'bottom':
      return [0, -dist * 0.92, 0.2];
    case 'reset':
      return [baseOffset[0] + dist * 0.22, baseOffset[1] + 0.04, baseOffset[2]];
    case 'front':
    default:
      return baseOffset;
  }
}

interface RegionFrameRule {
  regionLabel: string;
  maleTarget: [number, number, number];
  femaleTarget: [number, number, number];
  defaultOffset: [number, number, number];
  defaultView?: AtlasCameraView;
}

const REGION_FRAME_RULES: Array<{
  match: (key: string) => boolean;
  rule: RegionFrameRule;
}> = [
  {
    match: (k) => k === 'eye_l' || k === 'eye_r' || k === 'cranial_nerves',
    rule: {
      regionLabel: 'Orbits & Optic Nerves (SANS)',
      maleTarget: [0.01, 1.592, 0.04],
      femaleTarget: [0.005, 1.515, 0.05],
      defaultOffset: [0.13, 0.02, 0.44],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k === 'brain' || k === 'pituitary' || k === 'skull' || k === 'mandible' || k === 'arteries_head' || k === 'veins_head',
    rule: {
      regionLabel: 'Cranial Vault & Brain',
      maleTarget: [0, 1.61, -0.01],
      femaleTarget: [0, 1.535, 0.0],
      defaultOffset: [0.28, 0.06, 0.46],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k === 'cerebellum' || k === 'brainstem',
    rule: {
      regionLabel: 'Posterior Fossa & Vestibular CNS',
      maleTarget: [0, 1.575, -0.04],
      femaleTarget: [0, 1.495, -0.03],
      defaultOffset: [0.22, 0.02, -0.46],
      defaultView: 'back',
    },
  },
  {
    match: (k) => k === 'veins_thorax' || k === 'carotid_l' || k === 'carotid_r' || k === 'larynx' || k === 'pharynx',
    rule: {
      regionLabel: 'Cervical & Thoracic Outlet (IJV Window)',
      maleTarget: [0, 1.435, 0.01],
      femaleTarget: [0, 1.355, 0.015],
      defaultOffset: [0.16, 0.03, 0.56],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k === 'spinal_cord' || k === 'spine_cervical' || k.startsWith('neck_muscles'),
    rule: {
      regionLabel: 'Cervical Spine & Upper Cord',
      maleTarget: [0, 1.505, -0.035],
      femaleTarget: [0, 1.425, -0.03],
      defaultOffset: [0.22, 0.02, -0.56],
      defaultView: 'back',
    },
  },
  {
    match: (k) =>
      k === 'heart' ||
      k === 'coronary_arteries' ||
      k === 'aorta' ||
      k === 'vena_cava_superior' ||
      k === 'vena_cava_inferior' ||
      k === 'pulmonary_vessels' ||
      k === 'thymus',
    rule: {
      regionLabel: 'Heart & Mediastinal Great Vessels',
      maleTarget: [0.01, 1.27, 0.01],
      femaleTarget: [0.01, 1.195, 0.01],
      defaultOffset: [0.18, 0.04, 0.78],
      defaultView: 'front',
    },
  },
  {
    match: (k) =>
      k === 'lung_l' ||
      k === 'lung_r' ||
      k === 'trachea' ||
      k === 'bronchi' ||
      k === 'diaphragm' ||
      k === 'esophagus',
    rule: {
      regionLabel: 'Thoracic Respiratory & Diaphragm',
      maleTarget: [0, 1.28, 0],
      femaleTarget: [0, 1.205, 0],
      defaultOffset: [0.18, 0.04, 0.9],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k.startsWith('ribs') || k === 'sternum' || k.startsWith('chest_muscles') || k.startsWith('intercostals'),
    rule: {
      regionLabel: 'Thoracic Cage',
      maleTarget: [0, 1.27, 0.01],
      femaleTarget: [0, 1.19, 0.01],
      defaultOffset: [0.24, 0.05, 1.05],
      defaultView: 'front',
    },
  },
  {
    match: (k) =>
      k === 'spine_thoracic' ||
      k === 'spine_lumbar' ||
      k.startsWith('back_muscles') ||
      k.startsWith('trapezius') ||
      k.startsWith('scapula'),
    rule: {
      regionLabel: 'Thoracolumbar Spine & Back Extensors',
      maleTarget: [0, 1.18, -0.05],
      femaleTarget: [0, 1.11, -0.045],
      defaultOffset: [0.22, 0.05, -0.98],
      defaultView: 'back',
    },
  },
  {
    match: (k) =>
      k === 'abdominal_muscles' ||
      k === 'liver' ||
      k === 'stomach' ||
      k === 'pancreas' ||
      k === 'spleen' ||
      k.startsWith('kidney') ||
      k.startsWith('adrenal') ||
      k === 'gallbladder' ||
      k === 'small_intestine' ||
      k === 'colon' ||
      k === 'appendix' ||
      k === 'arteries_abdomen' ||
      k === 'veins_abdomen',
    rule: {
      regionLabel: 'Abdominal & Core Region',
      maleTarget: [0, 1.03, 0.015],
      femaleTarget: [0, 0.97, 0.015],
      defaultOffset: [0.18, 0.04, 0.94],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k === 'pelvis' || k === 'bladder' || k === 'pelvic_floor' || k.startsWith('gluteal') || k.startsWith('iliopsoas') || k.includes('pelvis'),
    rule: {
      regionLabel: 'Pelvic Ring & Hip Girdle',
      maleTarget: [0, 0.91, -0.01],
      femaleTarget: [0, 0.86, -0.01],
      defaultOffset: [0.2, 0.04, 0.92],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k.startsWith('hamstrings'),
    rule: {
      regionLabel: 'Posterior Thigh (Hamstrings)',
      maleTarget: [0, 0.64, -0.02],
      femaleTarget: [0, 0.60, -0.02],
      defaultOffset: [0.18, 0.04, -1.04],
      defaultView: 'back',
    },
  },
  {
    match: (k) => k.startsWith('femur') || k.startsWith('quadriceps') || k.startsWith('adductors') || k.startsWith('patella'),
    rule: {
      regionLabel: 'Anterior Thigh & Femoral Shaft',
      maleTarget: [0, 0.66, 0.01],
      femaleTarget: [0, 0.62, 0.01],
      defaultOffset: [0.18, 0.04, 1.04],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k.startsWith('calf'),
    rule: {
      regionLabel: 'Posterior Lower Leg (Calves)',
      maleTarget: [0, 0.29, -0.02],
      femaleTarget: [0, 0.27, -0.02],
      defaultOffset: [0.18, 0.03, -0.88],
      defaultView: 'back',
    },
  },
  {
    match: (k) => k.startsWith('shin_muscles') || k.startsWith('lower_leg') || k.startsWith('foot'),
    rule: {
      regionLabel: 'Lower Leg & Ankle',
      maleTarget: [0, 0.28, 0.01],
      femaleTarget: [0, 0.26, 0.01],
      defaultOffset: [0.18, 0.03, 0.88],
      defaultView: 'front',
    },
  },
  {
    match: (k) => k.startsWith('deltoid') || k.startsWith('rotator_cuff') || k.startsWith('clavicle') || k.startsWith('humerus') || k.startsWith('forearm') || k.startsWith('hand'),
    rule: {
      regionLabel: 'Shoulder & Upper Limb',
      maleTarget: [0, 1.24, 0],
      femaleTarget: [0, 1.17, 0],
      defaultOffset: [0.22, 0.05, 1.22],
      defaultView: 'front',
    },
  },
];

export function getAtlasCameraTarget(
  view: AtlasCameraView,
  sex: AtlasSex,
  selectedKey: string,
  focusRegion: boolean
): CameraTargetSpec {
  if (!focusRegion) {
    return getFullBodyCameraVectors(view, sex);
  }

  const matched = REGION_FRAME_RULES.find((item) => item.match(selectedKey));
  if (!matched) {
    return getFullBodyCameraVectors(view, sex);
  }

  const { rule } = matched;
  const target = sex === 'female' ? rule.femaleTarget : rule.maleTarget;
  const effectiveView = view === 'reset' ? (rule.defaultView ?? 'front') : view;
  const offset = rotateViewDirection(rule.defaultOffset, effectiveView);

  return {
    target: [target[0], target[1], target[2]],
    position: [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]],
    regionLabel: `Focused · ${rule.regionLabel}`,
  };
}

/**
 * Returns a gentle transparency override (0..1) for bony/muscular layers that
 * directly occlude an actively inspected deep organ (e.g. skull over brain/optic
 * nerves; sternum/ribs over heart/lungs), keeping human silhouette clear.
 */
export function getContextOcclusionOpacity(
  meshKey: string,
  selectedKey: string,
  accentKeys: string[],
  isolateSelected: boolean
): number | null {
  if (isolateSelected) return null;

  const activeSet = new Set([selectedKey, ...accentKeys]);

  const cranialTargets = ['brain', 'cerebellum', 'brainstem', 'pituitary', 'eye_l', 'eye_r', 'cranial_nerves', 'arteries_head', 'veins_head'];
  if (cranialTargets.some((k) => activeSet.has(k))) {
    if (meshKey === 'skull') return 0.14;
    if (meshKey === 'mandible' && (activeSet.has('cranial_nerves') || activeSet.has('brainstem'))) {
      return 0.25;
    }
  }

  const cervicalTargets = ['veins_thorax', 'carotid_l', 'carotid_r', 'trachea', 'larynx', 'pharynx'];
  if (cervicalTargets.some((k) => activeSet.has(k))) {
    if (meshKey.startsWith('neck_muscles')) return 0;
    if (meshKey === 'sternum') return 0;
  }

  const thoracicTargets = [
    'heart',
    'coronary_arteries',
    'aorta',
    'vena_cava_superior',
    'vena_cava_inferior',
    'pulmonary_vessels',
    'lung_l',
    'lung_r',
    'bronchi',
    'diaphragm',
    'thymus',
    'esophagus',
  ];
  if (thoracicTargets.some((k) => activeSet.has(k))) {
    if (meshKey === 'sternum') return 0;
    if (meshKey.startsWith('chest_muscles') || meshKey.startsWith('intercostals')) return 0;
  }

  const abdominalTargets = [
    'liver',
    'stomach',
    'pancreas',
    'spleen',
    'kidney_l',
    'kidney_r',
    'gallbladder',
    'small_intestine',
    'colon',
    'arteries_abdomen',
    'veins_abdomen',
  ];
  if (abdominalTargets.some((k) => activeSet.has(k))) {
    if (meshKey === 'abdominal_muscles') return 0.16;
  }

  const spinalCordTargets = ['spinal_cord', 'spine_thoracic', 'spine_lumbar', 'spine_cervical'];
  if (spinalCordTargets.some((k) => activeSet.has(k))) {
    if (meshKey.startsWith('back_muscles') || meshKey.startsWith('trapezius')) return 0.18;
    if (meshKey === 'skull' && activeSet.has('spinal_cord')) return 0.2;
  }

  if (activeSet.has('femur_l') || activeSet.has('femur_r') || activeSet.has('pelvis')) {
    if (meshKey.startsWith('quadriceps') || meshKey.startsWith('hamstrings') || meshKey.startsWith('gluteal') || meshKey.startsWith('adductors')) {
      return 0.18;
    }
  }

  return null;
}

/**
 * Only the actively selected structure (and explicit demonstration partner meshes)
 * should receive selective highlight treatment — never an entire body system at once.
 */
export function resolveMeshHighlightRole(
  meshKey: string,
  selectedKey: string,
  hoveredKey: string | null,
  demoAccentKeys: string[]
): 'selected' | 'accent' | 'hovered' | 'none' {
  if (meshKey === selectedKey) return 'selected';
  if (meshKey === hoveredKey) return 'hovered';
  if (demoAccentKeys.includes(meshKey)) return 'accent';
  return 'none';
}
