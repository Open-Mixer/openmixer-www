// SPDX-License-Identifier: GPL-3.0-or-later
// The listed message codes, read from core's sources in each form the console has had: LISTED_MESSAGE_DECLARED, the
// declaration (`'<code> <arg:type> ...'`, each code with its doc comment), which core uses now; LISTED_MESSAGE_CODES,
// the plain list it had before; LISTED_CODES inline in message-code.ts, before that. The REST reference's labels and
// openapi.json come from these, so a renamed list is never read as an empty or stale one.
// Run: node --test scripts/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listedCodesOf } from './listed-codes.mjs';

test('the declaration form: each entry\'s code, its arguments and its doc comment', () => {
  const listed = `export const LISTED_MESSAGE_DECLARED = [
  'stagebox.assign.unknown-device =StageboxAssignRefusalParams',
  /** The engine's measured share of its real-time budget. */
  'rt.budget pct:number',
  'plain.code',
] as const;`;
  assert.deepEqual(listedCodesOf(listed, ''), ['stagebox.assign.unknown-device', 'rt.budget', 'plain.code']);
});

test('the plain list it had before', () => {
  assert.deepEqual(listedCodesOf(`export const LISTED_MESSAGE_CODES = [\n  'a.b',\n  'c.d',\n];`, ''), ['a.b', 'c.d']);
});

test('inline in message-code.ts, before that', () => {
  assert.deepEqual(listedCodesOf(null, `const LISTED_CODES = [\n  'x.y',\n];`), ['x.y']);
});

test('none found is an error, never an empty list', () => {
  assert.throws(() => listedCodesOf('export const SOMETHING_ELSE = [];', ''), /no listed codes found/);
});
