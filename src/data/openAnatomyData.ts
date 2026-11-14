import catalogRaw from './openAnatomyCatalog.json';
import type {
  AtlasSex,
  AtlasSystemFilter,
  ModeAAnatomicalRegionId,
  ModeBRecoveryRegionId,
  OpenAnatomyCatalogEntry,
  AtlasStructureDetails,
  SubsystemKey,
} from '../types/astral';

export const OPEN_ANATOMY_ATTRIBUTION =
  'Anatomy: BodyParts3D © The Database Center for Life Science (CC BY 4.0); ' +
  'female organs: Human Reference Atlas 3D Reference Organs, HuBMAP (CC BY 4.0); ' +
  'female body: MakeHuman (CC0). Modified by open-anatomy-3d ' +
  '(https://github.com/MervinR07/open-anatomy-3d), CC BY 4.0.';

export const OPEN_ANATOMY_MODEL_URLS: Record<AtlasSex, string> = {
  male: '/models/anatomy-male.glb',
  female: '/models/anatomy-female.glb',
};

export const ALL_ATLAS_CATALOG = catalogRaw as OpenAnatomyCatalogEntry[];

export const ATLAS_BY_KEY: Record<string, OpenAnatomyCatalogEntry> = Object.fromEntries(
  ALL_ATLAS_CATALOG.map((entry) => [entry.key, entry])
);

export const SYSTEM_FILTER_OPTIONS: Array<{
  id: AtlasSystemFilter;
  label: string;
  description: string;
}> = [
  { id: 'skin', label: 'Skin', description: 'Translucent outer cutaneous envelope' },
  { id: 'skeleton', label: 'Skeleton', description: 'Skull, spine, ribs, pelvis & limb bones' },
  { id: 'muscles', label: 'Muscles', description: 'Superficial & deep skeletal musculature' },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    description: 'Heart, aorta, vena cava, carotids & pulmonary vessels',
  },
  {
    id: 'respiratory',
    label: 'Respiratory',
    description: 'Trachea, lungs, main bronchi, larynx & diaphragm',
  },
  {
    id: 'nervous',
    label: 'Nervous',
    description: 'Brain, brainstem, cerebellum, spinal cord & cranial nerves',
  },
  {
    id: 'organs',
    label: 'Organs',
    description: 'Digestive, renal, endocrine, immune & sensory organs',
  },
  {
    id: 'vessels',
    label: 'Vessels',
    description: 'Systemic regional arteries & veins (head, thorax, abdomen, limbs)',
  },
];

export const DEFAULT_SYSTEM_VISIBILITY: Record<AtlasSystemFilter, boolean> = {
  skin: true,
  skeleton: true,
  muscles: false, // Off by default so internal organs, skeleton & vessels are immediately visible; toggleable anytime
  cardiovascular: true,
  respiratory: true,
  nervous: true,
  organs: true,
  vessels: true,
};

/**
 * Honest coverage summary against the requested anatomical checklist,
 * reflecting the exact meshes present in open-anatomy-3d (BodyParts3D / HRA).
 */
export const ASSET_COVERAGE_NOTES: Array<{
  system: string;
  presentSeparately: string;
  groupedInAsset: string;
  notInAsset: string;
}> = [
  {
    system: 'Skeletal System',
    presentSeparately:
      'Skull, mandible, cervical/thoracic/lumbar spine, ribs (L/R), sternum, pelvis & sacrum, clavicle (L/R), scapula (L/R), humerus (L/R), femur (L/R), patella (L/R), hands & feet (L/R).',
    groupedInAsset:
      'Radius & ulna are combined as Forearm Bones (forearm_l/r); tibia & fibula as Shin Bones (lower_leg_l/r).',
    notInAsset: 'Individual phalanges, carpals, and tarsals are merged into hand/foot meshes.',
  },
  {
    system: 'Muscular System',
    presentSeparately:
      'Deltoid, chest/pectoralis, trapezius, gluteal, quadriceps, hamstrings, rotator cuff, iliopsoas, adductors, intercostals, diaphragm (L/R).',
    groupedInAsset:
      'Latissimus dorsi, erector spinae & multifidus are grouped in Back Muscles (back_muscles_l/r); rectus abdominis & obliques in Abdominal Wall Muscles; gastrocnemius & soleus in Calf Muscles (calf_l/r); tibialis anterior in Shin Muscles (shin_muscles_l/r).',
    notInAsset: 'Individual deep spinal fascicles (separate multifidus vs erector spinae) are not isolated.',
  },
  {
    system: 'Cardiovascular & Vessels',
    presentSeparately:
      'Heart (whole organ), aorta, superior & inferior vena cava, pulmonary vessels, carotid arteries (L/R), coronary arteries, and regional limb/trunk arteries & veins.',
    groupedInAsset:
      'Cervical/thoracic venous return (including internal jugular territory) is grouped inside Veins — Thorax (veins_thorax).',
    notInAsset:
      'Separate internal jugular vein (IJV) mesh and internal cardiac chambers/valves are not split in this asset.',
  },
  {
    system: 'Respiratory System',
    presentSeparately: 'Larynx, pharynx, trachea, main bronchi, right & left lungs, diaphragm.',
    groupedInAsset: 'Distal lobar/segmental bronchi are grouped with bronchi and lung parenchyma.',
    notInAsset: 'Microscopic alveolar/bronchiolar trees are not modeled.',
  },
  {
    system: 'Nervous System',
    presentSeparately: 'Brain (cerebrum), brainstem, cerebellum, spinal cord, cranial & eye nerves.',
    groupedInAsset: 'Optic nerves are included inside Cranial & Eye Nerves (cranial_nerves).',
    notInAsset: 'Major peripheral limb nerves (brachial plexus, sciatic, femoral) are absent from this asset.',
  },
  {
    system: 'Other Visceral Organs',
    presentSeparately:
      'Liver, stomach, pancreas, spleen, kidneys (L/R), urinary bladder, small intestine, colon, eyes (L/R), esophagus, gallbladder, appendix, adrenals, thymus, pituitary.',
    groupedInAsset: 'Sex-specific organs match the selected Male or Female model.',
    notInAsset: 'None missing from the core visceral checklist.',
  },
];

