// SPDX-License-Identifier: GPL-3.0-or-later
// Proves the deploy leaves the package paths alone: rpm/, deb/ and staging/ (the staging
// channel of a release wave) are never the site's, whatever the allow-list or the build say.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = join(dirname(fileURLToPath(import.meta.url)), 'deploy-root.sh');
const PACKAGE_PATHS = ['rpm', 'deb', 'staging'];

// A copy of the script beside its own allow-list, a built site and a pages checkout that
// already serves one file under each package path.
function rig(owns, siteNames) {
  const root = mkdtempSync(join(tmpdir(), 'deploy-root-'));
  mkdirSync(join(root, 'tool/scripts'), { recursive: true });
  mkdirSync(join(root, 'tool/deploy'));
  cpSync(script, join(root, 'tool/scripts/deploy-root.sh'));
  writeFileSync(join(root, 'tool/deploy/site-owns.txt'), owns.join('\n') + '\n');
  const site = join(root, 'site');
  mkdirSync(site);
  for (const name of siteNames) {
    if (name.endsWith('.html')) writeFileSync(join(site, name), `<p>${name}</p>\n`);
    else { mkdirSync(join(site, name)); writeFileSync(join(site, name, 'page.html'), 'new\n'); }
  }
  const pages = join(root, 'pages');
  mkdirSync(pages);
  const git = (...args) => assert.equal(spawnSync('git', ['-C', pages, ...args]).status, 0, args.join(' '));
  git('init', '-q');
  for (const path of PACKAGE_PATHS) {
    mkdirSync(join(pages, path, 'fedora'), { recursive: true });
    writeFileSync(join(pages, path, 'fedora', 'served.rpm'), `${path} package\n`);
  }
  writeFileSync(join(pages, 'index.html'), '<p>old</p>\n');
  git('add', '-A');
  git('-c', 'user.name=t', '-c', 'user.email=t@example.org', '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'start');
  const run = () => spawnSync('bash', [join(root, 'tool/scripts/deploy-root.sh'), site, pages], { encoding: 'utf8' });
  return { pages, run };
}

const served = (pages, path) => join(pages, path, 'fedora', 'served.rpm');

for (const path of PACKAGE_PATHS) {
  test(`an allow-list that names ${path} is refused and ${path}/ keeps its file`, () => {
    const { pages, run } = rig(['index.html', path], ['index.html', path]);
    const result = run();
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, new RegExp(`allow-list names a protected path: ${path}`));
    assert.equal(readFileSync(served(pages, path), 'utf8'), `${path} package\n`);
  });
}

test('a plain deploy replaces the site and leaves every package path as it was', () => {
  const { pages, run } = rig(['index.html', 'docs'], ['index.html', 'docs']);
  const result = run();
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /dry run, nothing committed or pushed/);
  assert.equal(readFileSync(join(pages, 'index.html'), 'utf8'), '<p>index.html</p>\n');
  assert.ok(existsSync(join(pages, 'docs', 'page.html')));
  for (const path of PACKAGE_PATHS) assert.equal(readFileSync(served(pages, path), 'utf8'), `${path} package\n`);
});

test('the last check before the commit names staging beside rpm and deb', () => {
  const text = readFileSync(script, 'utf8');
  const line = text.split('\n').find((l) => l.includes('diff --cached --quiet -- '));
  assert.ok(line, 'the check exists');
  for (const path of PACKAGE_PATHS) assert.match(line, new RegExp(`\\s${path}(\\s|$)`), path);
});
