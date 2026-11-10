<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * How plugins are grouped, drawn: the words, the four hosts, the six arrangements the benchmark measures (each a
 * GroupingFigure), the comparison and the figures. It takes the URL of plugin-hostd's docs/groupings.md, which the
 * generic project route would otherwise render as plain markdown; that file stays the repository's own documentation
 * and the last line links to it at the recorded commit.
 */
const { t } = useI18n();

useSeoMeta({
  title: () => t('groupings.seo.title'),
  description: () => t('groupings.seo.description'),
});

/** The source of docs/groupings.md at the commit content/projects/projects.json records. */
const { data: source } = await useAsyncData('groupings-source', async () => {
  const p = (await import('~/data/projects/plugin-hostd.json')).default as { pages: { src: string; source: string }[] };
  return p.pages.find((x) => x.src === 'docs/groupings.md')?.source ?? null;
});

const TERMS = ['jack', 'plugin', 'proc', 'worker', 'chain', 'pool'] as const;
const LEGEND = ['jack', 'proc', 'worker', 'chain', 'pool', 'iso'] as const;

const hostColumns = computed(() => [
  { accessorKey: 'bench', header: t('groupings.hosts.cols.bench') },
  { accessorKey: 'host', header: t('groupings.hosts.cols.host') },
  { accessorKey: 'what', header: t('groupings.hosts.cols.what') },
  { accessorKey: 'formats', header: t('groupings.hosts.cols.formats') },
]);
const hostRows = computed(() =>
  (
    [
      ['H1', 'omx-clap-host', 'h1'],
      ['H2', 'plugin-hostd', 'h2'],
      ['H3', 'mod-host', 'h3'],
      ['H4', 'jalv', 'h4'],
    ] as const
  ).map(([bench, host, k]) => ({ bench, host, what: t(`groupings.hosts.${k}.what`), formats: t(`groupings.hosts.${k}.formats`) })),
);

type ModeKey = 'individual' | 'shared' | 'chain' | 'chainAdd' | 'plan' | 'pool';
const MODES: { key: ModeKey; figure: 'individual' | 'shared' | 'chain' | 'chain-add' | 'plan' | 'pool'; tags: string[]; tally: string[]; small?: boolean; tradeoff: boolean }[] = [
  { key: 'individual', figure: 'individual', tags: ['a', 'b'], tally: ['a', 'b', 'c'], tradeoff: true },
  { key: 'shared', figure: 'shared', tags: ['a', 'b'], tally: ['a', 'b', 'c'], tradeoff: true },
  { key: 'chain', figure: 'chain', tags: ['a'], tally: ['a', 'b', 'c'], tradeoff: true },
  { key: 'chainAdd', figure: 'chain-add', tags: ['a'], tally: ['a', 'b'], tradeoff: false },
  { key: 'plan', figure: 'plan', tags: ['a'], tally: [], small: true, tradeoff: true },
  { key: 'pool', figure: 'pool', tags: ['a'], tally: [], tradeoff: true },
];

const compareColumns = computed(() => [
  { accessorKey: 'row', header: t('groupings.compare.cols.row') },
  { accessorKey: 'host', header: t('groupings.compare.cols.host') },
  { accessorKey: 'arrangement', header: t('groupings.compare.cols.arrangement') },
  { accessorKey: 'scenarios', header: t('groupings.compare.cols.scenarios') },
]);
const compareRows = computed(() =>
  (
    [
      ['jalv', 'H4'],
      ['modhost', 'H3'],
      ['clap', 'H1'],
      ['lv2', 'H1'],
      ['hostd', 'H2'],
    ] as const
  ).map(([k, host]) => ({
    row: t(`groupings.compare.rows.${k}.row`),
    host,
    arrangement: t(`groupings.compare.rows.${k}.arrangement`),
    scenarios: t(`groupings.compare.rows.${k}.scenarios`),
  })),
);