const CARDIO_GREAT_VESSEL_KEYS = new Set([
  'heart',
  'coronary_arteries',
  'aorta',
  'vena_cava_superior',
  'vena_cava_inferior',
  'pulmonary_vessels',
  'carotid_l',
  'carotid_r',
]);

const RESPIRATORY_KEYS = new Set([
  'larynx',
  'pharynx',
  'trachea',
  'bronchi',
  'lung_l',
  'lung_r',
  'diaphragm',
]);

export function getStructureFilterBucket(
  entry: OpenAnatomyCatalogEntry
): AtlasSystemFilter | 'joints' {
  if (entry.system === 'joints') return 'joints';
  if (entry.system === 'skin') return 'skin';
  if (entry.system === 'skeleton') return 'skeleton';
  if (entry.system === 'nerves') return 'nervous';
  if (RESPIRATORY_KEYS.has(entry.key)) return 'respiratory';
  if (CARDIO_GREAT_VESSEL_KEYS.has(entry.key)) return 'cardiovascular';
  if (entry.system === 'vessels') return 'vessels';
  if (entry.system === 'muscles') return 'muscles';
  return 'organs';
}

export function isStructureVisibleInAtlas(
  entry: OpenAnatomyCatalogEntry,
  visibility: Record<AtlasSystemFilter, boolean>
): boolean {
  const bucket = getStructureFilterBucket(entry);
  if (bucket === 'joints') return false;
  return visibility[bucket];
}

export function getStructuresForSex(sex: AtlasSex): OpenAnatomyCatalogEntry[] {
  return ALL_ATLAS_CATALOG.filter(
    (item) => item.system !== 'joints' && (!item.sex || item.sex === sex)
  );
}

export function filterAtlasStructures(
  structures: OpenAnatomyCatalogEntry[],
  searchQuery: string,
  visibility: Record<AtlasSystemFilter, boolean>,
  showHiddenInSearch = true
): OpenAnatomyCatalogEntry[] {
  const q = searchQuery.trim().toLowerCase();
  return structures.filter((item) => {
    const matchesSearch =
      q.length === 0 ||
      item.label.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (q.length > 0 && showHiddenInSearch) return true;
    return isStructureVisibleInAtlas(item, visibility);
  });
}

interface CuratedMeta {
  latinName: string | null;
  anatomicalFunction: string;
  anatomicalLocation: string;
  relatedKeys: string[];
  spaceflightRelevance: string;
  groupedOrLimitationNote?: string;
  modeASubsystem?: SubsystemKey;
  modeARegionId?: ModeAAnatomicalRegionId;
  modeAFocusLabel?: string;
  modeBRegionId?: ModeBRecoveryRegionId;
  modeBFocusArea?: AtlasStructureDetails['modeBFocusArea'];
}

