// The abstractions page is published: its data names each abstraction and says what it is for, and points nowhere
// into the console's source tree. No section label names a package directory, no item carries a path or a file, no
// name is a file name, and no summary cites an issue of the console's repository or one of its files. With the shared
// checks at hand (OMX_DOTGITHUB, as the site gate has them), private-refs-check reads the data as the gate would.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const data = JSON.parse(readFileSync(new URL('../app/data/abstractions.json', import.meta.url), 'utf8'));
const groups = [...data.curated, ...data.generated];
const items = groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.label })));
const SOURCE_FILE = /[\w-]+\.(vue|ts|tsx|mts|mjs|js|c|h)\b/;
const ISSUE = /\b[\w.-]+#\d+\b/;

test('no section label names a package directory', () => {
  for (const g of groups) assert.doesNotMatch(g.label, /packages\//, `label "${g.label}"`);
});

test('no item carries a path or a file', () => {
  for (const it of items) {
    assert.ok(!it.path, `${it.group} / ${it.name} has path ${it.path}`);
    assert.ok(!it.file, `${it.group} / ${it.name} has file ${it.file}`);
  }
});

test('no name is a file name or a path', () => {
  for (const it of items) {
    assert.doesNotMatch(it.name, SOURCE_FILE, `${it.group} / ${it.name}`);
    assert.doesNotMatch(it.name, /\//, `${it.group} / ${it.name}`);
  }
});

test('no summary cites an issue or a source file', () => {
  for (const it of [...items, ...groups]) {
    if (!it.summary) continue;
    assert.doesNotMatch(it.summary, ISSUE, `${it.group ?? it.label} / ${it.name ?? ''}: ${it.summary}`);
    assert.doesNotMatch(it.summary, SOURCE_FILE, `${it.group ?? it.label} / ${it.name ?? ''}: ${it.summary}`);
  }
});

test('private-refs-check reads the data clean (when the shared checks are at hand)', (t) => {
  const dot = process.env.OMX_DOTGITHUB;
  const check = dot && join(dot, '.github/actions/private-refs-check/check.sh');
  if (!check || !existsSync(check)) return t.skip('OMX_DOTGITHUB does not name a checkout of the shared checks');
  const dir = mkdtempSync(join(tmpdir(), 'abstractions-'));
  try {
    writeFileSync(join(dir, 'abstractions.json'), JSON.stringify(data, null, 2));
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', '-A'], { cwd: dir });
    const r = spawnSync(check, [dir], { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout + r.stderr);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