const FIGURES = ['dsp', 'rss', 'add', 'xruns', 'latency', 'processes', 'pss', 'cpu', 'ctx', 'recover', 'level'] as const;
const figureColumns = computed(() => [
  { accessorKey: 'figure', header: t('groupings.measured.cols.figure') },
  { accessorKey: 'meaning', header: t('groupings.measured.cols.meaning') },
]);
const figureRows = computed(() =>
  FIGURES.map((k) => ({ figure: t(`groupings.measured.rows.${k}.figure`), meaning: t(`groupings.measured.rows.${k}.meaning`) })),
);

/** The site's table look for Nuxt UI's UTable: the reference tables' mono header, edge lines and dim text. */
const tableUi = {
  root: 'rounded border border-edge bg-surface/60',
  base: 'min-w-full',
  thead: 'bg-surface/60',
  th: 'px-4 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint',
  td: 'px-4 py-3 align-top whitespace-normal text-sm leading-relaxed text-ink-dim',
  tr: 'border-edge',
};
/** Inline `<code>` inside a message: mono, no background, as the design writes identifiers in running text. */
const prose = '[&_code]:font-mono [&_code]:text-[0.86em] [&_b]:text-ink [&_b]:font-semibold';
const cardUi = { root: 'rounded-xl border border-edge bg-surface ring-0 divide-y-0', body: 'flex flex-col gap-1.5 p-4 sm:p-4' };
</script>

