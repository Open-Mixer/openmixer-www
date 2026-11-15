<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * One change of What is new on Zynthian that has a page of its own (page: true in app/data/zynthian-whats-new.json):
 * what it is, where it appears, what you do and what you see, each said only when the change's words have it, its
 * pictures from the Pi, what is not there yet, and as the last line the pull requests it covers.
 */
import data from '~/data/zynthian-whats-new.json';

const { t, te } = useI18n();
const sitePath = useSitePath();
const route = useRoute();

const change = computed(() => {
  const c = data.changes.find((x) => x.id === route.params.id && 'page' in x && x.page);
  if (!c) throw createError({ statusCode: 404, statusMessage: `no Zynthian change ${route.params.id}` });
  return c;
});
const key = (part: string) => `zynthianWhatsNew.changes.${change.value.id}.${part}`;
const parts = computed(() => (['what', 'where', 'do', 'sees'] as const).filter((p) => te(key(p))));
const shots = computed(() =>
  ('shots' in change.value ? change.value.shots : []).map((id) => ({
    id,
    file: (data.shots as Record<string, string | null>)[id] ?? null,
  })),
);
const prs = computed(() => change.value.prs.map(prLink));

useSeoMeta({
  title: () => t(key('title')),
  description: () => t(key('summary')),
});
</script>

<template>
  <div>
    <PageHero :eyebrow="t('zynthianWhatsNew.hero.eyebrow')" :title="t(key('title'))" :lede="t(key('summary'))" />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl space-y-8 px-6 py-16 text-base leading-relaxed text-ink-dim">
        <p class="text-sm">
          <a :href="sitePath('/docs/zynthian-whats-new')" class="text-accent hover:underline">← {{ t('zynthianWhatsNew.page.back') }}</a>
        </p>
        <p v-if="'status' in change && change.status === 'coming'" class="font-mono text-xs uppercase tracking-[0.12em] text-accent">
          {{ t('zynthianWhatsNew.page.coming') }}
        </p>
        <div v-for="p in parts" :key="p">
          <h2 class="font-display text-lg font-semibold text-ink">{{ t(`zynthianWhatsNew.page.${p}`) }}</h2>
          <p class="mt-2">{{ t(key(p)) }}</p>
        </div>
        <div v-for="s in shots" :key="s.id">
          <Shot v-if="s.file" :src="s.file" :alt="t(`zynthianWhatsNew.shots.${s.id}.alt`)" :caption="t(`zynthianWhatsNew.shots.${s.id}.caption`)" />
        </div>
        <div v-if="te(key('notYet'))" class="border-l-2 border-accent/60 pl-4">
          <h2 class="font-display text-lg font-semibold text-ink">{{ t('zynthianWhatsNew.page.notYet') }}</h2>
          <p class="mt-2">{{ t(key('notYet')) }}</p>
        </div>
        <p class="border-t border-edge pt-6 text-sm">
          {{ t('zynthianWhatsNew.page.prs') }}:
          <template v-if="prs.length">
            <template v-for="(p, i) in prs" :key="p.href"><a :href="p.href" class="hover:text-accent">{{ p.label }}</a><span v-if="i < prs.length - 1">, </span></template>
          </template>
          <template v-else>{{ t('zynthianWhatsNew.page.noPrs') }}</template>
        </p>
      </div>
    </section>
  </div>
</template>
