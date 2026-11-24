#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Places the released schema files deploy/schema-sources.json pins under public/schema/, at build time. Each source is
// one published npm package at one version: its tarball is fetched from the registry, its sha512 must equal the
// pinned integrity (a mismatch refuses the whole build), and each file the list names is copied from the tarball's
// package/ tree to public/schema/<at>. Nothing is committed: public/schema/ is generated, and this script is the only
// writer of it.
//
// A package that DECLARES a schema id under the base (a JSON file's top-level `$id`) which no pinned file serves is
// refused: every id we publish must resolve, so a release that adds a schema needs its row here before the site builds.
//
// Usage: node scripts/fetch-schemas.mjs [--root <dir, default public>] [--sources <file, default deploy/schema-sources.json>]
// Exit 0 every pinned file is placed; 1 a refusal (integrity, a missing file, a failed fetch); 2 usage.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

// The registry tarball of a scoped or plain package: <registry>/<name>/-/<last segment>-<version>.tgz
export function tarballUrl(source, registry = 'https://registry.npmjs.org') {
  const last = source.package.split('/').pop();
  return `${registry}/${source.package}/-/${last}-${source.version}.tgz`;
}

export function integrityOf(buf) {
  return 'sha512-' + createHash('sha512').update(buf).digest('base64');
}

// Every top-level `$id` under `base` that a JSON file of the unpacked package declares, as { file, id }.
export function declaredIds(dir, base) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.json')) {
        let doc;
        try {
          doc = JSON.parse(readFileSync(p, 'utf8'));
        } catch {
          continue; // not JSON: it declares nothing
        }
        if (typeof doc?.$id === 'string' && doc.$id.startsWith(base)) out.push({ file: relative(dir, p).split(sep).join('/'), id: doc.$id });
      }
    }
  };
  walk(dir);
  return out.sort((a, b) => (a.file < b.file ? -1 : 1));
}

async function defaultFetch(source) {
  const res = await fetch(tarballUrl(source));
  if (!res.ok) throw new Error(`${source.package}@${source.version}: registry answered ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Fetch, verify and place every pinned file. Throws on the first refusal, after placing nothing from a failed source.
export async function fetchSchemas({ sources, site, fetchTarball = defaultFetch }) {
  const schemaDir = join(site, 'schema');
  const work = mkdtempSync(join(tmpdir(), 'fetch-schemas-'));
  try {
    const staged = [];
    for (const src of sources.sources ?? []) {
      const buf = await fetchTarball(src);
      const got = integrityOf(buf);
      if (got !== src.integrity)
        throw new Error(`${src.package}@${src.version}: integrity ${got} is not the pinned ${src.integrity}; refused`);
      const tgz = join(work, `${src.repo}.tgz`);
      const dir = join(work, src.repo);
      mkdirSync(dir, { recursive: true });
      writeFileSync(tgz, buf);
      // argv, no shell: the tarball's names are never interpreted
      execFileSync('tar', ['-xzf', tgz, '-C', dir], { stdio: 'pipe' });
      for (const f of src.files ?? []) {
        const from = join(dir, 'package', f.from);
        if (!existsSync(from)) throw new Error(`${src.package}@${src.version}: no ${f.from} in the package; refused`);
        staged.push({ from, to: join(schemaDir, f.at) });
      }
      const pinned = new Set((src.files ?? []).map((f) => f.id));
      for (const { file, id } of declaredIds(join(dir, 'package'), sources.base))
        if (!pinned.has(id)) throw new Error(`${src.package}@${src.version}: ${file} declares ${id}, which no pinned file serves; refused`);
    }
    if (staged.length === 0) throw new Error('the sources file pins no file: nothing to place');
    rmSync(schemaDir, { recursive: true, force: true });
    for (const { from, to } of staged) {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
    }
    return staged.map((s) => s.to);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function args(argv) {
  const o = { root: join(repoRoot, 'public'), sources: join(repoRoot, 'deploy', 'schema-sources.json') };
  for (let i = 0; i < argv.length; i += 2) {
    if (argv[i] === '--root' && argv[i + 1]) o.root = resolve(argv[i + 1]);
    else if (argv[i] === '--sources' && argv[i + 1]) o.sources = resolve(argv[i + 1]);
    else return null;
  }
  return o;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const o = args(process.argv.slice(2));
  if (!o) {
    console.error('usage: fetch-schemas.mjs [--root <dir>] [--sources <file>]');
    process.exit(2);
  }
  const sources = JSON.parse(readFileSync(o.sources, 'utf8'));
  try {
    const placed = await fetchSchemas({ sources, site: o.root });
    for (const p of placed) console.log(`fetch-schemas: placed ${p.slice(o.root.length + 1).split(sep).join('/')}`);
  } catch (e) {
    console.error(`fetch-schemas: ${e.message}`);
    process.exit(1);
  }
}
