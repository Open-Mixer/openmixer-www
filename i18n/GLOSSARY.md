# Catalan glossary

How the Catalan site says the words a sound engineer uses. The machine-readable copy is
`i18n/glossary.json`; `npm run check:i18n` reads it and fails on any form it refuses.

## The rules

- Write Catalan, not English with Catalan words. Rebuild the sentence; never translate word
  for word.
- No comma before "i" (or "o"), unless it closes an inserted clause.
- Technical terms that Catalan sound engineers say in English stay in English, in roman, with
  no quotes and no italics. They take Catalan articles and plurals: el fader, els faders, el
  gate, els busos, un plugin, els plugins.
- Product, protocol and package names never change: OpenMixer, REAC, PipeWire, CLAP, LV2,
  omx-clap-host, plugin-hostd, dnf, apt.
- The public name is OpenMixer. The wordmark in the header stays as drawn.
- Commands, paths, code and REST paths are never translated.

## Terms that stay in English

fader, gate, compressor, limiter, bypass, plugin, bus (plural: busos), stagebox, mute, solo,
cue, send, insert, patchbay, DCA, matrix, mix, monitor, talkback, delay (the effect), reverb,
EQ, pan, xrun. Latency is latència.

The console's labels, abbreviations, effect names and unit symbols also stay as they are. A Catalan
engineer reads them on the desk as written, so a Catalan catalog entry identical to its English is right
for each of these, and only for these (`i18n/glossary.json` lists them as `keep` terms with the same
reasons):

| Term | Why it stays |
|---|---|
| ARM | record-arm key |
| auto | automatic mode label |
| aux | auxiliary send, said as is |
| BPM | beats per minute, read as is |
| broadcast | broadcast, said as is |
| buffer | audio buffer, said as is |
| BYP | bypass abbreviation |
| CH | channel abbreviation |
| chorus | effect name |
| clip | clip lamp, said as is |
| comp | compressor abbreviation |
| CPU | processor abbreviation |
| CR | control room abbreviation |
| dB | unit symbol |
| dBFS | unit symbol |
| de-esser | effect name |
| DIM | monitor dim key |
| drive | effect name |
| end-fire | sub-array pattern, said as is |
| FBS | feedback suppressor, the desk abbreviation |
| feedback | feedback, said as is |
| FET | compressor model class |
| firmware | firmware, said as is |
| flanger | effect name |
| FX | effects, said as is |
| GLUE | the console's GLUE control |
| GO | cue GO key |
| GRP | group abbreviation |
| handles | OS file handles |
| HD | display mode label |
| heap | memory heap |
| hi-hat | instrument name, said as is |
| HPF | high-pass filter abbreviation |
| HRP | the console's HRP section name |
| Hz | SI unit symbol |
| IFB | interruptible foldback |
| jitter | timing jitter, said as is |
| key | sidechain key, said as is |
| kHz | SI unit symbol |
| LCR | left/centre/right panning mode |
| link | stereo link key |
| listen | key listen, said as is |
| M | main/mono badge |
| mix-minus | broadcast feed, said as is |
| MON | monitor abbreviation |
| ms | SI unit symbol |
| MTX | matrix abbreviation |
| notch | filter name |
| OFF | panel state label |
| ON | panel state label |
| PA | the PA system, said as is |
| pad | input pad, said as is |
| patch | the routing patch, said as is |
| phaser | effect name |
| pitch | effect name |
| POST | post-fader key |
| post-fader | send point, said as is |
| PRE | pre-fader key |
| pre-fader | send point, said as is |
| preamp | preamp, said as is |
| ratio | compressor ratio label |
| REC | record key |
| recall | scene recall key |
| render | render key |
| reset | reset key |
| RMS | detector/model class |
| rotary | effect name |
| RTA | real-time analyser abbreviation |
| SAFE | solo-safe key |
| SEL | channel select key |
| SIP | solo-in-place |
| spill | DCA spill key |
| ST | stereo abbreviation; also the semitone mark on a transpose ({n} st) |
| sys | CPU system time |
| TAME | the console's TAME control |
| tremolo | effect name |
| trim | input trim, said as is |
| TRK | track abbreviation |
| usr | CPU user time |
| vintage | look style, said as is |

## Terms with one Catalan form

| English | Catalan | Not |
|---|---|---|
| mixing console | taula de mescles | consola de mescla, taula de barreja |
| desk | taula | escriptori |
| channel, channel strip | canal | tira de canal |
| head-amp, preamp | previ | preamplificador de capçal |
| phantom power | Phantom 48V | alimentació fantasma, alimentació phantom, poder fantasma |
| track | pista | |
| recording | enregistrament | gravació |
| sample rate | freqüència de mostratge | taxa de mostra |
| meter | vúmetre | comptador |
| threshold | llindar | |
| surface (the browser UI) | superfície | |
| scene | escena | |
| show (a performance) | actuació | espectacle |
| rig | equip | |
| free software | programari lliure | software lliure |
| download | baixar | descarregar |
| browser | navegador | explorador |
