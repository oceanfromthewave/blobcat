# Changelog

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
