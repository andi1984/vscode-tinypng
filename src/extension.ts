import vscode = require('vscode');
import { CompressionService } from './services/compressionService';
import { compressFileCommand } from './commands/compressFile';
import { compressFolderCommand } from './commands/compressFolder';
import { compressGitStageCommand } from './commands/compressGitStage';
import { getCompressionCountCommand } from './commands/getCompressionCount';
import { setApiKeyCommand } from './commands/setApiKey';
import { handleValidationError } from './utils/errorHandler';

/**
 * Activate the extension
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    // Initialize the compression service with API key from SecretStorage
    try {
        await CompressionService.initialize(context);

        // Validate the API key (fire and forget - don't block activation)
        CompressionService.validate(
            () => console.log('TinyPNG: API key validated successfully'),
            handleValidationError
        );
    } catch (error) {
        console.error('TinyPNG: Failed to initialize extension', error);
        vscode.window.showErrorMessage(
            `TinyPNG: Extension initialization failed. ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        // Continue to register commands even if initialization fails
        // This allows users to still set their API key
    }

    // Register command: Compress single file
    const disposableCompressFile = vscode.commands.registerCommand(
        'extension.compressFile',
        compressFileCommand
    );
    context.subscriptions.push(disposableCompressFile);

    // Register command: Compress folder
    const disposableCompressFolder = vscode.commands.registerCommand(
        'extension.compressFolder',
        compressFolderCommand
    );
    context.subscriptions.push(disposableCompressFolder);

    // Register command: Get compression count
    const disposableCompressionCount = vscode.commands.registerCommand(
        'extension.getCompressionCount',
        getCompressionCountCommand
    );
    context.subscriptions.push(disposableCompressionCount);

    // Register command: Compress git staged files
    const disposableCompressGitStage = vscode.commands.registerCommand(
        'extension.compressGitStage',
        compressGitStageCommand
    );
    context.subscriptions.push(disposableCompressGitStage);

    // Register command: Set API key securely
    const disposableSetApiKey = vscode.commands.registerCommand(
        'extension.setApiKey',
        () => setApiKeyCommand(context)
    );
    context.subscriptions.push(disposableSetApiKey);
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {}
