<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/** The colour key of one layer of the plugin hosting figures, for the glossary and the legend. */
defineProps<{ kind: keyof typeof HOST_SWATCH }>();
</script>

<template>
  <span class="inline-block size-3.5 flex-none rounded-[3px] border-2" :class="HOST_SWATCH[kind]" aria-hidden="true" />
</template>
