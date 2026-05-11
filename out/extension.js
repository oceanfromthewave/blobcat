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
const MARKER_START = '<!-- CAT_PET_INJECT_START -->';
const MARKER_END = '<!-- CAT_PET_INJECT_END -->';
const LEGACY_CLEANUP_KEY = 'cat-pet.legacyDesktopMainCleaned';
function activate(context) {
    if (!context.globalState.get(LEGACY_CLEANUP_KEY)) {
        cleanLegacyDesktopMainPatch();
        context.globalState.update(LEGACY_CLEANUP_KEY, true);
    }
    const signal = vscode.window.createStatusBarItem('cat-pet-signal', vscode.StatusBarAlignment.Left, 10000);
    signal.text = 'IDLE';
    signal.show();
    context.subscriptions.push(signal);
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
        if (e.contentChanges.length > 0) {
            signal.text = 'TYPING';
            setTimeout(() => { signal.text = 'IDLE'; }, 250);
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('cat-pet.install', () => install(context, false)), vscode.commands.registerCommand('cat-pet.uninstall', () => uninstall()));
    install(context, true);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function findWorkbenchHtml() {
    const appRoot = vscode.env.appRoot;
    const candidates = [
        path.join(appRoot, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.esm.html'),
        path.join(appRoot, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
        path.join(appRoot, 'out', 'vs', 'code', 'electron-sandbox', 'workbench', 'workbench.esm.html'),
        path.join(appRoot, 'out', 'vs', 'code', 'electron-sandbox', 'workbench', 'workbench.html'),
    ];
    return candidates.find(p => fs.existsSync(p)) ?? null;
}
async function install(context, silent) {
    const htmlPath = findWorkbenchHtml();
    if (!htmlPath) {
        if (!silent)
            vscode.window.showErrorMessage('workbench.html을 찾지 못했습니다.');
        return;
    }
    try {
        const backupPath = htmlPath + '.cat-backup';
        const currentHtml = fs.readFileSync(htmlPath, 'utf-8');
        const hasOurPatch = currentHtml.includes(MARKER_START);
        if (!fs.existsSync(backupPath) || !hasOurPatch) {
            fs.copyFileSync(htmlPath, backupPath);
        }
        let html = fs.readFileSync(backupPath, 'utf-8');
        const catJsPath = path.join(context.extensionPath, 'media', 'cat.js');
        const catJs = fs.readFileSync(catJsPath, 'utf-8');
        html = relaxCsp(html);
        const injection = `\n${MARKER_START}\n<script>\n${catJs}\n</script>\n${MARKER_END}\n`;
        html = html.replace('</body>', `${injection}</body>`);
        if (silent && fs.readFileSync(htmlPath, 'utf-8') === html)
            return;
        fs.writeFileSync(htmlPath, html);
        if (!silent)
            vscode.window.showInformationMessage('고양이 설치 완료. VS Code를 재시작하세요.');
    }
    catch (err) {
        if (!silent)
            vscode.window.showErrorMessage('설치 실패: ' + err.message);
    }
}
async function uninstall() {
    const htmlPath = findWorkbenchHtml();
    if (!htmlPath) {
        vscode.window.showErrorMessage('workbench.html을 찾지 못했습니다.');
        return;
    }
    try {
        const backupPath = htmlPath + '.cat-backup';
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, htmlPath);
        }
        else {
            let html = fs.readFileSync(htmlPath, 'utf-8');
            const re = new RegExp(`\\n?${escapeRegex(MARKER_START)}[\\s\\S]*?${escapeRegex(MARKER_END)}\\n?`, 'g');
            html = html.replace(re, '');
            fs.writeFileSync(htmlPath, html);
        }
        vscode.window.showInformationMessage('고양이 제거 완료. VS Code를 재시작하세요.');
    }
    catch (err) {
        vscode.window.showErrorMessage('제거 실패: ' + err.message);
    }
}
function relaxCsp(html) {
    return html.replace(/(script-src[^;]*?)(;)/, (match, directive, semicolon) => {
        if (directive.includes("'unsafe-inline'"))
            return match;
        return `${directive} 'unsafe-inline'${semicolon}`;
    });
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function cleanLegacyDesktopMainPatch() {
    try {
        const appRoot = vscode.env.appRoot;
        const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
        if (!fs.existsSync(jsPath))
            return;
        const content = fs.readFileSync(jsPath, 'utf-8');
        const re = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        if (!re.test(content))
            return;
        const cleaned = content.replace(re, '');
        fs.writeFileSync(jsPath, cleaned);
    }
    catch {
        /* best-effort */
    }
}
//# sourceMappingURL=extension.js.map