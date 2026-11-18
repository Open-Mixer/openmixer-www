// SPDX-License-Identifier: GPL-3.0-or-later
// Proves the fetch places each pinned file at its address, refuses a tarball whose integrity is not the pinned one, and
// refuses a package that lacks a pinned file, without leaving a partial site. The tarballs are built here, offline.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchSchemas, integrityOf, tarballUrl } from './fetch-schemas.mjs';
import { check } from './check-schema-ids.mjs';

// a package tarball with the given files under package/
function packageTgz(files) {
  const root = mkdtempSync(join(tmpdir(), 'pkg-'));
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, 'package', rel);
    mkdirSync(join(p, '..'), { recursive: true });
    writeFileSync(p, body);
  }
  const tgz = join(root, 'pkg.tgz');
  execFileSync('tar', ['-czf', tgz, '-C', root, 'package']);
  return readFileSync(tgz);
}

const BODY = { 'schema/omx-contract.schema.json': '{"$id":"https://openmixer.org/schema/omx-contract/main/x"}', 'shapes/travel.schema.json': '{"t":1}' };

function sources(buf) {
  return {
    base: 'https://openmixer.org/schema/',
    sources: [
      {
        repo: 'omx-contract',
        package: '@openmixer/omx-contract',
        version: '9.9.9',
        integrity: integrityOf(buf),
        files: [
          { from: 'schema/omx-contract.schema.json', at: 'omx-contract/v3/omx-contract.schema.json', id: 'https://openmixer.org/schema/omx-contract/v3/omx-contract.schema.json' },
          { from: 'shapes/travel.schema.json', at: 'omx-contract/v3/shapes/travel.schema.json', id: 'https://openmixer.org/schema/omx-contract/v3/shapes/travel.schema.json' },
        ],
      },
    ],
  };
}

test('the tarball address is the registry form for a scoped package', () => {
  const s = { package: '@openmixer/omx-contract', version: '3.19.1' };
  assert.equal(tarballUrl(s), 'https://registry.npmjs.org/@openmixer/omx-contract/-/omx-contract-3.19.1.tgz');
});

test('a verified tarball places each pinned file where the check looks for it', async () => {
  const buf = packageTgz(BODY);
  const site = mkdtempSync(join(tmpdir(), 'site-'));
  const placed = await fetchSchemas({ sources: sources(buf), site, fetchTarball: async () => buf });
  assert.equal(placed.length, 2);
  assert.ok(existsSync(join(site, 'schema/omx-contract/v3/omx-contract.schema.json')));
  assert.ok(existsSync(join(site, 'schema/omx-contract/v3/shapes/travel.schema.json')));
  assert.deepEqual(check(site, sources(buf)), []);
});

test('a tarball whose integrity is not the pinned one is refused and places nothing', async () => {
  const buf = packageTgz(BODY);
  const other = packageTgz({ ...BODY, 'shapes/travel.schema.json': '{"t":2}' });
  const site = mkdtempSync(join(tmpdir(), 'site-'));
  await assert.rejects(
    fetchSchemas({ sources: sources(buf), site, fetchTarball: async () => other }),
    /integrity .* is not the pinned .*; refused/,
  );
  assert.equal(existsSync(join(site, 'schema')), false);
});

test('a package without a pinned file is refused and places nothing', async () => {
  const buf = packageTgz({ 'schema/omx-contract.schema.json': '{}' });
  const site = mkdtempSync(join(tmpdir(), 'site-'));
  await assert.rejects(
    fetchSchemas({ sources: sources(buf), site, fetchTarball: async () => buf }),
    /no shapes\/travel\.schema\.json in the package; refused/,
  );
  assert.equal(existsSync(join(site, 'schema')), false);
});

test('a sources file that pins no file is refused, not an empty site', async () => {
  const buf = packageTgz(BODY);
  const site = mkdtempSync(join(tmpdir(), 'site-'));
  const empty = { base: 'https://openmixer.org/schema/', sources: [{ repo: 'x', package: 'x', version: '1.0.0', integrity: integrityOf(buf), files: [] }] };
  await assert.rejects(fetchSchemas({ sources: empty, site, fetchTarball: async () => buf }), /pins no file/);
});
