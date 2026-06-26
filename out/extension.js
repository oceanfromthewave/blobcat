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
const WELCOMED_KEY = 'cat-pet.welcomed';
const FIRST_SEEN_KEY = 'cat-pet.firstSeen';
const REVIEW_ASKED_KEY = 'cat-pet.reviewAsked';
const REVIEW_DELAY_MS = 3 * 24 * 60 * 60 * 1000; // ask only after 3 days of use
const REVIEW_URL = 'https://marketplace.visualstudio.com/items?itemName=blobcat.cat-pet-statusbar&ssr=false#review-details';
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
    context.subscriptions.push(vscode.commands.registerCommand('cat-pet.install', () => install(context, false)), vscode.commands.registerCommand('cat-pet.uninstall', () => uninstall()), vscode.commands.registerCommand('cat-pet.chooseColor', () => chooseColor()));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (!e.affectsConfiguration('blobcat'))
            return;
        const result = await install(context, true);
        if (result.status === 'installed') {
            vscode.window.showInformationMessage('BlobCat settings updated. Restart VS Code to apply them.');
        }
    }));
    if (!context.globalState.get(FIRST_SEEN_KEY)) {
        void context.globalState.update(FIRST_SEEN_KEY, Date.now());
    }
    void runStartupInstall(context);
    // Once the cat has had a few days to win the user over, ask (once) for a review.
    setTimeout(() => void maybeAskForReview(context), 8000);
}
exports.activate = activate;
async function runStartupInstall(context) {
    const result = await install(context, true);
    if (result.status === 'installed' || result.status === 'unchanged') {
        await maybeShowWelcome(context, result);
        return;
    }
    const reason = result.status === 'workbench-not-found'
        ? "Couldn't find VS Code's workbench.html."
        : `Couldn't modify workbench.html (${result.message}).`;
    const retry = 'Retry install';
    const choice = await vscode.window.showWarningMessage(`BlobCat: couldn't install the cat automatically. ${reason} ` +
        'If VS Code is installed in a protected location (e.g. Program Files), run it as administrator and try again.', retry);
    if (choice === retry) {
        await install(context, false);
    }
}
// One-time friendly heads-up the first time the cat is installed, so the required
// restart and the harmless "installation appears to be corrupt" notice don't scare
// new users into uninstalling.
async function maybeShowWelcome(context, result) {
    if (result.status !== 'installed')
        return; // only on a genuinely fresh injection, not existing users
    if (context.globalState.get(WELCOMED_KEY))
        return;
    await context.globalState.update(WELCOMED_KEY, true);
    void vscode.window.showInformationMessage('BlobCat is installed! 🐱 Fully quit and reopen VS Code to meet your cat in the status bar. ' +
        'VS Code may show a one-time "installation appears to be corrupt" notice — that is expected and harmless.', 'Got it');
}
// One-time, dismissible review nudge after the user has kept BlobCat for a few days.
// Reviews are the cheapest Marketplace ranking boost, so a single well-timed ask helps.
async function maybeAskForReview(context) {
    if (context.globalState.get(REVIEW_ASKED_KEY))
        return;
    const firstSeen = context.globalState.get(FIRST_SEEN_KEY) ?? Date.now();
    if (Date.now() - firstSeen < REVIEW_DELAY_MS)
        return;
    await context.globalState.update(REVIEW_ASKED_KEY, true);
    const rate = '★ Rate BlobCat';
    const choice = await vscode.window.showInformationMessage('Enjoying BlobCat? 🐱 A quick review on the Marketplace really helps other people find it!', rate, 'Not now');
    if (choice === rate) {
        void vscode.env.openExternal(vscode.Uri.parse(REVIEW_URL));
    }
}
const PRESET_COLORS = {
    white: '#FFFFFF',
    peach: '#FFB6A3',
    pink: '#FFC0CB',
    mint: '#A8E6CF',
    lilac: '#B5A8FF',
    orange: '#FFA94D',
    gray: '#C7CBD1',
};
function readConfig() {
    const cfg = vscode.workspace.getConfiguration('blobcat');
    const preset = cfg.get('catPreset', 'custom');
    const customColor = cfg.get('catColor', '#FFFFFF');
    const catColor = PRESET_COLORS[preset] ?? customColor;
    return {
        enableSleep: cfg.get('enableSleep', true),
        enableParticles: cfg.get('enableParticles', true),
        enablePetting: cfg.get('enablePetting', true),
        catScale: cfg.get('catScale', 1),
        catOpacity: cfg.get('catOpacity', 1),
        catColor,
    };
}
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
            vscode.window.showErrorMessage("Couldn't find workbench.html.");
        return { status: 'workbench-not-found' };
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
        const configJson = JSON.stringify(readConfig());
        html = relaxCsp(html);
        const injection = `\n${MARKER_START}\n<script>window.__BLOBCAT_CONFIG = ${configJson};</script>\n<script>\n${catJs}\n</script>\n${MARKER_END}\n`;
        html = html.replace('</body>', `${injection}</body>`);
        if (fs.readFileSync(htmlPath, 'utf-8') === html)
            return { status: 'unchanged' };
        fs.writeFileSync(htmlPath, html);
        if (!silent)
            vscode.window.showInformationMessage('Cat installed — please restart VS Code.');
        return { status: 'installed' };
    }
    catch (err) {
        if (!silent)
            vscode.window.showErrorMessage('Install failed: ' + err.message);
        return { status: 'error', message: err?.message ?? String(err) };
    }
}
async function uninstall() {
    const htmlPath = findWorkbenchHtml();
    if (!htmlPath) {
        vscode.window.showErrorMessage("Couldn't find workbench.html.");
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
        vscode.window.showInformationMessage('Cat removed — please restart VS Code.');
    }
    catch (err) {
        vscode.window.showErrorMessage('Uninstall failed: ' + err.message);
    }
}
// Discoverable color picker so users don't have to know the settings keys exist.
// Writing the setting triggers onDidChangeConfiguration, which re-injects and prompts a restart.
async function chooseColor() {
    const presets = [
        { label: 'White', description: '#FFFFFF', preset: 'white' },
        { label: 'Peach', description: '#FFB6A3', preset: 'peach' },
        { label: 'Pink', description: '#FFC0CB', preset: 'pink' },
        { label: 'Mint', description: '#A8E6CF', preset: 'mint' },
        { label: 'Lilac', description: '#B5A8FF', preset: 'lilac' },
        { label: 'Orange', description: '#FFA94D', preset: 'orange' },
        { label: 'Gray', description: '#C7CBD1', preset: 'gray' },
        { label: 'Custom…', description: 'Enter your own CSS color', preset: 'custom' },
    ];
    const pick = await vscode.window.showQuickPick(presets, { placeHolder: 'Pick a color for your BlobCat 🐱' });
    if (!pick)
        return;
    const cfg = vscode.workspace.getConfiguration('blobcat');
    if (pick.preset === 'custom') {
        const color = await vscode.window.showInputBox({
            prompt: 'Enter a CSS color for the cat (e.g. #FFB6A3, orange, hsl(20, 100%, 80%))',
            value: cfg.get('catColor', '#FFFFFF'),
        });
        if (color === undefined)
            return;
        await cfg.update('catColor', color, vscode.ConfigurationTarget.Global);
        await cfg.update('catPreset', 'custom', vscode.ConfigurationTarget.Global);
    }
    else {
        await cfg.update('catPreset', pick.preset, vscode.ConfigurationTarget.Global);
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