const CURATED_STRUCTURE_META: Record<string, CuratedMeta> = {
  heart: {
    latinName: 'Cor',
    anatomicalFunction:
      'Four-chambered muscular pump driving pulmonary and systemic blood circulation to maintain organ perfusion pressure.',
    anatomicalLocation: 'Middle mediastinum of the thoracic cavity, resting on the diaphragm.',
    relatedKeys: ['aorta', 'vena_cava_superior', 'vena_cava_inferior', 'pulmonary_vessels', 'coronary_arteries'],
    spaceflightRelevance:
      'Microgravity reduces plasma volume by 10–15% and cardiac workload if unmitigated, causing mild myocardial atrophy and post-flight orthostatic intolerance.',
    groupedOrLimitationNote:
      'Represented as a unified external heart mesh; internal chambers and valves are not split separately.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'heart_cardio',
    modeAFocusLabel: 'Cardiovascular Telemetry & Heart Rate',
    modeBFocusArea: 'Muscle Recovery',
  },
  aorta: {
    latinName: 'Aorta',
    anatomicalFunction:
      'Primary elastic systemic artery distributing oxygenated blood from the left ventricle to systemic branches.',
    anatomicalLocation: 'Ascends from the heart through the mediastinum and descends anterior to the thoracic and lumbar spine.',
    relatedKeys: ['heart', 'carotid_l', 'carotid_r', 'arteries_thorax', 'arteries_abdomen'],
    spaceflightRelevance:
      'Central arterial stiffness and baroreceptor unloading during spaceflight affect blood pressure regulation upon Earth re-entry.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'heart_cardio',
    modeAFocusLabel: 'Central Cardiovascular Perfusion',
  },
  vena_cava_superior: {
    latinName: 'Vena cava superior',
    anatomicalFunction:
      'Returns venous blood from the head, neck, upper limbs, and thorax into the right atrium.',
    anatomicalLocation: 'Superior mediastinum to the right of the ascending aorta.',
    relatedKeys: ['heart', 'veins_thorax', 'vena_cava_inferior'],
    spaceflightRelevance:
      'Receives elevated cephalad venous volume shifted headward in 0.0g microgravity.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'internal_jugular',
    modeAFocusLabel: 'Cephalad Venous Return & Stasis Monitoring',
  },
  vena_cava_inferior: {
    latinName: 'Vena cava inferior',
    anatomicalFunction:
      'Returns deoxygenated venous blood from the lower extremities, pelvis, and abdomen to the right atrium.',
    anatomicalLocation: 'Retroperitoneal abdomen, right of the abdominal aorta.',
    relatedKeys: ['heart', 'veins_abdomen', 'veins_pelvis', 'vena_cava_superior'],
    spaceflightRelevance:
      'Lower-body venous pooling shifts headward in microgravity and returns abruptly upon Earth landing (orthostatic hypotension risk).',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'heart_cardio',
    modeAFocusLabel: 'Venous Pooling & LBNP Response',
  },
  pulmonary_vessels: {
    latinName: 'Vasa pulmonalia',
    anatomicalFunction:
      'Pulmonary arteries and veins transporting blood between the heart and alveolar capillaries for gas exchange.',
    anatomicalLocation: 'Hilum of both lungs and superior mediastinum.',
    relatedKeys: ['heart', 'lung_l', 'lung_r', 'bronchi'],
    spaceflightRelevance:
      'Absence of hydrostatic gravity creates more uniform apical-to-basal pulmonary perfusion in microgravity.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'lungs_respiratory',
  },
  carotid_l: {
    latinName: 'Arteria carotis communis sinistra',
    anatomicalFunction: 'Major arterial supply to the left head, neck, eye, and cerebral circulation.',
    anatomicalLocation: 'Left anterior cervical region alongside the trachea and larynx.',
    relatedKeys: ['aorta', 'carotid_r', 'arteries_head', 'veins_thorax'],
    spaceflightRelevance:
      'Carotid baroreceptors remodel in microgravity, contributing to post-flight orthostatic intolerance; lies immediately medial to the IJV ultrasound scan window.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'internal_jugular',
    modeAFocusLabel: 'Cervical Vascular Window (Adjacent to IJV)',
  },
  carotid_r: {
    latinName: 'Arteria carotis communis dextra',
    anatomicalFunction: 'Major arterial supply to the right head, neck, eye, and cerebral circulation.',
    anatomicalLocation: 'Right anterior cervical region alongside the trachea and larynx.',
    relatedKeys: ['aorta', 'carotid_l', 'arteries_head', 'veins_thorax'],
    spaceflightRelevance:
      'Used as an anatomical landmark beside the right internal jugular vein during Butterfly iQ+ cervical ultrasound.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'internal_jugular',
    modeAFocusLabel: 'Cervical Vascular Window (Adjacent to IJV)',
  },
  veins_thorax: {
    latinName: 'Venae thoracicae (incl. cervical venous drainage)',
    anatomicalFunction:
      'Drains venous blood from the thoracic wall, mediastinum, and upper neck/cervical venous confluence into the brachiocephalic veins.',
    anatomicalLocation: 'Superior thorax and lower cervical root.',
    relatedKeys: ['vena_cava_superior', 'carotid_l', 'carotid_r', 'heart'],
    spaceflightRelevance:
      'Directly associated with ASTROCARE IJV / Cephalad Venous Stasis surveillance (NASA Medical Directive 44-A).',
    groupedOrLimitationNote:
      'Internal jugular veins (IJV) are not isolated as a standalone mesh in open-anatomy-3d; cervical venous drainage is grouped within thoracic/cervical veins.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'internal_jugular',
    modeAFocusLabel: 'IJV & Cephalad Venous Stasis Triage',
  },
  coronary_arteries: {
    latinName: 'Arteriae coronariae',
    anatomicalFunction: 'Supplies oxygenated blood directly to the myocardium.',
    anatomicalLocation: 'Epicardial grooves on the surface of the heart.',
    relatedKeys: ['heart', 'aorta'],
    spaceflightRelevance: 'Monitored alongside resting heart rate and cosmic radiation cardiovascular risk.',
    modeASubsystem: 'cardiovascular',
    modeARegionId: 'heart_cardio',
  },
  eye_l: {
    latinName: 'Oculus sinister',
    anatomicalFunction: 'Left sensory organ of vision converting optical images into retinal neural signals.',
    anatomicalLocation: 'Left bony orbit of the skull.',
    relatedKeys: ['eye_r', 'cranial_nerves', 'brain', 'skull'],
    spaceflightRelevance:
      'Primary site of Spaceflight-Associated Neuro-ocular Syndrome (SANS): posterior globe flattening, choroidal folds, and hyperopic refractive shift.',
    modeASubsystem: 'ocular_sans',
    modeARegionId: 'eyes_optic',
    modeAFocusLabel: 'SANS Ocular & ONSD Ultrasound',
    modeBFocusArea: 'Balance & Vestibular Rehabilitation',
  },
  eye_r: {
    latinName: 'Oculus dexter',
    anatomicalFunction: 'Right sensory organ of vision converting optical images into retinal neural signals.',
    anatomicalLocation: 'Right bony orbit of the skull.',
    relatedKeys: ['eye_l', 'cranial_nerves', 'brain', 'skull'],
    spaceflightRelevance:
      'Primary site of SANS transorbital ONSD ultrasound and visual acuity monitoring.',
    modeASubsystem: 'ocular_sans',
    modeARegionId: 'eyes_optic',
    modeAFocusLabel: 'SANS Ocular & ONSD Ultrasound',
    modeBFocusArea: 'Balance & Vestibular Rehabilitation',
  },
  cranial_nerves: {
    latinName: 'Nervi craniales (incl. Nervus opticus)',
    anatomicalFunction:
      'Twelve pairs of nerves emerging from the brain and brainstem, including the optic nerves (CN II) mediating vision.',
    anatomicalLocation: 'Anterior & middle cranial base exiting through cranial foramina toward orbits and face.',
    relatedKeys: ['eye_l', 'eye_r', 'brain', 'brainstem'],
    spaceflightRelevance:
      'Optic nerve sheath diameter (ONSD) distention and papilledema are hallmark indicators of elevated intracranial/perioptic fluid pressure in SANS.',
    groupedOrLimitationNote:
      'Optic nerves are grouped inside Cranial & Eye Nerves (cranial_nerves); peripheral limb nerves are not included in this asset.',
    modeASubsystem: 'ocular_sans',
    modeARegionId: 'eyes_optic',
    modeAFocusLabel: 'Optic Nerve Sheath (SANS) Monitoring',
    modeBFocusArea: 'Balance & Vestibular Rehabilitation',
  },
  brain: {
    latinName: 'Cerebrum',
    anatomicalFunction:
      'Integrates sensory perception, executive cognition, circadian arousal, and voluntary motor planning.',
    anatomicalLocation: 'Cranial cavity encased by the skull and cerebrospinal fluid.',
    relatedKeys: ['brainstem', 'cerebellum', 'cranial_nerves', 'skull'],
    spaceflightRelevance:
      'Upward brain shift in microgravity, circadian disruption (16 sunrises/day), and elevated cabin CO2 impair psychomotor vigilance and sleep quality.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'brain_nervous',
    modeAFocusLabel: 'Sleep, PVT Vigilance & Cabin CO2',
    modeBFocusArea: 'Balance & Vestibular Rehabilitation',
  },
  cerebellum: {
    latinName: 'Cerebellum',
    anatomicalFunction:
      'Coordinates posture, gait smoothness, motor learning, and vestibulo-ocular balance adaptation.',
    anatomicalLocation: 'Posterior cranial fossa inferior to the occipital lobes.',
    relatedKeys: ['brain', 'brainstem', 'spinal_cord'],
    spaceflightRelevance:
      'Crucial for post-flight sensorimotor re-adaptation when transitioning from 0.0g back to 1.0g Earth gravity (VOR gaze stabilization & sway recovery).',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'brain_nervous',
    modeBFocusArea: 'Balance & Vestibular Rehabilitation',
  },
  brainstem: {
    latinName: 'Truncus encephali',
    anatomicalFunction:
      'Autonomic control center for respiration, heart rate, blood pressure baroreflexes, and vestibular nuclei.',
    anatomicalLocation: 'Base of the brain continuous inferiorly with the spinal cord.',
    relatedKeys: ['brain', 'cerebellum', 'spinal_cord', 'cranial_nerves'],
    spaceflightRelevance:
      'Mediates autonomic baroreflex blunting and vestibular-autonomic dizziness during early post-flight re-adaptation.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'brain_nervous',
    modeBFocusArea: 'Balance & Vestibular Rehabilitation',
  },
  spinal_cord: {
    latinName: 'Medulla spinalis',
    anatomicalFunction: 'Conducts ascending sensory and descending motor pathways between brain and body.',
    anatomicalLocation: 'Vertebral canal from foramen magnum to L1–L2 vertebral level.',
    relatedKeys: ['brainstem', 'spine_cervical', 'spine_thoracic', 'spine_lumbar'],
    spaceflightRelevance:
      'Spinal elongation (up to 5 cm) in microgravity stretches paraspinal and neural tissues, contributing to back pain.',
    groupedOrLimitationNote:
      'The standalone spinal_cord mesh in open-anatomy-3d models the upper cervical segment below the brainstem; the lower thoracic and lumbar cord courses within the vertebral canal meshes.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'spine',
    modeBFocusArea: 'Spine & Posture Recovery',
  },
  trachea: {
    latinName: 'Trachea',
    anatomicalFunction: 'Cartilaginous airway conducting inspired air from the larynx to the main bronchi.',
    anatomicalLocation: 'Anterior neck and superior mediastinum anterior to the esophagus.',
    relatedKeys: ['larynx', 'bronchi', 'lung_l', 'lung_r'],
    spaceflightRelevance:
      'Conducts cabin atmosphere (monitored for CO2 partial pressure and dust/particulate exposure in lunar/Mars habitats).',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'lungs_respiratory',
  },
  bronchi: {
    latinName: 'Bronchi principales',
    anatomicalFunction: 'Left and right primary airway branches delivering air into each lung.',
    anatomicalLocation: 'Bifurcates at the carina (T4–T5) entering the pulmonary hila.',
    relatedKeys: ['trachea', 'lung_l', 'lung_r', 'pulmonary_vessels'],
    spaceflightRelevance: 'Inhaled aerosol/lunar dust clearance changes without gravity-assisted sedimentation.',
    groupedOrLimitationNote: 'Main bronchi are modeled; fine subsegmental bronchial branches are grouped within the lungs.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'lungs_respiratory',
  },
  lung_l: {
    latinName: 'Pulmo sinister',
    anatomicalFunction: 'Left respiratory organ mediating alveolar O2 uptake and CO2 elimination.',
    anatomicalLocation: 'Left pleural cavity within the thoracic ribcage.',
    relatedKeys: ['lung_r', 'trachea', 'bronchi', 'diaphragm', 'ribs_l'],
    spaceflightRelevance:
      'Microgravity alters ventilation-perfusion gradients and makes crew sensitive to elevated spacecraft CO2 (>3.5 mmHg).',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'lungs_respiratory',
    modeAFocusLabel: 'Cabin CO2 & Respiratory Status',
  },
  lung_r: {
    latinName: 'Pulmo dexter',
    anatomicalFunction: 'Right respiratory organ mediating alveolar O2 uptake and CO2 elimination.',
    anatomicalLocation: 'Right pleural cavity within the thoracic ribcage.',
    relatedKeys: ['lung_l', 'trachea', 'bronchi', 'diaphragm', 'ribs_r'],
    spaceflightRelevance:
      'Ventilation uniformity increases in 0.0g; CO2 retention drives headache and cognitive lapses.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'lungs_respiratory',
    modeAFocusLabel: 'Cabin CO2 & Respiratory Status',
  },
  diaphragm: {
    latinName: 'Diaphragma',
    anatomicalFunction: 'Primary dome-shaped skeletal muscle of inspiration separating thorax and abdomen.',
    anatomicalLocation: 'Inferior thoracic aperture above liver, stomach, and spleen.',
    relatedKeys: ['lung_l', 'lung_r', 'ribs_l', 'ribs_r', 'abdominal_muscles'],
    spaceflightRelevance:
      'Shifts superiorly in microgravity due to reduced abdominal hydrostatic pressure; core breathing stabilization aids post-flight orthostatic recovery.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'lungs_respiratory',
    modeBFocusArea: 'Core Stability',
  },
  skull: {
    latinName: 'Cranium',
    anatomicalFunction: 'Rigid bony vault protecting the brain, brainstem, cerebellum, and special sense organs.',
    anatomicalLocation: 'Superior axial skeleton.',
    relatedKeys: ['mandible', 'brain', 'eye_l', 'eye_r', 'spine_cervical'],
    spaceflightRelevance: 'Encases shifting CSF spaces and retrobulbar optic structures monitored in SANS.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'bones_skeletal',
  },
  spine_cervical: {
    latinName: 'Vertebrae cervicales (C1–C7)',
    anatomicalFunction: 'Supports head mass and provides multi-axial cervical mobility while housing the cervical spinal cord.',
    anatomicalLocation: 'Neck between skull base and T1 vertebra.',
    relatedKeys: ['skull', 'spine_thoracic', 'neck_muscles_l', 'neck_muscles_r', 'spinal_cord'],
    spaceflightRelevance:
      'Head-mounted EVA gear and post-flight return to 1.0g place high demand on deconditioned cervical extensors.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'spine',
    modeBRegionId: 'cervical_extensors',
    modeBFocusArea: 'Spine & Posture Recovery',
  },
  spine_thoracic: {
    latinName: 'Vertebrae thoracicae (T1–T12)',
    anatomicalFunction: 'Articulates with all 12 pairs of ribs to form the protective thoracic cage.',
    anatomicalLocation: 'Upper and middle posterior trunk.',
    relatedKeys: ['spine_cervical', 'spine_lumbar', 'ribs_l', 'ribs_r', 'spinal_cord'],
    spaceflightRelevance:
      'Intervertebral disc swelling in microgravity flattens spinal curves and causes spaceflight-associated backache.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'spine',
    modeBRegionId: 'spine_b',
    modeBFocusArea: 'Spine & Posture Recovery',
  },
  spine_lumbar: {
    latinName: 'Vertebrae lumbales (L1–L5)',
    anatomicalFunction: 'Largest load-bearing vertebrae transmitting upper-body weight to the pelvis and sacrum.',
    anatomicalLocation: 'Lower back between thoracic cage and pelvis.',
    relatedKeys: ['spine_thoracic', 'pelvis', 'back_muscles_l', 'back_muscles_r', 'spinal_cord'],
    spaceflightRelevance:
      'High risk of disc herniation upon rapid return to 1.0g axial loading; ARED squats & deadlifts target lumbar osteocyte strain.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'spine',
    modeBRegionId: 'spine_b',
    modeBFocusArea: 'Spine & Posture Recovery',
  },
  pelvis: {
    latinName: 'Pelvis et Os sacrum',
    anatomicalFunction: 'Bony ring transferring axial spinal loads bilaterally to the femora and protecting pelvic viscera.',
    anatomicalLocation: 'Inferior trunk connecting lumbar spine to hip joints.',
    relatedKeys: ['spine_lumbar', 'femur_l', 'femur_r', 'gluteal_l', 'gluteal_r'],
    spaceflightRelevance:
      'Pelvic and sacral trabecular bone experiences rapid demineralization (~1.0–1.5%/month) without axial weight-bearing.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'bones_skeletal',
    modeBRegionId: 'femoral_bones',
    modeBFocusArea: 'Bone Recovery',
  },
  femur_l: {
    latinName: 'Os femoris sinistrum',
    anatomicalFunction: 'Longest and strongest load-bearing bone transferring body weight across hip and knee.',
    anatomicalLocation: 'Left thigh from acetabulum to knee joint.',
    relatedKeys: ['pelvis', 'lower_leg_l', 'patella_l', 'quadriceps_l', 'hamstrings_l'],
    spaceflightRelevance:
      'Femoral neck BMD drops ~1.0–1.5%/month in microgravity; tracked in ASTROCARE Handover & Mode B Bone Recovery.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'bones_skeletal',
    modeBRegionId: 'femoral_bones',
    modeBFocusArea: 'Bone Recovery',
  },
  femur_r: {
    latinName: 'Os femoris dextrum',
    anatomicalFunction: 'Longest and strongest load-bearing bone transferring body weight across hip and knee.',
    anatomicalLocation: 'Right thigh from acetabulum to knee joint.',
    relatedKeys: ['pelvis', 'lower_leg_r', 'patella_r', 'quadriceps_r', 'hamstrings_r'],
    spaceflightRelevance:
      'Femoral neck BMD loss drives fracture vulnerability during early Phase 1–2 Earth reconditioning.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'bones_skeletal',
    modeBRegionId: 'femoral_bones',
    modeBFocusArea: 'Bone Recovery',
  },
  calf_l: {
    latinName: 'Musculus triceps surae sinister (Gastrocnemius & Soleus)',
    anatomicalFunction:
      'Plantarflexes the ankle for standing balance, walking propulsion, and venous calf-pump return.',
    anatomicalLocation: 'Left posterior lower leg.',
    relatedKeys: ['lower_leg_l', 'foot_l', 'hamstrings_l', 'shin_muscles_l'],
    spaceflightRelevance:
      'Soleus experiences the fastest anti-gravity slow-twitch muscle atrophy in microgravity (up to 20–30% strength decline without ARED).',
    groupedOrLimitationNote:
      'Gastrocnemius and soleus are grouped together as Calf Muscles (calf_l) in open-anatomy-3d.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'calves_soleus',
    modeAFocusLabel: 'ARED Calf Loading & Atrophy Prevention',
    modeBRegionId: 'soleus',
    modeBFocusArea: 'Lower-Limb Strength',
  },
  calf_r: {
    latinName: 'Musculus triceps surae dexter (Gastrocnemius & Soleus)',
    anatomicalFunction:
      'Plantarflexes the ankle for standing balance, walking propulsion, and venous calf-pump return.',
    anatomicalLocation: 'Right posterior lower leg.',
    relatedKeys: ['lower_leg_r', 'foot_r', 'hamstrings_r', 'shin_muscles_r'],
    spaceflightRelevance:
      'Primary target for Mode B aquatic treadmill running and eccentric heel-drop reconditioning.',
    groupedOrLimitationNote:
      'Gastrocnemius and soleus are grouped together as Calf Muscles (calf_r) in open-anatomy-3d.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'calves_soleus',
    modeBRegionId: 'gastrocnemius',
    modeBFocusArea: 'Lower-Limb Strength',
  },
  quadriceps_l: {
    latinName: 'Musculus quadriceps femoris sinister',
    anatomicalFunction: 'Extends the knee and absorbs eccentric impact during walking, squats, and stairs.',
    anatomicalLocation: 'Left anterior thigh.',
    relatedKeys: ['femur_l', 'patella_l', 'hamstrings_l'],
    spaceflightRelevance:
      'ARED squats maintain quadriceps cross-sectional area; deconditioning destabilizes early 1.0g stance.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'muscles',
    modeBRegionId: 'quadriceps',
    modeBFocusArea: 'Lower-Limb Strength',
  },
  quadriceps_r: {
    latinName: 'Musculus quadriceps femoris dexter',
    anatomicalFunction: 'Extends the knee and absorbs eccentric impact during walking, squats, and stairs.',
    anatomicalLocation: 'Right anterior thigh.',
    relatedKeys: ['femur_r', 'patella_r', 'hamstrings_r'],
    spaceflightRelevance:
      'Tracked in Mode B Phase 2–3 eccentric leg strengthening.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'muscles',
    modeBRegionId: 'quadriceps',
    modeBFocusArea: 'Lower-Limb Strength',
  },
  hamstrings_l: {
    latinName: 'Musculi ischiocrurales sinistri',
    anatomicalFunction: 'Extends the hip and flexes the knee while stabilizing the pelvis during gait.',
    anatomicalLocation: 'Left posterior thigh.',
    relatedKeys: ['femur_l', 'gluteal_l', 'calf_l'],
    spaceflightRelevance: 'Restores posterior kinetic chain power via Mode B banded Romanian deadlifts.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'muscles',
    modeBRegionId: 'hamstrings',
    modeBFocusArea: 'Lower-Limb Strength',
  },
  hamstrings_r: {
    latinName: 'Musculi ischiocrurales dextri',
    anatomicalFunction: 'Extends the hip and flexes the knee while stabilizing the pelvis during gait.',
    anatomicalLocation: 'Right posterior thigh.',
    relatedKeys: ['femur_r', 'gluteal_r', 'calf_r'],
    spaceflightRelevance: 'Restores posterior kinetic chain power in Mode B APTP Phase 2–3.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'muscles',
    modeBRegionId: 'hamstrings',
    modeBFocusArea: 'Lower-Limb Strength',
  },
  back_muscles_l: {
    latinName: 'Musculi dorsi (Latissimus dorsi, Erector spinae, Multifidus)',
    anatomicalFunction:
      'Stabilizes vertebral segments, extends the spine against gravity, and transfers trunk-to-limb forces.',
    anatomicalLocation: 'Left posterior thoracolumbar trunk.',
    relatedKeys: ['spine_thoracic', 'spine_lumbar', 'trapezius_l', 'back_muscles_r'],
    spaceflightRelevance:
      'Deep lumbar stabilizers (multifidus & erector spinae) lose up to 15–20% cross-sectional tone in microgravity, raising post-flight disc injury risk.',
    groupedOrLimitationNote:
      'Latissimus dorsi, erector spinae, and multifidus are grouped inside Back Muscles (back_muscles_l) in open-anatomy-3d.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'spine',
    modeBRegionId: 'multifidus',
    modeBFocusArea: 'Spine & Posture Recovery',
  },
  back_muscles_r: {
    latinName: 'Musculi dorsi dextri (Latissimus dorsi, Erector spinae, Multifidus)',
    anatomicalFunction:
      'Stabilizes vertebral segments, extends the spine against gravity, and transfers trunk-to-limb forces.',
    anatomicalLocation: 'Right posterior thoracolumbar trunk.',
    relatedKeys: ['spine_thoracic', 'spine_lumbar', 'trapezius_r', 'back_muscles_l'],
    spaceflightRelevance:
      'Protected via Mode B supine multifidus co-contraction before upright spinal compression.',
    groupedOrLimitationNote:
      'Latissimus dorsi, erector spinae, and multifidus are grouped inside Back Muscles (back_muscles_r) in open-anatomy-3d.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'spine',
    modeBRegionId: 'erector_spinae',
    modeBFocusArea: 'Spine & Posture Recovery',
  },
  abdominal_muscles: {
    latinName: 'Musculi abdominis (Rectus abdominis, Obliquus externus/internus)',
    anatomicalFunction: 'Flexes and rotates the trunk, stabilizes intra-abdominal pressure, and braces the lumbar spine.',
    anatomicalLocation: 'Anterolateral abdominal wall between ribcage and pelvis.',
    relatedKeys: ['diaphragm', 'pelvis', 'back_muscles_l', 'back_muscles_r'],
    spaceflightRelevance:
      'Essential for Mode B core stabilization and venous return support during standing re-adaptation.',
    groupedOrLimitationNote:
      'Rectus abdominis and external/internal obliques are grouped as Abdominal Wall Muscles in open-anatomy-3d.',
    modeASubsystem: 'musculoskeletal',
    modeARegionId: 'muscles',
    modeBRegionId: 'core_stabilizers',
    modeBFocusArea: 'Core Stability',
  },
  liver: {
    latinName: 'Hepar',
    anatomicalFunction: 'Metabolic hub for glycogen storage, plasma protein synthesis, detoxification, and bile production.',
    anatomicalLocation: 'Right upper abdominal quadrant beneath the diaphragm.',
    relatedKeys: ['stomach', 'gallbladder', 'pancreas', 'vena_cava_inferior'],
    spaceflightRelevance:
      'Microgravity alters hepatic lipid metabolism, drug clearance kinetics, and splanchnic blood volume.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'digestive',
  },
  stomach: {
    latinName: 'Gaster',
    anatomicalFunction: 'Mixes ingested food with gastric acid and pepsin to initiate enzymatic digestion.',
    anatomicalLocation: 'Left upper abdominal quadrant between esophagus and duodenum.',
    relatedKeys: ['esophagus', 'liver', 'pancreas', 'spleen', 'small_intestine'],
    spaceflightRelevance:
      'Absent gravity reduces gastric fluid layering, slowing gastric emptying and altering motion sickness medication absorption.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'digestive',
  },
  pancreas: {
    latinName: 'Pancreas',
    anatomicalFunction: 'Exocrine digestive enzyme secretion and endocrine insulin/glucagon glycemic regulation.',
    anatomicalLocation: 'Retroperitoneal epigastrium posterior to the stomach.',
    relatedKeys: ['stomach', 'liver', 'spleen', 'small_intestine'],
    spaceflightRelevance:
      'Long-duration spaceflight induces mild insulin resistance modulated by exercise compliance.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'digestive',
  },
  spleen: {
    latinName: 'Splen',
    anatomicalFunction: 'Filters senescent red blood cells and mounts adaptive immune responses.',
    anatomicalLocation: 'Left upper abdominal quadrant beneath ribs 9–11.',
    relatedKeys: ['stomach', 'pancreas', 'kidney_l'],
    spaceflightRelevance:
      'Spaceflight hematologic adaptation (neocytolysis) reduces red blood cell mass by ~10–12% during initial microgravity days.',
  },
  kidney_l: {
    latinName: 'Ren sinister',
    anatomicalFunction: 'Filters blood plasma to regulate fluid volume, electrolytes, acid-base balance, and blood pressure.',
    anatomicalLocation: 'Left retroperitoneal lumbar region (T12–L3).',
    relatedKeys: ['kidney_r', 'ureter_l', 'bladder', 'adrenal_l'],
    spaceflightRelevance:
      'Bone calcium resorption in microgravity elevates urinary calcium and increases renal stone (nephrolithiasis) risk without ≥2.5 L/day hydration.',
  },
  kidney_r: {
    latinName: 'Ren dexter',
    anatomicalFunction: 'Filters blood plasma to regulate fluid volume, electrolytes, acid-base balance, and blood pressure.',
    anatomicalLocation: 'Right retroperitoneal lumbar region slightly lower than left kidney due to liver.',
    relatedKeys: ['kidney_l', 'ureter_r', 'bladder', 'adrenal_r'],
    spaceflightRelevance:
      'Monitored indirectly via hydration adherence and ARED bone resorption mitigation.',
  },
  bladder: {
    latinName: 'Vesica urinaria',
    anatomicalFunction: 'Distensible muscular reservoir storing urine until voluntary micturition.',
    anatomicalLocation: 'Anterior pelvic cavity posterior to the pubic symphysis.',
    relatedKeys: ['ureter_l', 'ureter_r', 'pelvis', 'pelvic_floor'],
    spaceflightRelevance:
      'Without hydrostatic gravity pressure on the bladder base, stretch-receptor fullness cues are blunted in microgravity.',
  },
  small_intestine: {
    latinName: 'Intestinum tenue',
    anatomicalFunction: 'Primary site of enzymatic macronutrient, micronutrient, vitamin D, and water absorption.',
    anatomicalLocation: 'Central and lower abdominal cavity framed by the colon.',
    relatedKeys: ['stomach', 'colon', 'pancreas', 'liver'],
    spaceflightRelevance:
      'Spaceflight shifts gut microbiome diversity and slows intestinal transit.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'digestive',
  },
  colon: {
    latinName: 'Intestinum crassum (Colon)',
    anatomicalFunction: 'Absorbs water and electrolytes and hosts fermentative gut microbiota.',
    anatomicalLocation: 'Frames the small intestine around the abdominal perimeter.',
    relatedKeys: ['small_intestine', 'appendix', 'stomach'],
    spaceflightRelevance:
      'Hydration shifts and reduced fiber intake can slow colonic motility in orbit.',
    modeASubsystem: 'mood_sleep',
    modeARegionId: 'digestive',
  },
};

