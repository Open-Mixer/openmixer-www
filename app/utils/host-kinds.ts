// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The layers of a plugin hosting figure, outermost first: the JACK graph (dashed), a process, a worker, a chain,
 * a pool, the worker of an isolated plugin, and `ctl` for the plugin-hostd daemon, which only gives orders. Each
 * kind's colours are the `--color-host-*` tokens in assets/css/main.css; the class strings are written out in full
 * so Tailwind finds them.
 */
export type HostKind = 'jack' | 'proc' | 'worker' | 'chain' | 'pool' | 'iso' | 'ctl';

export const HOST_BOX: Record<HostKind, string> = {
  jack: 'bg-host-jack border-host-jack-line border-dashed',
  proc: 'bg-host-proc border-host-proc-line',
  worker: 'bg-host-worker border-host-worker-line',
  chain: 'bg-host-chain border-host-chain-line',
  pool: 'bg-host-pool border-host-pool-line',
  iso: 'bg-host-iso border-host-iso-line',
  ctl: 'bg-surface border-edge border-dotted',
};

export const HOST_LABEL: Record<HostKind, string> = {
  jack: 'text-host-jack-line',
  proc: 'text-host-proc-line',
  worker: 'text-host-worker-line',
  chain: 'text-host-chain-line',
  pool: 'text-host-pool-line',
  iso: 'text-host-iso-line',
  ctl: 'text-ink-dim',
};

/** A legend swatch: the layer's fill and line, plus the plugin chip's. */
export const HOST_SWATCH: Record<Exclude<HostKind, 'ctl'> | 'plugin', string> = {
  jack: 'bg-host-jack border-host-jack-line border-dashed',
  proc: 'bg-host-proc border-host-proc-line',
  worker: 'bg-host-worker border-host-worker-line',
  chain: 'bg-host-chain border-host-chain-line',
  pool: 'bg-host-pool border-host-pool-line',
  iso: 'bg-host-iso border-host-iso-line',
  plugin: 'bg-host-plugin border-host-plugin-line',
};

/** The drawings GroupingFigure.vue makes; a note places one with a ```figure block (scripts/gen-pages.mjs, GROUPING_FIGURES). */
export type GroupingFigureName = 'individual' | 'shared' | 'chain' | 'chain-add' | 'plan' | 'pool' | 'segments';
