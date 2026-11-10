#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// The interim Zynthian figures (/benchmarks/zynthian-interim) from the hardware tier's partial data: the Pi's bench
// runs as the harness wrote them, the bench gate's report and the qualification grid's log. Every figure is copied
// from a run or counted from its rows; nothing is typed. 192 kHz is not shown: it is unsupported on the Pi.
// Only plugin-hostd's own rows carry figures: a partial matrix ranks no host against another.
//
// Usage: node scripts/zynthian-interim.mjs --interface <text> --gate <gate.txt> --grid-log <grid.log>
//          --grid-lib <grid-lib.sh> --pass <name>=<run.json>[,<run.json>...] ... [--out app/data/zynthian-interim.json]

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

export const UNSUPPORTED_RATES = [192000];
const FIGURE_HOST = 'H2';
const FIGURE_MODE = 'chain';
const FIGURE_STRESS = 'none';

function args(argv) {
  const out = { pass: [] };
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i].replace(/^--/, '');
    if (k === 'pass') out.pass.push(argv[i + 1]);
    else out[k] = argv[i + 1];
  }
  for (const k of ['interface', 'gate', 'grid-log', 'grid-lib']) if (!out[k]) throw new Error(`--${k} is required`);
  if (out.pass.length === 0) throw new Error('at least one --pass is required');
  return out;
}

/** The gate's UNSTABLE findings, per run id: `<scenario> <host> <mode> <rate>/<frames> <stress>`. */
export function gateFindings(text) {
  const out = new Map();
  for (const m of text.matchAll(/^\S*?([a-z0-9]+-\d{8}-\d+)\.json: UNSTABLE (\S+) (H\d) (\S+) (\d+)\/(\d+) (?:(\S+) )?dsp/gm)) {
    const [, run, id, host, mode, rate, frames, stress] = m;
    const key = `${id}|${host}|${mode}|${rate}|${frames}|${stress ?? 'none'}`;
    out.set(run, new Set([...(out.get(run) ?? []), key]));
  }
  return out;
}

/** The qualification grid: its cells from grid-lib.sh, and those whose log line says they finished with exit 0. */
export function gridState(lib, log) {
  const cells = ['QCELLS', 'QCELLS2'].flatMap((v) => (new RegExp(`${v}=\\$\\{${v}:-"([^"]+)"\\}`).exec(lib)?.[1] ?? '').split(/\s+/).filter(Boolean));
  const done = [...log.matchAll(/=== qualify (\d+\/\d+) exit 0/g)].map((m) => m[1]);
  const running = [...log.matchAll(/=== qualify (\d+\/\d+) start/g)].map((m) => m[1]).filter((c) => !done.includes(c)).pop() ?? null;
  return { total: cells.length, done: [...new Set(done)].length, running, cells };
}

function main() {
  const a = args(process.argv.slice(2));
  const unstable = gateFindings(readFileSync(a.gate, 'utf8'));
  const grid = gridState(readFileSync(a['grid-lib'], 'utf8'), readFileSync(a['grid-log'], 'utf8'));
  const passes = [];
  const sources = [];
  let machine;
  for (const spec of a.pass) {
    const [name, files] = spec.split('=');
    const runs = files.split(',').map((f) => {
      const bytes = readFileSync(f);
      sources.push({ file: basename(f), sha256: createHash('sha256').update(bytes).digest('hex') });
      return JSON.parse(bytes.toString('utf8'));
    });
    machine ??= runs[0].machine;
    const coverage = runs.map((r) => {
      const rate = r.scenarios[0].rate;
      const shown = !UNSUPPORTED_RATES.includes(rate);
      const ok = r.scenarios.filter((s) => s.status === 'ok').length;
      return {
        run: r.id, rate, shown,
        frames: [...new Set(r.scenarios.map((s) => s.frames))].sort((x, y) => x - y),
        cells: r.scenarios.length, ok, failed: r.scenarios.length - ok,
        unstable: unstable.get(r.id)?.size ?? 0,
      };
    });
    const figures = runs.filter((r) => !UNSUPPORTED_RATES.includes(r.scenarios[0].rate)).flatMap((r) =>
      r.scenarios.filter((s) => s.host === FIGURE_HOST && s.mode === FIGURE_MODE && (s.stress ?? 'none') === FIGURE_STRESS).map((s) => ({
        set: s.id, title: s.title, plugins: Array.isArray(s.plugins) ? s.plugins.length : null, rate: s.rate, frames: s.frames, status: s.status,
        dsp_load_avg: s.dsp_load_avg ?? null, dsp_load_max: s.dsp_load_max ?? null, xruns: s.xruns ?? null,
        pss_mb_total: s.pss_mb_total ?? null, repeats: s.repeats ?? 1,
        unstable: unstable.get(r.id)?.has(`${s.id}|${s.host}|${s.mode}|${s.rate}|${s.frames}|${s.stress ?? 'none'}`) ?? false,
      })));
    passes.push({
      name, software: runs[0].software, periods: runs[0].jack?.periods ?? null, priority: runs[0].jack?.priority ?? null,
      hosts: [...new Set(runs.flatMap((r) => r.scenarios.map((s) => s.host)))].sort(),
      coverage, figures,
    });
  }
  const shown = passes.flatMap((p) => p.coverage.filter((c) => c.shown));
  const doc = {
    tier: 'hardware', machine: { model: machine.model, cpu: machine.cpu, cores: machine.cores, ram_mb: machine.ram_mb, os: machine.os, kernel: machine.kernel, governor: machine.governor },
    interface: a.interface, unsupported_rates: UNSUPPORTED_RATES,
    figure_rows: { host: FIGURE_HOST, mode: FIGURE_MODE, stress: FIGURE_STRESS },
    totals: { cells: shown.reduce((n, c) => n + c.cells, 0), ok: shown.reduce((n, c) => n + c.ok, 0), failed: shown.reduce((n, c) => n + c.failed, 0), unstable: shown.reduce((n, c) => n + c.unstable, 0) },
    grid: { total: grid.total, done: grid.done, running: grid.running },
    passes, sources,
  };
  writeFileSync(a.out ?? 'app/data/zynthian-interim.json', `${JSON.stringify(doc, null, 1)}\n`);
  console.log(`passes ${passes.length}, shown cells ${doc.totals.cells} (ok ${doc.totals.ok}, failed ${doc.totals.failed}, unstable ${doc.totals.unstable}), figure rows ${passes.reduce((n, p) => n + p.figures.length, 0)}, grid ${grid.done}/${grid.total}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
