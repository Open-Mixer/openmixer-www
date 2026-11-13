---
title: Les biblioteques que llegeixen els nostres plugins
summary: Cada responsable distribueix el lector del que escriu, en els llenguatges des dels quals es llegeix. Per a cada responsable i cada llenguatge, què cal instal·lar, el punt d'entrada i una crida, copiada del repositori del responsable.
measured: llegit del repositori de cada responsable a la seva branca principal, les seves proves i el seu README.
topic: zynthian
order: 75
---

Cada peça d'OpenMixer escriu un tipus de dades: omx-contract el vocabulari i les escales, el protocol de plugin-hostd
les paraules del cable, plugin-db i plugin-qualify els registres i les empremtes, omx-panel les disposicions, omx-plugins
els descriptors i els presets dels seus propis plugins. Cadascuna distribueix també el lector del que escriu. Un programa
que mostra un plugin, com ho fa la interfície de Zynthian, llegeix a través d'aquests lectors i no en guarda cap còpia.

Aquesta nota els recull per responsable i per llenguatge: què cal instal·lar, el punt d'entrada i una crida. Cada crida
d'aquí sota està copiada del repositori del responsable, amb el fitxer i la línia d'on surt. Quan el repositori no en té
cap exemple, la nota ho diu en lloc d'inventar-ne un.

![Cada responsable i els lectors que distribueix, per llenguatge](/technical-notes/the-libraries-that-read-our-plugins/owners-and-readers.svg)

Els paquets s'anomenen primer en rpm i després en deb. Cada dependència entre aquests paquets indica un mínim i un
màxim, la versió menor següent per sota d'1.0 i `< 4` per a omx-contract; la regla només està escrita en un lloc, a
`tests/clap_core_floor.py` de plugin-hostd.

## omx-contract

El vocabulari, les unitats i les escales; també el directori de contractes on la resta de responsables instal·la les seves
paraules.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| C | `omx-contract-devel` / `libomx-contract-dev` | `<omxcontract/omx_contract_limits.h>` i la resta de capçaleres de `/usr/include/omxcontract/` |
| dades | `omx-contract-data` | `/usr/share/omx-contract/`, el directori de contractes `contract.d/3/<owner>/` |
| Python | `omx-contract-data` | `omx_contract_catalog.py`, `omx_contract_scale.py` a `/usr/share/omx-contract/`, carregats pel seu camí |
| TypeScript | npm `@openmixer/omx-contract` | `/catalog`, `/scale`, `/descriptor`, `/validate` |

C, del README (`README.md:31,35`):

```c
#include <omxcontract/omx_contract_limits.h>
```

```sh
cc -c app.c $(pkg-config --cflags omx-contract)
```

Una frase d'un catàleg en TypeScript, de `test/catalog.test.mjs:65-66`:

```js
const ca = loadCatalog('omx-contract', 'ca', root);
assert.equal(fill(sentenceOf(ca, CODE, 'No contract directory at {path}'), { path: '/x' }), 'Cap directori de contracte a /x');
```

Una posició en una escala, de `test/scale-position.test.mjs:52-53`:

```js
const travel = { scale: 'log', min: 20, max: 20000 };
assert.equal(scalePosition(travel, 1000).toFixed(4), '0.5663');
```

Els mòduls de Python no són a `sys.path`: un programa els carrega pel seu fitxer. plugin-db ho fa amb el lector de
catàlegs, a `python/plugin_db/text.py:28,35-37`:

```python
READER = _installed("share", "omx-contract", "omx_contract_catalog.py")
        spec = importlib.util.spec_from_file_location("omx_contract_catalog", READER)
        _reader = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_reader)
```

i la prova del mateix omx-contract llegeix així l'escala, a `test/scale-position-py.test.mjs:121-122`:

```python
t = {"scale": "log", "min": 20, "max": 20000}
print(m["scale_position"](t, 20))
```

Aplicar una correcció a un descriptor, de `test/descriptor-export.test.mjs:9,17`:

```js
import { applyOverride } from '@openmixer/omx-contract/descriptor';
const r = applyOverride(read('examples/descriptors/scanned-clap-unknown.json'), [read('test/fixtures/overrides/good.json')], { paramsFingerprint: '5f0c' });
```

`/validate` i el fitxer generat `omx_contract.py` (`CLAP_IDS`, `CLAP_NUMBERS`): cap exemple al repositori.

## omx-dsp

Els nuclis de processament de senyal i els seus bessons en TypeScript per dibuixar el que fa un nucli.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| C | `omx-dsp-devel` / `libomxdsp-dev` | `<omxdsp/omxdsp.h>`, `omxdsp/{fx,analysis,mix}/*.h`: nuclis estàtics en línia |
| TypeScript | npm `@openmixer/omx-dsp` (només npm) | `dbToLinearGain`, `linearGainToDb`, `biquadMagnitudeDb`, `curvePoints`, les vistes dels mesuradors |

