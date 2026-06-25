<div align="center">

<!-- TODO(growth): replace media/icon.png below with an animated demo GIF (docs/hero.gif).
     Record a ~4s clip of the cat jumping as you type + a click-to-pet (hearts).
     A real GIF here is the single biggest install-rate lever for a visual extension. -->
<img src="media/icon.png" alt="BlobCat" width="160" />

# BlobCat 🐱

**A tiny cat that lives in your VS Code status bar and reacts as you type.**

No panel. No window. No screen space. Just a cute kitty in the corner that jumps when you code.

[![Version](https://img.shields.io/visual-studio-marketplace/v/blobcat.cat-pet-statusbar?label=Marketplace&color=ff69b4)](https://marketplace.visualstudio.com/items?itemName=blobcat.cat-pet-statusbar)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/blobcat.cat-pet-statusbar?color=blue)](https://marketplace.visualstudio.com/items?itemName=blobcat.cat-pet-statusbar)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/blobcat.cat-pet-statusbar?color=yellow)](https://marketplace.visualstudio.com/items?itemName=blobcat.cat-pet-statusbar&ssr=false#review-details)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[**Install from the Marketplace →**](https://marketplace.visualstudio.com/items?itemName=blobcat.cat-pet-statusbar)

</div>

---

## Why BlobCat?

Most VS Code pets open a panel or floating window that eats your screen. **BlobCat doesn't.** It's one tiny animated cat in the status bar — always visible, never in the way — and it reacts to *you*:

- ⌨️ **Jumps when you type** — little pink particles pop under its feet.
- 🫶 **Click to pet it** — happy wiggle + floating hearts.
- 😴 **Dozes off when you idle** — eyes close, tail slows after 30s.
- 🎨 **Recolor it** — match any theme with a single CSS color.
- 🪶 **Zero screen real estate** — it's just status-bar text, not a webview.

> Think of it as a 26‑pixel coding companion that celebrates every keystroke. 🐾

## ✨ Features

| | |
|---|---|
| ⌨️ **Reacts to typing** | The cat jumps with each keystroke, with optional pink particles. |
| 🫶 **Pet it** | Click the cat for a happy wiggle and a burst of hearts. |
| 😴 **Sleep mode** | After 30s of no typing, the cat closes its eyes and slows down. |
| 🎨 **Custom color** | Set `blobcat.catColor` to any CSS color to match your theme. |
| 🔍 **Scale & opacity** | Make it bigger, smaller, or more subtle. |
| 🪶 **Status bar only** | No panel, no window — it never covers your code. |

<!-- TODO(growth): add a "See it in action" gallery once GIFs exist:
docs/typing.gif  (jump + particles)
docs/petting.gif (click → hearts)
docs/colors.png  (a row of recolored cats: white / orange / pink / mint)
-->

## 🚀 Install

1. Open **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`), search **“BlobCat”**, and click **Install**.
   Or run this from the Command Palette: `ext install blobcat.cat-pet-statusbar`
2. **Fully quit and reopen VS Code** (not just *Reload Window*). The cat appears on the **left side of the status bar**. 🐱

> **Heads-up:** to draw the cat, BlobCat injects a small `<script>` into VS Code's `workbench.html`. Because of that, VS Code may show *“Your installation appears to be corrupt”* once after install. **This is expected and harmless** — see the [FAQ](#-faq) below. If you'd rather not modify the workbench, this extension isn't for you, and that's okay. 🙂

## ⚙️ Settings

All settings live under `blobcat.*` (Settings UI → search “BlobCat”). Changing one rewrites `workbench.html`, so **restart VS Code** to see it.

| Setting | Default | Description |
|---|---|---|
| `blobcat.enableSleep` | `true` | Close the cat's eyes after 30 seconds of inactivity. |
| `blobcat.enableParticles` | `true` | Pink particles when the cat jumps on a keystroke. |
| `blobcat.enablePetting` | `true` | Click the cat to pet it — wiggle + heart particles. |
| `blobcat.catColor` | `#FFFFFF` | Body/tail color — any CSS color, e.g. `orange`, `#FFB6A3`. |
| `blobcat.catScale` | `1` | Size multiplier (`0.5`–`3`). |
| `blobcat.catOpacity` | `1` | Opacity (`0.1`–`1`). |

## ❓ FAQ

<details>
<summary><b>VS Code says “Your installation appears to be corrupt.” Did BlobCat break something?</b></summary>

No. To render the cat, BlobCat adds a `<script>` tag to VS Code's `workbench.html`. VS Code's integrity check notices that the file changed and shows this warning — but nothing is actually broken. You can safely click **“Don't show again.”** Removing BlobCat (below) restores the original file.
</details>

<details>
<summary><b>Why do I have to fully restart VS Code?</b></summary>

`workbench.html` is only read once, at startup. A *Reload Window* isn't enough — quit every window and reopen.
</details>

<details>
<summary><b>The cat didn't show up.</b></summary>

The startup patch can fail silently, most often when VS Code is installed in a protected location (e.g. `C:\Program Files\`). To run it manually and see the error:

1. Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **`Cat Pet: Install Status Bar Pet`** — it reports success or the reason it failed.
3. Restart VS Code.

If it's a permission error, launch VS Code once as administrator, run the command, then restart normally.
</details>

<details>
<summary><b>How do I remove it?</b></summary>

Command Palette → **`Cat Pet: Remove Status Bar Pet`** → restart VS Code. That restores the original `workbench.html` from its backup.

To remove it by hand, delete everything between `<!-- CAT_PET_INJECT_START -->` and `<!-- CAT_PET_INJECT_END -->` in
`<VS Code install path>/resources/app/out/vs/code/electron-browser/workbench/workbench.html`.
</details>

<details>
<summary><b>How is this different from vscode-pets?</b></summary>

[vscode-pets](https://marketplace.visualstudio.com/items?itemName=tonybaloney.vscode-pets) is great — it gives you many pets that roam a dedicated panel. BlobCat is the opposite trade-off: **one cat, in the status bar, that reacts to your typing, taking zero screen space.** Pick the vibe you want. 🐾
</details>

## 🤝 Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Good first contributions: new cat colors/presets, demo GIFs for this README, and bug reports from different OS/VS Code setups.

## 📄 License

[MIT](LICENSE) © oceanfromthewave
