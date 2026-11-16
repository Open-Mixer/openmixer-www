<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * Panels, curves and the analyser: the user's page on what a plugin's panel shows and how to read its curves and the
 * analyser. Every picture is a real capture (PanelShot, app/data/panels-shots.json); a section whose feature has not
 * shipped shows a marked slot naming what it waits for.
 */
const { t } = useI18n();
const sitePath = useSitePath();
useSeoMeta({
  title: () => t('docsPanelsCurves.seo.title'),
  description: () => t('docsPanelsCurves.seo.description'),
});
const modgui = ['looks', 'needles', 'tiers', 'matrix'] as const;
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('docsPanelsCurves.hero.eyebrow')"
      :title="t('docsPanelsCurves.hero.title')"
      :lede="t('docsPanelsCurves.hero.lede')"
    />

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl px-6 py-16">
        <SectionHead eyebrow="01" :title="t('docsPanelsCurves.modgui.title')" />
        <p class="mb-6 rounded border border-dashed border-accent/60 px-4 py-3 font-mono text-xs text-ink-dim">
          {{ t('docsPanelsCurves.draft') }}
        </p>
        <p class="text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.modgui.intro') }}</p>
        <div class="mt-8">
          <PanelShot id="m1" />
        </div>
        <div v-for="k in modgui" :key="k" class="mt-10">
          <h3 class="text-lg text-ink">{{ t(`docsPanelsCurves.modgui.${k}.title`) }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t(`docsPanelsCurves.modgui.${k}.text`) }}</p>
          <div v-if="k === 'looks'" class="mt-6 grid gap-6 sm:grid-cols-2">
            <PanelShot id="m2" />
            <PanelShot id="m3" />
            <PanelShot id="m4" />
          </div>
          <div v-else-if="k === 'needles'" class="mt-6">
            <PanelShot id="m5" />
          </div>
          <div v-else-if="k === 'tiers'" class="mt-6 grid gap-6 sm:grid-cols-2">
            <PanelShot id="m6" />
            <PanelShot id="m7" />
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-edge bg-surface/40">
      <div class="mx-auto max-w-4xl px-6 py-16">
        <SectionHead eyebrow="02" :title="t('docsPanelsCurves.curves.title')" />
        <p class="text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.curves.intro') }}</p>
        <div class="mt-10">
          <h3 class="text-lg text-ink">{{ t('docsPanelsCurves.curves.eq.title') }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.curves.eq.text') }}</p>
          <div class="mt-6"><PanelShot id="c1" /></div>
        </div>
        <div class="mt-10">
          <h3 class="text-lg text-ink">{{ t('docsPanelsCurves.curves.comp.title') }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.curves.comp.text') }}</p>
          <div class="mt-6"><PanelShot id="c2" /></div>
        </div>
        <div class="mt-10">
          <h3 class="text-lg text-ink">{{ t('docsPanelsCurves.curves.time.title') }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.curves.time.text') }}</p>
        </div>
      </div>
    </section>

    <section class="border-b border-edge">
      <div class="mx-auto max-w-4xl px-6 py-16">
        <SectionHead eyebrow="03" :title="t('docsPanelsCurves.rta.title')" />
        <div>
          <h3 class="text-lg text-ink">{{ t('docsPanelsCurves.rta.console.title') }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.rta.console.text') }}</p>
          <div class="mt-6"><PanelShot id="r1" /></div>
        </div>
        <div class="mt-10">
          <h3 class="text-lg text-ink">{{ t('docsPanelsCurves.rta.under.title') }}</h3>
          <p class="mt-2 text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.rta.under.text') }}</p>
          <div class="mt-6"><PanelShot id="r2" /></div>
        </div>
      </div>
    </section>

    <section>
      <div class="mx-auto max-w-4xl px-6 py-16">
        <SectionHead eyebrow="04" :title="t('docsPanelsCurves.zynthian.title')" />
        <p class="text-base leading-relaxed text-ink-dim">{{ t('docsPanelsCurves.zynthian.text') }}</p>
        <p class="mt-4">
          <NuxtLink :to="sitePath('/docs/zynthian')" class="text-accent underline">{{ t('docsPanelsCurves.zynthian.link') }}</NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>
