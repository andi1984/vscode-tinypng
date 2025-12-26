import vscode = require('vscode');
import { TinyPngConfig } from '../types';

/**
 * Service for managing TinyPNG extension configuration
 */
export class ConfigService {
    private static readonly CONFIG_SECTION = 'tinypng';
    private static readonly SECRET_KEY = 'tinypng.apiKey';
    private static readonly MIGRATION_STATE_KEY = 'tinypng.migrationCompleted';

    /**
     * Get the current TinyPNG configuration
     */
    public static getConfig(): TinyPngConfig {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);

        return {
            apiKey: config.get<string>('apiKey'),
            forceOverwrite: config.get<boolean>('forceOverwrite') || false,
            compressedFilePostfix: config.get<string>('compressedFilePostfix') || '.min'
        };
    }

    /**
     * Get the API key from SecretStorage (preferred) or fallback to settings
     */
    public static async getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
        // Try SecretStorage first
        const secretKey = await context.secrets.get(this.SECRET_KEY);
        if (secretKey) {
            return secretKey;
        }

        // Fallback to settings for backward compatibility
        const settingsKey = vscode.workspace
            .getConfiguration(this.CONFIG_SECTION)
            .get<string>('apiKey');

        // Migrate to SecretStorage if found in settings
        if (settingsKey) {
            await this.setApiKey(context, settingsKey);

            // Check if we've already shown the migration warning
            const migrationCompleted = context.globalState.get<boolean>(this.MIGRATION_STATE_KEY);
            if (!migrationCompleted) {
                await context.globalState.update(this.MIGRATION_STATE_KEY, true);

                // Prompt user with actionable options
                const action = await vscode.window.showWarningMessage(
                    'TinyPNG: API key found in settings.json has been migrated to secure storage. Remove it from settings for security?',
                    'Remove from Settings',
                    'I\'ll Do It Manually'
                );

                if (action === 'Remove from Settings') {
                    try {
                        await vscode.workspace.getConfiguration(this.CONFIG_SECTION)
                            .update('apiKey', undefined, vscode.ConfigurationTarget.Global);
                        await vscode.workspace.getConfiguration(this.CONFIG_SECTION)
                            .update('apiKey', undefined, vscode.ConfigurationTarget.Workspace);
                        vscode.window.showInformationMessage('TinyPNG: API key removed from settings and stored securely.');
                    } catch (err) {
                        vscode.window.showWarningMessage(
                            'TinyPNG: Could not automatically remove API key from settings. Please remove tinypng.apiKey manually from settings.json.'
                        );
                    }
                }
            }

            return settingsKey;
        }

        return undefined;
    }

    /**
     * Store API key securely in SecretStorage
     */
    public static async setApiKey(context: vscode.ExtensionContext, apiKey: string): Promise<void> {
        await context.secrets.store(this.SECRET_KEY, apiKey);
    }

    /**
     * Delete API key from SecretStorage
     */
    public static async deleteApiKey(context: vscode.ExtensionContext): Promise<void> {
        await context.secrets.delete(this.SECRET_KEY);
    }

    /**
     * Check if files should be overwritten
     */
    public static shouldOverwrite(): boolean {
        return vscode.workspace
            .getConfiguration(this.CONFIG_SECTION)
            .get<boolean>('forceOverwrite') || false;
    }

    /**
     * Get the postfix for compressed files
     */
    public static getCompressedFilePostfix(): string {
        return vscode.workspace
            .getConfiguration(this.CONFIG_SECTION)
            .get<string>('compressedFilePostfix') || '.min';
    }

    /**
     * Get the concurrency limit for batch operations
     */
    public static getConcurrency(): number {
        return vscode.workspace
            .getConfiguration(this.CONFIG_SECTION)
            .get<number>('concurrency') || 3;
    }
}
