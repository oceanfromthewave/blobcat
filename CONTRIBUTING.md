# Contributing to BlobCat 🐱

Thanks for helping the cat grow! Bug reports, ideas, and PRs are all welcome.

## Ways to help (no code required)

- 🐛 **Report bugs** from your OS / VS Code version — the workbench injection behaves differently across platforms and install locations.
- 🎨 **Suggest cat colors / presets** that pair well with popular themes.
- ⭐ **Leave a Marketplace review** — it's the single biggest discoverability boost.

## Project layout

- `src/extension.ts` — the only TypeScript source. It finds `workbench.html`, injects `media/cat.js`, and manages install/uninstall + config.
- `media/cat.js` — the cat itself (SVG, animations, particles, petting) injected into the workbench.
- `media/icon.png` — Marketplace icon (256×256). `docs/icon-source.png` is the high-res master; regenerate the small one from it rather than editing it directly.
- `docs/` — README/Marketplace images. Excluded from the packaged `.vsix`.

> Note: BlobCat renders by injecting a `<script>` into VS Code's `workbench.html`. We deliberately do **not** patch the minified `workbench.desktop.main.js` bundle.

> ⚠️ **Don't move or rename anything in `docs/`, and don't rename the `main` branch.** `vsce` rewrites the README's relative image paths to `github.com/.../raw/HEAD/docs/...`, and the Marketplace fetches them live. Moving a file there breaks the images on *already-published* listings, not just the next release.

## Dev setup

```bash
npm install
npm run compile      # tsc -> out/
```

Press **F5** in VS Code to launch the Extension Development Host. To see the cat, run the `BlobCat: Install Status Bar Pet` command, then fully restart that window.

## Pull requests

1. Branch off `main`.
2. Keep changes focused; `src/extension.ts` should stay the only TS module unless real reuse appears.
3. **User-facing text (README, CHANGELOG, notifications) must be in English.** Commit messages may be in Korean.
4. Do **not** bump the `version` in `package.json` in your PR — pushing a version bump to `main` auto-publishes to the Marketplace. Maintainers handle releases.
5. Add a CHANGELOG entry describing the change.

Thanks again! 🐾
