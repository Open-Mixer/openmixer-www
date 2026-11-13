#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// The interim Zynthian figures by period length (/benchmarks/zynthian-interim, its last table): the hardware tier's
// matrix as plugin-hostd's `bench/matrix.sh --json` read it, one table per periods value, rates compared at equal
// period length, with each rate's safe minimum. Every figure is copied from that reading or from a run; nothing is
// typed. A host's figures are its own rows counted; no host is ranked against another.
//
// Usage: node scripts/zynthian-interim-periods.mjs --interface <text> --matrix <matrix.json> --runs <run.json>[,<run.json>...]
//          [--out app/data/zynthian-interim-periods.json]

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const HOSTS = ['H1', 'H2', 'H3', 'H4'];

/** The page's data from the matrix reading and the runs it read. A cell's run must be one of `runs`. */
export function periodTables(matrix, runs) {
  const byId = new Map(runs.map((r) => [r.id, r]));
  return Object.keys(matrix).sort().map((name) => {
    const m = matrix[name];
    const periods = Number(/^n(\d+)$/.exec(name)?.[1]);
    if (!Number.isInteger(periods)) throw new Error(`${name}: not a periods value`);
    const rows = [...m.rows].sort((a, b) => b - a).map((ms) => ({
      ms,
      cells: m.rates.map((rate) => {
        const c = m.cells[String(ms)]?.[String(rate)];
        if (!c) return { rate, measured: false };
        const run = byId.get(c.id);
        if (!run) throw new Error(`${name} ${ms} ms at ${rate}: run ${c.id} is not among --runs`);
        if (run.jack?.periods !== periods) throw new Error(`${c.id}: the run has ${run.jack?.periods} periods, the table ${periods}`);
        return {
          rate, measured: true, run: c.id, frames: c.frames, clean: c.clean, sub_ms: c.sub_ms, xruns: c.xruns,
          hosts: HOSTS.filter((h) => c.hosts[h]).map((h) => ({ host: h, ...c.hosts[h] })),
        };
      }),
    }));
    return { periods, rates: m.rates, rows, safe: m.rates.map((rate) => ({ rate, ms: m.safe[String(rate)] ?? null })) };
  });
}

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) out[argv[i].replace(/^--/, '')] = argv[i + 1];
  for (const k of ['interface', 'matrix', 'runs']) if (!out[k]) throw new Error(`--${k} is required`);
  return out;
}

function main() {
  const a = args(process.argv.slice(2));
  const sources = [];
  const runs = a.runs.split(',').map((f) => {
    const bytes = readFileSync(f);
    const run = JSON.parse(bytes.toString('utf8'));
    sources.push({
      file: basename(f), sha256: createHash('sha256').update(bytes).digest('hex'),
      'plugin-hostd': run.software['plugin-hostd'], 'omx-clap-host': run.software['omx-clap-host'],
    });
    return run;
  });
  const tables = periodTables(JSON.parse(readFileSync(a.matrix, 'utf8')), runs);
  const used = new Set(tables.flatMap((t) => t.rows.flatMap((r) => r.cells.filter((c) => c.measured).map((c) => `${c.run}.json`))));
  const m = runs[0].machine;
  const doc = {
    tier: 'hardware',
    machine: { model: m.model, cpu: m.cpu, cores: m.cores, ram_mb: m.ram_mb, os: m.os, kernel: m.kernel, governor: m.governor },
    interface: a.interface, jack: { driver: runs[0].jack.driver, priority: runs[0].jack.priority },
    tables, sources: sources.filter((s) => used.has(s.file)),
  };
  writeFileSync(a.out ?? 'app/data/zynthian-interim-periods.json', `${JSON.stringify(doc, null, 1)}\n`);
  console.log(`tables ${tables.length}, cells ${used.size}, runs ${doc.sources.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
