// SPDX-License-Identifier: GPL-3.0-or-later
/** A pull request of the Open-Mixer organisation, <repo>#<number>, as its link and its label. */
export function prLink(ref: string): { href: string; label: string } {
  const [repo, n] = ref.split('#');
  return { href: `https://github.com/Open-Mixer/${repo}/pull/${n}`, label: `${repo} #${n}` };
}
