<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * What is new on Zynthian: one paragraph and one link per high-level change (app/data/zynthian-whats-new.json), each
 * with every merged pull request of the change. A change with a page of its own links to /docs/zynthian-whats-new/<id>;
 * one an existing page already covers links there.
 */
import data from '~/data/zynthian-whats-new.json';

const { t } = useI18n();
const sitePath = useSitePath();

const changes = data.changes.map((c) => ({
  ...c,
  href: 'link' in c && c.link ? c.link : `/docs/zynthian-whats-new/${c.id}`,
  prLinks: c.prs.map(prLink),
}));

useSeoMeta({
  title: () => t('zynthianWhatsNew.seo.title'),
  description: () => t('zynthianWhatsNew.seo.description'),
});
</script>

<template>
  <div>
    <PageHero :eyebrow="t('zynthianWhatsNew.hero.eyebrow')" :title="t('zynthianWhatsNew.hero.title')" :lede="t('zynthianWhatsNew.hero.lede')" />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl space-y-10 px-6 py-16">
        <article v-for="c in changes" :key="c.id" :id="c.id" class="border-l-2 border-edge-strong pl-5">
          <h2 class="font-display text-xl font-semibold tracking-tight text-ink">
            <a :href="sitePath(c.href)" class="hover:text-accent">{{ t(`zynthianWhatsNew.changes.${c.id}.title`) }}</a>
          </h2>
          <p v-if="'status' in c && c.status === 'coming'" class="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
            {{ t('zynthianWhatsNew.index.coming') }}
          </p>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t(`zynthianWhatsNew.changes.${c.id}.summary`) }}</p>
          <p class="mt-2 text-sm">
            <a :href="sitePath(c.href)" class="text-accent hover:underline">
              {{ 'link' in c && c.link ? `${t('zynthianWhatsNew.index.coveredBy')} ${c.link}` : t('zynthianWhatsNew.index.readPage') }}
            </a>
          </p>
          <details v-if="c.prLinks.length" class="mt-2 text-sm text-ink-dim">
            <summary class="cursor-pointer">{{ t('zynthianWhatsNew.index.count', { n: c.prLinks.length }) }}</summary>
            <p class="mt-2 leading-relaxed">
              <template v-for="(p, i) in c.prLinks" :key="p.href"><a :href="p.href" class="hover:text-accent">{{ p.label }}</a><span v-if="i < c.prLinks.length - 1">, </span></template>
            </p>
          </details>
        </article>
      </div>
    </section>
  </div>
</template>
