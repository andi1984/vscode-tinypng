import vscode = require('vscode');
import { CompressionService } from './services/compressionService';
import { compressFileCommand } from './commands/compressFile';
import { compressFolderCommand } from './commands/compressFolder';
import { compressGitStageCommand } from './commands/compressGitStage';
import { getCompressionCountCommand } from './commands/getCompressionCount';
import { handleValidationError } from './utils/errorHandler';

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext): void {
    // Initialize the compression service with API key
    CompressionService.initialize();

    // Validate the API key
    CompressionService.validate(
        () => console.log('Validation successful!'),
        handleValidationError
    );

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
}

/**
 * Deactivate the extension
 */
export function deactivate(): void {}
