<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * What is new, both halves (app/data/whats-new.json). Zynthian: one paragraph and one link per high-level change, each
 * with every merged pull request of the change; a change with a page of its own links to /docs/whats-new/<id>, one an
 * existing page already covers links there. The console: one paragraph per group of changes, with the pages of the
 * console's documentation that explain it.
 */
import data from '~/data/whats-new.json';

const { t } = useI18n();
const sitePath = useSitePath();

const consoleGroups = data.console;
const changes = data.changes.map((c) => ({
  ...c,
  href: 'link' in c && c.link ? c.link : `/docs/whats-new/${c.id}`,
  prLinks: c.prs.map(prLink),
}));

useSeoMeta({
  title: () => t('whatsNew.seo.title'),
  description: () => t('whatsNew.seo.description'),
});
</script>

<template>
  <div>
    <PageHero :eyebrow="t('whatsNew.hero.eyebrow')" :title="t('whatsNew.hero.title')" :lede="t('whatsNew.hero.lede')" />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl space-y-10 px-6 py-16">
        <SectionHead eyebrow="01" :title="t('whatsNew.index.zynthian')" />
        <article v-for="c in changes" :key="c.id" :id="c.id" class="border-l-2 border-edge-strong pl-5">
          <h2 class="font-display text-xl font-semibold tracking-tight text-ink">
            <a :href="sitePath(c.href)" class="hover:text-accent">{{ t(`whatsNew.changes.${c.id}.title`) }}</a>
          </h2>
          <p v-if="'status' in c && c.status === 'coming'" class="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
            {{ t('whatsNew.index.coming') }}
          </p>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t(`whatsNew.changes.${c.id}.summary`) }}</p>
          <p class="mt-2 text-sm">
            <a :href="sitePath(c.href)" class="text-accent hover:underline">
              {{ 'link' in c && c.link ? `${t('whatsNew.index.coveredBy')} ${c.link}` : t('whatsNew.index.readPage') }}
            </a>
          </p>
          <details v-if="c.prLinks.length" class="mt-2 text-sm text-ink-dim">
            <summary class="cursor-pointer">{{ t('whatsNew.index.count', { n: c.prLinks.length }) }}</summary>
            <p class="mt-2 leading-relaxed">
              <template v-for="(p, i) in c.prLinks" :key="p.href"><a :href="p.href" class="hover:text-accent">{{ p.label }}</a><span v-if="i < c.prLinks.length - 1">, </span></template>
            </p>
          </details>
        </article>
      </div>
    </section>

    <section class="border-b border-edge bg-surface/40">
      <div class="mx-auto max-w-4xl space-y-10 px-6 py-16">
        <SectionHead eyebrow="02" :title="t('whatsNew.index.console')" />
        <p class="text-base leading-relaxed text-ink-dim">{{ t('whatsNew.index.consoleLede') }}</p>
        <article v-for="g in consoleGroups" :key="g.id" :id="`console-${g.id}`" class="border-l-2 border-edge-strong pl-5">
          <h3 class="font-display text-xl font-semibold tracking-tight text-ink">{{ t(`whatsNew.console.${g.id}.title`) }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t(`whatsNew.console.${g.id}.summary`) }}</p>
          <p class="mt-2 text-sm text-ink-dim">
            {{ t('whatsNew.index.pages') }}:
            <template v-for="(p, i) in g.pages" :key="p"><a :href="sitePath(p)" class="text-accent hover:underline">{{ p }}</a><span v-if="i < g.pages.length - 1">, </span></template>
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
