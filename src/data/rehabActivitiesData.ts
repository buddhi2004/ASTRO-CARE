export type RehabActivityCategory =
  | 'Cardiovascular'
  | 'Vestibular'
  | 'Core & Spine'
  | 'Strength'
  | 'Hydrotherapy'
  | 'Certification';

export type RehabChecklistItemKind = 'prep' | 'set' | 'finish';

export interface RehabChecklistStep {
  id: string;
  label: string;
  detail?: string;
  kind: RehabChecklistItemKind;
  setNumber?: number;
}

export interface RehabActivityProfile {
  exerciseId: string;
  category: RehabActivityCategory;
  shortDescription: string;
  setsCount: number;
  repsPerSetLabel: string;
  durationMinutes: number;
  equipment: string[];
  movementCue: string;
  stepByStep: string[];
  postureReminders: string[];
  clinicalRationale: string;
  checklist: RehabChecklistStep[];
}

export const REHAB_ACTIVITY_PROFILES: Record<string, RehabActivityProfile> = {
  // PHASE 1: STABILIZATION & BALANCE (R+0 to R+7)
  p1_recumbent_cycle: {
    exerciseId: 'p1_recumbent_cycle',
    category: 'Cardiovascular',
    shortDescription:
      'Low-resistance cycling at a 45° recline to restore aerobic flow without triggering standing dizziness.',
    setsCount: 3,
    repsPerSetLabel: '65–75 RPM · 8 min blocks',
    durationMinutes: 25,
    equipment: ['45° Semi-Recumbent Ergometer', 'Automated BP Cuff', 'Telemetry HR Strap'],
    movementCue: 'Smooth circular pedal stroke · Keep torso reclined at 45°',
    stepByStep: [
      'Adjust seat backrest firmly to 45° inclination and verify systolic BP > 95 mmHg.',
      'Begin 5-minute warm-up spin at 60–65 RPM with minimal resistance.',
      'Hold steady 65–75 RPM cadence through the main aerobic conditioning blocks.',
      'Complete 4-minute cool-down spin and remain seated 2 minutes before standing.',
    ],
    postureReminders: [
      'Keep head and shoulders supported against the 45° seat back.',
      'Avoid gripping handlebars tightly; relax neck and upper traps.',
      'Breathe rhythmically—never hold your breath during pedal push.',
    ],
    clinicalRationale:
      'Post-flight plasma volume reduction increases orthostatic intolerance. A 45° semi-recumbent position maintains venous return to the heart while rebuilding cardiac stroke volume.',
    checklist: [
      { id: 'prep_bp', label: 'Check baseline systolic BP (> 95 mmHg) & set 45° recline', kind: 'prep' },
      { id: 'set_1', label: 'Warm-up spin (5 mins · 60–65 RPM)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Main aerobic block (15 mins · 65–75 RPM)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Cool-down pedal & heart-rate recovery (5 mins)', kind: 'set', setNumber: 3 },
      { id: 'finish', label: 'Complete activity & confirm zero presyncope', kind: 'finish' },
    ],
  },

  p1_vor_gaze: {
    exerciseId: 'p1_vor_gaze',
    category: 'Vestibular',
    shortDescription:
      'Focused eye-head coordination drills to recalibrate inner-ear otolith reflexes after microgravity.',
    setsCount: 3,
    repsPerSetLabel: '60s horizontal & vertical @ 1 Hz',
    durationMinutes: 15,
    equipment: ['High-Back Chair', 'Thumb / High-Contrast Gaze Target', '1 Hz Metronome'],
    movementCue: 'Rotate head ±20° at 1 Hz · Lock eyes sharply on stationary target',
    stepByStep: [
      'Sit upright with full back support and hold your thumb at arm’s length at eye level.',
      'Lock both eyes on the thumbnail and turn your head left-right ±20° to the 1 Hz beat.',
      'Rest 60 seconds, then repeat with vertical up-down ±20° head nods.',
      'Stop immediately and pause 90 seconds if visual target blurs or nausea rises.',
    ],
    postureReminders: [
      'Keep shoulders still; motion must come purely from cervical rotation.',
      'Eyes stay rock-steady on the target—no lagging or saccadic jumps.',
      'Stay seated throughout all 3 sets with feet flat on the floor.',
    ],
    clinicalRationale:
      'Microgravity alters otolith-ocular gain. VOR x1 fixation drives rapid neuroplastic recalibration of gaze stabilization in terrestrial 1.0g.',
    checklist: [
      { id: 'prep', label: 'Sit upright with back support & position gaze target', kind: 'prep' },
      { id: 'set_1', label: 'Complete Set 1 (60s Horizontal + 60s Vertical @ 1 Hz)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Set 2 (60s Horizontal + 60s Vertical @ 1 Hz)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Set 3 (60s Horizontal + 60s Vertical @ 1 Hz)', kind: 'set', setNumber: 3 },
      { id: 'finish', label: 'Complete activity & log dizziness status', kind: 'finish' },
    ],
  },

  p1_diaphragm_core: {
    exerciseId: 'p1_diaphragm_core',
    category: 'Core & Spine',
    shortDescription:
      'Gentle supine core bracing to wake up deep lumbar stabilizers without compressing the spine.',
    setsCount: 4,
    repsPerSetLabel: '10 holds × 10s each',
    durationMinutes: 20,
    equipment: ['Padded Rehab Mat', 'Knee Bolster Cushion'],
    movementCue: 'Inhale laterally · Draw lower belly gently inward · Hold 10s without pelvic tilt',
    stepByStep: [
      'Lie supine in hook-lying position (knees bent 45°, feet flat on padded mat).',
      'Take a slow nasal diaphragmatic breath expanding the lower ribcage.',
      'Gently draw navel slightly inward (20% effort) to engage transverse abdominis and multifidus.',
      'Hold steady co-contraction for 10 seconds while breathing softly, then relax.',
    ],
    postureReminders: [
      'Maintain a natural neutral lumbar curve—do not flatten lower back forcefully.',
      'Keep glutes and upper chest completely relaxed during each 10s hold.',
      'Zero axial spinal compression; pain must stay ≤ 3/10.',
    ],
    clinicalRationale:
      'Spinal unloading in space elongates intervertebral discs and atrophies deep lumbar multifidus. Low-load isometric bracing restores segmental spinal stiffness safely.',
    checklist: [
      { id: 'prep', label: 'Set up supine hook-lying posture on padded mat', kind: 'prep' },
      { id: 'set_1', label: 'Complete Set 1 (10 holds × 10s)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Set 2 (10 holds × 10s)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Set 3 (10 holds × 10s)', kind: 'set', setNumber: 3 },
      { id: 'set_4', label: 'Complete Set 4 (10 holds × 10s)', kind: 'set', setNumber: 4 },
      { id: 'finish', label: 'Complete activity & verify lumbar comfort (pain ≤ 3/10)', kind: 'finish' },
    ],
  },

  p1_ankle_pump: {
    exerciseId: 'p1_ankle_pump',
    category: 'Strength',
    shortDescription:
      'Slow elastic-band ankle presses to reactivate the calf venous pump and soleus endurance.',
    setsCount: 3,
    repsPerSetLabel: '20 slow eccentric reps',
    durationMinutes: 20,
    equipment: ['Seated Rehab Chair', 'Light Elastic Resistance Band (Green)'],
    movementCue: 'Press forefoot smoothly forward · Control 3-second return · Keep knee steady',
    stepByStep: [
      'Sit tall with legs extended on a low support stool and loop the green band across the ball of your foot.',
      'Point toes forward smoothly (plantarflexion) for 1 second.',
      'Hold peak contraction for 1 second, feeling soleus and gastrocnemius tension.',
      'Control the return (dorsiflexion) over a slow 3-second count.',
    ],
    postureReminders: [
      'Keep knees softly straight without locking the joint.',
      'Move only at the ankle joint—avoid rocking hips backward.',
      'Remain seated for 60 seconds post-set before any standing transition.',
    ],
    clinicalRationale:
      'Soleus slow-twitch fibers lose up to 25% strength in microgravity. Slow eccentric plantarflexion rebuilds muscle-pump venous return and Achilles tendon stiffness.',
    checklist: [
      { id: 'prep', label: 'Loop green resistance band securely around forefoot', kind: 'prep' },
      { id: 'set_1', label: 'Complete Set 1 (20 slow eccentric reps)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Set 2 (20 slow eccentric reps)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Set 3 (20 slow eccentric reps)', kind: 'set', setNumber: 3 },
      { id: 'finish', label: 'Complete activity & transition slowly from seated', kind: 'finish' },
    ],
  },

  // PHASE 2: STRENGTH & HYDROTHERAPY (R+8 to R+21)
  p2_aquatic_treadmill: {
    exerciseId: 'p2_aquatic_treadmill',
    category: 'Hydrotherapy',
    shortDescription:
      'Warm chest-deep underwater treadmill walking and jogging with 55% buoyancy offloading.',
    setsCount: 3,
    repsPerSetLabel: '3.2–4.5 mph · 55% Offload',
    durationMinutes: 30,
    equipment: ['Hydrotherapy Underwater Treadmill', 'Chest-Deep Warm Pool (33°C)', 'Gait Camera'],
    movementCue: 'Tall upright torso · Even heel-to-toe foot strike · Zero lateral sway',
    stepByStep: [
      'Step into chest-deep hydrotherapy pool and verify buoyancy offload at 55% bodyweight.',
      'Begin warm-up gait at 3.2 mph for 8 minutes focusing on symmetric heel-to-toe roll.',
      'Increase belt speed to 3.8–4.5 mph for 17 minutes while driving arms naturally through water.',
      'Taper belt down to 3.2 mph for a 5-minute cool-down walk and exit pool smoothly.',
    ],
    postureReminders: [
      'Keep chest lifted and gaze forward—avoid looking down at the submerged belt.',
      'Ensure equal left/right foot-strike rhythm without drifting side-to-side.',
      'Engage core lightly to resist water drag turbulence.',
    ],
    clinicalRationale:
      'Chest-level hydrostatic pressure assists venous return while 55% buoyancy offload lets astronauts rebuild terrestrial stride mechanics without overloading recovering joints.',
    checklist: [
      { id: 'prep', label: 'Enter chest-deep pool & confirm 55% bodyweight offload', kind: 'prep' },
      { id: 'set_1', label: 'Warm-up gait phase (8 mins @ 3.2 mph)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Main stride phase (17 mins @ 3.8–4.5 mph)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Verify foot-strike symmetry & cool-down (5 mins)', kind: 'set', setNumber: 3 },
      { id: 'finish', label: 'Complete 30-min hydrotherapy activity', kind: 'finish' },
    ],
  },

  p2_banded_rdl: {
    exerciseId: 'p2_banded_rdl',
    category: 'Strength',
    shortDescription:
      'Controlled hip-hinge deadlift with heavy resistance band to strengthen hamstrings and back.',
    setsCount: 3,
    repsPerSetLabel: '3 sets × 12 controlled reps',
    durationMinutes: 25,
    equipment: ['Heavy Resistance Band', 'Support Rail / Dowel Reference'],
    movementCue: 'Push hips back · Neutral lumbar spine · 3s lower, 1s drive up',
    stepByStep: [
      'Read exercise instructions & verify lumbar stability before loading.',
      'Anchor heavy resistance band symmetrically under midfoot arches, hip-width stance.',
      'Brace core, unlock knees slightly, and hinge hips straight back for 3 seconds.',
      'Drive glutes and hamstrings forward to stand tall without hyperextending lower back.',
    ],
    postureReminders: [
      'Keep spine neutral from tailbone to crown—never round the lumbar back.',
      'Keep shins nearly vertical while hips travel backward.',
      'Stop immediately if axial back pain rises above 4/10.',
    ],
    clinicalRationale:
      'Eccentric hip-hinge loading strengthens the posterior chain (hamstrings, gluteals, erector spinae) needed for normal standing posture under 1.0g.',
    checklist: [
      { id: 'prep_read', label: 'Read exercise instructions & check lumbar safety', kind: 'prep' },
      { id: 'prep_band', label: 'Prepare & anchor resistance band underfoot', kind: 'prep' },
      { id: 'set_1', label: 'Complete Set 1 (12 repetitions)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Set 2 (12 repetitions)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Set 3 (12 repetitions)', kind: 'set', setNumber: 3 },
      { id: 'finish', label: 'Complete activity', kind: 'finish' },
    ],
  },

  p2_erg_rowing: {
    exerciseId: 'p2_erg_rowing',
    category: 'Cardiovascular',
    shortDescription:
      'Five 3-minute rowing intervals with 90-second active recovery to restore full-body VO2 capacity.',
    setsCount: 5,
    repsPerSetLabel: '5 × 3-min intervals (90s rest)',
    durationMinutes: 25,
    equipment: ['Concept2 RowErg', 'Chest HR Monitor (Cap ≤ 82% Max)'],
    movementCue: 'Drive: Legs → Body → Arms · Return: Arms → Body → Legs',
    stepByStep: [
      'Strap feet comfortably and set damper resistance between 3 and 4.',
      'Start each 3-minute interval driving first with legs while keeping arms straight.',
      'Pivot torso slightly back (11 o’clock) and pull handle smoothly to lower ribs.',
      'Use each 90-second active rest to paddle lightly and verify HR remains ≤ 82% max.',
    ],
    postureReminders: [
      'Keep thoracic spine tall—avoid slumping forward at the catch.',
      'Sync exhale on the leg drive and inhale during the slow recovery slide.',
      'Keep wrists flat and shoulders relaxed away from ears.',
    ],
    clinicalRationale:
      'Synchronized kinetic-chain rowing builds posterior-chain endurance and aerobic VO2 max recovery while minimizing high-impact ground reaction forces.',
    checklist: [
      { id: 'prep', label: 'Set damper level (3–4) & verify HR cap monitor (≤ 82%)', kind: 'prep' },
      { id: 'set_1', label: 'Interval 1 (3 min work + 90s active rest)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Interval 2 (3 min work + 90s active rest)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Interval 3 (3 min work + 90s active rest)', kind: 'set', setNumber: 3 },
      { id: 'set_4', label: 'Interval 4 (3 min work + 90s active rest)', kind: 'set', setNumber: 4 },
      { id: 'set_5', label: 'Interval 5 (3 min work + cooldown)', kind: 'set', setNumber: 5 },
      { id: 'finish', label: 'Complete rowing activity & log peak HR', kind: 'finish' },
    ],
  },

  p2_tandem_balance: {
    exerciseId: 'p2_tandem_balance',
    category: 'Vestibular',
    shortDescription:
      'Heel-to-toe balance on foam with slow head turns to challenge ankle and vestibular stability.',
    setsCount: 4,
    repsPerSetLabel: '4 sets × 45s per stance',
    durationMinutes: 20,
    equipment: ['Medium-Density Balance Foam Pad', 'Parallel Safety Handrails'],
    movementCue: 'Heel-to-toe stance · Turn head slowly L/R · Keep handrail within reach',
    stepByStep: [
      'Place balance foam between parallel bars so handrails stay within immediate arm reach.',
      'Step into heel-to-toe tandem stance and stabilize gaze forward.',
      'Perform slow, controlled 30° head turns left and right throughout the 45-second hold.',
      'Switch lead foot between sets to balance bilateral ankle proprioception.',
    ],
    postureReminders: [
      'Keep knees soft—avoid locking knee joints.',
      'Maintain upright pelvis without leaning torso to compensate.',
      'Spotter handrail must remain within arm reach at all times.',
    ],
    clinicalRationale:
      'Compliant foam reduces reliable plantar somatosensory input, forcing central integration of vestibular and visual-proprioceptive pathways.',
    checklist: [
      { id: 'prep', label: 'Position foam pad beside parallel safety handrails', kind: 'prep' },
      { id: 'set_1', label: 'Complete Set 1 (45s Right Foot Forward)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Set 2 (45s Left Foot Forward)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Set 3 (45s Right Foot Forward + Head Turns)', kind: 'set', setNumber: 3 },
      { id: 'set_4', label: 'Complete Set 4 (45s Left Foot Forward + Head Turns)', kind: 'set', setNumber: 4 },
      { id: 'finish', label: 'Complete balance activity cleanly', kind: 'finish' },
    ],
  },

  // PHASE 3: FULL EARTH READINESS (R+22 to R+45)
  p3_track_run: {
    exerciseId: 'p3_track_run',
    category: 'Cardiovascular',
    shortDescription:
      'Progressive 800m tempo track runs in full 1.0g to deliver bone-building impact stimulus.',
    setsCount: 4,
    repsPerSetLabel: '4 × 800m progressive tempo',
    durationMinutes: 35,
    equipment: ['Shock-Absorbing Running Track', 'GPS / Lap Timer', 'Cushioned Trainers'],
    movementCue: 'Midfoot strike under center of mass · Crisp cadence · Upright forward lean',
    stepByStep: [
      'Complete 6-minute brisk dynamic walking and leg-swing warm-up.',
      'Run 4 progressive 800m tempo efforts with 2-minute walking recovery between laps.',
      'Focus on elastic midfoot ground contact (> 2,000 microstrain osteogenic load).',
      'Finish with gentle calf stretches and monitor Achilles/plantar tendon soreness.',
    ],
    postureReminders: [
      'Land softly beneath your hips rather than over-striding on the heel.',
      'Keep arms swinging compactly front-to-back without crossing midline.',
      'Report any sharp Achilles or plantar fascia discomfort immediately.',
    ],
    clinicalRationale:
      'Full terrestrial ground reaction forces above 2,000 microstrain signal osteocytes to remodel tibial and femoral cortical bone density.',
    checklist: [
      { id: 'prep', label: 'Complete dynamic warm-up & Achilles mobility check', kind: 'prep' },
      { id: 'set_1', label: 'Complete Lap 1 (800m @ Baseline Tempo)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Lap 2 (800m @ Moderate Tempo)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Lap 3 (800m @ Progressive Tempo)', kind: 'set', setNumber: 3 },
      { id: 'set_4', label: 'Complete Lap 4 (800m @ Target Pace + Cool-down)', kind: 'set', setNumber: 4 },
      { id: 'finish', label: 'Complete track activity & log tendon status', kind: 'finish' },
    ],
  },

  p3_trapbar_deadlift: {
    exerciseId: 'p3_trapbar_deadlift',
    category: 'Strength',
    shortDescription:
      'Heavy balanced hex-bar deadlifts at 75–80% pre-flight 1RM to restore hip and spine BMD.',
    setsCount: 4,
    repsPerSetLabel: '4 sets × 6 reps @ 75–80% 1RM',
    durationMinutes: 30,
    equipment: ['Hex Trap Bar', 'Calibrated Bumper Plates', 'Lifting Belt (Optional)'],
    movementCue: 'Center weight over midfoot · Drive floor away · Lock hips tall at top',
    stepByStep: [
      'Confirm cleared Phase 2 lumbar stability screen and warm up with empty bar.',
      'Load hex bar to 75–80% of pre-flight 1RM and step squarely inside frame.',
      'Grip side handles, pack shoulders down, brace core, and drive smoothly through heels.',
      'Lower plates cleanly under control and rest 2 minutes between each of the 4 sets.',
    ],
    postureReminders: [
      'Maintain flat neutral spine from setup through lockout.',
      'Keep knees tracking smoothly over middle toes—no inward collapse.',
      'Do not jerk bar off the floor; build tension before initiating lift.',
    ],
    clinicalRationale:
      'Hex trap-bar geometry centers load along the body’s vertical axis, generating high femoral neck and lumbar osteogenic strain with lower shear torque.',
    checklist: [
      { id: 'prep', label: 'Verify Phase 2 lumbar clearance & warm-up sets', kind: 'prep' },
      { id: 'set_1', label: 'Complete Working Set 1 (6 reps @ 75–80% 1RM)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Complete Working Set 2 (6 reps @ 75–80% 1RM)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Complete Working Set 3 (6 reps @ 75–80% 1RM)', kind: 'set', setNumber: 3 },
      { id: 'set_4', label: 'Complete Working Set 4 (6 reps @ 75–80% 1RM)', kind: 'set', setNumber: 4 },
      { id: 'finish', label: 'Complete activity & unload plates safely', kind: 'finish' },
    ],
  },

  p3_agility_ladder: {
    exerciseId: 'p3_agility_ladder',
    category: 'Vestibular',
    shortDescription:
      'Multi-directional footwork drills and 180° turns to certify agile Earth movement.',
    setsCount: 6,
    repsPerSetLabel: '6 pattern drills × 4 passes',
    durationMinutes: 25,
    equipment: ['6-Meter Agility Ladder', 'Cones for Deceleration Markers'],
    movementCue: 'Quick light midfoot contacts · Clean deceleration · Zero knee valgus',
    stepByStep: [
      'Clear 8-meter flat non-slip lane and lay out agility ladder securely.',
      'Execute each of the 6 prescribed footwork patterns for 4 clean passes.',
      'Stick a 2-second balanced single-leg deceleration at the final cone.',
      'Reset visual focus cleanly after 180° reorientation cuts.',
    ],
    postureReminders: [
      'Stay in an athletic quarter-squat ready stance—hips back, chest up.',
      'Track knees straight over toes on every cut and landing (zero valgus).',
      'Spot visual landmarks cleanly during 180° turns.',
    ],
    clinicalRationale:
      'Rapid multi-planar accelerations and visual head turns challenge high-frequency vestibular and neuromuscular reaction systems.',
    checklist: [
      { id: 'prep', label: 'Secure agility ladder & clear 8m deceleration lane', kind: 'prep' },
      { id: 'set_1', label: 'Drill 1: Two-Foot Quick Linear Run (4 passes)', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Drill 2: Lateral High-Knee Shuffle (4 passes)', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Drill 3: In-In-Out-Out Coordination (4 passes)', kind: 'set', setNumber: 3 },
      { id: 'set_4', label: 'Drill 4: Single-Leg Hop & Stick (4 passes)', kind: 'set', setNumber: 4 },
      { id: 'set_5', label: 'Drill 5: Icky Shuffle Cross-Step (4 passes)', kind: 'set', setNumber: 5 },
      { id: 'set_6', label: 'Drill 6: 180° Visual-Cut Deceleration (4 passes)', kind: 'set', setNumber: 6 },
      { id: 'finish', label: 'Complete agility certification drill', kind: 'finish' },
    ],
  },

  p3_nhis_check: {
    exerciseId: 'p3_nhis_check',
    category: 'Certification',
    shortDescription:
      'Final Earth clearance test: 30s single-leg eyes-closed balance & 10-minute stand pulse check.',
    setsCount: 3,
    repsPerSetLabel: '3 trials (30s) + 10m stand test',
    durationMinutes: 15,
    equipment: ['Stopwatch / Timer', 'Pulse Oximeter / BP Cuff', 'Spotter Stand'],
    movementCue: 'Stand tall on 1 leg · Close eyes cleanly · Hold 30s without step-out',
    stepByStep: [
      'Position near spotter rail, place hands on hips, and lift one foot clear of the floor.',
      'Close eyes and hold unipedal balance cleanly for 30 seconds across 3 benchmark trials.',
      'Complete the 10-minute motionless stand test while recording resting vs standing HR.',
      'Confirm pulse delta ≤ 15 bpm and 30s balance pass for full flight clearance.',
    ],
    postureReminders: [
      'Keep pelvis level—avoid hiking the lifted hip.',
      'Relax toes inside shoe; balance through midfoot tripod.',
      'Signal spotter immediately if dizzy during 10-minute stand test.',
    ],
    clinicalRationale:
      'Benchmarks astronaut post-flight equilibrium and baroreflex tolerance directly against HealthData.gov NHIS terrestrial population norms.',
    checklist: [
      { id: 'prep', label: 'Record supine baseline HR & BP prior to stand test', kind: 'prep' },
      { id: 'set_1', label: 'Trial 1: 30s Unipedal Eyes-Closed Balance', kind: 'set', setNumber: 1 },
      { id: 'set_2', label: 'Trial 2: 30s Unipedal Eyes-Closed Balance', kind: 'set', setNumber: 2 },
      { id: 'set_3', label: 'Trial 3: 30s Balance + 10-Min Motionless Stand Check', kind: 'set', setNumber: 3 },
      { id: 'finish', label: 'Certify NHIS Earth Readiness Clearance', kind: 'finish' },
    ],
  },
};
