# fonts/

Fonts that a test installs on the machine before it runs, because the test is about how Bloom
treats a font of that kind and a clean Windows runner has none.

Bloom reads each installed font's internal metadata (the name table's copyright, license and
license URL, and the OS/2 `fsType`) and sorts it into one of four verdicts, shown in the font
chooser as a mark beside the font (`src/BloomExe/FontProcessing/FontMetadata.cs` in BloomDesktop):

| Verdict      | Mark             | What Bloom found                                                   |
| ------------ | ---------------- | ------------------------------------------------------------------ |
| `ok`         | check            | a license it recognises as free (OFL, GPL, Apache, ...)             |
| `unsuitable` | exclamation mark | a Microsoft font, "All rights reserved", "may not copy", ...        |
| `unknown`    | question mark    | nothing it can read either way                                     |
| `invalid`    | exclamation mark | a file format Bloom cannot embed                                   |

A GitHub Actions `windows-latest` runner has only Microsoft fonts and a few Bloom ships, so it
has no `unsuitable` font that is not Microsoft's, and no `unknown` font at all. The two fonts
here fill those gaps. Both are genuinely free to redistribute; they land in those verdicts
only because their internal metadata does not say so in a form Bloom's heuristics recognise.

## The fonts

### Alef (verdict: `unsuitable`, "All rights reserved")

- Files: `Alef/Alef-Regular.ttf`, `Alef/Alef-Bold.ttf`, version 1.002.
- License: SIL Open Font License 1.1 (`Alef/OFL.txt`), copyright HaGilda & Mushon Zer-Aviv.
- Source: Google Fonts, https://github.com/google/fonts/tree/main/ofl/alef (the files are
  byte-for-byte that repository's, fetched 2026-09-03).
- Why it gets this verdict: the font's copyright string is "Copyright (c) 2012 by Hagilda. All
  rights reserved." and its license fields are empty, so Bloom's "all rights reserved and no
  license" rule fires before anything else. The font is OFL regardless; the metadata is just
  incomplete.

### Luciole (verdict: `unknown`)

- Files: `Luciole/Luciole-Regular.ttf`, version 1.001.
- License: Creative Commons Attribution 4.0 International (`Luciole/LICENSE.txt`), by Laurent
  Bourcellier & Jonathan Perez, 2019. CC BY asks for attribution: this README and the LICENSE
  file beside the font are it.
- Source: https://www.luciole-vision.com/luciole-en.html, the `Luciole.zip` download (fetched
  2026-09-03; the file is byte-for-byte the one in that zip).
- Why it gets this verdict: the license field says, in French and English, that the font is
  free under CC BY 4.0, and the license URL points at creativecommons.org, but Bloom's rules
  look for "Creative Commons" only in the copyright string, so nothing matches and it gives up
  with "no reliable information".

## Who uses them

`src/BloomE2E/tests/font-chooser.spec.ts` in BloomDesktop (Notion test case 358), which needs
one installed font of each verdict. The nightly workflow installs everything under this folder
per user before the e2e suite (`src/BloomE2E/scripts/install-test-fonts.ps1`); a developer whose
machine lacks a font of some kind can run the same script.

## Adding a font

Keep only what a test needs (one weight is usually enough), put the upstream license text beside
the files, and record here: the verdict Bloom gives and which metadata produces it, the real
license, and the exact source and date. Everything in this repo is public, so a font must be
one we may redistribute. Check the verdict before you commit: install the font, open Bloom's
Format dialog, and hover the mark, or read `fonts/metadata` from Bloom's API.
