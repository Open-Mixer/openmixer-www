// SPDX-License-Identifier: GPL-3.0-or-later
// check-site-public.sh judges the built site with the public repository checks the Pages repository runs on it
// (Open-Mixer/.github's private-refs-check and public-layout-check), before anything is deployed: a site with a
// finding is red and the finding is shown; a clean site is green; a checker that cannot be found or run is red, never
// a pass; only the site is judged, as tracked files, with nothing of the Pages repository around it.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-site-public.sh');

// a checkout of the shared checks whose two check.sh files flag any tracked file that holds the word FORBIDDEN (and
// the folder notes/ for the layout check), and record the files they were shown
function rig(files) {
  const root = mkdtempSync(join(tmpdir(), 'site-public-'));
  const dot = join(root, 'dotgithub');
  for (const [name, rule] of [['private-refs-check', 'grep -l FORBIDDEN'], ['public-layout-check', 'grep -E "(^|/)notes/"']]) {
    const dir = join(dot, '.github/actions', name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'check.sh'), `#!/bin/bash
[ "$1" = --self-test ] && exit 0
cd "$1" || exit 2
git ls-files >> "${root}/${name}.seen"
hits=$(git ls-files -z | ${name === 'private-refs-check' ? 'xargs -0 ' + rule : 'tr "\\\\0" "\\\\n" | ' + rule} || true)
[ -z "$hits" ] || { echo "${name}: $hits"; exit 1; }
`);
    chmodSync(join(dir, 'check.sh'), 0o755);
  }
  const site = join(root, 'site');
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(site, path)), { recursive: true });
    writeFileSync(join(site, path), body);
  }
  return { root, dot, site };
}
const run = (site, env) => spawnSync('bash', [script, site], { encoding: 'utf8', env: { ...process.env, ...env } });

test('a clean site is green, and every file of it is judged', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n', 'docs/a/index.html': '<p>a</p>\n' });
  const res = run(r.site, { OMX_DOTGITHUB: r.dot });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(spawnSync('cat', [join(r.root, 'private-refs-check.seen')], { encoding: 'utf8' }).stdout, /docs\/a\/index\.html/);
});

test('a page pointing into a private repository is red and named', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n', 'api-docs/x.html': 'Defined in FORBIDDEN/src/x.ts\n' });
  const res = run(r.site, { OMX_DOTGITHUB: r.dot });
  assert.notEqual(res.status, 0);
  assert.match(res.stdout + res.stderr, /api-docs\/x\.html/);
});

test('a folder of notes is red and named', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n', 'notes/a/index.html': '<p>n</p>\n' });
  const res = run(r.site, { OMX_DOTGITHUB: r.dot });
  assert.notEqual(res.status, 0);
  assert.match(res.stdout + res.stderr, /notes\//);
});

test('without the shared checks it is red, never a pass', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n' });
  const res = run(r.site, { OMX_DOTGITHUB: join(r.root, 'nowhere') });
  assert.notEqual(res.status, 0);
  assert.match(res.stdout + res.stderr, /shared checks/);
});

test('no built site is red', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n' });
  const res = run(join(r.root, 'nosite'), { OMX_DOTGITHUB: r.dot });
  assert.notEqual(res.status, 0);
});

// report-only (CHECK_SITE_REPORT_ONLY=1), until the docs tree is clean: the findings are shown and counted, the step
// passes so the deploys go on; a checker that cannot run is still red
test('report-only: the findings shown and counted, exit 0', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n', 'api-docs/x.html': 'Defined in FORBIDDEN/src/x.ts\n', 'notes/a.html': 'n\n' });
  const res = run(r.site, { OMX_DOTGITHUB: r.dot, CHECK_SITE_REPORT_ONLY: '1' });
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(res.stdout + res.stderr, /api-docs\/x\.html/);
  assert.match(res.stdout + res.stderr, /REPORT-ONLY: the built site fails private-refs-check, public-layout-check/);
});

test('report-only: a checker that cannot run is still red', () => {
  const r = rig({ 'index.html': '<p>hello</p>\n' });
  const res = run(r.site, { OMX_DOTGITHUB: join(r.root, 'nowhere'), CHECK_SITE_REPORT_ONLY: '1' });
  assert.notEqual(res.status, 0);
});
