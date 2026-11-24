#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Runs typedoc against an openmixer checkout's public surface (@openmixer/core + @openmixer/server) for one thing: the
// JSON reflection model at .docgen-tmp/typedoc-model.json, which gen-abstractions.mjs reads to build the catalogue page
// and its docstring-gap report. The HTML typedoc writes beside it stays in .docgen-tmp/ and is never published: it
// renders the console's comments verbatim, an internal reference that cites private specifications; the public API is
// the REST reference and openapi.json (#26).
//
// Runs typedoc's own CLI (via its checkout's node_modules) rather than importing the package, because typedoc, ts-morph
// and the full TS project graph live in the SOURCE checkout, not in this site.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const wwwRoot = resolve(here, '..');
const src = resolve(wwwRoot, process.env.OPENMIXER_SRC || '../openmixer');
const htmlScratch = resolve(wwwRoot, '.docgen-tmp/typedoc-html');
const jsonOut = resolve(wwwRoot, '.docgen-tmp/typedoc-model.json');
const bin = resolve(src, 'node_modules/.bin/typedoc');

// The GitHub Pages runner has no sibling openmixer checkout (private, no credential carried by this workflow): there
// gen-abstractions.mjs keeps the committed app/data/abstractions.json, and this pass has nothing to do.
if (!existsSync(bin) || !existsSync(resolve(src, 'typedoc.json'))) {
  console.log(`[gen-typedoc] no checkout at ${src}: no model; the abstractions page keeps its committed data`);
  process.exit(0);
}

mkdirSync(dirname(jsonOut), { recursive: true });

// The root typedoc.json lists 14 packages; this pass is scoped to the two named in the docs brief (core + server's
// public surface), so entryPoints is overridden on the CLI rather than widened at the source.
const args = [
  '--options', 'typedoc.json',
  '--entryPoints', 'packages/core',
  '--entryPoints', 'packages/server',
  '--out', htmlScratch,
  '--json', jsonOut,
];

console.log(`[gen-typedoc] checkout: ${src}`);
execFileSync(bin, args, { cwd: src, stdio: 'inherit' });
console.log(`[gen-typedoc] json → ${jsonOut} (the HTML in ${htmlScratch} is not published)`);
