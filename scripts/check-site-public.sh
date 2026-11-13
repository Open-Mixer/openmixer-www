#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
#
# Judges the built site with the checks the Pages repository runs on what it serves, before anything is deployed:
# Open-Mixer/.github's private-refs-check (no file points into a private repository: no private source path,
# repository, issue or machine) and public-layout-check (no dated document or folder, no evidence or notes folder).
# Both judge a repository's tracked files, so the site is copied into a scratch git repository of its own and judged
# there, with nothing of the Pages repository around it: what is judged is exactly what the deploy would publish.
#
#   scripts/check-site-public.sh [site-dir]     (default .output/public)
#
# The checks come from a checkout of Open-Mixer/.github at the release line: OMX_DOTGITHUB (CI checks it out there).
# Exit 0 clean, 1 a finding (shown), 2 no site or no checker: a check that cannot run is never a pass.
set -euo pipefail

site=${1:-.output/public}
dot=${OMX_DOTGITHUB:-}
die() { echo "check-site-public: $*" >&2; exit 2; }

[ -f "$site/index.html" ] || die "no built site at $site"
[ -n "$dot" ] || die "OMX_DOTGITHUB is not set: the shared checks (a checkout of Open-Mixer/.github) are needed"
for c in private-refs-check public-layout-check; do
  [ -x "$dot/.github/actions/$c/check.sh" ] || die "the shared checks are not at $dot (no .github/actions/$c/check.sh)"
done

scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
cp -a "$site/." "$scratch/"
git -C "$scratch" init -q
git -C "$scratch" add -A

rc=0
for c in private-refs-check public-layout-check; do
  "$dot/.github/actions/$c/check.sh" --self-test >/dev/null || die "$c --self-test failed: the checker itself is broken"
  if ! (cd "$scratch" && "$dot/.github/actions/$c/check.sh" "$scratch"); then
    echo "check-site-public: $c finds the above in the built site; nothing may be deployed until the generator stops writing it" >&2
    rc=1
  fi
done
[ "$rc" = 0 ] && echo "check-site-public: the built site passes private-refs-check and public-layout-check"
exit "$rc"
