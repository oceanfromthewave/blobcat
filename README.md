# Cat Pet Status Bar

just blobcat in your status bar 🐱

## ⚠️ After Installation

To render the cat in the status bar, this extension injects a `<script>` tag into VS Code's `workbench.html`.

As a result, VS Code may show this notification once on startup:

> **Your Code installation appears to be corrupt. Please reinstall.**

**This is expected — please ignore it.** VS Code's integrity check detects that the workbench HTML has been modified and warns about it, but nothing is actually broken. You can safely click "Don't show again."

## Usage

- After installing the extension, restart VS Code. The cat appears on the left side of the status bar.
- Typing makes the cat jump with little pink particles.
- **Clicking the cat pets it** — it does a happy wiggle and spawns floating hearts.
- After 30 seconds of inactivity, the cat dozes off (eyes closed, slower tail).
- Hovering tilts the cat and brightens its cheeks.

## Settings

| Setting | Default | Description |
|---|---|---|
| `blobcat.enableSleep` | `true` | Close the cat's eyes after 30 seconds of inactivity. |
| `blobcat.enableParticles` | `true` | Spawn pink particles when the cat jumps on keystroke. |
| `blobcat.enablePetting` | `true` | Click the cat to pet it — wiggle + heart particles. |
| `blobcat.catScale` | `1` | Size multiplier for the cat (`0.5` – `3`). |
| `blobcat.catOpacity` | `1` | Opacity of the cat (`0.1` – `1`). |
| `blobcat.catColor` | `#FFFFFF` | Body/tail color (any CSS color string, e.g. `orange`, `#FFB6A3`). |

Changing a setting rewrites VS Code's `workbench.html`; restart VS Code for the new values to take effect.

## How to Remove

Open the Command Palette (`Ctrl+Shift+P`) → run **Cat Pet: Remove Status Bar Pet** → restart VS Code.

For manual removal, delete the block between `<!-- CAT_PET_INJECT_START -->` and `<!-- CAT_PET_INJECT_END -->` in `<VS Code install path>/resources/app/out/vs/code/electron-browser/workbench/workbench.html`.

