import type {
  ModeAAnatomicalRegionId,
  ModeAAnatomyRegionDef,
  ModeBRecoveryRegionDef,
  ModeBRecoveryRegionId,
  SubsystemKey,
} from '../types/astral';

export const MODE_A_ANATOMY_REGIONS: Record<ModeAAnatomicalRegionId, ModeAAnatomyRegionDef> = {
  brain_nervous: {
    id: 'brain_nervous',
    name: 'Brain & Central Nervous System',
    shortLabel: 'Brain / CNS',
    linkedSubsystem: 'mood_sleep',
    biologicalFunction:
      'Regulates circadian sleep-wake architecture via the suprachiasmatic nucleus, executive cognition, psychomotor vigilance, and vestibular-autonomic integration.',
    spaceflightConcern:
      '16 orbital sunrises/day, elevated cabin CO2 (3–5 mmHg), and cephalad upward brain shift alter CSF drainage, sleep consolidation, and cognitive reaction speed.',
    relevantMeasurements: [
      'Actigraphy Consolidated Sleep (hrs)',
      'PVT Reaction Lapses (>500ms)',
      'Habitat Ambient CO2 (mmHg)',
    ],
    monitoringRecommendations: [
      'Review 3-minute Psychomotor Vigilance Test (PVT) prior to EVA or robotics.',
      'Maintain dynamic 460nm morning / 2700K evening SSLA lighting cycles.',
      'Verify cabin CO2 scrubber performance if PVT lapses exceed 4 per test.',
    ],
    references: [
      'NASA HRP Behavioral Health & Performance (BHP) Standard',
      'Roberts et al., NEJM (2017) — Narrowing of CSF Spaces After Spaceflight',
    ],
    cameraFocus: [0, 1.56, 0],
    preferredView: 'front',
  },
  eyes_optic: {
    id: 'eyes_optic',
    name: 'Eyes & Optic Nerves (SANS)',
    shortLabel: 'Eyes / Optic',
    linkedSubsystem: 'ocular_sans',
    biologicalFunction:
      'Transmits retinal phototransduction signals through the retrobulbar optic nerve sheath to the visual cortex while maintaining intraocular pressure homeostasis.',
    spaceflightConcern:
      'Spaceflight-Associated Neuro-ocular Syndrome (SANS): microgravity cephalad fluid shift elevates perioptic CSF pressure, distending the optic nerve sheath (ONSD), flattening the posterior globe, and inducing hyperopic shift.',
    relevantMeasurements: [
      'Optic Nerve Sheath Diameter (ONSD, mm)',
      'Hyperopic Refractive Shift (Diopters)',
      'Frisen Papilledema Grade (0–5)',
    ],
    monitoringRecommendations: [
      'Perform transorbital ultrasound ONSD scan 3mm posterior to globe (<50 mW/cm²).',
      'Cross-check with OCT retinal nerve fiber layer thickness and Amsler grid.',
      'Deploy LBNP (-25 to -35 mmHg) or veno-occlusive thigh cuffs if ONSD ≥ 5.5 mm.',
    ],
    references: [
      'NASA SANS Clinical Practice Guidelines & Taskforce Report',
      'Mader et al., Ophthalmology — Optic Disc Edema & Globe Flattening in Astronauts',
    ],
    cameraFocus: [0, 1.52, 0.08],
    preferredView: 'front',
  },
  internal_jugular: {
    id: 'internal_jugular',
    name: 'Internal Jugular Veins (IJV)',
    shortLabel: 'Jugular Veins',
    linkedSubsystem: 'cardiovascular',
    biologicalFunction:
      'Provides primary cerebral venous return from the dural venous sinuses down the anterior cervical triangle toward the brachiocephalic veins and right atrium.',
    spaceflightConcern:
      'Loss of hydrostatic gravitational gradient causes persistent cephalad venous stasis, engorged IJV cross-sectional area, stagnant/retrograde Doppler flow, and thrombosis risk (NASA MD 44-A).',
    relevantMeasurements: [
      'IJV Doppler Flow Velocity (cm/s)',
      'Cephalad Venous Stasis Grade (1–5)',
      'Bilateral Compression Ultrasound Patency',
    ],
    monitoringRecommendations: [
      'Perform Butterfly iQ+ bilateral compression sweep at C4–C6 with minimal probe pressure.',
      'Initiate LBNP chuffing (-35 mmHg, 30 min) when IJV flow velocity drops ≤ 14 cm/s.',
      'Escalate immediately under Medical Directive 44-A if flow ≤ 6 cm/s or non-compressible thrombus is suspected.',
    ],
    references: [
      'NASA Medical Directive 44-A (In-Flight IJV Thrombosis Protocol)',
      'Marshall-Goebel et al., JAMA Network Open (2019) — Jugular Venous Flow Stasis',
    ],
    cameraFocus: [0, 1.37, 0.05],
    preferredView: 'front',
  },
  heart_cardio: {
    id: 'heart_cardio',
    name: 'Heart & Cardiovascular System',
    shortLabel: 'Heart / Cardio',
    linkedSubsystem: 'cardiovascular',
    biologicalFunction:
      'Maintains systemic perfusion pressure, baroreceptor autonomic tone, and plasma volume distribution across central and peripheral vascular beds.',
    spaceflightConcern:
      'Microgravity reduces plasma volume by 10–15% within days, drives myocardial remodeling/atrophy if unmitigated, and blunts carotid baroreflex sensitivity prior to Earth re-entry.',
    relevantMeasurements: [
      'Resting Heart Rate (bpm)',
      'Cephalad Venous Stasis Grade (1–5)',
      'IJV Doppler Flow Velocity (cm/s)',
    ],
    monitoringRecommendations: [
      'Track morning resting heart rate and orthostatic heart rate variability.',
      'Maintain 2.5 L/day fluid intake plus scheduled T2 aerobic intervals.',
      'Run oral electrolyte fluid-loading protocol 24h before de-orbit burn.',
    ],
    references: [
      'NASA HRP Risk of Cardiovascular Disease & Orthostatic Intolerance',
      'Norsk et al., Journal of Physiology — Fluid Shifts & Cardiac Output in Space',
    ],
    cameraFocus: [0.03, 1.16, 0.05],
    preferredView: 'front',
  },
  lungs_respiratory: {
    id: 'lungs_respiratory',
    name: 'Lungs & Respiratory System',
    shortLabel: 'Lungs / Resp',
    linkedSubsystem: 'mood_sleep',
    biologicalFunction:
      'Exchanges alveolar oxygen and carbon dioxide across pulmonary capillary beds to maintain arterial pH and cerebral vascular tone.',
    spaceflightConcern:
      'Absence of gravity eliminates regional ventilation-perfusion (V/Q) gradients, while localized cabin CO2 pockets around sleeping crew increase cerebral blood flow, headaches, and sleep fragmentation.',
    relevantMeasurements: [
      'Habitat Ambient CO2 (mmHg)',
      'Actigraphy Consolidated Sleep (hrs)',
      'PVT Reaction Lapses (>500ms)',
    ],
    monitoringRecommendations: [
      'Verify sleep-station inter-module ventilation airflow before rest periods.',
      'Monitor CO2 partial pressure continuously; boost CDRA scrubber if > 3.8 mmHg.',
      'Track nocturnal SpO2 and respiratory rate during high-CO2 anomalies.',
    ],
    references: [
      'NASA HRP Risk of Adverse Cognitive/Behavioral Effects of Elevated CO2',
      'Prisk, Journal of Applied Physiology — Microgravity Pulmonary Function',
    ],
    cameraFocus: [0, 1.18, 0.02],
    preferredView: 'front',
  },
  digestive: {
    id: 'digestive',
    name: 'Digestive & Metabolic System',
    shortLabel: 'Digestive',
    linkedSubsystem: 'mood_sleep',
    biologicalFunction:
      'Digests macronutrients, absorbs calcium/vitamin D, regulates gut microbiome immunity, and anchors peripheral circadian metabolic oscillators.',
    spaceflightConcern:
      'Space motion sickness, altered gastric emptying in 0g, reduced thirst drive, and circadian meal timing drift compromise caloric balance, hydration, and bone mineral retention.',
    relevantMeasurements: [
      'Actigraphy Consolidated Sleep (hrs)',
      'Cephalad Venous Stasis Grade (1–5)',
      'Daily Hydration & Electrolyte Compliance',
    ],
    monitoringRecommendations: [
      'Enforce minimum 2.5 L/day hydration and 800 IU/day Vitamin D3 supplementation.',
      'Align protein-rich post-ARED meals within 45 minutes of resistance training.',
      'Limit dietary sodium (<1800 mg/day) when cephalad fluid shift grade ≥ 3.',
    ],
    references: [
      'NASA HRP Risk of Inadequate Nutrition & Spaceflight Microbiome Shifts',
      'Smith et al., Journal of Nutrition — Bone & Calcium Metabolism in Microgravity',
    ],
    cameraFocus: [0, 0.94, 0.06],
    preferredView: 'front',
  },
  spine: {
    id: 'spine',
    name: 'Spine (Cervical, Thoracic & Lumbar)',
    shortLabel: 'Spine',
    linkedSubsystem: 'musculoskeletal',
    biologicalFunction:
      'Provides axial structural support, intervertebral disc shock absorption, and protective conduit for the spinal cord and segmental nerve roots.',
    spaceflightConcern:
      'Unloading in microgravity hydrates intervertebral discs, lengthening the spine by 3–5 cm ("spaceflight elongation") and causing axial lumbar pain and post-flight disc herniation risk.',
    relevantMeasurements: [
      'Axial Lumbar Elongation Pain (VAS 0–10)',
      'ARED Resistance Load Adherence (%)',
      'Missed Workouts (Last 7 Days)',
    ],
    monitoringRecommendations: [
      'Monitor lumbar VAS pain daily before heavy ARED squat or deadlift sets.',
      'Maintain neutral lumbar bracing during vacuum cylinder resistance loading.',
      'Substitute supine hip sled if axial lumbar pain reaches ≥ 4/10.',
    ],
    references: [
      'NASA HRP Risk of Intervertebral Disc Damage After Spaceflight',
      'Johnston et al., Aviation, Space, and Environmental Medicine — Post-Flight Herniation',
    ],
    cameraFocus: [0, 1.08, -0.06],
    preferredView: 'back',
  },
  bones_skeletal: {
    id: 'bones_skeletal',
    name: 'Bones & Skeletal System',
    shortLabel: 'Skeletal Bones',
    linkedSubsystem: 'musculoskeletal',
    biologicalFunction:
      'Bears mechanical gravitational loads, protects vital organs, and serves as the body’s calcium-phosphate mineral reservoir through osteoblast/osteoclast remodeling.',
    spaceflightConcern:
      'Without 1.0g ground-reaction forces, weight-bearing bones (femoral neck, lumbar vertebrae, calcaneus) lose 1.0–1.5% bone mineral density per month and increase renal stone risk.',
    relevantMeasurements: [
      'ARED Resistance Load Adherence (%)',
      'Missed Workouts (Last 7 Days)',
      'Estimated Daily Osteogenic Strain Compliance',
    ],
    monitoringRecommendations: [
      'Sustain ARED mechanical load adherence ≥ 88% (target ≥ 1,800 microstrain).',
      'Prioritize compound axial lifts: squats, deadlifts, and heavy heel raises.',
      'Pair high-load ARED blocks with adequate hydration to mitigate hypercalciuria.',
    ],
    references: [
      'NASA HRP Risk of Early-Onset Osteoporosis Due to Spaceflight',
      'Sibonga et al., Bone — Recovery of Spaceflight-Induced Bone Loss',
    ],
    cameraFocus: [0, 0.72, 0],
    preferredView: 'front',
  },
  muscles: {
    id: 'muscles',
    name: 'Skeletal Muscles (Kinetic Chain)',
    shortLabel: 'Muscles',
    linkedSubsystem: 'musculoskeletal',
    biologicalFunction:
      'Generates force for posture, locomotion, ARED countermeasure exertion, and systemic glucose/amino-acid metabolic homeostasis.',
    spaceflightConcern:
      'Microgravity unloading rapidly downregulates myofibrillar protein synthesis, causing 10–25% cross-sectional atrophy across trunk and lower-limb extensors over 180-day missions.',
    relevantMeasurements: [
      'ARED Resistance Load Adherence (%)',
      'Missed Workouts (Last 7 Days)',
      'Axial Lumbar Elongation Pain (VAS 0–10)',
    ],
    monitoringRecommendations: [
      'Log daily ARED peak resistance percentage into the Flight Archive for Mode B calibration.',
      'Make up missed sessions within 72 hours to prevent compounding atrophy decay.',
      'Integrate eccentric deceleration phases on squats and Romanian deadlifts.',
    ],
    references: [
      'NASA HRP Risk of Impaired Performance Due to Reduced Muscle Mass & Strength',
      'Trappe et al., Journal of Applied Physiology — ISS Crew Muscle Countermeasures',
    ],
    cameraFocus: [0, 0.74, 0.04],
    preferredView: 'front',
  },
  calves_soleus: {
    id: 'calves_soleus',
    name: 'Calves & Soleus Muscles',
    shortLabel: 'Calves / Soleus',
    linkedSubsystem: 'musculoskeletal',
    biologicalFunction:
      'Antigravity slow-twitch postural muscle complex that stabilizes upright stance and acts as the peripheral "second heart" venous pump in 1.0g.',
    spaceflightConcern:
      'The soleus exhibits the fastest and most severe fiber atrophy in microgravity (up to 20–30% loss and slow-to-fast fiber shift), impairing both standing balance and venous return upon landing.',
    relevantMeasurements: [
      'ARED Resistance Load Adherence (%)',
      'Missed Workouts (Last 7 Days)',
      'Bilateral Calf Circumference Screen (10cm below tibial tuberosity)',
    ],
    monitoringRecommendations: [
      'Perform weekly bilateral calf circumference tape tracking.',
      'Execute high-volume seated & standing ARED heel raises with full ankle dorsiflexion.',
      'Combine T2 treadmill harness running with bungee axial loading (≥ 75% bodyweight).',
    ],
    references: [
      'Fitts et al., Journal of Physiology — Prolonged Spaceflight Effects on Soleus Fibers',
      'NASA APTP — Antigravity Postural Calf Reconditioning Standards',
    ],
    cameraFocus: [0, 0.31, -0.03],
    preferredView: 'back',
  },
};

