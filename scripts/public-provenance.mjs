// SPDX-License-Identifier: GPL-3.0-or-later
// The facts of a row's provenance, without its pointers: the REST reference publishes what a figure is (what was
// measured, on which CPU, when, at which rates), never the machine it was measured on, the private note that holds the
// measurement, or a path into the console's sources (#26).

/** one provenance string, its host= and source= words dropped and a source path named by its package */
export function publicProvenance(text) {
  return text
    .replace(/\s+(?:host|source)=\S+/g, '')
    .replace(/\(packages\/([a-z0-9-]+)\/[^)\s]+\)/g, '($1)')
    .trim();
}

/** a row sample with every string under its provenance made public; the input is not changed */
export function publicSample(sample) {
  if (!sample || typeof sample !== 'object') return sample ?? null;
  const out = structuredClone(sample);
  const walk = (v) => (typeof v === 'string' ? publicProvenance(v)
    : Array.isArray(v) ? v.map(walk)
      : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v);
  if (out.provenance) out.provenance = walk(out.provenance);
  return out;
}