const FALLBACK_LATIN_BY_KEY: Record<string, string> = {
  mandible: 'Mandibula',
  sternum: 'Sternum',
  clavicle_l: 'Clavicula sinistra',
  clavicle_r: 'Clavicula dextra',
  scapula_l: 'Scapula sinistra',
  scapula_r: 'Scapula dextra',
  ribs_l: 'Costae sinistrae',
  ribs_r: 'Costae dextrae',
  humerus_l: 'Humerus sinister',
  humerus_r: 'Humerus dexter',
  forearm_l: 'Radius et Ulna sinistrae',
  forearm_r: 'Radius et Ulna dextrae',
  patella_l: 'Patella sinistra',
  patella_r: 'Patella dextra',
  lower_leg_l: 'Tibia et Fibula sinistrae',
  lower_leg_r: 'Tibia et Fibula dextrae',
  hand_l: 'Manus sinistra (Ossa)',
  hand_r: 'Manus dextra (Ossa)',
  foot_l: 'Pes sinister (Ossa)',
  foot_r: 'Pes dexter (Ossa)',
  deltoid_l: 'Musculus deltoideus sinister',
  deltoid_r: 'Musculus deltoideus dexter',
  chest_muscles_l: 'Musculus pectoralis major sinister',
  chest_muscles_r: 'Musculus pectoralis major dexter',
  trapezius_l: 'Musculus trapezius sinister',
  trapezius_r: 'Musculus trapezius dexter',
  gluteal_l: 'Musculi glutei sinistri',
  gluteal_r: 'Musculi glutei dextri',
  shin_muscles_l: 'Musculi cruris anteriores sinistri',
  shin_muscles_r: 'Musculi cruris anteriores dextri',
  larynx: 'Larynx',
  pharynx: 'Pharynx',
  esophagus: 'Oesophagus',
  gallbladder: 'Vesica biliaris',
  appendix: 'Appendix vermiformis',
  thymus: 'Thymus',
  pituitary: 'Hypophysis',
  skin: 'Cutis (Integumentum commune)',
};

