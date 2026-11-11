// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Pau Aliagas <linuxnow@gmail.com>
// Run: node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { stampFor, tarReproducible } from './reproducible.mjs';

const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');

test('SOURCE_DATE_EPOCH is the stamp, and a checkout without git is the epoch, never the clock', () => {
  assert.equal(stampFor('/nonexistent', { SOURCE_DATE_EPOCH: '86400' }), '1970-01-02T00:00:00.000Z');
  assert.equal(stampFor('/nonexistent', {}), '1970-01-01T00:00:00.000Z');
});

test('the stamp of a checkout is its HEAD commit time, the same on every call', () => {
  const d = mkdtempSync(join(tmpdir(), 'stamp-'));
  const env = { ...process.env, GIT_AUTHOR_DATE: '2026-01-02T03:04:05Z', GIT_COMMITTER_DATE: '2026-01-02T03:04:05Z' };
  const g = (...a) => execFileSync('git', ['-C', d, '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...a], { env });
  g('init', '-q'); writeFileSync(join(d, 'a'), 'x'); g('add', 'a'); g('commit', '-q', '-m', 'a');
  assert.equal(stampFor(d, {}), '2026-01-02T03:04:05.000Z');
  assert.equal(stampFor(d, {}), stampFor(d, {}));
});

test('two tarballs of one tree built at different times are byte-identical', () => {
  const d = mkdtempSync(join(tmpdir(), 'tar-'));
  const tree = join(d, 'tree'); mkdirSync(join(tree, 'public'), { recursive: true });
  writeFileSync(join(tree, 'public', 'index.html'), '<p>x</p>'); writeFileSync(join(tree, 'meta.json'), '{}');
  const stamp = '2026-01-02T03:04:05.000Z';
  tarReproducible(join(d, 'a.tar.gz'), tree, ['meta.json', 'public'], stamp);
  const later = new Date(Date.now() + 5000);
  for (const f of ['meta.json', 'public', 'public/index.html']) utimesSync(join(tree, f), later, later);
  tarReproducible(join(d, 'b.tar.gz'), tree, ['meta.json', 'public'], stamp);
  assert.equal(sha(join(d, 'a.tar.gz')), sha(join(d, 'b.tar.gz')));
});
