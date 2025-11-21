import * as assert from 'assert';
import * as vscode from 'vscode';

// Helper to detect if we're running in web extension mode
const isWebExtension = () => {
    // In web extensions, certain Node.js modules are not available
    return typeof process === 'undefined' || !process.versions || !process.versions.node;
};

suite('Integration Tests', () => {
    let extension: vscode.Extension<any> | undefined;

    suiteSetup(async () => {
        extension = vscode.extensions.getExtension('andi1984.tinypng');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
    });

    suite('Command Registration and Availability', () => {
        test('All commands should be registered after activation', async function() {
            const commands = await vscode.commands.getCommands(true);
            const extensionCommands = [
                'extension.compressFile',
                'extension.compressFolder',
                'extension.getCompressionCount',
                ...(isWebExtension() ? [] : ['extension.compressGitStage'])
            ];

            extensionCommands.forEach(cmd => {
                assert.ok(
                    commands.includes(cmd),
                    `Command ${cmd} should be registered`
                );
            });
        });
    });

    suite('Configuration Integration', () => {
        test('Should read configuration from workspace settings', () => {
            const config = vscode.workspace.getConfiguration('tinypng');
            assert.ok(config !== undefined);
        });

        test('Should provide default values for all settings', () => {
            const config = vscode.workspace.getConfiguration('tinypng');

            const forceOverwrite = config.get<boolean>('forceOverwrite');
            assert.strictEqual(forceOverwrite, false);

            const postfix = config.get<string>('compressedFilePostfix');
            assert.strictEqual(postfix, '.min');
        });

        test('Should allow reading configuration inspect details', () => {
            const config = vscode.workspace.getConfiguration('tinypng');
            const inspection = config.inspect<string>('compressedFilePostfix');

            assert.ok(inspection);
            assert.strictEqual(inspection.defaultValue, '.min');
        });
    });

    suite('Extension Metadata', () => {
        test('Should have valid package.json metadata', () => {
            assert.ok(extension);
            const pkg = extension!.packageJSON;

            assert.strictEqual(typeof pkg.name, 'string');
            assert.strictEqual(typeof pkg.version, 'string');
            assert.strictEqual(typeof pkg.displayName, 'string');
            assert.strictEqual(typeof pkg.description, 'string');
            assert.ok(Array.isArray(pkg.categories));
        });

        test('Should have proper icon configuration', () => {
            assert.ok(extension);
            const pkg = extension!.packageJSON;
            assert.strictEqual(typeof pkg.icon, 'string');
            assert.ok(pkg.icon.includes('icon.png'));
        });

        test('Should have repository information', () => {
            assert.ok(extension);
            const pkg = extension!.packageJSON;
            assert.ok(pkg.repository);
            assert.strictEqual(pkg.repository.type, 'git');
            assert.ok(pkg.repository.url.includes('github.com'));
        });
    });

    suite('Menu Contributions', () => {
        test('Should contribute to explorer context menu', () => {
            assert.ok(extension);
            const menus = extension!.packageJSON.contributes.menus;

            assert.ok(menus['explorer/context']);
            const explorerMenus = menus['explorer/context'];

            const compressFileMenu = explorerMenus.find(
                (m: any) => m.command === 'extension.compressFile'
            );
            assert.ok(compressFileMenu);
            assert.strictEqual(compressFileMenu.when, 'resourceLangId == tinypng_file');

            const compressFolderMenu = explorerMenus.find(
                (m: any) => m.command === 'extension.compressFolder'
            );
            assert.ok(compressFolderMenu);
            assert.strictEqual(compressFolderMenu.when, 'explorerResourceIsFolder');
        });

        test('Should contribute to editor title context menu', () => {
            assert.ok(extension);
            const menus = extension!.packageJSON.contributes.menus;

            assert.ok(menus['editor/title/context']);
            const editorMenus = menus['editor/title/context'];

            const compressFileMenu = editorMenus.find(
                (m: any) => m.command === 'extension.compressFile'
            );
            assert.ok(compressFileMenu);
        });

        test('Should hide certain commands from command palette', () => {
            assert.ok(extension);
            const menus = extension!.packageJSON.contributes.menus;

            assert.ok(menus['commandPalette']);
            const paletteMenus = menus['commandPalette'];

            const compressFileMenu = paletteMenus.find(
                (m: any) => m.command === 'extension.compressFile'
            );
            const compressFolderMenu = paletteMenus.find(
                (m: any) => m.command === 'extension.compressFolder'
            );

            assert.strictEqual(compressFileMenu.when, 'False');
            assert.strictEqual(compressFolderMenu.when, 'False');
        });
    });

    suite('Activation Events', () => {
        test('Should activate on command execution', () => {
            assert.ok(extension);
            const activationEvents = extension!.packageJSON.activationEvents;

            assert.ok(Array.isArray(activationEvents));
            assert.ok(activationEvents.length > 0);
        });

        test('Should list all command activation events', () => {
            assert.ok(extension);
            const activationEvents = extension!.packageJSON.activationEvents;

            const expectedEvents = [
                'onCommand:extension.compressFile',
                'onCommand:extension.compressFolder',
                'onCommand:extension.getCompressionCount'
            ];

            expectedEvents.forEach(event => {
                assert.ok(
                    activationEvents.includes(event),
                    `Activation event ${event} should be defined`
                );
            });
        });
    });

    suite('Language Definitions', () => {
        test('Should define tinypng_file language', () => {
            assert.ok(extension);
            const languages = extension!.packageJSON.contributes.languages;

            assert.ok(Array.isArray(languages));
            const tinypngLang = languages.find((lang: any) => lang.id === 'tinypng_file');
            assert.ok(tinypngLang);
        });

        test('Should associate correct file extensions', () => {
            assert.ok(extension);
            const languages = extension!.packageJSON.contributes.languages;
            const tinypngLang = languages.find((lang: any) => lang.id === 'tinypng_file');

            assert.ok(tinypngLang);
            assert.ok(Array.isArray(tinypngLang.extensions));

            const expectedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
            expectedExtensions.forEach(ext => {
                assert.ok(
                    tinypngLang.extensions.includes(ext),
                    `Extension ${ext} should be associated`
                );
            });
        });
    });

    suite('VSCode Engine Compatibility', () => {
        test('Should specify minimum VSCode version', () => {
            assert.ok(extension);
            const pkg = extension!.packageJSON;

            assert.ok(pkg.engines);
            assert.ok(pkg.engines.vscode);
            assert.ok(pkg.engines.vscode.startsWith('^'));
        });
    });

    suite('Dependencies', () => {
        test('Should have tinify as dependency', () => {
            assert.ok(extension);
            const pkg = extension!.packageJSON;

            assert.ok(pkg.dependencies);
            assert.ok(pkg.dependencies.tinify);
        });

        test('Should have required dev dependencies', () => {
            assert.ok(extension);
            const pkg = extension!.packageJSON;

            assert.ok(pkg.devDependencies);
            assert.ok(pkg.devDependencies['@types/vscode']);
            assert.ok(pkg.devDependencies['@types/mocha']);
            assert.ok(pkg.devDependencies['@types/node']);
            assert.ok(pkg.devDependencies['typescript']);
        });
    });
});
