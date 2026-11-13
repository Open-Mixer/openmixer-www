<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * One of the Zynthian page's acceptance shots, by its id in app/data/zynthian-shots.json: the capture when it is taken,
 * a marked slot saying what it waits for when it is not.
 */
import data from '~/data/zynthian-shots.json';

const props = defineProps<{ id: string }>();
const { t } = useI18n();
const shot = computed(() => {
  const s = data.shots.find((x) => x.id === props.id);
  if (!s) throw new Error(`ZynthianShot: no shot ${props.id} in app/data/zynthian-shots.json`);
  return s;
});
const words = (part: 'alt' | 'caption') => t(`docsZynthian.shots.${shot.value.key}.${part}`);
</script>

<template>
  <Shot v-if="shot.file" :src="shot.file" :alt="words('alt')" :caption="words('caption')" />
  <ShotSlot v-else :caption="words('caption')" :pending="t('docsZynthian.shots.slot', { after: shot.after ?? '' })" />
</template>
