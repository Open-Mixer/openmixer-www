<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- Copyright (C) 2026 Pau Aliagas -->
# omx-formats

**Folded, to be archived (owner ruling Q9, 2026-11-20).** omx-formats is not the format level: each format's terms
live with the owner of that format's level, which maps them to the standard words of omx-contract. The LV2 terms and
the words every format's terms use are plugin-db's, the CLAP terms are omx-clap-core's. Nothing here was ever released,
and no repository reads it. The table below gives every module, item and file its new home; the repository is archived
after the owners' pull requests land (O5), and nothing new is written here.

## Where everything went

| Here | Items | New home |
|---|---|---|
| `contract.d/formats/common/common.json` | `FORMAT_TERM_KINDS`, `FORMAT_TERM_STATUSES` (29 words) | plugin-db, domain `format`: `contract.d/format/format.json`, names and words unchanged |
| `contract.d/formats/lv2/lv2.json` | the 24 LV2 terms items (452 terms): `LV2_ATOM_TERMS`, `LV2_BUF_SIZE_TERMS`, `LV2_CORE_TERMS`, `LV2_DATA_ACCESS_TERMS`, `LV2_DYNMANIFEST_TERMS`, `LV2_EVENT_TERMS`, `LV2_INSTANCE_ACCESS_TERMS`, `LV2_LOG_TERMS`, `LV2_MIDI_TERMS`, `LV2_MORPH_TERMS`, `LV2_OPTIONS_TERMS`, `LV2_PARAMETERS_TERMS`, `LV2_PATCH_TERMS`, `LV2_PORT_GROUPS_TERMS`, `LV2_PORT_PROPS_TERMS`, `LV2_PRESETS_TERMS`, `LV2_RESIZE_PORT_TERMS`, `LV2_STATE_TERMS`, `LV2_TIME_TERMS`, `LV2_UI_TERMS`, `LV2_UNITS_TERMS`, `LV2_URI_MAP_TERMS`, `LV2_URID_TERMS`, `LV2_WORKER_TERMS` | plugin-db, domain `lv2`: `contract.d/lv2/lv2.json`, names and terms unchanged (omx-contract's terms kind), beside the F1 mapping of the LV2 units, designations and port properties to the standard words (sorting pass V27a, F1, O1) |
| `contract.d/formats/clap/clap.json` | the 58 CLAP terms items (297 terms), `CLAP_COLOR_TERMS` to `CLAP_VERSION_TERMS` | omx-clap-core, domain `clap`, with the F2 mapping (sorting pass V27b, O2) |
| `include/omxcontract/omx_formats.h`, `share/omx-formats/omx_formats.py`, `ts/formats.js`, `ts/formats.d.ts` | the renders of the 82 items | none: nothing includes or imports them (a grep over every repository finds no reader); an owner renders its own domain when a reader needs it. Their comparison with omx-contract's renders left with those renders (omx-contract renders no format terms after V27b): `make check` no longer makes it, and the files stay here unchanged until the archive |
| `test/golden/terms.digest` | the digest of the 82 classic items | split: plugin-db `tests/golden/lv2-terms.digest` (the 24 LV2 items, `tests/lv2_domain_test.py`); the CLAP half with omx-clap-core's domain |
| `tools/check.sh`, `tools/terms-digest.mjs`, `Makefile` | the tree's check and install | each owner's own tests and install of its domains |
| `debian/`, `packaging/omx-formats.spec`, `.github/`, `.githooks/` | packaging and CI of a package never released | none: no package is built |

The prefix change of the open pull request #2 (`FORMATS_LV2_*`, `FORMATS_CLAP_*`, `FORMATS_COMMON_*`) is not needed under
the new homes: the domains `lv2`, `clap` and `format` take the names as they are. Its `$schema` statement is in
plugin-db's domains.

## What it was

The plugin-format vocabulary of OpenMixer: the identifiers, numbers and terms of the plugin formats OpenMixer hosts
(CLAP, LV2, and any format added later), each mapped under its own name with its status for us. It is one domain
module per format, shared terms in a common module, every module a self-describing OpenAPI-3.1-style document with
its own version, shipped with its catalogs. The loader, the validator and the renderers are
[omx-contract](https://github.com/Open-Mixer/omx-contract)'s; this package holds the data only.

## Layout

```
contract.d/formats/common/    the words every format's terms use: FORMAT_TERM_KINDS and FORMAT_TERM_STATUSES
contract.d/formats/clap/      the CLAP terms
contract.d/formats/lv2/       the LV2 terms
contract.d/formats/<module>/catalogs/<lang>.json   the module's translations
```

The modules carry the 82 terms items omx-contract's `data/formats/` held (297 CLAP terms, 452 LV2 terms), moved
unchanged: `test/golden/terms.digest` is the digest of the classic items and `make check` holds the modules to it. No
term has a translation today (no catalog of omx-contract keys a format item), so there is no catalog to move; a module's
translations go in `contract.d/formats/<module>/catalogs/<lang>.json`, which omx-contract's reader takes with the module
(owner `omx-formats`).

The renders, committed (until the sorting pass held to omx-contract's renders by `make check`; that comparison left with omx-contract's format renders): `include/omxcontract/omx_formats.h` (the C header),
`share/omx-formats/omx_formats.py` (the Python module) and `ts/formats.js` with `ts/formats.d.ts` (the TypeScript
values). They are byte for byte what omx-contract rendered from its own `data/formats/` before the move.

A new format is a new module; no other module's version or consumers change. A consumer reads the modules it
speaks. Modules refer to each other by `$id`, never by file path.

## Status: never released; folded and to be archived

There is NO release and NO tag, and none will be cut: the fold above replaces the plan below. The plan, kept as it was
written: a package of omx-formats would ship the same files as
omx-contract's `omx-contract-data` until omx-contract removes `data/formats/` (omx-contract#90, after moves 2, 6 and
11 of omx-contract#81), so the first tag, `v0.1.0`, is cut only with the omx-contract release that removes it
(expected 3.21.0), and the packages floor that release (`omx-contract-data >= 3.21.0`). No release workflow exists
yet: it is added with that tag (as omx-contract's `release.yml`, run by a `v*` tag only; a package is published by a
tag and never by a push or a pull request). The packages: `omx-formats` (the modules and the Python module) and
`omx-formats-devel` / `libomx-formats-dev` (the C header, nothing else).

## Work on it

`make check` parses every module; with `OMX_CONTRACT` set to the omx-contract command it validates them (the omx-contract of ci.yml's pin) and holds the terms to the classic digest. `make install DESTDIR=...` installs `contract.d/`. A
pull request runs the fast checks only; the packages build on `workflow_dispatch` and on a `v*` tag.

Licence: GPL-3.0-or-later.
