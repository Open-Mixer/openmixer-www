// SPDX-License-Identifier: GPL-3.0-or-later
// A row's provenance, as the console serves it, can name the machine a figure was measured on and the private design
// note that holds the measurement. The REST reference the site publishes keeps the facts of a provenance string (what
// was measured, on which CPU, when, at which rates) and drops the pointers: the host, the source note, a source path.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicProvenance, publicSample } from './public-provenance.mjs';

const SEED = 'rt-cost-seed: status=measured host=ref-desk cpu=Intel(R) Core(TM) Ultra 9 275HX measuredAt=2026-10-06 rates=96000,192000 quanta=128,256,512 p95 source=docs/design/notes/2026-10-06-rt-envelope-new-kinds/grid.json';

test('a measurement keeps its facts and loses the host and the source note', () => {
  assert.equal(publicProvenance(SEED), 'rt-cost-seed: status=measured cpu=Intel(R) Core(TM) Ultra 9 275HX measuredAt=2026-10-06 rates=96000,192000 quanta=128,256,512 p95');
});

test('a source path becomes the package it is in', () => {
  assert.equal(publicProvenance('RT_HARD_TARGET (packages/core/src/rt-hard-target.ts)'), 'RT_HARD_TARGET (core)');
});

test('a string with no pointer is left as it is', () => {
  assert.equal(publicProvenance('declared default'), 'declared default');
});

test('a sample: every provenance string made public, nothing else touched', () => {
  const sample = { value: 3, provenance: { 'capacity.W.maxOut': [SEED, 'declared'], 'status.target': ['RT_HARD_TARGET (packages/core/src/rt-hard-target.ts)'] } };
  const out = publicSample(sample);
  assert.equal(out.value, 3);
  assert.doesNotMatch(JSON.stringify(out), /host=|source=|packages\//);
  assert.deepEqual(out.provenance['capacity.W.maxOut'][1], 'declared');
  assert.match(JSON.stringify(sample), /host=ref-desk/, 'the input is not changed');
  assert.equal(publicSample(null), null);
});
