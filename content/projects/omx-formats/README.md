<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- Copyright (C) 2026 Pau Aliagas -->
# omx-formats

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

The renders, committed and held to the modules by `make check`: `include/omxcontract/omx_formats.h` (the C header),
`share/omx-formats/omx_formats.py` (the Python module) and `ts/formats.js` with `ts/formats.d.ts` (the TypeScript
values). They are byte for byte what omx-contract rendered from its own `data/formats/` before the move.

A new format is a new module; no other module's version or consumers change. A consumer reads the modules it
speaks. Modules refer to each other by `$id`, never by file path.

## Status: not released, not installable yet

The repository content is here; there is NO release and NO tag. A package of omx-formats would ship the same files as
omx-contract's `omx-contract-data` until omx-contract removes `data/formats/` (omx-contract#90, after moves 2, 6 and
11 of omx-contract#81), so the first tag, `v0.1.0`, is cut only with the omx-contract release that removes it
(expected 3.21.0), and the packages floor that release (`omx-contract-data >= 3.21.0`). No release workflow exists
yet: it is added with that tag (as omx-contract's `release.yml`, run by a `v*` tag only; a package is published by a
tag and never by a push or a pull request). The packages: `omx-formats` (the modules and the Python module) and
`omx-formats-devel` / `libomx-formats-dev` (the C header, nothing else).

## Work on it

`make check` parses every module; with `OMX_CONTRACT` set to the omx-contract command it validates them and holds the renders and the terms to omx-contract's own. `make install DESTDIR=...` installs `contract.d/`. A
pull request runs the fast checks only; the packages build on `workflow_dispatch` and on a `v*` tag.

Licence: GPL-3.0-or-later.
