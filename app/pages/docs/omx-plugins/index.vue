<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * Every plugin omx-plugins ships, one link each to its page (app/data/omx-plugins.json, written by
 * scripts/omx-plugin-pages.mjs from omx-plugins' own reference and panel pictures).
 */
import data from '~/data/omx-plugins.json';

const { t } = useI18n();
const sitePath = useSitePath();
const base = useRuntimeConfig().app.baseURL;
/** a path under public/, mounted under the site's base */
const site = (path: string) => withSiteBase(base, path);

useSeoMeta({
  title: () => t('docsOmxPlugins.seo.title'),
  description: () => t('docsOmxPlugins.seo.description'),
});
</script>

<template>
  <div>
    <PageHero :eyebrow="t('docsOmxPlugins.hero.eyebrow')" :title="t('docsOmxPlugins.hero.title')" :lede="t('docsOmxPlugins.hero.lede')" />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-5xl px-6 py-16">
        <SectionHead eyebrow="01" :title="t('docsOmxPlugins.index.title')" />
        <p class="mb-8 text-base leading-relaxed text-ink-dim">{{ t('docsOmxPlugins.index.intro') }}</p>
        <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="p in data.plugins" :key="p.stem" class="rounded border border-edge bg-surface">
            <NuxtLink :to="sitePath(`/docs/omx-plugins/${p.stem}`)" class="block p-4 hover:bg-surface/60">
              <div class="flex h-40 items-start justify-center overflow-hidden">
                <img
                  v-if="p.image"
                  :src="site(p.image.file)"
                  :alt="t('docsOmxPlugins.page.panelAlt', { name: p.name })"
                  :width="p.image.width"
                  :height="p.image.height"
                  class="max-h-40 w-auto object-contain object-top"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <p class="mt-3 font-display font-semibold text-ink">{{ p.name }}</p>
              <p class="font-mono text-xs text-ink-faint">{{ t('docsOmxPlugins.index.parameters', { n: p.parameters }) }}</p>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <PluginsNav current="omx" />
  </div>
</template>
