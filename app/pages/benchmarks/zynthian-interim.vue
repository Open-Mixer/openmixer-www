<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * The interim Zynthian figures: what the hardware tier measured before its matrix is complete, read from
 * app/data/zynthian-interim.json (scripts/zynthian-interim.mjs, from the harness's runs as written). Preliminary:
 * the reference-tier matrix replaces this page at the next release. No host is ranked. The last table is the
 * matrix by period length, app/data/zynthian-interim-periods.json (scripts/zynthian-interim-periods.mjs): the rates at
 * equal period length, 192 kHz among them, and each rate's safe minimum.
 */
import data from '~/data/zynthian-interim.json';
import periods from '~/data/zynthian-interim-periods.json';

const { t } = useI18n();
const sitePath = useSitePath();

const khz = (rate: number) => `${rate / 1000} kHz`;
const shown = data.passes.flatMap((p) => p.coverage.filter((c) => c.shown));
const rates = [...new Set(shown.map((c) => c.rate))].sort((a, b) => a - b).map(khz).join(', ');
const frames = [...new Set(shown.flatMap((c) => c.frames))].sort((a, b) => a - b).join(', ');
const unsupported = data.unsupported_rates.map(khz).join(', ');
const versions = (s: Record<string, string>) => `plugin-hostd ${s['plugin-hostd']}, omx-clap-host ${s['omx-clap-host']}`;

const coverageColumns = computed(() => [
  { key: 'pass', label: t('zynthianInterim.coverage.pass') },
  { key: 'versions', label: t('zynthianInterim.coverage.versions') },
  { key: 'periods', label: t('zynthianInterim.coverage.periods'), mono: true },
  { key: 'rate', label: t('zynthianInterim.coverage.rate'), mono: true },
  { key: 'frames', label: t('zynthianInterim.coverage.frames'), mono: true },
  { key: 'cells', label: t('zynthianInterim.coverage.cells'), mono: true },
  { key: 'ok', label: t('zynthianInterim.coverage.ok'), mono: true },
  { key: 'failed', label: t('zynthianInterim.coverage.failed'), mono: true },
  { key: 'unstable', label: t('zynthianInterim.coverage.unstable'), mono: true },
]);
const coverageRows = computed(() => data.passes.flatMap((p) => p.coverage.map((c) => ({
  pass: p.name,
  versions: versions(p.software),
  periods: p.periods ?? '—',
  rate: khz(c.rate),
  frames: c.frames.join(', '),
  cells: c.shown ? c.cells : t('zynthianInterim.coverage.unsupported'),
  ok: c.shown ? c.ok : '—',
  failed: c.shown ? c.failed : '—',
  unstable: c.shown ? c.unstable : '—',
}))));

/** The newest pass: Zynthian's own JACK setting (3 periods), plugin-hostd's chain rows without added load. */
const figurePass = data.passes[data.passes.length - 1]!;
const figureColumns = computed(() => [
  { key: 'set', label: t('zynthianInterim.figures.set') },
  { key: 'where', label: t('zynthianInterim.figures.where'), mono: true },
  { key: 'dsp', label: t('zynthianInterim.figures.dsp'), mono: true },
  { key: 'xruns', label: t('zynthianInterim.figures.xruns'), mono: true },
  { key: 'pss', label: t('zynthianInterim.figures.pss'), mono: true },
  { key: 'status', label: t('zynthianInterim.figures.status') },
]);
const figureRows = computed(() => figurePass.figures.map((f) => ({
  set: f.title,
  where: `${khz(f.rate)} / ${f.frames}`,
  dsp: f.dsp_load_avg === null ? '—' : `${f.dsp_load_avg} / ${f.dsp_load_max ?? '—'}`,
  xruns: f.xruns ?? '—',
  pss: f.pss_mb_total ?? '—',
  status: f.status !== 'ok' ? t('zynthianInterim.figures.failed') : f.unstable ? t('zynthianInterim.figures.unstable') : t('zynthianInterim.figures.ok'),
})));

/** One table per periods value: a row per period length, a column per rate, each cell the frames, the verdict and its hosts. */
const periodVersions = [...new Set(periods.sources.map((x) => versions(x)))].join('; ');
const periodTables = computed(() => periods.tables.map((table) => ({
  periods: table.periods,
  columns: [
    { key: 'ms', label: t('zynthianInterim.periods.period'), mono: true },
    ...table.rates.map((rate) => ({ key: `r${rate}`, label: khz(rate), mono: true })),
  ],
  rows: [
    ...table.rows.map((row) => ({
      ms: `${row.ms} ms`,
      ...Object.fromEntries(row.cells.map((c) => [`r${c.rate}`, !c.measured
        ? '—'
        : [
            `${c.frames}: ${c.clean ? t('zynthianInterim.periods.clean') : t('zynthianInterim.periods.xruns', { n: c.xruns ?? 0 })}`,
            (c.hosts ?? []).map((h) => `${h.host} ${h.clean}/${h.ok}`).join(', '),
            ...(c.sub_ms ? [t('zynthianInterim.periods.subMs')] : []),
          ].join(' · ')])),
    })),
    {
      ms: t('zynthianInterim.periods.safe'),
      ...Object.fromEntries(table.safe.map((x) => [`r${x.rate}`, x.ms === null ? t('zynthianInterim.periods.none') : `${x.ms} ms`])),
    },
  ],
})));

const runIds = data.passes.flatMap((p) => p.coverage.map((c) => c.run)).join(', ');

useSeoMeta({
  title: () => t('zynthianInterim.seo.title'),
  description: () => t('zynthianInterim.seo.description'),
});
</script>

<template>
  <div>
    <PageHero :eyebrow="t('zynthianInterim.hero.eyebrow')" :title="t('zynthianInterim.hero.title')" :lede="t('zynthianInterim.hero.lede')" />

    <section class="border-t border-edge">
      <div class="mx-auto max-w-4xl px-6 py-16">
        <SectionHead eyebrow="01" :title="t('zynthianInterim.scope.title')" />
        <ul class="list-disc space-y-3 pl-6 text-base leading-relaxed text-ink-dim">
          <li>{{ t('zynthianInterim.scope.tier', { model: data.machine.model, cores: data.machine.cores, ram: data.machine.ram_mb, iface: data.interface }) }}</li>
          <li>{{ t('zynthianInterim.scope.covered', { rates, frames }) }}</li>
          <li>{{ t('zynthianInterim.scope.unsupported', { rates: unsupported }) }}</li>
          <li>{{ t('zynthianInterim.scope.cells', { cells: data.totals.cells, ok: data.totals.ok, failed: data.totals.failed, unstable: data.totals.unstable }) }}</li>
          <li>{{ t('zynthianInterim.scope.grid', { done: data.grid.done, total: data.grid.total }) }}</li>
          <li>{{ t('zynthianInterim.scope.preliminary') }}</li>
          <li>{{ t('zynthianInterim.scope.noRanking') }}</li>
          <li>{{ t('zynthianInterim.scope.digital') }}</li>
        </ul>
      </div>
    </section>

    <section class="border-t border-edge">
      <div class="mx-auto max-w-5xl px-6 py-16">
        <SectionHead eyebrow="02" :title="t('zynthianInterim.coverage.title')">
          <p class="mt-3 text-base leading-relaxed text-ink-dim">{{ t('zynthianInterim.coverage.intro') }}</p>
        </SectionHead>
        <RefTable :columns="coverageColumns" :rows="coverageRows" />
      </div>
    </section>

    <section class="border-t border-edge">
      <div class="mx-auto max-w-5xl px-6 py-16">
        <SectionHead eyebrow="03" :title="t('zynthianInterim.figures.title')">
          <p class="mt-3 text-base leading-relaxed text-ink-dim">
            {{ t('zynthianInterim.figures.intro', { versions: versions(figurePass.software), periods: figurePass.periods ?? '—' }) }}
          </p>
        </SectionHead>
        <RefTable :columns="figureColumns" :rows="figureRows" />
      </div>
    </section>

    <section class="border-t border-edge">
      <div class="mx-auto max-w-5xl px-6 py-16">
        <SectionHead eyebrow="04" :title="t('zynthianInterim.periods.title')">
          <p class="mt-3 text-base leading-relaxed text-ink-dim">
            {{ t('zynthianInterim.periods.intro', { versions: periodVersions, driver: periods.jack.driver, priority: periods.jack.priority, iface: periods.interface }) }}
          </p>
          <p class="mt-3 text-base leading-relaxed text-ink-dim">{{ t('zynthianInterim.periods.reading') }}</p>
        </SectionHead>
        <div v-for="table in periodTables" :key="table.periods" class="mt-10">
          <h3 class="mb-4 text-lg font-semibold text-ink">{{ t('zynthianInterim.periods.table', { periods: table.periods }) }}</h3>
          <RefTable :columns="table.columns" :rows="table.rows" />
        </div>
        <p class="mt-6 text-base leading-relaxed text-ink-dim">{{ t('zynthianInterim.periods.hosts') }}</p>
        <p class="mt-6 text-base">
          <NuxtLink :to="sitePath('/benchmarks')" class="text-accent hover:underline">{{ t('zynthianInterim.back') }}</NuxtLink>
        </p>
        <p class="mt-8 font-mono text-xs leading-relaxed text-ink-faint">{{ t('zynthianInterim.footer', { runs: runIds }) }}</p>
        <p class="mt-2 font-mono text-xs leading-relaxed text-ink-faint">{{ t('zynthianInterim.periods.footer', { runs: periods.sources.map((x) => x.file.replace(/\.json$/, '')).join(', ') }) }}</p>
      </div>
    </section>
  </div>
</template>
