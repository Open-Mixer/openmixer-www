// SPDX-License-Identifier: GPL-3.0-or-later
// The technical notes are served at /technical-notes: a public repository holds no folder named notes
// (public-layout-check), and the site is one. No source of the site routes or links to /notes any more, and an old
// /notes address (English or Catalan) still lands on its page: 404.html carries the mapping, so nothing is written
// under a notes folder for it.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newAddress, withOldAddresses } from './old-addresses.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = /(?<=['"`(\[\s](?:\/ca)?)\/notes(?=[/'"`)\]\s]|$)/;

function files(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(vue|ts|mjs|json|md|yml)$/.test(n) && !n.endsWith('.test.mjs') && n !== 'old-addresses.mjs') out.push(p); // the mapping names the old address
  }
  return out;
}

test('no source routes or links to /notes', () => {
  const hits = [...files(join(root, 'app')), ...files(join(root, 'content')), ...files(join(root, 'scripts')), join(root, 'nuxt.config.ts')]
    .flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => [f.slice(root.length + 1), i + 1, l]))
    .filter(([, , l]) => ROUTE.test(l))
    .map(([f, n]) => `${f}:${n}`);
  assert.deepEqual(hits, []);
});

test('an old /notes address maps to its page under /technical-notes', () => {
  assert.equal(newAddress('/notes/pins-on-first-use/'), '/technical-notes/pins-on-first-use/');
  assert.equal(newAddress('/notes'), '/technical-notes');
  assert.equal(newAddress('/ca/notes/pins-on-first-use'), '/ca/technical-notes/pins-on-first-use');
  assert.equal(newAddress('/openmixer-www/notes/x/'), '/technical-notes/x/');
  assert.equal(newAddress('/notesy'), null);
  assert.equal(newAddress('/faq/'), null);
});

test('404.html carries the mapping, once, before anything else runs', () => {
  const page = '<!DOCTYPE html><html><head><title>404</title></head><body></body></html>';
  const out = withOldAddresses(page);
  assert.match(out, /<head><script data-old-addresses>[^<]*technical-notes[^<]*<\/script><title>/);
  assert.equal(withOldAddresses(out), out);
});
