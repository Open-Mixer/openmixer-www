// SPDX-License-Identifier: GPL-3.0-or-later
// The shipped plugins' pages: the committed data and pictures agree, and the check reds each way they can part.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { DATA, IMAGES, verify } from './omx-plugin-pages.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** A copy of the data and the pictures, to break. */
function copy() {
  const dir = mkdtempSync(join(tmpdir(), 'omx-plugin-pages-'));
  mkdirSync(dirname(join(dir, DATA)), { recursive: true });
  cpSync(join(ROOT, DATA), join(dir, DATA));
  cpSync(join(ROOT, IMAGES), join(dir, IMAGES), { recursive: true });
  return dir;
}

test('every shipped plugin has its picture, of the size its data says, and a section with a control', () => {
  assert.deepEqual(verify(ROOT), []);
  const { plugins, source } = JSON.parse(readFileSync(join(ROOT, DATA), 'utf8'));
  assert.ok(plugins.length >= 30, `${plugins.length} plugins`);
  assert.match(source.commit, /^[0-9a-f]{40}$/);
});

test('a missing picture, a picture of another size and a picture of no plugin are each refused', () => {
  const dir = copy();
  try {
    const { plugins } = JSON.parse(readFileSync(join(dir, DATA), 'utf8'));
    const [a, b] = plugins;
    rmSync(join(dir, 'public', a.image.file));
    cpSync(join(ROOT, 'public', a.image.file), join(dir, IMAGES, 'omx-nothing.png'));
    cpSync(join(ROOT, 'public', a.image.file), join(dir, 'public', b.image.file));
    const bad = verify(dir);
    assert.ok(bad.some((s) => s.startsWith(`${a.stem}: `) && s.includes('missing')), bad.join('\n'));
    assert.notEqual(`${a.image.width}x${a.image.height}`, `${b.image.width}x${b.image.height}`, 'the swap must change the size');
    assert.ok(bad.some((s) => s.startsWith(`${b.stem}: the picture is`)), bad.join('\n'));
    assert.ok(bad.some((s) => s.includes('omx-nothing.png')), bad.join('\n'));
    const data = JSON.parse(readFileSync(join(dir, DATA), 'utf8'));
    data.plugins[2].sections = [];
    writeFileSync(join(dir, DATA), JSON.stringify(data));
    assert.ok(verify(dir).some((s) => s === `${data.plugins[2].stem}: no section with a control`));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