C, del README (`README.md:32,36-37`):

```c
#include <omxdsp/fx/omx_delay.h>
```

```sh
cc $(pkg-config --cflags omxdsp) -c my_plugin.c
cc -shared -o my_plugin.so my_plugin.o $(pkg-config --libs omxdsp)
```

Un bessó, de `ts/test/agreement.test.mjs:70`:

```js
assert.equal(linearGainToDb(0), -Infinity);
```

## omx-clap-core

La biblioteca que allotja plugins CLAP, l'adaptador LV2 i les taules dels seus codis per a un programa en JavaScript.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| C | `omx-clap-core` + `-devel` / `libomx-clap-core1` + `-dev` | `<omx-clap-host/clap_host.h>`: `omx_clap_host_config_default`, `omx_clap_host_configure`, `omx_clap_host_open`, `omx_clap_host_activate`, `omx_clap_host_close` |
| C, LV2 | `omx-clap-lv2-devel` / `libomx-clap-lv2-dev` | `<omx_clap_lv2.h>` |
| JavaScript | `omx-clap-core` / `libomx-clap-core1` | `omx-clap-core-vocabulary.js`, `omx-clap-core-hosting.js` a `pkg-config --variable=tsdir omx-clap-core` |

De `tests/active_race_test.c:66-68,77,83`:

```c
    omx_clap_host_config_default(&config);
    config.lane_channels = 0;
    if (omx_clap_host_configure(&config) != 0 || omx_clap_host_open(argv[1], STEREO_MONO, &in, why) != 0 || !in)
    // …
        if (omx_clap_host_activate(in, SAMPLE_RATE, BLOCK, why) != 0)
    // …
    omx_clap_host_close(in);
```

Les taules en JavaScript no tenen cap exemple al repositori; plugin-qualify les llegeix al seu `tools/clap-core-tsdir.mjs`.

## plugin-hostd-protocol

Les paraules del cable, com a capçalera de C i com la taula que llegeixen els dos clients.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| C | `plugin-hostd-protocol` + `-devel` / `libplugin-hostd-protocol0` + `-dev` | `<plugin-hostd/protocol.h>`: el còdec de camins de les empremtes `phd_pin_path_encode`, `phd_pin_path_decode`; les taules X-macro `PHD_VERBS`, `PHD_ERRORS`, `PHD_EVENTS` |
| dades | el paquet d'execució | `/usr/share/plugin-hostd-protocol/plugin-hostd-protocol.json`, la taula (`pkg-config --variable=table plugin-hostd-protocol`) |

De `tests/protocol_test.c:816`:

```c
if (phd_pin_path_decode("Surge%20xt%2c.clap", back, sizeof(back)) != 0 || strcmp(back, "Surge xt,.clap"))
```

## plugin-hostd

Els dos clients del dimoni, un sol còdec sobre la taula anterior.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| TypeScript | npm `@openmixer/plugin-hostd-client` (només npm) | `class Protocol`: `encode`, `decode`, `parse`, `code`, `name`, `sentence` |
| Python | `python3-plugin-hostd-protocol` | `plugin_hostd_protocol`: `Protocol`, amb les mateixes crides |
| C | `plugin-hostd-devel` / `plugin-hostd-dev` | `<plugin-hostd/plugin_hostd_vocabulary.h>` |

TypeScript, de `clients/ts/README.md:26-39`:

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

Python, de `clients/python/tests/test_codec.py:10,28,58`:

```python
from plugin_hostd_protocol import RETRY_REASONS, Protocol, ProtocolError, format_number
# …
        cls.protocol = Protocol()
# …
        reply = self.protocol.parse(line)
```

`tests/clients_agree.py` comprova que els dos clients donen les mateixes respostes.

## plugin-db

Els registres del que és cada plugin en aquesta màquina amb el veredicte que mostra una superfície.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| Python | `python3-plugin-db` | `plugin_db`: `query(address, here)`, `read(entry, here)`, `why(answer, lang)`, `vocabulary` |
| C | `plugin-db-devel` / `plugin-db-dev` | `<plugin-db/db.h>`, `<plugin-db/pin.h>`: `pdb_address_parse`, `pdb_state`, `pdb_check`, `pdb_word` |
| ordre | `plugin-db` | `plugin-db query --json` |

Python, de `README.md:101-105`:

```python
from plugin_db import query, read, why, vocabulary as v

answer = query("lv2:http://example.org/plugins/amp", here)   # asks the command plugin-db
if answer["state"] == v.states.qualified: ...
why(answer, "ca")                                            # the sentence of its reason, in Catalan
```

C, de `tests/consumer.c:11,33-35`:

```c
#include <plugin-db/db.h>
// …
    if (pdb_address_parse("lv2:http://example.org/amp", &address) != 0)
        return 1;
    printf("%s\n", pdb_word(formats, PDB_ADDRESS_FORMATS_COUNT, address.format));
```

