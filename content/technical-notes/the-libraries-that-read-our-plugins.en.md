---
title: The libraries that read our plugins
summary: Every owner ships the reader of what it writes, in the languages it is read from. Per owner and per language, what to install, the entry point and one call, copied from the owner's repository.
measured: read from each owner's repository on its main branch, its tests and its README.
topic: zynthian
order: 75
---

Each piece of OpenMixer writes one kind of data: omx-contract the vocabulary and the scales, plugin-hostd's protocol the
words of the wire, plugin-db and plugin-qualify the records and the pins, omx-panel the layouts, omx-plugins the
descriptors and presets of its own plugins. Each one also ships the reader of what it writes. A program that shows a
plugin, as Zynthian's interface does, reads through those readers and keeps no copy of its own.

This note lists them, per owner and per language: what to install, the entry point, and one call. Every call below is
copied from the owner's repository, with the file and line it comes from. Where the repository has no example, the note
says so rather than make one up.

![Each owner and the readers it ships, by language](/technical-notes/the-libraries-that-read-our-plugins/owners-and-readers.svg)

The packages are named rpm first, then deb. Every dependency between these packages states a floor and a ceiling, the
next minor below 1.0 and `< 4` for omx-contract; the rule is written down once, in plugin-hostd's
`tests/clap_core_floor.py`.

## omx-contract

The vocabulary, the units and scales, and the contract directory every other owner installs its words into.

| language | install | entry point |
|---|---|---|
| C | `omx-contract-devel` / `libomx-contract-dev` | `<omxcontract/omx_contract_limits.h>` and the other headers under `/usr/include/omxcontract/` |
| data | `omx-contract-data` | `/usr/share/omx-contract/`, the contract directory `contract.d/3/<owner>/` |
| Python | `omx-contract-data` | `omx_contract_catalog.py`, `omx_contract_scale.py` in `/usr/share/omx-contract/`, loaded by path |
| TypeScript | npm `@openmixer/omx-contract` | `/catalog`, `/scale`, `/descriptor`, `/validate` |

C, from the README (`README.md:31,35`):

```c
#include <omxcontract/omx_contract_limits.h>
```

```sh
cc -c app.c $(pkg-config --cflags omx-contract)
```

A catalog sentence in TypeScript, from `test/catalog.test.mjs:65-66`:

```js
const ca = loadCatalog('omx-contract', 'ca', root);
assert.equal(fill(sentenceOf(ca, CODE, 'No contract directory at {path}'), { path: '/x' }), 'Cap directori de contracte a /x');
```

A position on a scale, from `test/scale-position.test.mjs:52-53`:

```js
const travel = { scale: 'log', min: 20, max: 20000 };
assert.equal(scalePosition(travel, 1000).toFixed(4), '0.5663');
```

The Python modules are not on `sys.path`: a program loads them by their file. plugin-db does it for the catalog reader,
in `python/plugin_db/text.py:28,35-37`:

```python
READER = _installed("share", "omx-contract", "omx_contract_catalog.py")
        spec = importlib.util.spec_from_file_location("omx_contract_catalog", READER)
        _reader = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_reader)
```

and omx-contract's own test reads the scale that way, in `test/scale-position-py.test.mjs:121-122`:

```python
t = {"scale": "log", "min": 20, "max": 20000}
print(m["scale_position"](t, 20))
```

Overriding a descriptor, from `test/descriptor-export.test.mjs:9,17`:

```js
import { applyOverride } from '@openmixer/omx-contract/descriptor';
const r = applyOverride(read('examples/descriptors/scanned-clap-unknown.json'), [read('test/fixtures/overrides/good.json')], { paramsFingerprint: '5f0c' });
```

`/validate` and the generated `omx_contract.py` (`CLAP_IDS`, `CLAP_NUMBERS`): no example in the repository.

## omx-dsp

The DSP kernels, and their TypeScript twins for drawing what a kernel does.

| language | install | entry point |
|---|---|---|
| C | `omx-dsp-devel` / `libomxdsp-dev` | `<omxdsp/omxdsp.h>`, `omxdsp/{fx,analysis,mix}/*.h`: static inline kernels |
| TypeScript | npm `@openmixer/omx-dsp` (npm only) | `dbToLinearGain`, `linearGainToDb`, `biquadMagnitudeDb`, `curvePoints`, the meter views |

C, from the README (`README.md:32,36-37`):

```c
#include <omxdsp/fx/omx_delay.h>
```

