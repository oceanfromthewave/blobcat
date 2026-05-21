import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const MARKER_START = '<!-- CAT_PET_INJECT_START -->';
const MARKER_END = '<!-- CAT_PET_INJECT_END -->';
const LEGACY_CLEANUP_KEY = 'cat-pet.legacyDesktopMainCleaned';

type InstallResult =
    | { status: 'installed' }
    | { status: 'unchanged' }
    | { status: 'workbench-not-found' }
    | { status: 'error'; message: string };

export function activate(context: vscode.ExtensionContext) {
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

    context.subscriptions.push(
        vscode.commands.registerCommand('cat-pet.install', () => install(context, false)),
        vscode.commands.registerCommand('cat-pet.uninstall', () => uninstall())
    );

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async e => {
        if (!e.affectsConfiguration('blobcat')) return;
        const result = await install(context, true);
        if (result.status === 'installed') {
            vscode.window.showInformationMessage('BlobCat settings updated. Restart VS Code to apply them.');
        }
    }));

    void runStartupInstall(context);
}

async function runStartupInstall(context: vscode.ExtensionContext): Promise<void> {
    const result = await install(context, true);
    if (result.status === 'installed' || result.status === 'unchanged') return;

    const reason = result.status === 'workbench-not-found'
        ? "Couldn't find VS Code's workbench.html."
        : `Couldn't modify workbench.html (${result.message}).`;

    const retry = 'Retry install';
    const choice = await vscode.window.showWarningMessage(
        `BlobCat: couldn't install the cat automatically. ${reason} ` +
        'If VS Code is installed in a protected location (e.g. Program Files), run it as administrator and try again.',
        retry
    );
    if (choice === retry) {
        await install(context, false);
    }
}

function readConfig() {
    const cfg = vscode.workspace.getConfiguration('blobcat');
    return {
        enableSleep: cfg.get<boolean>('enableSleep', true),
        enableParticles: cfg.get<boolean>('enableParticles', true),
        enablePetting: cfg.get<boolean>('enablePetting', true),
        catScale: cfg.get<number>('catScale', 1),
        catOpacity: cfg.get<number>('catOpacity', 1),
        catColor: cfg.get<string>('catColor', '#FFFFFF'),
    };
}

export function deactivate() {}

function findWorkbenchHtml(): string | null {
    const appRoot = vscode.env.appRoot;
    const candidates = [
        path.join(appRoot, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.esm.html'),
        path.join(appRoot, 'out', 'vs', 'code', 'electron-browser', 'workbench', 'workbench.html'),
        path.join(appRoot, 'out', 'vs', 'code', 'electron-sandbox', 'workbench', 'workbench.esm.html'),
        path.join(appRoot, 'out', 'vs', 'code', 'electron-sandbox', 'workbench', 'workbench.html'),
    ];
    return candidates.find(p => fs.existsSync(p)) ?? null;
}

async function install(context: vscode.ExtensionContext, silent: boolean): Promise<InstallResult> {
    const htmlPath = findWorkbenchHtml();
    if (!htmlPath) {
        if (!silent) vscode.window.showErrorMessage("Couldn't find workbench.html.");
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

        if (fs.readFileSync(htmlPath, 'utf-8') === html) return { status: 'unchanged' };

        fs.writeFileSync(htmlPath, html);
        if (!silent) vscode.window.showInformationMessage('Cat installed — please restart VS Code.');
        return { status: 'installed' };
    } catch (err: any) {
        if (!silent) vscode.window.showErrorMessage('Install failed: ' + err.message);
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
        } else {
            let html = fs.readFileSync(htmlPath, 'utf-8');
            const re = new RegExp(`\\n?${escapeRegex(MARKER_START)}[\\s\\S]*?${escapeRegex(MARKER_END)}\\n?`, 'g');
            html = html.replace(re, '');
            fs.writeFileSync(htmlPath, html);
        }
        vscode.window.showInformationMessage('Cat removed — please restart VS Code.');
    } catch (err: any) {
        vscode.window.showErrorMessage('Uninstall failed: ' + err.message);
    }
}

function relaxCsp(html: string): string {
    return html.replace(/(script-src[^;]*?)(;)/, (match, directive, semicolon) => {
        if (directive.includes("'unsafe-inline'")) return match;
        return `${directive} 'unsafe-inline'${semicolon}`;
    });
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanLegacyDesktopMainPatch() {
    try {
        const appRoot = vscode.env.appRoot;
        const jsPath = path.join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.js');
        if (!fs.existsSync(jsPath)) return;
        const content = fs.readFileSync(jsPath, 'utf-8');
        const re = /\/\* (CAT_PATCH|CAT_PET_PATCH_.*?)_START \*\/[\s\S]*?\/\* \1_END \*\//g;
        if (!re.test(content)) return;
        const cleaned = content.replace(re, '');
        fs.writeFileSync(jsPath, cleaned);
    } catch {
        /* best-effort */
    }
}
