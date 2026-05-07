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
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PATCH_ID = 'CAT_PET_PATCH_V13';
function activate(context) {
    // ✅ StatusBar: 고정 텍스트 (UX 핵심)
    const myStatusBarItem = vscode.window.createStatusBarItem('cat-pet-signal', vscode.StatusBarAlignment.Left, 10000);
    myStatusBarItem.text = "🐱 BlobCat";
    myStatusBarItem.show();
    context.subscriptions.push(myStatusBarItem);
    // ✅ typing 감지 (UI 변경 X, trigger만 사용)
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        triggerTypingAnimation();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('cat-pet.install', () => installPatch()));
    context.subscriptions.push(vscode.commands.registerCommand('cat-pet.uninstall', () => uninstallPatch()));
    installPatch(true);
}
exports.activate = activate;
/* =========================
   Typing trigger (DOM patch용)
========================= */
function triggerTypingAnimation() {
    const vscodeApi = globalThis.vscode;
    // 실제 DOM은 webview/patch 쪽에서 감지
    const sig = document.querySelector('#cat-pet-signal');
    if (sig) {
        sig.setAttribute('data-state', 'typing');
        setTimeout(() => {
            sig.setAttribute('data-state', 'idle');
        }, 300);
    }
}
/* =========================
   Install Patch
========================= */
async function installPatch(silent = false) {
    const appRoot = vscode.env.appRoot;
    const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
    try {
        let content = fs.readFileSync(jsPath, 'utf-8');
        // 기존 패치 제거
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        content = content.replace(allPatchRegex, '');
        const patchCode = `
/* ${PATCH_ID}_START */
(function () {

    let injected = false;

    function createSVG(tag, attrs = {}) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function inject() {
        if (injected) return;
        injected = true;

        const leftItems = document.querySelector('.part.statusbar .items-container.left-items');
        if (!leftItems) return;

        // 기존 signal 숨김
        const signalItem = document.querySelector('[id*="cat-pet-signal"]');
        if (signalItem) {
            signalItem.style.position = 'absolute';
            signalItem.style.opacity = '0';
            signalItem.style.pointerEvents = 'none';
            signalItem.style.width = '0';
        }

        // container
        const container = document.createElement('div');
        container.id = 'cat-pet-container';
        container.style.cssText = 'display:flex; align-items:center; padding:0 8px; height:100%;';

        const svg = createSVG('svg', { viewBox: '0 0 100 100' });
        svg.id = 'cat-pet-svg';
        svg.style.cssText = 'height:24px; width:24px; transition: all 0.35s ease; transform-origin: center bottom;';

        const g = createSVG('g');

        const shapes = [
            {t:'path', a:{d:'M20 80 Q20 40 50 40 Q80 40 80 80 Z', fill:'#FFFFFF', stroke:'#E0E0E0', 'stroke-width':'2'}},

            {t:'path', a:{d:'M34 41 Q30 30 40 38 Z', fill:'#FFFFFF'}},
            {t:'path', a:{d:'M66 41 Q70 30 60 38 Z', fill:'#FFFFFF'}},

            {t:'circle', a:{cx:'40', cy:'55', r:'4', fill:'#333'}},
            {t:'circle', a:{cx:'60', cy:'55', r:'4', fill:'#333'}},

            {t:'circle', a:{cx:'32', cy:'62', r:'5', fill:'#FFD1DC'}},
            {t:'circle', a:{cx:'68', cy:'62', r:'5', fill:'#FFD1DC'}},

            {t:'path', a:{d:'M45 65 Q50 70 55 65', fill:'none', stroke:'#333', 'stroke-width':'2'}}
        ];

        shapes.forEach(s => g.appendChild(createSVG(s.t, s.a)));
        svg.appendChild(g);
        container.appendChild(svg);
        leftItems.appendChild(container);

        /* =========================
           Idle breathing animation
        ========================= */
        let scale = 1;
        setInterval(() => {
            const cat = document.getElementById('cat-pet-svg');
            if (!cat) return;

            const state = cat.getAttribute('data-state');

            if (state !== 'typing') {
                scale = scale === 1 ? 1.08 : 1;
                cat.style.transform = \`scaleY(\${scale})\`;
            }
        }, 1200);

        /* =========================
           Typing reaction animation
        ========================= */
        const observer = new MutationObserver(() => {
            const cat = document.getElementById('cat-pet-svg');
            if (!cat) return;

            const sig = document.querySelector('#cat-pet-signal');
            const state = sig?.getAttribute('data-state');

            if (state === 'typing' && !cat.classList.contains('jump')) {
                cat.classList.add('jump');

                cat.style.transition = 'all 0.12s ease';
                cat.style.transform = 'translateY(-6px) scale(0.95, 1.1)';

                setTimeout(() => {
                    cat.classList.remove('jump');
                    cat.style.transform = 'translateY(0) scale(1)';
                    cat.style.transition = 'all 0.35s ease';
                }, 180);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    inject();

})();
/* ${PATCH_ID}_END */
`;
        fs.writeFileSync(jsPath, content + patchCode);
        if (!silent) {
            vscode.window.showInformationMessage('BlobCat v13 적용 완료 🐱 (IDLE/TYPING 제거 + 안정화 완료)');
        }
    }
    catch (err) {
        if (!silent) {
            vscode.window.showErrorMessage('패치 실패: ' + err.message);
        }
    }
}
/* =========================
   Uninstall
========================= */
async function uninstallPatch() {
    const appRoot = vscode.env.appRoot;
    const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
    try {
        let content = fs.readFileSync(jsPath, 'utf-8');
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        content = content.replace(allPatchRegex, '');
        fs.writeFileSync(jsPath, content);
        vscode.window.showInformationMessage('BlobCat 패치 제거 완료');
    }
    catch (err) {
        vscode.window.showErrorMessage('제거 실패: ' + err.message);
    }
}
//# sourceMappingURL=extension.js.map