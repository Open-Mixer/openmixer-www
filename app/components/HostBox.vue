<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * One layer of a plugin hosting figure: a coloured box with a mono label (and an optional note on the right), holding
 * the next layers in its slot. The figures on /projects/plugin-hostd/groupings are built only from this and PluginChip.
 */
defineProps<{ kind: HostKind; label: string; note?: string }>();
</script>

<template>
  <div class="flex min-w-0 flex-col gap-2 rounded-[10px] border-2 px-3 pt-2.5 pb-3" :class="HOST_BOX[kind]">
    <div class="flex justify-between gap-3 font-mono text-[11.5px] leading-tight font-semibold tracking-[0.04em]" :class="HOST_LABEL[kind]">
      <span>{{ label }}</span>
      <span v-if="note" class="font-normal text-ink-dim">{{ note }}</span>
    </div>
    <slot />
  </div>
</template>
