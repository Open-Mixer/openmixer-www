<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * The place of a screenshot not taken yet: framed as a {@link Shot} is, so the page keeps its shape, and saying what
 * the picture will show and what it waits for. Never a mockup: there is no picture until the capture exists.
 */
defineProps<{ caption: string; pending: string }>();
</script>

<template>
  <figure class="overflow-hidden rounded border border-dashed border-edge bg-surface" data-shot-slot>
    <div class="flex aspect-[4/3] items-center justify-center bg-surface-2 p-6 text-center font-mono text-xs leading-relaxed text-ink-dim">
      {{ pending }}
    </div>
    <figcaption class="border-t border-edge px-4 py-3 font-mono text-xs text-ink-faint">
      {{ caption }}
    </figcaption>
  </figure>
</template>
