// SPDX-License-Identifier: GPL-3.0-or-later
// The listed message codes from core's sources, in each form the console has had (newest first):
//   message-codes-listed.ts   LISTED_MESSAGE_DECLARED = ['<code> <arg:type> ...', ...]  (each entry's first word)
//   message-codes-listed.ts   LISTED_MESSAGE_CODES = ['<code>', ...]
//   message-code.ts           const LISTED_CODES = ['<code>', ...]
// None found is an error: a renamed list is never read as an empty one.

/** the single-quoted strings of the array that starts where `startRe` matches, comments left out */
export function arrayStrings(text, startRe) {
  const m = startRe.exec(text ?? '');
  if (!m) return [];
  let i = m.index + m[0].length, depth = 1;
  const from = i;
  while (i < text.length && depth > 0) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') depth--;
    i++;
  }
  const body = text.slice(from, i - 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

/** the codes, from message-codes-listed.ts's text (or null) and message-code.ts's */
export function listedCodesOf(listedText, messageCodeText) {
  const declared = arrayStrings(listedText, /export const LISTED_MESSAGE_DECLARED = \[/);
  const codes = declared.length ? declared.map((e) => e.trim().split(/\s+/)[0])
    : arrayStrings(listedText, /export const LISTED_MESSAGE_CODES = \[/).length ? arrayStrings(listedText, /export const LISTED_MESSAGE_CODES = \[/)
      : arrayStrings(messageCodeText, /const LISTED_CODES = \[/);
  if (codes.length === 0) {
    throw new Error('message-code: no listed codes found (neither LISTED_MESSAGE_DECLARED, LISTED_MESSAGE_CODES nor LISTED_CODES)');
  }
  return codes;
}
