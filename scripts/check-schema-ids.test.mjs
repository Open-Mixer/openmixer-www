// SPDX-License-Identifier: GPL-3.0-or-later
// Proves the schema-id check reads the sources file, names every id it is not served at, and passes only when each
// id is served as JSON at its own address. Run: node --test scripts/
// Red first: with an empty site the check names every id; once the files are served it is green.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check, namedIds } from './check-schema-ids.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const sources = JSON.parse(readFileSync(resolve(here, '..', 'deploy', 'schema-sources.json'), 'utf8'));

function site(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'schema-site-'));
  for (const [at, body] of Object.entries(files)) {
    const p = join(root, 'schema', at);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, body);
  }
  return root;
}

test('the sources name at least one id, each at its own address under the base', () => {
  const ids = namedIds(sources);
  assert.ok(ids.length >= 2, 'omx-contract names its schema and its travel shape');
  for (const { id, expect } of ids) assert.equal(id, expect);
});

test('an empty site names every id as not served', () => {
  const problems = check(site(), sources);
  assert.equal(problems.length, namedIds(sources).length);
  for (const p of problems) assert.match(p, /is not served/);
});

test('every named id served as JSON at its address is green', () => {
  const files = {};
  for (const { at, id } of namedIds(sources)) files[at] = JSON.stringify({ $id: id });
  assert.deepEqual(check(site(files), sources), []);
});

test('a served file that is not JSON is named', () => {
  const files = {};
  for (const { at } of namedIds(sources)) files[at] = '<html>';
  const problems = check(site(files), sources);
  assert.equal(problems.length, namedIds(sources).length);
  for (const p of problems) assert.match(p, /is not JSON/);
});

test('an id that does not sit at its own address is named, whatever is served', () => {
  const bad = structuredClone(sources);
  bad.sources[0].files[0].id = 'https://openmixer.org/schema/omx-contract/main/omx-contract.schema.json';
  const files = {};
  for (const { at, id } of namedIds(sources)) files[at] = JSON.stringify({ $id: id });
  const problems = check(site(files), bad);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /does not sit at its own address/);
});

test('a sources file that names no id is red, not an empty pass', () => {
  const problems = check(site(), { base: 'https://openmixer.org/schema/', sources: [] });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /names no schema id/);
});

test('a served file whose own $id is not its listed id is named (the 3.19.1 file says /main/)', () => {
  const files = {};
  for (const { at, id } of namedIds(sources)) files[at] = JSON.stringify({ $id: id });
  const first = namedIds(sources)[0];
  files[first.at] = JSON.stringify({ $id: 'https://openmixer.org/schema/omx-contract/main/omx-contract.schema.json' });
  const problems = check(site(files), sources);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /its own \$id/);
  assert.match(problems[0], new RegExp(first.id.replace(/[.]/g, '\\.')));
});

test('a served file with no $id at all is named too', () => {
  const files = {};
  for (const { at, id } of namedIds(sources)) files[at] = JSON.stringify({ $id: id });
  files[namedIds(sources)[1].at] = '{}';
  const problems = check(site(files), sources);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /its own \$id/);
});
