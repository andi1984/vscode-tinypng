import vscode = require('vscode');
import { ConfigService } from '../services/configService';
import { CompressionService } from '../services/compressionService';

/**
 * Command to securely set the TinyPNG API key
 */
export async function setApiKeyCommand(context: vscode.ExtensionContext): Promise<void> {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your TinyPNG API Key',
        password: true,
        ignoreFocusOut: true,
        placeHolder: 'Your API key from https://tinypng.com/developers'
    });

    if (apiKey) {
        await ConfigService.setApiKey(context, apiKey);

        // Re-initialize the compression service with the new key
        await CompressionService.initialize(context);

        // Validate the new API key
        CompressionService.validate(
            () => {
                vscode.window.showInformationMessage('TinyPNG API key saved and validated successfully!');
            },
            (error: Error) => {
                vscode.window.showWarningMessage(
                    `TinyPNG API key saved, but validation failed: ${error.message}. Please check if the key is correct.`
                );
            }
        );
    }
}
