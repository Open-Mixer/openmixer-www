// The MCP page's install block shows commands a reader runs, never a path into the console's source tree: the
// site gate's private-refs-check reads `packages/...` in the built page as a private reference.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/pages/docs/mcp.vue', import.meta.url), 'utf8');
const block = page.match(/const install = computed\(\(\) => \[([\s\S]*?)\]\);/);

test('the MCP page has an install block', () => {
  assert.ok(block, 'app/pages/docs/mcp.vue declares `const install = computed(() => [...])`');
});

test('the install block names no path into the source tree', () => {
  assert.doesNotMatch(block[1], /packages\/[\w-]+\/(dist|src)\//);
});

// The page is for a user of the console: what omx-mcp is, the tools it offers and how a client starts it. The
// development workspace (its build, its root, the process skills its repository keeps) is not on it.
const strings = Object.fromEntries(
  ['en', 'ca'].map((l) => {
    const j = JSON.parse(readFileSync(new URL(`../i18n/locales/${l}/docsMcp.json`, import.meta.url), 'utf8'));
    return [l, j.docsMcp ?? j];
  }),
);

test('the install block starts omx-mcp and builds no workspace', () => {
  assert.match(block[1], /'omx-mcp'/);
  assert.doesNotMatch(block[1], /pnpm|install\.top/);
});

test('the page carries no process-skills section', () => {
  assert.doesNotMatch(page, /SKILLS|docsMcp\.skills|docsMcp\.s4\./);
  for (const [l, s] of Object.entries(strings)) {
    assert.ok(!('skills' in s), `${l}: docsMcp.skills is gone`);
    assert.ok(!('s4' in s), `${l}: docsMcp.s4 is gone`);
  }
});

test('no string speaks of the development workspace', () => {
  for (const [l, s] of Object.entries(strings)) {
    assert.doesNotMatch(JSON.stringify(s), /workspace|espai de treball/i, `${l}: a string names the workspace`);
  }
});