```sh
cc $(pkg-config --cflags omxdsp) -c my_plugin.c
cc -shared -o my_plugin.so my_plugin.o $(pkg-config --libs omxdsp)
```

A twin, from `ts/test/agreement.test.mjs:70`:

```js
assert.equal(linearGainToDb(0), -Infinity);
```

## omx-clap-core

The CLAP host library, the LV2 adapter, and the tables of its codes for a program in JavaScript.

| language | install | entry point |
|---|---|---|
| C | `omx-clap-core` + `-devel` / `libomx-clap-core1` + `-dev` | `<omx-clap-host/clap_host.h>`: `omx_clap_host_config_default`, `omx_clap_host_configure`, `omx_clap_host_open`, `omx_clap_host_activate`, `omx_clap_host_close` |
| C, LV2 | `omx-clap-lv2-devel` / `libomx-clap-lv2-dev` | `<omx_clap_lv2.h>` |
| JavaScript | `omx-clap-core` / `libomx-clap-core1` | `omx-clap-core-vocabulary.js`, `omx-clap-core-hosting.js` in `pkg-config --variable=tsdir omx-clap-core` |

From `tests/active_race_test.c:66-68,77,83`:

```c
    omx_clap_host_config_default(&config);
    config.lane_channels = 0;
    if (omx_clap_host_configure(&config) != 0 || omx_clap_host_open(argv[1], STEREO_MONO, &in, why) != 0 || !in)
    // …
        if (omx_clap_host_activate(in, SAMPLE_RATE, BLOCK, why) != 0)
    // …
    omx_clap_host_close(in);
```

The JavaScript tables have no example in the repository; plugin-qualify reads them in its `tools/clap-core-tsdir.mjs`.

## plugin-hostd-protocol

The words of the wire, as a C header and as the table both clients read.

| language | install | entry point |
|---|---|---|
| C | `plugin-hostd-protocol` + `-devel` / `libplugin-hostd-protocol0` + `-dev` | `<plugin-hostd/protocol.h>`: the pin path codec `phd_pin_path_encode`, `phd_pin_path_decode`; the X-macro tables `PHD_VERBS`, `PHD_ERRORS`, `PHD_EVENTS` |
| data | the runtime package | `/usr/share/plugin-hostd-protocol/plugin-hostd-protocol.json`, the table (`pkg-config --variable=table plugin-hostd-protocol`) |

From `tests/protocol_test.c:816`:

```c
if (phd_pin_path_decode("Surge%20xt%2c.clap", back, sizeof(back)) != 0 || strcmp(back, "Surge xt,.clap"))
```

## plugin-hostd

The daemon's two clients, one codec over the table above.

| language | install | entry point |
|---|---|---|
| TypeScript | npm `@openmixer/plugin-hostd-client` (npm only) | `class Protocol`: `encode`, `decode`, `parse`, `code`, `name`, `sentence` |
| Python | `python3-plugin-hostd-protocol` | `plugin_hostd_protocol`: `Protocol`, with the same calls |
| C | `plugin-hostd-devel` / `plugin-hostd-dev` | `<plugin-hostd/plugin_hostd_vocabulary.h>` |

TypeScript, from `clients/ts/README.md:26-39`:

```ts
import { Protocol } from '@openmixer/plugin-hostd-client';

const protocol = new Protocol();            // the installed table and vocabulary
// …
protocol.encode('add', ['clap:...', 0]);     // the line to send, by the table's form
// …
protocol.parse('resp 0');                     // what the host answered: a reply, feedback or a protocol error
// …
protocol.sentence(-2, 'ca');                  // its sentence in a listed language, English when the catalog lacks it
```

Python, from `clients/python/tests/test_codec.py:10,28,58`:

```python
from plugin_hostd_protocol import RETRY_REASONS, Protocol, ProtocolError, format_number
# …
        cls.protocol = Protocol()
# …
        reply = self.protocol.parse(line)
```

The two clients are held to the same answers by `tests/clients_agree.py`.

## plugin-db

The records of what each plugin is on this machine, and the verdict a surface shows.

| language | install | entry point |
|---|---|---|
| Python | `python3-plugin-db` | `plugin_db`: `query(address, here)`, `read(entry, here)`, `why(answer, lang)`, `vocabulary` |
| C | `plugin-db-devel` / `plugin-db-dev` | `<plugin-db/db.h>`, `<plugin-db/pin.h>`: `pdb_address_parse`, `pdb_state`, `pdb_check`, `pdb_word` |
| command | `plugin-db` | `plugin-db query --json` |