export function getAtlasStructureDetails(key: string): AtlasStructureDetails {
  const entry = ATLAS_BY_KEY[key] ?? ALL_ATLAS_CATALOG[0];
  const bucket = getStructureFilterBucket(entry);
  const curated = CURATED_STRUCTURE_META[entry.key];

  if (curated) {
    return {
      key: entry.key,
      label: entry.label,
      latinName: curated.latinName,
      assetSystem: entry.system,
      filterBucket: bucket,
      category: entry.category,
      color: entry.color,
      anatomicalFunction: curated.anatomicalFunction,
      anatomicalLocation: curated.anatomicalLocation,
      relatedKeys: curated.relatedKeys,
      spaceflightRelevance: curated.spaceflightRelevance,
      groupedOrLimitationNote: curated.groupedOrLimitationNote,
      modeASubsystem: curated.modeASubsystem,
      modeARegionId: curated.modeARegionId,
      modeAFocusLabel: curated.modeAFocusLabel,
      modeBRegionId: curated.modeBRegionId,
      modeBFocusArea: curated.modeBFocusArea,
    };
  }

  // Deterministic accurate fallback by asset system/category without inventing fake telemetry
  const isMusculo = entry.category === 'Musculoskeletal';
  const isBone = entry.system === 'skeleton';
  const isMuscle = entry.system === 'muscles';
  const isVessel = entry.system === 'vessels';
  const isRespiratory = bucket === 'respiratory';
  const isSkin = entry.system === 'skin';

  let modeASubsystem: SubsystemKey | undefined;
  let modeARegionId: ModeAAnatomicalRegionId | undefined;
  let modeBFocusArea: AtlasStructureDetails['modeBFocusArea'];

  if (isBone) {
    modeASubsystem = 'musculoskeletal';
    modeARegionId = 'bones_skeletal';
    modeBFocusArea = 'Bone Recovery';
  } else if (isMuscle && isMusculo) {
    modeASubsystem = 'musculoskeletal';
    modeARegionId = 'muscles';
    if (entry.key.includes('neck')) modeBFocusArea = 'Spine & Posture Recovery';
    else if (entry.key.includes('shin') || entry.key.includes('foot') || entry.key.includes('adductor') || entry.key.includes('gluteal')) {
      modeBFocusArea = 'Lower-Limb Strength';
    } else if (entry.key.includes('iliopsoas') || entry.key.includes('pelvic')) {
      modeBFocusArea = 'Core Stability';
    } else {
      modeBFocusArea = 'Muscle Recovery';
    }
  } else if (isVessel) {
    modeASubsystem = 'cardiovascular';
    modeARegionId = 'heart_cardio';
  } else if (isRespiratory) {
    modeASubsystem = 'mood_sleep';
    modeARegionId = 'lungs_respiratory';
  }

  const functionBySystem: Record<string, string> = {
    skeleton: 'Provides structural rigidity, lever arms for muscle force, mineral storage, and protection for internal organs.',
    muscles: 'Generates contractile force for joint movement, postural stability against gravity, and mechanical osteocyte loading.',
    vessels: 'Transports oxygenated arterial blood or returns deoxygenated venous blood across regional capillary beds.',
    organs: `Performs specialized ${entry.category.toLowerCase()} physiological functions supporting homeostasis.`,
    skin: 'Protective integumentary barrier regulating thermoregulation, fluid retention, and tactile sensation.',
    nerves: 'Relays neural action potentials between central nuclei and peripheral effectors.',
  };

  const relevanceBySystem: Record<string, string> = {
    skeleton:
      'Microgravity unloading accelerates trabecular and cortical bone resorption unless countered with ARED high-load resistance.',
    muscles:
      'Skeletal muscles experience disuse atrophy in 0.0g and require phased eccentric/concentric reconditioning after Earth landing.',
    vessels:
      'Fluid redistribution in microgravity eliminates normal hydrostatic pressure gradients across regional vascular beds.',
    organs: `Monitored via mission health baselines and crew flight logs; specific ${entry.category.toLowerCase()} sensor telemetry is not directly measured by ASTROCARE.`,
    skin: 'Orbital humidity, EVA suit friction, and altered wound healing require cutaneous hygiene monitoring.',
    nerves: 'Central and cranial neuro-sensory structures adapt to microgravity fluid shifts and vestibular unloading.',
  };

  return {
    key: entry.key,
    label: entry.label,
    latinName: FALLBACK_LATIN_BY_KEY[entry.key] ?? null,
    assetSystem: entry.system,
    filterBucket: bucket,
    category: entry.category,
    color: entry.color,
    anatomicalFunction: functionBySystem[entry.system] ?? functionBySystem.organs,
    anatomicalLocation: `Part of the ${entry.category} system (${entry.system} mesh group in open-anatomy-3d).`,
    relatedKeys: [],
    spaceflightRelevance: relevanceBySystem[entry.system] ?? relevanceBySystem.organs,
    groupedOrLimitationNote:
      entry.key.startsWith('forearm_')
        ? 'Radius and ulna are combined in this mesh.'
        : entry.key.startsWith('lower_leg_')
          ? 'Tibia and fibula are combined in this mesh.'
          : entry.key.startsWith('shin_muscles_')
            ? 'Tibialis anterior and anterior crural extensors are grouped in this mesh.'
            : undefined,
    modeASubsystem,
    modeARegionId,
    modeBFocusArea,
  };
}
