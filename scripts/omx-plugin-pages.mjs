// SPDX-License-Identifier: GPL-3.0-or-later
/**
 * The pages of the plugins OpenMixer ships (/docs/omx-plugins/<stem>), from omx-plugins' own reference: its
 * docs/plugins/plugins.json (each plugin's words, ids and declared panel's sections with every control, written by its
 * tools/params-doc.mjs from the declarations) and docs/images/panels/<stem>.png (each panel drawn from the declaration
 * alone by omx-panel's renderer, its `make panel-images`). Nothing here is written by hand.
 *
 *   node scripts/omx-plugin-pages.mjs --from <omx-plugins checkout>
 *       writes app/data/omx-plugins.json (the plugins, the checkout's commit, each picture's size) and copies the pictures
 *       to public/img/omx-plugins/panels/, removing any no plugin has
 *   node scripts/omx-plugin-pages.mjs --verify
 *       reads only this tree: every plugin has its picture, of the size the data says, every picture is a plugin's, and
 *       every plugin has a section with a control; exit 1 naming each failure
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = 'app/data/omx-plugins.json';
export const IMAGES = 'public/img/omx-plugins/panels';

/** A PNG's width and height, from its IHDR. */
export function pngSize(bytes) {
  const b = Buffer.from(bytes);
  if (b.toString('latin1', 1, 4) !== 'PNG' || b.toString('latin1', 12, 16) !== 'IHDR') throw new Error('not a PNG');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/** The site's data from an omx-plugins checkout: `{ data, pictures }`, pictures as [stem, source path]. */
export function fromCheckout(checkout) {
  const ref = JSON.parse(readFileSync(join(checkout, 'docs/plugins/plugins.json'), 'utf8'));
  const commit = execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const pictures = [];
  const plugins = ref.plugins.map((p) => {
    let image = null;
    if (p.image) {
      const src = join(checkout, 'docs', p.image);
      pictures.push([p.stem, src]);
      image = { file: `/img/omx-plugins/panels/${p.stem}.png`, ...pngSize(readFileSync(src)) };
    }
    return { stem: p.stem, name: p.name, doc: p.doc, clapId: p.clapId, lv2Uri: p.lv2Uri, parameters: p.parameters, image, sections: p.sections };
  });
  return { data: { source: { repo: 'omx-plugins', commit }, plugins }, pictures };
}

/** What is wrong with the tree's pages, as sentences; none when the data and the pictures agree. */
export function verify(root = ROOT) {
  const bad = [];
  if (!existsSync(join(root, DATA))) return [`${DATA} is missing: run node scripts/omx-plugin-pages.mjs --from <omx-plugins checkout>`];
  const { plugins } = JSON.parse(readFileSync(join(root, DATA), 'utf8'));
  for (const p of plugins) {
    if (!p.sections.some((s) => s.controls.length)) bad.push(`${p.stem}: no section with a control`);
    if (!p.image) { bad.push(`${p.stem}: no panel picture`); continue; }
    const file = join(root, 'public', p.image.file);
    if (!existsSync(file)) { bad.push(`${p.stem}: ${p.image.file} is missing`); continue; }
    const size = pngSize(readFileSync(file));
    if (size.width !== p.image.width || size.height !== p.image.height) bad.push(`${p.stem}: the picture is ${size.width}x${size.height}, the data says ${p.image.width}x${p.image.height}`);
  }
  const dir = join(root, IMAGES);
  for (const f of existsSync(dir) ? readdirSync(dir) : []) if (!plugins.some((p) => `${p.stem}.png` === f)) bad.push(`${IMAGES}/${f}: no plugin has it`);
  return bad;
}

function main(argv) {
  if (argv[0] === '--verify') {
    const bad = verify();
    for (const b of bad) console.error(`omx-plugin-pages: FAIL ${b}`);
    if (bad.length) process.exit(1);
    console.log(`omx-plugin-pages: ${JSON.parse(readFileSync(join(ROOT, DATA), 'utf8')).plugins.length} plugins, each with its picture`);
    return;
  }
  if (argv[0] !== '--from' || !argv[1]) {
    console.error('usage: omx-plugin-pages.mjs --from <omx-plugins checkout> | --verify');
    process.exit(2);
  }
  const { data, pictures } = fromCheckout(resolve(argv[1]));
  mkdirSync(join(ROOT, IMAGES), { recursive: true });
  for (const [stem, src] of pictures) copyFileSync(src, join(ROOT, IMAGES, `${stem}.png`));
  for (const f of readdirSync(join(ROOT, IMAGES))) if (!pictures.some(([stem]) => `${stem}.png` === f)) rmSync(join(ROOT, IMAGES, f));
  writeFileSync(join(ROOT, DATA), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`omx-plugin-pages: ${data.plugins.length} plugins, ${pictures.length} pictures, from omx-plugins ${data.source.commit.slice(0, 12)}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
