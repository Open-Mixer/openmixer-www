<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * One shot of the panels, curves and analyser page, by its id in app/data/panels-shots.json: the capture when it is
 * taken, a marked slot saying what it waits for when it is not.
 */
import data from '~/data/panels-shots.json';

const props = defineProps<{ id: string }>();
const { t } = useI18n();
const shot = computed(() => {
  const s = data.shots.find((x) => x.id === props.id);
  if (!s) throw new Error(`PanelShot: no shot ${props.id} in app/data/panels-shots.json`);
  return s;
});
const words = (part: 'alt' | 'caption') => t(`docsPanelsCurves.shots.${shot.value.key}.${part}`);
</script>

<template>
  <Shot v-if="shot.file" :src="shot.file" :alt="words('alt')" :caption="words('caption')" />
  <ShotSlot v-else :caption="words('caption')" :pending="t('docsPanelsCurves.shots.slot', { after: shot.after ?? '' })" />
</template>
