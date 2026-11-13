// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Pau Aliagas <linuxnow@gmail.com>
// The Zynthian docs page carries the seven acceptance shots of 2026-11-13, each where its text is (queue row 12):
// app/data/zynthian-shots.json lists s1..s7; a shot taken is a file under public/docs/zynthian/shots/, one still to come
// (s1 after plugin-qualify 0.20.5, s4 after zynthian-ui#30) is a marked slot. Every shot has its words in English and
// Catalan, the page places each once, and the four older pictures it borrowed from a technical note are gone from it.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const MANIFEST = 'app/data/zynthian-shots.json';
const PAGE = 'app/pages/docs/zynthian.vue';
const IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

const shots = () => JSON.parse(read(MANIFEST)).shots;

test('the page lists the seven shots s1..s7, s1 and s4 still to come', () => {
  assert.ok(existsSync(join(ROOT, MANIFEST)), `${MANIFEST} is there`);
  const s = shots();
  assert.deepEqual(s.map((x) => x.id), IDS);
  assert.deepEqual(s.filter((x) => x.file === null).map((x) => x.id), ['s1', 's4'], 's1 and s4 are slots');
  for (const x of s.filter((x) => x.file === null)) assert.ok(x.after, `${x.id} says what it waits for`);
});

test('each shot taken is a file the site serves', () => {
  for (const x of shots().filter((x) => x.file !== null)) {
    assert.match(x.file, /^\/docs\/zynthian\/shots\/s[0-9]-[a-z0-9-]+\.(png|webp)$/, `${x.id}: ${x.file}`);
    assert.ok(existsSync(join(ROOT, 'public', x.file)), `${x.id}: public${x.file} is there`);
  }
});

test('every shot has its words in English and Catalan', () => {
  for (const lang of ['en', 'ca']) {
    const d = JSON.parse(read(`i18n/locales/${lang}/docsZynthian.json`)).docsZynthian;
    for (const x of shots()) {
      const w = d.shots?.[x.key];
      assert.ok(w && typeof w.caption === 'string' && w.caption.length > 0, `${lang}: shots.${x.key}.caption`);
      assert.ok(typeof w.alt === 'string' && w.alt.length > 0, `${lang}: shots.${x.key}.alt`);
    }
  }
});

test('the page places each shot once, where its text is', () => {
  const page = read(PAGE);
  for (const id of IDS) {
    const n = page.match(new RegExp(`<ZynthianShot id="${id}"`, 'g'))?.length ?? 0;
    assert.equal(n, 1, `${id} is placed once`);
  }
  const at = (id) => page.indexOf(`<ZynthianShot id="${id}"`);
  const after = (id, key) => {
    const k = page.indexOf(key);
    assert.ok(k >= 0 && k < at(id), `${id} comes after ${key}`);
    const next = page.indexOf("t('docsZynthian.", k + key.length + 1);
    assert.ok(at(id) < page.indexOf('</section>', k), `${id} is in the section of ${key}`);
    return next;
  };
  after('s6', "t('docsZynthian.changes.p2')");
  after('s1', "t('docsZynthian.use.intro')");
  after('s2', "t('docsZynthian.use.intro')");
  after('s5', "t('docsZynthian.use.group.p1')");
  after('s3', "t('docsZynthian.use.strip.p1')");
  after('s7', "t('docsZynthian.use.restore.p1')");
  after('s4', "t('docsZynthian.languages.codes')");
});

test('the pictures borrowed from the technical note are gone from the page', () => {
  assert.doesNotMatch(read(PAGE), /from-a-plugin-file-to-a-page\/[a-z-]+\.png|\$\{SHOTS\}\//);
});
