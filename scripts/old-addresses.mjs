// SPDX-License-Identifier: GPL-3.0-or-later
// Old addresses of the site that have no page of their own any more, answered by 404.html: the technical notes moved
// from /notes to /technical-notes (a public repository holds no folder named notes), and the site's first home was
// /openmixer-www/. GitHub Pages serves 404.html for any address it has no file for, so a short script there sends an
// old address to its page, keeping the query and the #anchor, without a stub under a notes folder.

const OLD = /^(\/openmixer-www)?(\/ca)?\/notes(\/.*)?$/;

/** the page an old address now lives at, or null when it is not one */
export function newAddress(path) {
  const m = OLD.exec(path);
  return m ? `${m[2] ?? ''}/technical-notes${m[3] ?? ''}` : null;
}

const MARK = 'data-old-addresses';
const SCRIPT = `<script ${MARK}>(function(){var m=/^(\\/openmixer-www)?(\\/ca)?\\/notes(\\/.*)?$/.exec(location.pathname);if(m)location.replace((m[2]||'')+'/technical-notes'+(m[3]||'')+location.search+location.hash)})()</script>`;

/** 404.html with the mapping as the first thing its head runs; a page that already has it is returned as it is */
export function withOldAddresses(html) {
  if (html.includes(MARK)) return html;
  return html.replace(/<head>/, `<head>${SCRIPT}`);
}
