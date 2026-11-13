<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * How a message on our screens reaches the device's language: the owner's code with its arguments, the English source
 * sentence in the owner's contract, the owner's language pack, the screen. On a narrow screen the drawing scrolls
 * inside its own box, never the page.
 */
const { t } = useI18n();
const STEPS = ['code', 'contract', 'pack', 'screen'] as const;
const arrow = 'flex-none self-center font-mono text-[15px] leading-none font-semibold text-ink-dim';
</script>

<template>
  <div class="overflow-x-auto">
    <div class="flex min-w-[640px] items-stretch gap-2">
      <template v-for="(s, i) in STEPS" :key="s">
        <div class="flex min-w-0 flex-1 flex-col gap-1.5 rounded-[10px] border-2 border-edge bg-surface-2 px-3 pt-2.5 pb-3">
          <div class="font-mono text-[11.5px] leading-tight font-semibold tracking-[0.04em] text-ink-dim">{{ t(`docsZynthian.languages.fig.${s}.label`) }}</div>
          <div class="font-mono text-xs leading-snug break-words text-ink">{{ t(`docsZynthian.languages.fig.${s}.value`) }}</div>
          <div class="text-xs leading-snug text-ink-dim">{{ t(`docsZynthian.languages.fig.${s}.note`) }}</div>
        </div>
        <span v-if="i < STEPS.length - 1" :class="arrow">→</span>
      </template>
    </div>
  </div>
</template>
