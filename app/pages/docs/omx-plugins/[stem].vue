<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * One plugin omx-plugins ships: what it does (its declaration's words), its panel (the picture omx-plugins'
 * `make panel-images` draws from the declaration alone with omx-panel's renderer) and every control, section by section
 * (app/data/omx-plugins.json, written by scripts/omx-plugin-pages.mjs; nothing here is typed by hand).
 */
import data from '~/data/omx-plugins.json';

const { t } = useI18n();
const sitePath = useSitePath();
const route = useRoute();
const base = useRuntimeConfig().app.baseURL;
/** a path under public/, mounted under the site's base */
const site = (path: string) => withSiteBase(base, path);

const plugin = computed(() => {
  const p = data.plugins.find((x) => x.stem === route.params.stem);
  if (!p) throw createError({ statusCode: 404, statusMessage: `no omx plugin ${route.params.stem}` });
  return p;
});
const commit = data.source.commit.slice(0, 12);

useSeoMeta({
  title: () => `${plugin.value.name} | OpenMixer`,
  description: () => plugin.value.doc,
});
</script>

<template>
  <div>
    <PageHero :eyebrow="t('docsOmxPlugins.hero.eyebrow')" :title="plugin.name" :lede="plugin.doc" />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-5xl space-y-10 px-6 py-16 text-base leading-relaxed text-ink-dim">
        <p class="text-sm">
          <NuxtLink :to="sitePath('/docs/omx-plugins')" class="text-accent hover:underline">← {{ t('docsOmxPlugins.page.back') }}</NuxtLink>
        </p>

        <div>
          <h2 class="font-display text-lg font-semibold text-ink">{{ t('docsOmxPlugins.page.ids') }}</h2>
          <dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt>{{ t('docsOmxPlugins.page.clap') }}</dt><dd><code>{{ plugin.clapId }}</code></dd>
            <dt>{{ t('docsOmxPlugins.page.lv2') }}</dt><dd><code>{{ plugin.lv2Uri }}</code></dd>
          </dl>
        </div>

        <div v-if="plugin.image">
          <h2 class="font-display text-lg font-semibold text-ink">{{ t('docsOmxPlugins.page.panel') }}</h2>
          <p class="mt-2">{{ t('docsOmxPlugins.page.panelNote') }}</p>
          <figure class="mt-4 overflow-x-auto rounded border border-edge bg-surface p-2">
            <img
              :src="site(plugin.image.file)"
              :alt="t('docsOmxPlugins.page.panelAlt', { name: plugin.name })"
              :width="plugin.image.width"
              :height="plugin.image.height"
              class="block h-auto max-w-full"
              loading="lazy"
              decoding="async"
            >
          </figure>
        </div>

        <div>
          <h2 class="font-display text-lg font-semibold text-ink">{{ t('docsOmxPlugins.page.controls') }}</h2>
          <p class="mt-2">{{ t('docsOmxPlugins.page.controlsNote') }}</p>
          <div v-for="s in plugin.sections" :key="s.label" class="mt-6 overflow-x-auto">
            <h3 class="font-mono text-xs uppercase tracking-[0.12em] text-accent">{{ s.label }}</h3>
            <table class="mt-2 w-full text-left text-sm">
              <thead class="text-ink">
                <tr>
                  <th class="py-1 pr-4">{{ t('docsOmxPlugins.page.control') }}</th>
                  <th class="py-1 pr-4">{{ t('docsOmxPlugins.page.unit') }}</th>
                  <th class="py-1 pr-4">{{ t('docsOmxPlugins.page.min') }}</th>
                  <th class="py-1 pr-4">{{ t('docsOmxPlugins.page.max') }}</th>
                  <th class="py-1 pr-4">{{ t('docsOmxPlugins.page.default') }}</th>
                  <th class="py-1">{{ t('docsOmxPlugins.page.values') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in s.controls" :key="c.symbol" class="border-t border-edge align-top">
                  <td class="py-1 pr-4 text-ink">{{ c.name }}</td>
                  <td class="py-1 pr-4">{{ c.unit }}</td>
                  <td class="py-1 pr-4">{{ c.min }}</td>
                  <td class="py-1 pr-4">{{ c.max }}</td>
                  <td class="py-1 pr-4">{{ c.default }}</td>
                  <td class="py-1">{{ c.values }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="border-t border-edge pt-6 font-mono text-xs text-ink-faint">{{ t('docsOmxPlugins.page.source', { commit }) }}</p>
      </div>
    </section>

    <PluginsNav current="omx" />
  </div>
</template>
