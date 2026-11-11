<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/**
 * One drawing of how plugins are packed into programs, built from HostBox layers and PluginChip plugins. The same
 * drawings serve the groupings page (/projects/plugin-hostd/groupings) and the technical notes, where a ```figure
 * block names one of them (scripts/gen-pages.mjs, GROUPING_FIGURES). On a narrow screen a drawing scrolls inside its
 * own box, never the page.
 */
defineProps<{ name: GroupingFigureName }>();
const { t } = useI18n();
const io = 'whitespace-nowrap font-mono text-xs leading-snug font-semibold text-ink-dim';
const arrow = 'flex-none font-mono text-[15px] leading-none font-semibold text-ink-dim';
const row = 'flex items-center gap-2';
</script>

<template>
  <div class="overflow-x-auto">
    <div class="min-w-[560px]">
      <HostBox v-if="name === 'individual'" kind="jack" :label="t('groupings.fig.jack')" :note="t('groupings.fig.clients3')">
        <div :class="row">
          <span :class="io">{{ t('groupings.fig.sine') }}</span><span :class="arrow">→</span>
          <template v-for="(p, i) in ['A', 'B', 'C']" :key="p">
            <HostBox kind="worker" class="grow" :label="t('groupings.fig.workerN', { n: i + 1 })">
              <div :class="row"><PluginChip>{{ p }}</PluginChip></div>
            </HostBox>
            <span :class="arrow">→</span>
          </template>
          <span :class="io">{{ t('groupings.fig.out') }}</span>
        </div>
      </HostBox>

      <HostBox v-else-if="name === 'shared'" kind="jack" :label="t('groupings.fig.jack')" :note="t('groupings.fig.oneHost')">
        <div :class="row">
          <span :class="io">{{ t('groupings.fig.sine') }}</span><span :class="arrow">→</span>
          <HostBox kind="proc" class="grow" :label="t('groupings.fig.hostProcess')">
            <div :class="row">
              <PluginChip>A</PluginChip><span :class="arrow">→</span><PluginChip>B</PluginChip><span :class="arrow">→</span><PluginChip>C</PluginChip>
            </div>
          </HostBox>
          <span :class="arrow">→</span><span :class="io">{{ t('groupings.fig.out') }}</span>
        </div>
      </HostBox>

      <HostBox v-else-if="name === 'chain'" kind="jack" :label="t('groupings.fig.jack')">
        <div :class="row">
          <span :class="io">{{ t('groupings.fig.sine') }}</span><span :class="arrow">→</span>
          <HostBox kind="ctl" class="grow" :label="t('groupings.fig.daemon')" :note="t('groupings.fig.daemonNote')">
            <HostBox kind="worker" :label="t('groupings.fig.worker')">
              <HostBox kind="chain" :label="t('groupings.fig.chain1')">
                <div :class="row">
                  <PluginChip>A</PluginChip><span :class="arrow">→</span><PluginChip>B</PluginChip><span :class="arrow">→</span><PluginChip>C</PluginChip>
                </div>
              </HostBox>
            </HostBox>
          </HostBox>
          <span :class="arrow">→</span><span :class="io">{{ t('groupings.fig.out') }}</span>
        </div>
      </HostBox>

      <div v-else-if="name === 'chain-add'" :class="row">
        <div class="flex flex-col gap-1.5">
          <span v-for="p in ['A', 'B', 'C']" :key="p" :class="io">{{ t('groupings.fig.addTo', { p }) }}</span>
        </div>
        <span :class="arrow">⇒</span>
        <HostBox kind="jack" class="grow" :label="t('groupings.fig.jack')">
          <HostBox kind="worker" :label="t('groupings.fig.worker')">
            <HostBox kind="chain" :label="t('groupings.fig.chain1')">
              <div :class="row">
                <PluginChip>A</PluginChip><span :class="arrow">→</span><PluginChip>B</PluginChip><span :class="arrow">→</span><PluginChip>C</PluginChip>
              </div>
            </HostBox>
          </HostBox>
        </HostBox>
      </div>

      <HostBox v-else-if="name === 'plan'" kind="jack" :label="t('groupings.fig.jack')" :note="t('groupings.fig.segments5')">
        <div :class="row">
          <span :class="io">{{ t('groupings.fig.in') }}</span><span :class="arrow">→</span>
          <template v-for="(p, i) in ['comp', 'drive', 'delay', 'drive', 'comp']" :key="i">
            <HostBox
              :kind="p === 'drive' ? 'iso' : 'worker'"
              class="grow"
              :label="p === 'drive' ? t('groupings.fig.isolated') : t('groupings.fig.segmentN', { n: i + 1 })"
            >
              <div :class="row"><PluginChip>{{ p }}</PluginChip></div>
            </HostBox>
            <span :class="arrow">→</span>
          </template>
          <span :class="io">{{ t('groupings.fig.out') }}</span>
        </div>
      </HostBox>

      <HostBox v-else-if="name === 'pool'" kind="jack" :label="t('groupings.fig.jack')" :note="t('groupings.fig.poolGraphNote')">
        <div :class="row">
          <HostBox kind="pool" class="grow" :label="t('groupings.fig.pool')" :note="t('groupings.fig.poolNote')">
            <div :class="row"><PluginChip>comp</PluginChip><PluginChip>delay</PluginChip><PluginChip>comp</PluginChip></div>
          </HostBox>
          <HostBox v-for="i in 2" :key="i" kind="iso" :label="t('groupings.fig.isolated')">
            <div :class="row"><PluginChip>drive</PluginChip></div>
          </HostBox>
        </div>
        <p class="text-sm text-ink-dim">{{ t('groupings.fig.poolFlow') }}</p>
      </HostBox>

      <HostBox v-else-if="name === 'segments'" kind="jack" :label="t('groupings.fig.jack')" :note="t('groupings.fig.segments3')">
        <div :class="row">
          <span :class="io">{{ t('groupings.fig.in') }}</span><span :class="arrow">→</span>
          <HostBox kind="worker" class="grow" :label="t('groupings.fig.segmentN', { n: 1 })">
            <HostBox kind="chain" :label="t('groupings.fig.chain')">
              <div :class="row"><PluginChip>A</PluginChip><span :class="arrow">→</span><PluginChip>B</PluginChip></div>
            </HostBox>
          </HostBox>
          <span :class="arrow">→</span>
          <HostBox kind="iso" class="grow" :label="t('groupings.fig.isolated')">
            <div :class="row"><PluginChip>C</PluginChip></div>
          </HostBox>
          <span :class="arrow">→</span>
          <HostBox kind="worker" class="grow" :label="t('groupings.fig.segmentN', { n: 3 })">
            <HostBox kind="chain" :label="t('groupings.fig.chain')">
              <div :class="row"><PluginChip>D</PluginChip><span :class="arrow">→</span><PluginChip>E</PluginChip></div>
            </HostBox>
          </HostBox>
          <span :class="arrow">→</span><span :class="io">{{ t('groupings.fig.out') }}</span>
        </div>
      </HostBox>
    </div>
  </div>
</template>