El seu bessó en TypeScript és privat i no es publica.

## plugin-qualify

Els registres de qualificació i el fitxer d'empremtes que llegeix el dimoni.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| TypeScript | npm `@openmixer/plugin-qualify`; el porta el paquet `plugin-qualify` | `parsePinLine`, `pinLine`; `recordFigures`; `readDistributedLayer` |
| dades | `plugin-qualify` les escriu, `plugin-qualification-records` les distribueix | `/var/lib/omx/qualified.pins`, `/var/lib/omx/qualification/`, `/usr/share/omx/qualification/` |

Una línia d'empremta, de `src/pins-file.test.ts:89`:

```ts
const p = parsePinLine(pinLine(entry("clap:/p/x.clap#id", { verdict: "isolated" }))!);
```

Les xifres d'un registre, de `src/record-figures.test.ts:28`:

```ts
const figures = recordFigures(rec, 48000, 128);
```

`readDistributedLayer`: cap exemple al repositori. No hi ha cap lector en Python de registres ni del fitxer d'empremtes.

## omx-panel

La disposició de les pàgines d'un plugin, els seus gestos i els seus aspectes; també el renderitzador que els dibuixa.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| TypeScript | npm `@openmixer/omx-panel`; el porta el paquet `omx-panel` | `/describe`: `describe`; `/panel-description`: `pagesOf`; `/gestures`; `/look` |
| C | `omx-panel-render` + `-devel` / `libomx-panel-render0` + `-dev` | `<omx_panel_render.h>`: `omx_panel_view_create_from_files`, `omx_panel_word_name` |
| dades | `omx-panel` | `/usr/share/omx-panel/schema/gestures.json`, `schema/look-roles.json` |

De `test/describe.test.mjs:35` i `test/pages.test.mjs:17`:

```js
  const { description, refusals } = describe(descriptor(dyn(), lv2('lv2:CompressorPlugin')));
  // …
  const eight = pagesOf(x, { perPage: 8 });
```

C, de `renderer/src/cli.c:386`:

```c
omx_panel_view_t *v = omx_panel_view_create_from_files(desc, data, err, sizeof err);
```

No es distribueix cap lector en Python; el `test/host_reads.py` del repositori llegeix els noms de les paraules de la
biblioteca de C amb ctypes.

## omx-plugins

Els plugins propis d'OpenMixer: els seus descriptors, presets i empremtes; també l'entrada estàtica de cada plugin CLAP.

| llenguatge | instal·lació | punt d'entrada |
|---|---|---|
| dades | `omx-plugins-contract`, `omx-plugins` | descriptors `contract.d/3/omx-plugins/plugins/<stem>.json`; presets `/usr/share/omx/presets/<plugin id>/<preset id>.json`; empremtes `/usr/share/plugin-hostd/pins.d/omx-plugins.pins` |
| C | `omx-plugins-devel` / `omx-plugins-dev` | `<omx-plugins/omx_clap_static.h>`: `omx_clap_static_find`; `<omx-plugins/omx_preset_file.h>` |

De `docs/catalogue.md:690-695`:

```c
#include <omx-plugins/omx_clap_static.h>

const clap_plugin_entry_t *e = omx_clap_static_find("org.openmixer.delay");
e->init("");
const clap_plugin_factory_t *f = e->get_factory(CLAP_PLUGIN_FACTORY_ID);
const clap_plugin_t *delay = f->create_plugin(f, host, "org.openmixer.delay");
```

## El que encara no hi és

- plugin-qualify esmenta un lector en Python de les xifres dels registres per a Zynthian (`tools/record_figures.py`) que
  no existeix: no hi ha cap lector en Python de registres ni del fitxer d'empremtes.
- Els mòduls de Python d'omx-contract no són a `sys.path`; cada programa els carrega pel seu fitxer, com ho fa el
  `text.py` de plugin-db. omx-contract#28 en fa un paquet, `python3-omx-contract` (`import omx_contract.catalog`).
- Tres tipus de nom amb què un client compara encara no són constants del lector del seu responsable, de manera que el fork de
  Zynthian els escriu com a text en unes poques línies llistades, cadascuna amb la seva incidència: quins refusos són
  transitoris (plugin-hostd-protocol#23), els verbs i els codis de resposta al client en Python
  (plugin-hostd-protocol#24) i els motius d'agrupació de `grouping.json` (plugin-hostd#67).
- L'exportació `/validate` d'omx-contract, el seu `omx_contract.py` generat i el `readDistributedLayer` de plugin-qualify
  no tenen cap exemple als seus repositoris.
- Els bessons en TypeScript d'omx-dsp i el client en TypeScript de plugin-hostd només són a npm, no als paquets rpm ni
  deb; el bessó en TypeScript de plugin-db és privat.
