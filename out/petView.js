"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class PetViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // 웹뷰에서 오는 메시지 수신 (클릭 등)
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'clicked':
                    vscode.window.showInformationMessage('야옹! (고양이가 기분 좋아 보입니다)');
                    break;
            }
        });
    }
    // 타이핑 시 고양이에게 신호를 보냄
    onTyping() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'typing' });
        }
    }
    _getHtmlForWebview(webview) {
        const catUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'cat.svg'));
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <style>
                body { margin: 0; padding: 0; overflow: hidden; height: 100vh; background-color: transparent; }
                #pet-container { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); transition: all 0.5s ease-in-out; cursor: pointer; }
                #pet { width: 100px; height: 100px; image-rendering: pixelated; }
                
                /* 애니메이션 정의 */
                .walk { animation: walk-cycle 0.5s infinite alternate; }
                @keyframes walk-cycle {
                    from { transform: rotate(-5deg) translateY(0); }
                    to { transform: rotate(5deg) translateY(-10px); }
                }

                .typing { animation: jump 0.2s ease-in-out; }
                @keyframes jump {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }
            </style>
        </head>
        <body>
            <div id="pet-container">
                <img id="pet" src="${catUri}" />
            </div>

            <script>
                const petContainer = document.getElementById('pet-container');
                const pet = document.getElementById('pet');
                let x = 50; // 퍼센트 위치
                let direction = 1;

                // 클릭 이벤트
                petContainer.addEventListener('click', () => {
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage({ type: 'clicked' });
                });

                // 랜덤 이동 로직
                setInterval(() => {
                    if (Math.random() > 0.7) { // 30% 확률로 이동
                        x += (Math.random() * 20 - 10) * direction;
                        if (x < 10) { x = 10; direction = 1; }
                        if (x > 90) { x = 90; direction = -1; }
                        
                        petContainer.style.left = x + '%';
                        pet.classList.add('walk');
                        setTimeout(() => pet.classList.remove('walk'), 1000);
                        pet.style.transform = direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
                    }
                }, 3000);

                // 익스텐션(백엔드)에서 오는 신호 수신
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'typing') {
                        petContainer.classList.add('typing');
                        setTimeout(() => petContainer.classList.remove('typing'), 200);
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
exports.PetViewProvider = PetViewProvider;
PetViewProvider.viewType = 'catGotchi.petView';
//# sourceMappingURL=petView.js.map