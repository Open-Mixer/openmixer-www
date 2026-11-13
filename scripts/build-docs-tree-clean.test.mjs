// SPDX-License-Identifier: GPL-3.0-or-later
//
// The BUILD half of build-docs-tree.mjs needs nothing but Node, pnpm and git: the site reads the
// feature declarations from the openmixer checkout's source (openmixer#176), so the build installs
// and generates @freemixer/website alone. Building catalog's closure reached @freemixer/declarations,
// whose build runs the protocol generator and the omx-contract render and needs the -devel headers:
// a docs build failed on a runner without them (www-docs-pin run 43483010929).
//
// - static, always: the build installs @freemixer/website alone and runs no closure build.
// - the clean container, when OPENMIXER_SRC names an openmixer checkout and podman is there: in
//   fedora:44 with nodejs, npm, pnpm and git only (no C toolchain, no -devel package), the build
//   emits a docs tree with the manual in it. PUBLIC_GUARD_LIST names the private list, as for any build.
//
// Run: node --test scripts/build-docs-tree-clean.test.mjs
//      OPENMIXER_SRC=<checkout> PUBLIC_GUARD_LIST=<list> node --test scripts/build-docs-tree-clean.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const www = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = readFileSync(join(www, 'scripts/build-docs-tree.mjs'), 'utf8');

test('the docs build installs and generates @freemixer/website alone, with no closure build', () => {
  const filters = /const CLOSURE_FILTERS = \[([^\]]*)\]/.exec(script)?.[1] ?? '';
  assert.match(filters, /'--filter', '@freemixer\/website\.\.\.'/);
  assert.doesNotMatch(filters, /catalog|core|declarations/, `the install selects more than the website: ${filters}`);
  assert.doesNotMatch(script, /run\('pnpm', \['-r'[^\]]*'build'\]\)/, 'a closure build is still run');
});

const src = process.env.OPENMIXER_SRC;
const guard = process.env.PUBLIC_GUARD_LIST;
const podman = spawnSync('podman', ['--version']).status === 0;
const why = !src ? 'OPENMIXER_SRC is not set' : !guard ? 'PUBLIC_GUARD_LIST is not set' : !podman ? 'no podman' : '';

test('the docs build succeeds in a clean fedora:44 with no toolchain and no -devel package', { skip: why || false, timeout: 1_800_000 }, () => {
  const out = mkdtempSync(join(tmpdir(), 'docs-tree-clean-'));
  const pm = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8')).packageManager ?? 'pnpm@10';
  const inside = [
    'set -euo pipefail',
    'dnf -y -q install --setopt=install_weak_deps=False nodejs npm git-core >/dev/null',
    `npm install -g -s ${pm} >/dev/null`,
    // the point of the test: nothing that compiles C, no -devel header
    'for p in gcc gcc-c++ make pipewire-devel; do ! rpm -q "$p" >/dev/null 2>&1 || { echo "the image has $p"; exit 9; }; done',
    'cp -a /www-ro /www && cd /www',
    'OPENMIXER_SRC=/src PUBLIC_GUARD_LIST=/guard.json NODE_AUTH_TOKEN=unused node scripts/build-docs-tree.mjs --emit /out/tree.tar.gz',
  ].join('\n');
  const r = spawnSync('podman', ['run', '--rm', '-v', `${www}:/www-ro:ro,Z`, '-v', `${resolve(src)}:/src:ro,Z`,
    '-v', `${resolve(www, guard)}:/guard.json:ro,Z`, '-v', `${out}:/out:Z`, 'registry.fedoraproject.org/fedora:44', 'bash', '-c', inside],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  try {
    assert.equal(r.status, 0, `the clean build failed (rc ${r.status}):\n${(r.stdout + r.stderr).slice(-3000)}`);
    assert.ok(existsSync(join(out, 'tree.tar.gz')), 'no docs tree was emitted');
    const list = spawnSync('tar', ['-tzf', join(out, 'tree.tar.gz')], { encoding: 'utf8' }).stdout;
    assert.match(list, /docs\/manual\/index\.html/, 'the tree has no manual');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
