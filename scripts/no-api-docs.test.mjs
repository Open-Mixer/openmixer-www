// SPDX-License-Identifier: GPL-3.0-or-later
// The typedoc tree is not on the public site: it rendered the console's TypeScript comments verbatim, an internal
// reference written for its own developers, citing private specifications; the public API is the REST reference and
// openapi.json (#26, which also retires the old api-docs stubs of #21). No tree is committed under public/, nothing of
// the site links or routes to /api-docs, and typedoc's pass writes only the JSON model the abstractions page reads.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function files(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(vue|ts|mjs|json|md|yml)$/.test(n) && !n.endsWith('.test.mjs')) out.push(p);
  }
  return out;
}

test('no typedoc tree is committed under public/', () => {
  assert.equal(existsSync(join(root, 'public/api-docs')), false);
});

test('nothing of the site links or routes to /api-docs', () => {
  const hits = [...files(join(root, 'app')), ...files(join(root, 'scripts')), join(root, 'nuxt.config.ts')]
    .flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => [f.slice(root.length + 1), i + 1, l]))
    .filter(([, , l]) => /\/api-docs\b/.test(l))
    .map(([f, n]) => `${f}:${n}`);
  assert.deepEqual(hits, []);
});

test('the typedoc pass writes its HTML nowhere under public/', () => {
  const src = readFileSync(join(root, 'scripts/gen-typedoc.mjs'), 'utf8');
  assert.doesNotMatch(src, /resolve\(wwwRoot, 'public/);
  assert.match(src, /'--json', jsonOut/);
});
