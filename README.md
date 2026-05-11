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
- Hovering tilts the cat and brightens its cheeks.

## How to Remove

Open the Command Palette (`Ctrl+Shift+P`) → run **Cat Pet: Remove Status Bar Pet** → restart VS Code.

For manual removal, delete the block between `<!-- CAT_PET_INJECT_START -->` and `<!-- CAT_PET_INJECT_END -->` in `<VS Code install path>/resources/app/out/vs/code/electron-browser/workbench/workbench.html`.
