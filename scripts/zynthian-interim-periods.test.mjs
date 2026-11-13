// SPDX-License-Identifier: GPL-3.0-or-later
// Proves the tables by period length copy the matrix reading as it is, order the periods longest first, keep an
// unmeasured cell and a missing safe minimum as such, and refuse a cell whose run is absent or has other periods;
// and that the committed data is what the page states. Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { periodTables } from './zynthian-interim-periods.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cell = (id, frames, hosts, extra = {}) => ({ id, frames, clean: true, sub_ms: false, xruns: 0, hosts, ...extra });
const run = (id, periods) => ({ id, jack: { periods } });
const matrix = () => ({
  n2: {
    rates: [48000, 96000],
    rows: [2.67, 10.67],
    cells: {
      10.67: { 48000: cell('a', 512, { H2: { ok: 3, clean: 3, xruns: 0 }, H1: { ok: 2, clean: 2, xruns: 0 } }) },
      2.67: {
        48000: cell('b', 128, { H4: { ok: 4, clean: 3, xruns: 2 } }, { clean: false, xruns: 2 }),
        96000: cell('c', 256, { H2: { ok: 1, clean: 1, xruns: 0 } }),
      },
    },
    safe: { 48000: 10.67 },
  },
});
const runs = () => [run('a', 2), run('b', 2), run('c', 2)];

test('a table per periods value, the longest period first, the cells as read', () => {
  const [table, ...rest] = periodTables(matrix(), runs());
  assert.equal(rest.length, 0);
  assert.equal(table.periods, 2);
  assert.deepEqual(table.rates, [48000, 96000]);
  assert.deepEqual(table.rows.map((r) => r.ms), [10.67, 2.67]);
  assert.deepEqual(table.rows[1].cells[0], {
    rate: 48000, measured: true, run: 'b', frames: 128, clean: false, sub_ms: false, xruns: 2,
    hosts: [{ host: 'H4', ok: 4, clean: 3, xruns: 2 }],
  });
  assert.deepEqual(table.rows[0].cells[0].hosts.map((h) => h.host), ['H1', 'H2']);
});

test('a cell no run measured stays unmeasured, a rate with no safe minimum says none', () => {
  const [table] = periodTables(matrix(), runs());
  assert.deepEqual(table.rows[0].cells[1], { rate: 96000, measured: false });
  assert.deepEqual(table.safe, [{ rate: 48000, ms: 10.67 }, { rate: 96000, ms: null }]);
});

test('a cell whose run is not given is refused', () => {
  assert.throws(() => periodTables(matrix(), runs().slice(0, 2)), /run c is not among --runs/);
});

test('a cell whose run has other periods is refused', () => {
  assert.throws(() => periodTables(matrix(), [run('a', 2), run('b', 3), run('c', 2)]), /b: the run has 3 periods, the table 2/);
});

test('a table name that is no periods value is refused', () => {
  assert.throws(() => periodTables({ fast: matrix().n2 }, runs()), /fast: not a periods value/);
});

test('the committed data: hardware tier, every measured cell names a run among its sources', () => {
  const data = JSON.parse(readFileSync(join(root, 'app/data/zynthian-interim-periods.json'), 'utf8'));
  assert.equal(data.tier, 'hardware');
  assert.ok(data.interface && data.machine.model);
  const ids = new Set(data.sources.map((s) => s.file.replace(/\.json$/, '')));
  const cells = data.tables.flatMap((t) => t.rows.flatMap((r) => r.cells)).filter((c) => c.measured);
  assert.ok(cells.length > 0);
  for (const c of cells) {
    assert.ok(ids.has(c.run), `${c.run} is not among the sources`);
    assert.equal(c.clean, c.xruns === 0, `${c.run}: clean and its xruns disagree`);
    assert.equal(c.xruns, c.hosts.reduce((n, h) => n + h.xruns, 0), `${c.run}: the hosts' xruns do not sum to the cell's`);
  }
  for (const s of data.sources) assert.match(s.sha256, /^[0-9a-f]{64}$/);
});
