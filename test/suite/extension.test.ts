import * as assert from 'assert';
import * as vscode from 'vscode';

// Helper to detect if we're running in web extension mode
const isWebExtension = () => {
    // In web extensions, certain Node.js modules are not available
    return typeof process === 'undefined' || !process.versions || !process.versions.node;
};

suite('TinyPNG Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('andi1984.tinypng'));
    });

    test('Extension should activate', async () => {
        const ext = vscode.extensions.getExtension('andi1984.tinypng');
        assert.ok(ext);
        await ext!.activate();
        assert.strictEqual(ext!.isActive, true);
    });

    test('Should register compressFile command', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('extension.compressFile'));
    });

    test('Should register compressFolder command', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('extension.compressFolder'));
    });

    test('Should register getCompressionCount command', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('extension.getCompressionCount'));
    });

    test('Should register compressGitStage command', async function() {
        // Skip this test in web extension mode - Git commands are not available in browser
        if (isWebExtension()) {
            this.skip();
        }

        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('extension.compressGitStage'));
    });

    test('Configuration should have apiKey property', () => {
        const config = vscode.workspace.getConfiguration('tinypng');
        assert.ok(config.has('apiKey'));
    });

    test('Configuration should have forceOverwrite property', () => {
        const config = vscode.workspace.getConfiguration('tinypng');
        assert.ok(config.has('forceOverwrite'));
        // Check default value
        const forceOverwrite = config.get<boolean>('forceOverwrite');
        assert.strictEqual(forceOverwrite, false);
    });

    test('Configuration should have compressedFilePostfix property', () => {
        const config = vscode.workspace.getConfiguration('tinypng');
        assert.ok(config.has('compressedFilePostfix'));
        // Check default value
        const postfix = config.get<string>('compressedFilePostfix');
        assert.strictEqual(postfix, '.min');
    });

    test('Should handle missing API key gracefully', async () => {
        const config = vscode.workspace.getConfiguration('tinypng');
        const apiKey = config.get<string>('apiKey');
        // API key should either be undefined or empty in test environment
        assert.ok(apiKey === undefined || apiKey === '');
    });

    test('Default postfix should be ".min"', () => {
        const config = vscode.workspace.getConfiguration('tinypng');
        const postfix = config.get<string>('compressedFilePostfix');
        assert.strictEqual(postfix, '.min');
    });

    test('Default forceOverwrite should be false', () => {
        const config = vscode.workspace.getConfiguration('tinypng');
        const forceOverwrite = config.get<boolean>('forceOverwrite');
        assert.strictEqual(forceOverwrite, false);
    });

    test('Language should recognize .png files', () => {
        const languages = vscode.extensions.all
            .filter(ext => ext.packageJSON.contributes?.languages)
            .flatMap(ext => ext.packageJSON.contributes.languages);

        const tinypngLang = languages.find((lang: any) => lang.id === 'tinypng_file');
        assert.ok(tinypngLang);
        assert.ok(tinypngLang.extensions.includes('.png'));
    });

    test('Language should recognize .jpg files', () => {
        const languages = vscode.extensions.all
            .filter(ext => ext.packageJSON.contributes?.languages)
            .flatMap(ext => ext.packageJSON.contributes.languages);

        const tinypngLang = languages.find((lang: any) => lang.id === 'tinypng_file');
        assert.ok(tinypngLang);
        assert.ok(tinypngLang.extensions.includes('.jpg'));
    });

    test('Language should recognize .jpeg files', () => {
        const languages = vscode.extensions.all
            .filter(ext => ext.packageJSON.contributes?.languages)
            .flatMap(ext => ext.packageJSON.contributes.languages);

        const tinypngLang = languages.find((lang: any) => lang.id === 'tinypng_file');
        assert.ok(tinypngLang);
        assert.ok(tinypngLang.extensions.includes('.jpeg'));
    });

    test('Language should recognize .webp files', () => {
        const languages = vscode.extensions.all
            .filter(ext => ext.packageJSON.contributes?.languages)
            .flatMap(ext => ext.packageJSON.contributes.languages);

        const tinypngLang = languages.find((lang: any) => lang.id === 'tinypng_file');
        assert.ok(tinypngLang);
        assert.ok(tinypngLang.extensions.includes('.webp'));
    });

    test('Extension package.json should have correct metadata', () => {
        const ext = vscode.extensions.getExtension('andi1984.tinypng');
        assert.ok(ext);

        const pkg = ext!.packageJSON;
        assert.strictEqual(pkg.name, 'tinypng');
        assert.strictEqual(pkg.displayName, 'TinyPNG');
        assert.strictEqual(pkg.publisher, 'andi1984');
        assert.ok(pkg.version);
    });

    test('Extension should define all required activation events', () => {
        const ext = vscode.extensions.getExtension('andi1984.tinypng');
        assert.ok(ext);

        const activationEvents = ext!.packageJSON.activationEvents;
        assert.ok(activationEvents.includes('onCommand:extension.compressFile'));
        assert.ok(activationEvents.includes('onCommand:extension.compressFolder'));
        assert.ok(activationEvents.includes('onCommand:extension.getCompressionCount'));
    });

    test('Extension should contribute commands to command palette', () => {
        const ext = vscode.extensions.getExtension('andi1984.tinypng');
        assert.ok(ext);

        const commands = ext!.packageJSON.contributes.commands;
        assert.ok(commands.length >= 4);

        const commandTitles = commands.map((cmd: any) => cmd.command);
        assert.ok(commandTitles.includes('extension.compressFile'));
        assert.ok(commandTitles.includes('extension.compressFolder'));
        assert.ok(commandTitles.includes('extension.getCompressionCount'));
        assert.ok(commandTitles.includes('extension.compressGitStage'));
    });

    test('Extension should have explorer context menu contributions', () => {
        const ext = vscode.extensions.getExtension('andi1984.tinypng');
        assert.ok(ext);

        const menus = ext!.packageJSON.contributes.menus;
        assert.ok(menus['explorer/context']);
        assert.ok(menus['explorer/context'].length >= 2);
    });

    test('Commands should have proper category', () => {
        const ext = vscode.extensions.getExtension('andi1984.tinypng');
        assert.ok(ext);

        const commands = ext!.packageJSON.contributes.commands;
        commands.forEach((cmd: any) => {
            if (cmd.category) {
                assert.strictEqual(cmd.category, 'TinyPNG');
            }
        });
    });
});
