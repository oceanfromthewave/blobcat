import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const PATCH_ID = 'CAT_PET_PATCH_V14';

export function activate(context: vscode.ExtensionContext) {
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

async function installPatch(silent = false) {
    const appRoot = vscode.env.appRoot;
    const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');

    try {
        let content = fs.readFileSync(jsPath, 'utf-8');
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        content = content.replace(allPatchRegex, '');

        if (silent && content.includes(PATCH_ID)) return;

        const patchCode = `
/* ${PATCH_ID}_START */
(function() {
    function createSVG(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function injectStyle() {
        if (document.getElementById('cat-pet-style')) return;
        const style = document.createElement('style');
        style.id = 'cat-pet-style';
        style.textContent = \`
            [id*="cat-pet-signal"] {
                position: absolute !important; opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important; min-width: 0 !important; max-width: 0 !important;
                padding: 0 !important; margin: 0 !important; border: 0 !important;
                overflow: hidden !important; visibility: hidden !important;
                left: -9999px !important;
            }

            #cat-pet-container {
                position: relative;
                display: flex; align-items: center;
                padding: 0 10px; height: 100%;
            }

            #cat-pet-svg {
                height: 26px; width: 26px;
                transform-origin: center bottom;
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: visible;
            }

            #cat-pet-svg > g.cat-body {
                transform-origin: center bottom;
                transition: transform 0.9s ease-in-out;
            }
            #cat-pet-svg.is-breathing > g.cat-body {
                transform: scaleY(1.06);
            }

            /* 점프 — squash & stretch */
            @keyframes cat-jump {
                0%   { transform: translateY(0)    scaleX(1)    scaleY(1); }
                10%  { transform: translateY(2px)  scaleX(1.18) scaleY(0.82); }
                28%  { transform: translateY(-9px) scaleX(0.88) scaleY(1.2); }
                48%  { transform: translateY(-12px) scaleX(0.92) scaleY(1.14); }
                68%  { transform: translateY(0)    scaleX(1.18) scaleY(0.82); }
                84%  { transform: translateY(-2px) scaleX(0.97) scaleY(1.05); }
                100% { transform: translateY(0)    scaleX(1)    scaleY(1); }
            }
            #cat-pet-svg.is-jumping {
                animation: cat-jump 0.6s cubic-bezier(0.34, 1.36, 0.64, 1) forwards;
                transition: none;
            }

            /* 호버 — 갸우뚱 + 볼 진하게 (점프 중엔 무시) */
            #cat-pet-container:hover #cat-pet-svg:not(.is-jumping) {
                transform: rotate(-9deg) scale(1.06);
            }
            .cat-cheek { transition: fill 0.25s ease, r 0.25s ease; }
            #cat-pet-container:hover .cat-cheek { fill: #FF9FB3; }

            /* 눈 */
            .cat-eye {
                transform-origin: center;
                transform-box: fill-box;
            }
            .cat-eye.is-blinking {
                animation: cat-blink 0.22s ease both;
            }
            @keyframes cat-blink {
                0%, 100% { transform: scaleY(1); }
                50%      { transform: scaleY(0.05); }
            }
            /* 점프 중엔 눈 ^^ 모양 (납작하게) */
            #cat-pet-svg.is-jumping .cat-eye {
                transform: scaleY(0.18);
            }

            /* 입 표정 토글 */
            .cat-mouth-jump { display: none; }
            #cat-pet-svg.is-jumping .cat-mouth-idle { display: none; }
            #cat-pet-svg.is-jumping .cat-mouth-jump { display: block; }

            /* 꼬리 — 살랑살랑 */
            #cat-pet-tail {
                transform-origin: 78px 75px;
                transform-box: fill-box;
                animation: cat-tail-wag 1.7s ease-in-out infinite;
            }
            @keyframes cat-tail-wag {
                0%, 100% { transform: rotate(-14deg); }
                50%      { transform: rotate(16deg); }
            }
            #cat-pet-svg.is-jumping #cat-pet-tail {
                animation-duration: 0.4s;
            }

            /* 점프 파티클 */
            .cat-particle {
                position: absolute;
                width: 5px; height: 5px;
                border-radius: 50%;
                background: #FFD1DC;
                pointer-events: none;
                bottom: 6px; left: 50%;
                margin-left: -2.5px;
                opacity: 0;
                animation: cat-particle-pop 0.55s ease-out forwards;
            }
            @keyframes cat-particle-pop {
                0%   { transform: translate(0, 0) scale(0.3); opacity: 1; }
                60%  { opacity: 0.9; }
                100% { transform: translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; }
            }
        \`;
        document.head.appendChild(style);
    }

    function spawnParticles(container) {
        const offsets = [
            { dx: '-12px', dy: '-6px' },
            { dx: '12px',  dy: '-6px' },
            { dx: '-7px',  dy: '4px' },
            { dx: '7px',   dy: '4px' }
        ];
        offsets.forEach((o, i) => {
            const p = document.createElement('div');
            p.className = 'cat-particle';
            p.style.setProperty('--dx', o.dx);
            p.style.setProperty('--dy', o.dy);
            p.style.animationDelay = (i * 20) + 'ms';
            container.appendChild(p);
            setTimeout(() => p.remove(), 700);
        });
    }

    function startBlinkLoop(svg) {
        function next() {
            const wait = 3500 + Math.random() * 3500;
            setTimeout(() => {
                if (!svg.classList.contains('is-jumping')) {
                    const eyes = svg.querySelectorAll('.cat-eye');
                    eyes.forEach(e => {
                        e.classList.remove('is-blinking');
                        void e.getBoundingClientRect();
                        e.classList.add('is-blinking');
                        setTimeout(() => e.classList.remove('is-blinking'), 240);
                    });
                }
                next();
            }, wait);
        }
        next();
    }

    function startBreathLoop(svg) {
        let on = false;
        setInterval(() => {
            if (svg.classList.contains('is-jumping')) return;
            on = !on;
            svg.classList.toggle('is-breathing', on);
        }, 1100);
    }

    function inject() {
        injectStyle();
        if (document.getElementById('cat-pet-container')) return;
        const leftItems = document.querySelector('.part.statusbar .items-container.left-items');
        if (!leftItems) return;

        const container = document.createElement('div');
        container.id = 'cat-pet-container';

        const svg = createSVG('svg', { viewBox: '0 0 100 100' });
        svg.id = 'cat-pet-svg';

        // 꼬리는 본체 뒤에 깔리도록 먼저 그림 (별도 그룹)
        const tail = createSVG('path', {
            d: 'M 78 75 Q 92 68 90 52',
            fill: 'none',
            stroke: '#FFFFFF',
            'stroke-width': '6',
            'stroke-linecap': 'round'
        });
        tail.id = 'cat-pet-tail';
        svg.appendChild(tail);

        // 본체 그룹 — 숨쉬기 transform이 여기 적용됨
        const body = createSVG('g');
        body.setAttribute('class', 'cat-body');

        const shapes = [
            // 본체
            {t:'path', a:{d:'M20 80 Q20 40 50 40 Q80 40 80 80 Z', fill:'#FFFFFF', stroke:'#E0E0E0', 'stroke-width':'2'}},
            // 왼쪽 귀
            {t:'path', a:{d:'M34 41 Q30 30 40 38 Z', fill:'#FFFFFF', stroke:'#E0E0E0'}},
            {t:'path', a:{d:'M35 39 Q32 33 38 37 Z', fill:'#FFD1DC'}},
            // 오른쪽 귀
            {t:'path', a:{d:'M66 41 Q70 30 60 38 Z', fill:'#FFFFFF', stroke:'#E0E0E0'}},
            {t:'path', a:{d:'M65 39 Q68 33 62 37 Z', fill:'#FFD1DC'}},
            // 눈
            {t:'circle', a:{cx:'40', cy:'55', r:'4', fill:'#333333', class:'cat-eye'}},
            {t:'circle', a:{cx:'60', cy:'55', r:'4', fill:'#333333', class:'cat-eye'}},
            // 볼
            {t:'circle', a:{cx:'32', cy:'62', r:'5', fill:'#FFD1DC', class:'cat-cheek'}},
            {t:'circle', a:{cx:'68', cy:'62', r:'5', fill:'#FFD1DC', class:'cat-cheek'}},
            // 입 — idle
            {t:'path', a:{d:'M45 65 Q50 70 55 65', fill:'none', stroke:'#333333', 'stroke-width':'2', 'stroke-linecap':'round', class:'cat-mouth-idle'}},
            // 입 — jump (큰 미소)
            {t:'path', a:{d:'M43 64 Q50 74 57 64', fill:'none', stroke:'#333333', 'stroke-width':'2', 'stroke-linecap':'round', class:'cat-mouth-jump'}}
        ];

        shapes.forEach(s => body.appendChild(createSVG(s.t, s.a)));
        svg.appendChild(body);
        container.appendChild(svg);
        leftItems.appendChild(container);

        startBreathLoop(svg);
        startBlinkLoop(svg);

        const statusbar = document.querySelector('.part.statusbar');
        if (!statusbar) return;

        const observer = new MutationObserver(() => {
            const sig = document.querySelector('[id*="cat-pet-signal"]');
            const isTyping = sig && (sig.textContent || '').includes('TYPING');
            if (!isTyping || svg.classList.contains('is-jumping')) return;

            svg.classList.add('is-jumping');
            spawnParticles(container);

            const onEnd = (e) => {
                if (e.animationName !== 'cat-jump') return;
                svg.classList.remove('is-jumping');
                svg.removeEventListener('animationend', onEnd);
            };
            svg.addEventListener('animationend', onEnd);
        });

        observer.observe(statusbar, { childList: true, subtree: true, characterData: true });
    }
    setInterval(inject, 2000);
})();
/* ${PATCH_ID}_END */
`;
        fs.writeFileSync(jsPath, content + patchCode);
        if (!silent) vscode.window.showInformationMessage('v13 깊게 숨 쉬는 고양이 패치가 완료되었습니다! VS Code를 완전히 재시작하세요.');
    } catch (err: any) {
        if (!silent) vscode.window.showErrorMessage('패치 실패: ' + err.message);
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
    } catch (err: any) {
        vscode.window.showErrorMessage('제거 실패: ' + err.message);
    }
}

export function deactivate() {
    try {
        const jsPath = path.join(vscode.env.appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
        const content = fs.readFileSync(jsPath, 'utf-8');
        const allPatchRegex = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        if (!allPatchRegex.test(content)) return;
        fs.writeFileSync(jsPath, content.replace(allPatchRegex, ''));
    } catch {}
}