export const MODE_A_REGION_LIST: ModeAAnatomyRegionDef[] = Object.values(MODE_A_ANATOMY_REGIONS);

export const SUBSYSTEM_TO_DEFAULT_REGION: Record<SubsystemKey, ModeAAnatomicalRegionId> = {
  cardiovascular: 'internal_jugular',
  ocular_sans: 'eyes_optic',
  musculoskeletal: 'spine',
  mood_sleep: 'brain_nervous',
};

export const MODE_B_RECOVERY_REGIONS: Record<ModeBRecoveryRegionId, ModeBRecoveryRegionDef> = {
  soleus: {
    id: 'soleus',
    name: 'Soleus Muscles (Deep Antigravity Calf)',
    shortLabel: 'Soleus',
    category: 'Postural Muscle',
    biologicalFunction:
      'Primary slow-twitch postural plantarflexor maintaining quiet standing balance and driving lower-limb venous return against Earth gravity.',
    postFlightConcern:
      'Suffers the steepest spaceflight fiber atrophy and slow-to-fast myosin shift; vulnerable to eccentric strain and orthostatic venous pooling during R+0 to R+14.',
    baselineVulnerabilityWeight: 1.18,
    linkedExerciseKeywords: ['Soleus', 'Calves', 'Treadmill'],
    loadingGuidance:
      'Begin seated elastic-band plantarflexion (Phase 1), progress to chest-deep aquatic treadmill (Phase 2), and clear overground tempo track running in Phase 3.',
    references: [
      'NASA JSC APTP Phase 1–3 Postural Calf Progression',
      'Fitts et al., J Physiol — Human Soleus Fiber Recovery Post-ISS',
    ],
    cameraFocus: [0, 0.30, -0.04],
    preferredView: 'back',
  },
  gastrocnemius: {
    id: 'gastrocnemius',
    name: 'Gastrocnemius Muscles (Superficial Calf)',
    shortLabel: 'Gastrocnemius',
    category: 'Phasic Muscle',
    biologicalFunction:
      'Bi-articular plantarflexor crossing the knee and ankle joints to generate propulsive push-off force and decelerate landing impacts.',
    postFlightConcern:
      'Prone to Achilles-tendon junction micro-strain when transitioning abruptly from 0.0g float to 1.0g heel-strike locomotion.',
    baselineVulnerabilityWeight: 1.02,
    linkedExerciseKeywords: ['Gastrocnemius', 'Calves', 'Agility'],
    loadingGuidance:
      'Use eccentric heel slides in Phase 1 before introducing multi-directional agility ladder deceleration in Phase 3.',
    references: [
      'NASA JSC APTP Achilles & Gastrocnemius Guarded Return Protocol',
    ],
    cameraFocus: [0, 0.35, -0.06],
    preferredView: 'back',
  },
  quadriceps: {
    id: 'quadriceps',
    name: 'Quadriceps (Anterior Thigh Extensors)',
    shortLabel: 'Quadriceps',
    category: 'Phasic Muscle',
    biologicalFunction:
      'Controls knee extension, sit-to-stand transitions, stair ascent, and eccentric shock absorption under 1.0g.',
    postFlightConcern:
      'Reduced concentric torque and altered neuromotor recruitment increase knee buckling risk during early standing and upright ergometer work.',
    baselineVulnerabilityWeight: 0.92,
    linkedExerciseKeywords: ['Quadriceps', 'Ergometer', 'Trap-Bar'],
    loadingGuidance:
      'Start with 45° semi-recumbent cycling (Phase 1) to protect orthostatic BP before loading hex trap-bar deadlifts in Phase 3.',
    references: [
      'NASA JSC APTP Lower Extremity Strength Restoration Benchmarks',
    ],
    cameraFocus: [0, 0.56, 0.05],
    preferredView: 'front',
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstrings (Posterior Thigh Chain)',
    shortLabel: 'Hamstrings',
    category: 'Phasic Muscle',
    biologicalFunction:
      'Extends the hip, stabilizes posterior pelvic tilt, and decelerates tibial translation during running and hinge movements.',
    postFlightConcern:
      'Asymmetric posterior chain stiffness and strength deficit after microgravity hip-flexed floating posture.',
    baselineVulnerabilityWeight: 0.95,
    linkedExerciseKeywords: ['Hamstrings', 'Romanian Deadlift', 'Rowing'],
    loadingGuidance:
      'Introduce supported banded Romanian deadlifts (RDL) and Concept2 rowing intervals in Phase 2 with strict neutral-spine control.',
    references: [
      'NASA JSC APTP Posterior Kinetic Chain Protocol',
    ],
    cameraFocus: [0, 0.56, -0.05],
    preferredView: 'back',
  },
  multifidus: {
    id: 'multifidus',
    name: 'Multifidus (Deep Lumbar Stabilizers)',
    shortLabel: 'Multifidus',
    category: 'Postural Muscle',
    biologicalFunction:
      'Provides segmental intervertebral stiffness and proprioceptive control of the lumbar spine against gravitational shear.',
    postFlightConcern:
      'Shows up to 22% cross-sectional shrinkage after 6-month missions; delayed recovery leaves intervertebral discs exposed to post-flight herniation.',
    baselineVulnerabilityWeight: 1.24,
    linkedExerciseKeywords: ['Multifidus', 'Lumbar Core', 'Diaphragmatic'],
    loadingGuidance:
      'Strictly avoid heavy axial barbell loading until Phase 3; reactivate with supine diaphragmatic co-contraction in Phase 1.',
    references: [
      'Bailey et al., Spine Journal — Lumbar Multifidus Atrophy & Disc Herniation Post-ISS',
      'NASA JSC APTP Phase 1 Core Stabilization Standard',
    ],
    cameraFocus: [0, 0.94, -0.06],
    preferredView: 'back',
  },
  erector_spinae: {
    id: 'erector_spinae',
    name: 'Erector Spinae (Paraspinal Extensors)',
    shortLabel: 'Erector Spinae',
    category: 'Postural Muscle',
    biologicalFunction:
      'Maintains upright thoracic and lumbar spinal alignment and controls forward trunk flexion under Earth gravity.',
    postFlightConcern:
      'Rapid fatigue and paraspinal spasm during initial 1.0g upright posture due to elongated spinal ligaments and unloaded extensor atrophy.',
    baselineVulnerabilityWeight: 1.1,
    linkedExerciseKeywords: ['Erector Spinae', 'Posterior Chain', 'Deadlift'],
    loadingGuidance:
      'Progress from supine activation to aquatic buoyancy offloading, then controlled banded RDL hinge mechanics in Phase 2.',
    references: [
      'NASA HRP Risk of Intervertebral Disc Damage & Paraspinal Atrophy',
    ],
    cameraFocus: [0, 1.08, -0.07],
    preferredView: 'back',
  },
  core_stabilizers: {
    id: 'core_stabilizers',
    name: 'Core Stabilizers (Transverse Abdominis & Obliques)',
    shortLabel: 'Core Stabilizers',
    category: 'Postural Muscle',
    biologicalFunction:
      'Generates intra-abdominal pressure cylinder that stiffens the lumbopelvic canister and assists venous return.',
    postFlightConcern:
      'Deconditioned deep abdominal bracing impairs postural sway control and exacerbates orthostatic blood pooling on standing.',
    baselineVulnerabilityWeight: 1.06,
    linkedExerciseKeywords: ['Transverse Abdominis', 'Lumbar Core', 'Core'],
    loadingGuidance:
      'Use supine hollowing without pelvic tilt in Phase 1, then integrate dynamic tandem balance & kinetic chain rowing in Phase 2.',
    references: [
      'NASA JSC APTP Lumbopelvic Stability Progression',
    ],
    cameraFocus: [0, 0.96, 0.06],
    preferredView: 'front',
  },
  cervical_extensors: {
    id: 'cervical_extensors',
    name: 'Cervical Extensors & Vestibulo-Spinal Neck',
    shortLabel: 'Cervical Extensors',
    category: 'Postural Muscle',
    biologicalFunction:
      'Supports cranial mass under 1.0g and stabilizes gaze during head-turn vestibulo-ocular reflex (VOR) recalibration.',
    postFlightConcern:
      'High vulnerability during R+0 to R+7 re-adaptation when crew experience otolith-ocular lag, heavy-head sensation, and cervical fatigue.',
    baselineVulnerabilityWeight: 1.08,
    linkedExerciseKeywords: ['Vestibulo-Ocular', 'Head Turns', 'Vestibular'],
    loadingGuidance:
      'Perform seated supported VOR x1 gaze fixation drills (Phase 1) before advancing to tandem foam-pad head turns (Phase 2).',
    references: [
      'NASA HRP Sensorimotor & Otolith-Ocular Re-adaptation Guidelines',
    ],
    cameraFocus: [0, 1.38, -0.04],
    preferredView: 'back',
  },
  femoral_bones: {
    id: 'femoral_bones',
    name: 'Femoral Bones (Femoral Neck & Shaft)',
    shortLabel: 'Femoral Bones',
    category: 'Load-Bearing Bone',
    biologicalFunction:
      'Primary axial load-bearing long bone transmitting bodyweight across the hip joint during standing, running, and lifting.',
    postFlightConcern:
      'Losable BMD (1.0–1.5%/month in flight) leaves the femoral neck vulnerable to stress injury during premature high-impact Earth loading.',
    baselineVulnerabilityWeight: 1.12,
    linkedExerciseKeywords: ['Femoral', 'Trap-Bar', 'Track Run'],
    loadingGuidance:
      'Protect with 55% aquatic buoyancy offloading in Phase 2 before reintroducing >2,000 microstrain osteogenic track runs and trap-bar deadlifts in Phase 3.',
    references: [
      'Sibonga et al., Bone — Femoral Neck BMD Recovery Trajectory Post-Flight',
      'HealthData.gov NHIS Osteogenic Loading Thresholds',
    ],
    cameraFocus: [0, 0.62, 0.02],
    preferredView: 'front',
  },
  spine_b: {
    id: 'spine_b',
    name: 'Spine (Vertebral Column & Discs)',
    shortLabel: 'Spine',
    category: 'Axial Spine',
    biologicalFunction:
      'Transmits axial gravitational load while protecting intervertebral disc hydration and spinal nerve root integrity.',
    postFlightConcern:
      'Post-flight disc super-hydration coupled with vertebral trabecular BMD loss creates peak disc herniation risk during the first 21 days back on Earth.',
    baselineVulnerabilityWeight: 1.16,
    linkedExerciseKeywords: ['Spine', 'Multifidus', 'Deadlift'],
    loadingGuidance:
      'Zero axial compression in Phase 1; neutral-spine bracing in Phase 2; trap-bar centered load only after Phase 2 clearance.',
    references: [
      'NASA HRP Intervertebral Disc Reconditioning Restriction (Days R+0 to R+21)',
    ],
    cameraFocus: [0, 1.04, -0.05],
    preferredView: 'back',
  },
};

export const MODE_B_REGION_LIST: ModeBRecoveryRegionDef[] = Object.values(MODE_B_RECOVERY_REGIONS);
