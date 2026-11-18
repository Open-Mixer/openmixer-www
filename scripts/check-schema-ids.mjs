#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Every schema id the owners name must resolve on this site. The ids are the ones in deploy/schema-sources.json
// (the released files, fetched at build time by scripts/fetch-schemas.mjs). A `$schema` or `$id` that names
// https://openmixer.org/schema/<path> resolves only if public/schema/<path> is in the generated site.
//
// Usage: node scripts/check-schema-ids.mjs [--root <dir, default public>] [--sources <file, default deploy/schema-sources.json>]
// Exit 0 every id is served as a parseable JSON file whose address is the id; 1 at least one is not (each named);
// 2 usage or an unreadable sources file.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

// The served list: every (id, file) pair the sources name. A file whose id is not base + at is itself a fault.
export function namedIds(sources) {
  const out = [];
  for (const src of sources.sources ?? [])
    for (const f of src.files ?? []) out.push({ repo: src.repo, at: f.at, id: f.id, expect: sources.base + f.at });
  return out;
}

// The problems with the site under `root`, one line each. Empty when every named id resolves.
export function check(root, sources) {
  const problems = [];
  if (namedIds(sources).length === 0) problems.push('the sources file names no schema id: nothing would be checked');
  for (const { repo, at, id, expect } of namedIds(sources)) {
    if (id !== expect) {
      problems.push(`${repo}: id ${id} does not sit at its own address ${expect}`);
      continue;
    }
    const file = join(root, 'schema', at);
    if (!existsSync(file) || !statSync(file).isFile()) {
      problems.push(`${repo}: ${id} is not served (no ${join(root, 'schema', at)})`);
      continue;
    }
    try {
      JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      problems.push(`${repo}: ${id} is served but is not JSON (${e.message})`);
    }
  }
  return problems;
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
    console.error('usage: check-schema-ids.mjs [--root <dir>] [--sources <file>]');
    process.exit(2);
  }
  let sources;
  try {
    sources = JSON.parse(readFileSync(o.sources, 'utf8'));
  } catch (e) {
    console.error(`check-schema-ids: cannot read ${o.sources}: ${e.message}`);
    process.exit(2);
  }
  const problems = check(o.root, sources);
  const n = namedIds(sources).length;
  if (problems.length) {
    for (const p of problems) console.error(`check-schema-ids: ${p}`);
    console.error(`check-schema-ids: ${problems.length} of ${n} named ids are not served under ${o.root}`);
    process.exit(1);
  }
  console.log(`check-schema-ids: all ${n} named ids are served under ${o.root}`);
}
