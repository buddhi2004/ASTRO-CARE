import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import catalogRaw from '../../data/openAnatomyCatalog.json' with { type: 'json' };
import {
  ATLAS_CAMERA_FOV,
  ATLAS_LAYER_PRESETS,
  MODE_A_DEMO_STORIES,
  MODE_B_DEMO_STORIES,
  getAtlasCameraTarget,
  getContextOcclusionOpacity,
  getFullBodyCameraVectors,
  resolveMeshHighlightRole,
} from './atlasCameraAndMaterials.ts';

const VALID_KEYS = new Set((catalogRaw as Array<{ key: string }>).map((e) => e.key));

describe('atlasCameraAndMaterials', () => {
  it('frames full-body male and female figures to fill ~82-90% of viewport height', () => {
    const halfFovRad = ((ATLAS_CAMERA_FOV / 2) * Math.PI) / 180;
    const tanHalf = Math.tan(halfFovRad);

    const maleCam = getFullBodyCameraVectors('front', 'male');
    const maleDist = Math.hypot(
      maleCam.position[0] - maleCam.target[0],
      maleCam.position[1] - maleCam.target[1],
      maleCam.position[2] - maleCam.target[2]
    );
    const maleViewHeight = 2 * maleDist * tanHalf;
    const maleOccupancy = 1.719 / maleViewHeight;
    assert.ok(
      maleOccupancy >= 0.82 && maleOccupancy <= 0.90,
      `Expected male viewport occupancy 82-90%, got ${(maleOccupancy * 100).toFixed(1)}%`
    );

    const femaleCam = getFullBodyCameraVectors('front', 'female');
    const femaleDist = Math.hypot(
      femaleCam.position[0] - femaleCam.target[0],
      femaleCam.position[1] - femaleCam.target[1],
      femaleCam.position[2] - femaleCam.target[2]
    );
    const femaleViewHeight = 2 * femaleDist * tanHalf;
    const femaleOccupancy = 1.62 / femaleViewHeight;
    assert.ok(
      femaleOccupancy >= 0.82 && femaleOccupancy <= 0.90,
      `Expected female viewport occupancy 82-90%, got ${(femaleOccupancy * 100).toFixed(1)}%`
    );
  });

  it('zooms to distinct anatomical regions when focusRegion is enabled', () => {
    const full = getAtlasCameraTarget('front', 'male', 'heart', false);
    const heart = getAtlasCameraTarget('front', 'male', 'heart', true);
    const ijv = getAtlasCameraTarget('front', 'male', 'veins_thorax', true);
    const sans = getAtlasCameraTarget('front', 'male', 'eye_l', true);
    const calf = getAtlasCameraTarget('back', 'male', 'calf_l', true);

    assert.ok(sans.target[1] > ijv.target[1], 'Eyes target must sit above cervical IJV window');
    assert.ok(ijv.target[1] > heart.target[1], 'Cervical IJV window must sit above heart');
    assert.ok(heart.target[1] > calf.target[1], 'Heart must sit above calves');

    const fullDist = Math.hypot(
      full.position[0] - full.target[0],
      full.position[1] - full.target[1],
      full.position[2] - full.target[2]
    );
    const sansDist = Math.hypot(
      sans.position[0] - sans.target[0],
      sans.position[1] - sans.target[1],
      sans.position[2] - sans.target[2]
    );
    assert.ok(sansDist < fullDist * 0.25, 'SANS orbit zoom should be dramatically closer than full body');
    assert.ok(calf.position[2] < calf.target[2], 'Posterior calf focus should position camera behind (-Z)');
  });

  it('applies targeted context occlusion ghosting only to occluding bones/muscles', () => {
    assert.ok(
      (getContextOcclusionOpacity('skull', 'eye_l', ['cranial_nerves'], false) ?? 1) < 0.25,
      'Skull should ghost transparently when inspecting eyes/optic nerves'
    );
    assert.equal(
      getContextOcclusionOpacity('femur_l', 'eye_l', ['cranial_nerves'], false),
      null,
      'Femur should not be ghosted when inspecting eyes'
    );
    assert.ok(
      (getContextOcclusionOpacity('sternum', 'heart', ['aorta'], false) ?? 1) < 0.25,
      'Sternum should ghost transparently when inspecting the heart'
    );
    assert.equal(
      getContextOcclusionOpacity('skull', 'heart', ['aorta'], false),
      null,
      'Skull should remain solid when inspecting the heart'
    );
  });

  it('highlights only selected/accented structures rather than flooding the whole body', () => {
    assert.equal(
      resolveMeshHighlightRole('heart', 'heart', null, ['heart', 'aorta']),
      'selected'
    );
    assert.equal(
      resolveMeshHighlightRole('aorta', 'heart', null, ['heart', 'aorta']),
      'accent'
    );
    assert.equal(
      resolveMeshHighlightRole('femur_l', 'heart', null, ['heart', 'aorta']),
      'none'
    );
    assert.equal(
      resolveMeshHighlightRole('ribs_l', 'heart', 'ribs_l', ['heart', 'aorta']),
      'hovered'
    );
  });

  it('references only valid GLB catalog keys across all Mode A/B demonstration stories and presets', () => {
    assert.ok(ATLAS_LAYER_PRESETS.length >= 4);
    assert.ok(MODE_A_DEMO_STORIES.length >= 5);
    assert.ok(MODE_B_DEMO_STORIES.length >= 5);

    for (const story of [...MODE_A_DEMO_STORIES, ...MODE_B_DEMO_STORIES]) {
      assert.ok(VALID_KEYS.has(story.primaryKey), `Invalid primaryKey: ${story.primaryKey}`);
      for (const k of story.accentKeys) {
        assert.ok(VALID_KEYS.has(k), `Invalid accentKey: ${k}`);
      }
    }
  });
});
