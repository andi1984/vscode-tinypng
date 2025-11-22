import vscode = require('vscode');
import { TinyPngConfig } from '../types';

/**
 * Service for managing TinyPNG extension configuration
 */
export class ConfigService {
    private static readonly CONFIG_SECTION = 'tinypng';

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
     * Get the API key from configuration
     */
    public static getApiKey(): string | undefined {
        return vscode.workspace
            .getConfiguration(this.CONFIG_SECTION)
            .get<string>('apiKey');
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
