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
