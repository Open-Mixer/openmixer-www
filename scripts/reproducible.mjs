// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Pau Aliagas <linuxnow@gmail.com>
//
// One build of one commit is one byte string: no stamp is the wall clock, and the tarball carries neither the
// build's file times nor its owners.
import { execFileSync } from 'node:child_process';

/** The time a build of `dir` is stamped with: SOURCE_DATE_EPOCH, else the committer date of the checkout's HEAD, else the epoch. */
export function stampFor(dir, env = process.env) {
  if (env.SOURCE_DATE_EPOCH) return new Date(Number(env.SOURCE_DATE_EPOCH) * 1000).toISOString();
  try {
    const t = execFileSync('git', ['-C', dir, 'log', '-1', '--format=%ct'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (/^\d+$/.test(t)) return new Date(Number(t) * 1000).toISOString();
  } catch { /* not a checkout */ }
  return new Date(0).toISOString();
}

/** Write `members` of `from` to `file` as a gzip tarball whose bytes depend only on the content and `stamp`. */
export function tarReproducible(file, from, members, stamp) {
  const mtime = `@${Math.floor(Date.parse(stamp) / 1000)}`;
  const plain = file.replace(/\.gz$/, '');
  execFileSync('tar', ['--sort=name', `--mtime=${mtime}`, '--owner=0', '--group=0', '--numeric-owner', '--format=gnu', '-cf', plain, '-C', from, ...members]);
  execFileSync('gzip', ['-nf', plain]);   // -n: no name, no time in the header
}