<template>
  <div>
    <PageHero :eyebrow="t('groupings.hero.eyebrow')" :title="t('groupings.hero.title')" :lede="t('groupings.hero.lede')" />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionHead :eyebrow="t('groupings.words.eyebrow')" :title="t('groupings.words.title')" />
        <p class="max-w-[68ch] text-base leading-relaxed text-ink-dim">{{ t('groupings.words.intro') }}</p>
        <div class="mt-6 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <UCard v-for="k in TERMS" :key="k" :ui="cardUi">
            <h3 class="flex items-center gap-2 font-display text-base font-semibold text-ink">
              <HostSwatch :kind="k" />{{ t(`groupings.words.${k}.name`) }}
            </h3>
            <p class="text-[15px] leading-relaxed text-ink">{{ t(`groupings.words.${k}.body`) }}</p>
            <p class="text-sm leading-relaxed text-ink-dim">{{ t(`groupings.words.${k}.eg`) }}</p>
          </UCard>
        </div>
        <p class="mt-6 max-w-[68ch] text-base leading-relaxed text-ink-dim" :class="prose" v-html="t('groupings.words.more')" />
      </div>
    </section>

    <section class="border-b border-edge bg-surface/40">
      <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionHead :eyebrow="t('groupings.hosts.eyebrow')" :title="t('groupings.hosts.title')" />
        <UTable :data="hostRows" :columns="hostColumns" :ui="tableUi">
          <template #bench-cell="{ row }"><span class="font-mono text-xs">{{ row.original.bench }}</span></template>
          <template #host-cell="{ row }"><b class="whitespace-nowrap text-ink">{{ row.original.host }}</b></template>
        </UTable>
      </div>
    </section>

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionHead :eyebrow="t('groupings.modes.eyebrow')" :title="t('groupings.modes.title')" />
        <p class="max-w-[68ch] text-base leading-relaxed text-ink-dim">{{ t('groupings.modes.intro') }}</p>
        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs font-semibold text-ink-dim">
          <span v-for="k in LEGEND" :key="k" class="inline-flex items-center gap-1.5"><HostSwatch :kind="k" />{{ t(`groupings.kinds.${k}`) }}</span>
        </div>
        <div class="mt-6 flex flex-col gap-4">
          <UCard v-for="m in MODES" :key="m.key" :ui="{ ...cardUi, body: 'flex flex-col gap-3.5 p-4 sm:p-5' }">
            <div class="flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
              <h3 class="font-display text-xl font-semibold text-ink">{{ t(`groupings.modes.${m.key}.title`) }}</h3>
              <UBadge
                v-for="tag in m.tags" :key="tag"
                color="neutral" variant="outline"
                class="rounded-full font-mono text-xs whitespace-nowrap text-ink-dim [&_code]:font-mono"
              ><span v-html="t(`groupings.modes.${m.key}.tags.${tag}`)" /></UBadge>
            </div>
            <p class="text-base leading-relaxed text-ink" :class="prose" v-html="t(`groupings.modes.${m.key}.body`)" />
            <GroupingFigure :name="m.figure" />
            <div v-if="m.tally.length" class="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-dim [&_b]:font-mono [&_b]:font-semibold [&_b]:text-ink [&_b]:tabular-nums">
              <span v-for="k in m.tally" :key="k" v-html="t(`groupings.modes.${m.key}.tally.${k}`)" />
            </div>
            <p v-if="m.small" class="text-sm leading-relaxed text-ink-dim">{{ t(`groupings.modes.${m.key}.small`) }}</p>
            <p v-if="m.tradeoff" class="text-[15px] leading-relaxed text-ink">{{ t(`groupings.modes.${m.key}.tradeoff`) }}</p>
          </UCard>
        </div>
      </div>
    </section>

    <section class="border-b border-edge bg-surface/40">
      <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionHead :eyebrow="t('groupings.compare.eyebrow')" :title="t('groupings.compare.title')" />
        <p class="mb-6 max-w-[68ch] text-base leading-relaxed text-ink-dim">{{ t('groupings.compare.intro') }}</p>
        <UTable :data="compareRows" :columns="compareColumns" :ui="tableUi">
          <template #host-cell="{ row }"><span class="font-mono text-xs">{{ row.original.host }}</span></template>
          <template #arrangement-cell="{ row }"><span v-html="row.original.arrangement" /></template>
          <template #scenarios-cell="{ row }"><span class="font-mono text-xs" v-html="row.original.scenarios" /></template>
        </UTable>
        <div class="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <UCard v-for="k in ['chains', 'grouping']" :key="k" :ui="cardUi">
            <h3 class="font-display text-base font-semibold text-ink">{{ t(`groupings.compare.${k}.title`) }}</h3>
            <p class="text-[15px] leading-relaxed text-ink" :class="prose" v-html="t(`groupings.compare.${k}.body`)" />
            <p class="text-sm leading-relaxed text-ink-dim">{{ t(`groupings.compare.${k}.eg`) }}</p>
          </UCard>
        </div>
      </div>
    </section>

    <section>
      <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionHead :eyebrow="t('groupings.measured.eyebrow')" :title="t('groupings.measured.title')" />
        <p class="mb-6 max-w-[68ch] text-base leading-relaxed text-ink-dim">{{ t('groupings.measured.intro') }}</p>
        <UTable :data="figureRows" :columns="figureColumns" :ui="tableUi">
          <template #figure-cell="{ row }"><span class="font-mono text-xs whitespace-nowrap">{{ row.original.figure }}</span></template>
        </UTable>
        <p class="mt-6 max-w-[68ch] text-base leading-relaxed text-ink-dim">{{ t('groupings.measured.runs') }}</p>
        <p class="mt-4 max-w-[68ch] border-l-[3px] border-accent py-1 pl-4 text-base leading-relaxed text-ink" :class="prose" v-html="t('groupings.measured.callout')" />
        <i18n-t keypath="groupings.measured.docs" tag="p" scope="global" class="mt-4 text-sm text-ink-dim">
          <template #link>
            <a v-if="source" :href="source" class="text-accent hover:underline" rel="noopener" data-i18n-skip>docs/groupings.md</a>
            <span v-else data-i18n-skip>docs/groupings.md</span>
          </template>
        </i18n-t>
      </div>
    </section>
  </div>
</template>
