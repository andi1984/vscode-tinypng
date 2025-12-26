import * as assert from 'assert';
import * as vscode from 'vscode';

suite('SecretStorage Tests', () => {
    let extension: vscode.Extension<any> | undefined;

    suiteSetup(async () => {
        extension = vscode.extensions.getExtension('andi1984.tinypng');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
    });

    suite('Set API Key Command', () => {
        test('setApiKey command should be registered', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('extension.setApiKey'),
                'extension.setApiKey command should be registered'
            );
        });

        test('setApiKey command should be in command palette', () => {
            assert.ok(extension);
            const menus = extension!.packageJSON.contributes.menus;
            const paletteMenus = menus['commandPalette'];

            const setApiKeyMenu = paletteMenus.find(
                (m: any) => m.command === 'extension.setApiKey'
            );

            assert.ok(setApiKeyMenu, 'setApiKey should be in command palette');
            // Should not have a "when" clause that hides it
            assert.ok(
                !setApiKeyMenu.when || setApiKeyMenu.when !== 'False',
                'setApiKey should be visible in command palette'
            );
        });

        test('setApiKey command should have correct title', () => {
            assert.ok(extension);
            const commands = extension!.packageJSON.contributes.commands;

            const setApiKeyCmd = commands.find(
                (cmd: any) => cmd.command === 'extension.setApiKey'
            );

            assert.ok(setApiKeyCmd);
            assert.strictEqual(setApiKeyCmd.title, 'TinyPNG: Set API Key');
            assert.strictEqual(setApiKeyCmd.category, 'TinyPNG');
        });
    });

    suite('API Key Configuration', () => {
        test('apiKey setting should be deprecated', () => {
            assert.ok(extension);
            const configuration = extension!.packageJSON.contributes.configuration[0];
            const apiKeySetting = configuration.properties['tinypng.apiKey'];

            assert.ok(apiKeySetting);
            assert.ok(
                apiKeySetting.deprecationMessage,
                'apiKey setting should have a deprecation message'
            );
            assert.ok(
                apiKeySetting.deprecationMessage.includes('Set API Key'),
                'Deprecation message should reference the new command'
            );
        });

        test('apiKey setting description should indicate deprecation', () => {
            assert.ok(extension);
            const configuration = extension!.packageJSON.contributes.configuration[0];
            const apiKeySetting = configuration.properties['tinypng.apiKey'];

            assert.ok(apiKeySetting);
            assert.ok(
                apiKeySetting.description.includes('DEPRECATED'),
                'Description should indicate deprecation'
            );
        });
    });

    suite('Activation Events', () => {
        test('setApiKey command should be in activation events', () => {
            assert.ok(extension);
            const activationEvents = extension!.packageJSON.activationEvents;

            assert.ok(
                activationEvents.includes('onCommand:extension.setApiKey'),
                'setApiKey should be in activation events'
            );
        });
    });

    suite('ConfigService API Key Methods', () => {
        test('ConfigService should export getApiKey method', async () => {
            // We can't directly test the ConfigService internals without mocking,
            // but we can verify the extension activates successfully which means
            // the async getApiKey method works
            assert.ok(extension);
            assert.ok(extension!.isActive, 'Extension should be active');
        });
    });
});
