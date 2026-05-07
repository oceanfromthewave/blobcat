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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PATCH_ID = 'CAT_PET_PATCH_V13';
function activate(context) {
    const myStatusBarItem = vscode.window.createStatusBarItem('cat-pet-signal', vscode.StatusBarAlignment.Left, 10000);
    myStatusBarItem.text = "IDLE";
    myStatusBarItem.show();
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.contentChanges.length > 0) {
            myStatusBarItem.text = "TYPING";
            setTimeout(() => { myStatusBarItem.text = "IDLE"; }, 250);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('cat-pet.install', () => installPatch()));
    context.subscriptions.push(vscode.commands.registerCommand('cat-pet.uninstall', () => uninstallPatch()));
    installPatch(true);
}
exports.activate = activate;
async function installPatch(silent = false) {
    const appRoot = vscode.env.appRoot;
    const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
    try {
        let content = fs.readFileSync(jsPath, 'utf-8');
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        content = content.replace(allPatchRegex, '');
        if (silent && content.includes(PATCH_ID))
            return;
        const patchCode = `
/* ${PATCH_ID}_START */
(function() {
    function createSVG(tag, attrs = {}) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function injectHiderStyle() {
        if (document.getElementById('cat-pet-hider-style')) return;
        const style = document.createElement('style');
        style.id = 'cat-pet-hider-style';
        style.textContent = \`
            [id*="cat-pet-signal"] {
                position: absolute !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                min-width: 0 !important;
                max-width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 0 !important;
                overflow: hidden !important;
                visibility: hidden !important;
                left: -9999px !important;
            }
        \`;
        document.head.appendChild(style);
    }

    function inject() {
        injectHiderStyle();
        if (document.getElementById('cat-pet-container')) return;
        const leftItems = document.querySelector('.part.statusbar .items-container.left-items');
        if (!leftItems) return;

        const container = document.createElement('div');
        container.id = 'cat-pet-container';
        container.style.cssText = 'display:flex; align-items:center; padding:0 8px; height:100%;';
        
        const svg = createSVG('svg', { viewBox: '0 0 100 100' });
        svg.id = 'cat-pet-svg';
        // 기본 트랜지션을 숨쉬기에 맞게 약간 느리게 설정 (0.4s)
        svg.style.cssText = 'height:24px; width:24px; transition: all 0.4s ease-in-out; transform-origin: center bottom;';

        const g = createSVG('g');
        g.style.transformOrigin = 'center bottom';

        const shapes = [
            {t:'path', a:{d:'M20 80 Q20 40 50 40 Q80 40 80 80 Z', fill:'#FFFFFF', stroke:'#E0E0E0', 'stroke-width':'2'}},

            // 둥근 왼쪽 귀
            {t:'path', a:{d:'M34 41 Q30 30 40 38 Z', fill:'#FFFFFF', stroke:'#E0E0E0'}},
            {t:'path', a:{d:'M35 39 Q32 33 38 37 Z', fill:'#FFD1DC'}},

            // 둥근 오른쪽 귀
            {t:'path', a:{d:'M66 41 Q70 30 60 38 Z', fill:'#FFFFFF', stroke:'#E0E0E0'}},
            {t:'path', a:{d:'M65 39 Q68 33 62 37 Z', fill:'#FFD1DC'}},

            // 눈
            {t:'circle', a:{cx:'40', cy:'55', r:'4', fill:'#333333'}},
            {t:'circle', a:{cx:'60', cy:'55', r:'4', fill:'#333333'}},

            // 볼
            {t:'circle', a:{cx:'32', cy:'62', r:'5', fill:'#FFD1DC'}},
            {t:'circle', a:{cx:'68', cy:'62', r:'5', fill:'#FFD1DC'}},

            // 입
            {t:'path', a:{d:'M45 65 Q50 70 55 65', fill:'none', stroke:'#333333', 'stroke-width':'2'}}
        ];

        shapes.forEach(s => g.appendChild(createSVG(s.t, s.a)));
        svg.appendChild(g);
        container.appendChild(svg);
        leftItems.appendChild(container);

        // 숨쉬기 애니메이션 (Idle) - 이제 티가 확 납니다!
        let breathScale = 1;
        setInterval(() => {
            const cat = document.getElementById('cat-pet-svg');
            if (cat && !cat.classList.contains('is-jumping')) {
                breathScale = (breathScale === 1) ? 1.10 : 1;
                cat.style.transform = \`scaleY(\${breathScale})\`;
            }
        }, 1000);

        const observer = new MutationObserver(() => {
            const sig = document.querySelector('[id*="cat-pet-signal"]');
            const isTyping = sig && (sig.textContent || "").includes('TYPING');
            const cat = document.getElementById('cat-pet-svg');
            
            if (cat && isTyping && !cat.classList.contains('is-jumping')) {
                cat.classList.add('is-jumping');
                // 점프 시에는 트랜지션을 빠르게 (0.1s)
                cat.style.transition = 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                cat.style.transform = 'translateY(-5px) scaleX(0.9) scaleY(1.1)';
                
                setTimeout(() => {
                    cat.classList.remove('is-jumping');
                    // 다시 숨쉬기용 트랜지션으로 복구 (0.4s)
                    cat.style.transition = 'all 0.4s ease-in-out';
                    cat.style.transform = 'translateY(0) scale(1)';
                }, 200);
            }
        });

        observer.observe(document.querySelector('.part.statusbar'), { 
            childList: true, 
            subtree: true, 
            characterData: true 
        });
    }
    setInterval(inject, 2000);
})();
/* ${PATCH_ID}_END */
`;
        fs.writeFileSync(jsPath, content + patchCode);
        if (!silent)
            vscode.window.showInformationMessage('v13 깊게 숨 쉬는 고양이 패치가 완료되었습니다! VS Code를 완전히 재시작하세요.');
    }
    catch (err) {
        if (!silent)
            vscode.window.showErrorMessage('패치 실패: ' + err.message);
    }
}
async function uninstallPatch() {
    const appRoot = vscode.env.appRoot;
    const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
    try {
        let content = fs.readFileSync(jsPath, 'utf-8');
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        content = content.replace(allPatchRegex, '');
        fs.writeFileSync(jsPath, content);
        vscode.window.showInformationMessage('모든 고양이 패치가 제거되었습니다.');
    }
    catch (err) {
        vscode.window.showErrorMessage('제거 실패: ' + err.message);
    }
}
function deactivate() {
    try {
        const jsPath = path.join(vscode.env.appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
        const content = fs.readFileSync(jsPath, 'utf-8');
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        if (!allPatchRegex.test(content))
            return;
        fs.writeFileSync(jsPath, content.replace(allPatchRegex, ''));
    }
    catch { }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map