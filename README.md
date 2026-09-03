# bloom-testing-inputs

Test input collections and books for [Bloom](https://github.com/BloomBooks/BloomDesktop),
plus their reference baselines (e.g. visual-regression screenshots).

This repo holds the **inputs for all Bloom testing** — both the automated suites
(nightly edge-to-edge and visual-regression tests in BloomDesktop) and tests that are
still executed manually. Test *code* does not live here; it lives in BloomDesktop,
versioned with the product code it tests. This repo is data.

## How BloomDesktop consumes this repo

BloomDesktop pins an exact commit of this repo in `build/testing-inputs.pin` and
fetches it with `build/get-testing-inputs.mjs` into its gitignored
`output/testing-inputs/` folder. That means:

- Changing this repo breaks nothing until a BloomDesktop branch advances its pin.
- Each BloomDesktop branch (master, Version6.5, …) pins the commit that matches it.
- To ship a data change: merge it here, then open a BloomDesktop PR that updates the
  pin (and any test expectations) together.

## Layout

```
collections/
  <collection-name>/
    <collection-name>.bloomCollection
    <Book Title>/
      <Book Title>.htm          # the book DOM (validated by CI)
      meta.json, appearance.json, publish-settings.json, images…
      screenshots/*-reference.png   # committed baselines, when the owning test uses them
fonts/
  <Font>/*.ttf + license file   # fonts a test installs before it runs; see fonts/README.md
manifest.json                   # required entry per collection: purpose, usedBy, automation
scripts/                        # validation run by CI and by `pnpm validate`
```

## Authoring rules

- **Author books with Bloom itself**, then copy the folder in. Hand-editing the .htm
  invites invalid DOM; CI runs `scripts/validateBloomBook.mjs` (vendored from
  BloomDesktop's `edit-bloom-book` skill) against every book.
- **Commit the rendering-relevant CSS Bloom regenerates** (branding.css,
  appearance.css, defaultLangStyles.css, origami.css, langVisibility.css), captured
  under the Default branding. These snapshots are forensic evidence: when a reference
  screenshot later breaks, their diff can name the cause. Refresh them whenever you
  refresh reference screenshots. Run artifacts (thumbnails, coverImage caches,
  history.db, branding logo copies) stay uncommitted; the `.gitignore` explains the
  split.
- **Add a `manifest.json` entry** for every new collection: what it is for, which test
  suite (or manual test) uses it, and `"automation": "automated" | "manual"`.
- **Stay inside the size budgets**: 10 MB per file, 50 MB per book folder (CI-enforced;
  a collection can override in its manifest entry, with justification in the PR).
  This repo is plain git, no LFS; keep media small (shrink images, trim audio/video).
- **Keep content redistributable.** Everything here is public. Only include images,
  audio, and text that we have the right to publish (CC-licensed or team-created).

## Running validation locally

```bash
pnpm install
pnpm validate
```