Python, from `README.md:101-105`:

```python
from plugin_db import query, read, why, vocabulary as v

answer = query("lv2:http://example.org/plugins/amp", here)   # asks the command plugin-db
if answer["state"] == v.states.qualified: ...
why(answer, "ca")                                            # the sentence of its reason, in Catalan
```

C, from `tests/consumer.c:11,33-35`:

```c
#include <plugin-db/db.h>
// …
    if (pdb_address_parse("lv2:http://example.org/amp", &address) != 0)
        return 1;
    printf("%s\n", pdb_word(formats, PDB_ADDRESS_FORMATS_COUNT, address.format));
```

Its TypeScript twin is private and not published.

## plugin-qualify

The qualification records and the pins file the daemon reads.

| language | install | entry point |
|---|---|---|
| TypeScript | npm `@openmixer/plugin-qualify`; the `plugin-qualify` package carries it | `parsePinLine`, `pinLine`; `recordFigures`; `readDistributedLayer` |
| data | `plugin-qualify` writes, `plugin-qualification-records` ships | `/var/lib/omx/qualified.pins`, `/var/lib/omx/qualification/`, `/usr/share/omx/qualification/` |

A pin line, from `src/pins-file.test.ts:89`:

```ts
const p = parsePinLine(pinLine(entry("clap:/p/x.clap#id", { verdict: "isolated" }))!);
```

A record's figures, from `src/record-figures.test.ts:28`:

```ts
const figures = recordFigures(rec, 48000, 128);
```

`readDistributedLayer`: no example in the repository. There is no Python reader of records or of the pins file.

## omx-panel

The layout of a plugin's pages, its gestures and its looks, and the renderer that draws them.

| language | install | entry point |
|---|---|---|
| TypeScript | npm `@openmixer/omx-panel`; the `omx-panel` package carries it | `/describe`: `describe`; `/panel-description`: `pagesOf`; `/gestures`; `/look` |
| C | `omx-panel-render` + `-devel` / `libomx-panel-render0` + `-dev` | `<omx_panel_render.h>`: `omx_panel_view_create_from_files`, `omx_panel_word_name` |
| data | `omx-panel` | `/usr/share/omx-panel/schema/gestures.json`, `schema/look-roles.json` |

From `test/describe.test.mjs:35` and `test/pages.test.mjs:17`:

```js
  const { description, refusals } = describe(descriptor(dyn(), lv2('lv2:CompressorPlugin')));
  // …
  const eight = pagesOf(x, { perPage: 8 });
```

C, from `renderer/src/cli.c:386`:

```c
omx_panel_view_t *v = omx_panel_view_create_from_files(desc, data, err, sizeof err);
```

No Python reader is shipped; the repository's `test/host_reads.py` reads the word names from the C library with ctypes.

## omx-plugins

OpenMixer's own plugins: their descriptors, presets and pins, and the static entry of each CLAP plugin.

| language | install | entry point |
|---|---|---|
| data | `omx-plugins-contract`, `omx-plugins` | descriptors `contract.d/3/omx-plugins/plugins/<stem>.json`; presets `/usr/share/omx/presets/<plugin id>/<preset id>.json`; pins `/usr/share/plugin-hostd/pins.d/omx-plugins.pins` |
| C | `omx-plugins-devel` / `omx-plugins-dev` | `<omx-plugins/omx_clap_static.h>`: `omx_clap_static_find`; `<omx-plugins/omx_preset_file.h>` |

From `docs/catalogue.md:690-695`:

```c
#include <omx-plugins/omx_clap_static.h>

const clap_plugin_entry_t *e = omx_clap_static_find("org.openmixer.delay");
e->init("");
const clap_plugin_factory_t *f = e->get_factory(CLAP_PLUGIN_FACTORY_ID);
const clap_plugin_t *delay = f->create_plugin(f, host, "org.openmixer.delay");
```

## Not there yet

- plugin-qualify cites a Python reader of record figures for Zynthian (`tools/record_figures.py`) that does not exist:
  there is no Python reader of records or of the pins file.
- omx-contract's Python modules are not on `sys.path`; every program loads them by their file, as plugin-db's
  `text.py` does.
- omx-contract's `/validate` export, its generated `omx_contract.py` and plugin-qualify's `readDistributedLayer` have
  no example in their repositories.
- omx-dsp's TypeScript twins and plugin-hostd's TypeScript client are on npm only, not in the rpm or deb packages;
  plugin-db's TypeScript twin is private.
