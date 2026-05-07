import * as vscode from 'vscode';

let catState: 'idle' | 'typing' = 'idle';
let statusBar: vscode.StatusBarItem;
let interval: NodeJS.Timer;

export function activate(context: vscode.ExtensionContext) {

    // =========================
    // StatusBar Item (메인 표시)
    // =========================
    statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        10000
    );

    statusBar.text = getCatSVG('idle');
    statusBar.tooltip = 'BlobCat is watching your code 🐱';
    statusBar.show();

    context.subscriptions.push(statusBar);

    // =========================
    // typing 감지
    // =========================
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => {
            setTyping();
        })
    );

    // =========================
    // idle loop animation
    // =========================
    interval = setInterval(() => {
        if (catState === 'idle') {
            toggleIdleAnimation();
        }
    }, 1200);

    context.subscriptions.push({
        dispose: () => clearInterval(interval)
    });

    // =========================
    // commands
    // =========================
    context.subscriptions.push(
        vscode.commands.registerCommand('cat-pet.install', () => {
            vscode.window.showInformationMessage('BlobCat activated 🐱');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('cat-pet.uninstall', () => {
            vscode.window.showInformationMessage('BlobCat removed');
        })
    );
}

/* =========================
   Typing State
========================= */
function setTyping() {
    catState = 'typing';

    statusBar.text = getCatSVG('typing');

    setTimeout(() => {
        catState = 'idle';
        statusBar.text = getCatSVG('idle');
    }, 400);
}

/* =========================
   Idle animation toggle
========================= */
let toggle = false;

function toggleIdleAnimation() {
    if (catState !== 'idle') return;

    toggle = !toggle;
    statusBar.text = getCatSVG(toggle ? 'idle1' : 'idle2');
}

/* =========================
   SVG Renderer (StatusBar safe)
========================= */
function getCatSVG(state: string): string {

    const base = `
<svg width="18" height="18" viewBox="0 0 100 100">
`;

    const face = `
<circle cx="50" cy="55" r="28" fill="#ffffff" stroke="#d0d0d0"/>
<circle cx="40" cy="50" r="4" fill="#333"/>
<circle cx="60" cy="50" r="4" fill="#333"/>
<path d="M45 65 Q50 70 55 65" stroke="#333" fill="none" stroke-width="2"/>
`;

    const ears = `
<path d="M30 40 L40 20 L45 40 Z" fill="#fff" stroke="#ccc"/>
<path d="M70 40 L60 20 L55 40 Z" fill="#fff" stroke="#ccc"/>
`;

    const idleEffect = state === 'idle1'
        ? `<circle cx="50" cy="58" r="20" opacity="0.05"/>`
        : state === 'idle2'
            ? `<circle cx="50" cy="58" r="22" opacity="0.08"/>`
            : '';

    const typingEffect = state === 'typing'
        ? `
<circle cx="35" cy="60" r="5" fill="#ffb6c1"/>
<circle cx="65" cy="60" r="5" fill="#ffb6c1"/>
`
        : '';

    return `${base}${ears}${face}${idleEffect}${typingEffect}</svg>`;
}

/* =========================
   deactivate
========================= */
export function deactivate() {
    if (interval) clearInterval(interval);
}