# Changelog

## 2.0.7

- Fix: when the startup patch of `workbench.html` failed, it failed silently — most often a permission error when VS Code is installed in a protected location — so the cat simply never appeared with no explanation. The extension now shows a warning with the failure reason and a one-click **retry** action.
- The README now has an **Installation** section, including what to do when the cat doesn't show up (`Cat Pet: Install Status Bar Pet` from the Command Palette).

## 2.0.6

- **New**: Click the cat to pet it — it does a happy wiggle and spawns little hearts. Toggle with `blobcat.enablePetting` (default `true`).
- **New**: `blobcat.catColor` — recolor the cat's body and tail with any CSS color string (default `#FFFFFF`). Pairs nicely with custom themes.

## 2.0.5

- Fix: the `blobcat.*` configuration block was at the top level of `package.json` instead of inside `contributes`, so the four settings never showed up in VS Code's Settings UI. Moved it under `contributes.configuration`. Editing `settings.json` directly already worked in 2.0.4.

## 2.0.4

- The `blobcat.*` settings declared in `package.json` are now wired up:
  - `blobcat.enableSleep` — cat closes its eyes after 30 seconds of inactivity.
  - `blobcat.enableParticles` — toggle the pink particles that pop on keystroke.
  - `blobcat.catScale` — resize the cat (`0.5` – `3`, default `1`).
  - `blobcat.catOpacity` — fade the cat (`0.1` – `1`, default `1`).
- Changing any of these rewrites `workbench.html`; a VS Code restart is required for the new values to take effect.

## 2.0.3

- Added a small white highlight to each eye so the cat looks a bit more alive.

## 2.0.2

- Updated the marketplace icon to match the current cat design (now includes the tail).

## 2.0.1

- Removed stray `clean_vscode.js` (a stale developer utility) that was shipping inside the vsix and contained a hardcoded local path. The legacy `.desktop.main.js` cleanup is already handled inside the extension at activation, so no replacement is needed.
- Hardened `.vscodeignore` so similar local-only utilities won't get packaged in the future.

## 2.0.0

- **Injection target changed**: Previously patched `out/vs/workbench/workbench.desktop.main.js` (a minified bundle) via regex splicing. From this version on, the extension inserts a `<script>` tag into `out/vs/code/electron-browser/workbench/workbench.html` instead.
  - More stable: minified bundle patches broke on every VS Code update; HTML injection survives across updates.
  - Cleaner backup/restore: the original `workbench.html` is preserved as `workbench.html.cat-backup`.
  - On first launch, any leftover `.desktop.main.js` patches from earlier versions are cleaned up automatically.
- Adapts to VS Code's newer directory layout (`electron-sandbox` → `electron-browser`).
- Visuals and animations are unchanged from 1.x (multi-color cat, tail wag, jump, particles, blinking).

## 1.2.2

- **중요 버그 수정**: 1.1.0~1.2.1의 `deactivate()`가 normal VS Code 종료 시점에도 디스크 패치를 제거하던 문제. 이로 인해 다음 세션에서 워크벤치 메모리에 패치가 로드되지 않아 고양이가 영영 보이지 않는 회귀가 있었음. 이번 버전부터 `deactivate()`는 아무것도 하지 않음.
- 잔존 패치 정리는 다음 두 경로 중 하나로 동작:
  - 다른 버전을 install하면 `installPatch`가 모든 이전 `CAT_PATCH` 블록을 자동으로 정리 후 새로 주입.
  - 명령 팔레트에서 `Cat Pet: Remove Status Bar Pet` 수동 실행.

## 1.2.1

- 최신 VS Code의 status bar DOM 변경으로 고양이가 주입되지 않던 문제 수정 (셀렉터 fallback 추가).

## 1.2.0

- 점프 애니메이션을 squash &amp; stretch 방식으로 재작성 (웅크림 → 점프 → 정점 → 착지 → 회복).
- 점프 중에는 눈을 살짝 감아 "신난" 표정으로 변하고, 입 모양도 더 큰 미소로 바뀜.
- idle 상태에서 4~7초 주기로 가끔 눈을 깜빡이는 디테일 추가.
- 마우스를 올리면 살짝 갸우뚱하면서 볼이 더 진해지는 호버 반응 추가.
- 점프할 때 발 밑에서 작은 핑크 파티클이 톡톡 튀어나옴.
- 본체 뒤로 살랑살랑 흔들리는 꼬리 추가 (점프 중에는 빠르게 흔들림).

## 1.1.0

- 확장을 disable / uninstall할 때 워크벤치에 주입했던 패치가 자동으로 제거되도록 `deactivate()` 추가.

### 1.0.9 이하 버전 사용자 안내

1.0.9 이하에서는 확장을 uninstall해도 VS Code 내부 파일(`workbench.desktop.main.js`)에 주입된 패치가 남아, 고양이가 상태바에 그대로 보이는 문제가 있었습니다. 이미 그 상태인 경우 다음 중 하나를 따라주세요.

1. **권장**: 1.1.0으로 업데이트 → VS Code 재시작(확장이 한 번 활성화되도록) → 확장 uninstall. 이때 `deactivate()`가 호출되어 패치가 자동 정리됩니다.
2. 또는 확장이 설치된 상태에서 명령 팔레트(`Ctrl+Shift+P`) → **Cat Pet: Remove Status Bar Pet** 실행 → 그 다음 uninstall.
3. 위 둘 다 어려우면, VS Code를 종료하고 `<VS Code 설치 경로>/resources/app/out/vs/workbench/workbench.desktop.main.js` 파일에서 `/* CAT_PET_PATCH_..._START */` ~ `/* ..._END */` 블록을 직접 삭제.

> 패치 제거 후 VS Code가 *"installation appears to be corrupt"* 알림을 한 번 띄울 수 있는데, 정상 동작이며 무시하면 됩니다.

## 1.0.9

- 타이핑 시 고양이 위치가 흔들리던 문제 수정.

## 1.0.6

- blobcat SVG 렌더링 안정화.
