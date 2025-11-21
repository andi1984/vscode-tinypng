/**
 * Web-compatible extension entry point for vscode.dev
 * Uses VSCode FileSystem API and fetch-based TinyPNG client
 */
import * as vscode from 'vscode';
import { tinify, AccountError, ClientError, ServerError, ConnectionError } from './tinify-web';

/**
 * Get the file name from a URI
 */
function getFileName(uri: vscode.Uri): string {
    const pathParts = uri.path.split('/');
    return pathParts[pathParts.length - 1];
}

/**
 * Get the directory path from a URI
 */
function getDirectoryPath(uri: vscode.Uri): string {
    const pathParts = uri.path.split('/');
    pathParts.pop(); // Remove filename
    return pathParts.join('/');
}

/**
 * Generate destination file path with postfix
 */
function getDestinationUri(uri: vscode.Uri, postfix: string): vscode.Uri {
    const fileName = getFileName(uri);
    const dirPath = getDirectoryPath(uri);

    // Parse filename and extension
    const lastDotIndex = fileName.lastIndexOf('.');
    const name = fileName.substring(0, lastDotIndex);
    const ext = fileName.substring(lastDotIndex);

    // Generate new filename: <name><postfix>.<ext>
    const newFileName = `${name}${postfix}${ext}`;
    const newPath = `${dirPath}/${newFileName}`;

    return uri.with({ path: newPath });
}

/**
 * Function to compress a single image using VSCode FileSystem API
 */
const compressImage = async (file: vscode.Uri) => {
    const shouldOverwrite: boolean =
        vscode.workspace
            .getConfiguration('tinypng')
            .get<boolean>('forceOverwrite') || false;

    // Determine destination file path
    let destinationUri = file;
    if (!shouldOverwrite) {
        const postfix = vscode.workspace
            .getConfiguration('tinypng')
            .get<string>('compressedFilePostfix') || '-min';

        destinationUri = getDestinationUri(file, postfix);
    }

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
    );

    try {
        statusBarItem.text = `Compressing ${getFileName(file)}...`;
        statusBarItem.show();

        // Read the file using VSCode FileSystem API
        const fileData = await vscode.workspace.fs.readFile(file);

        // Compress using web-compatible tinify client
        const compressedData = await tinify.fromBuffer(fileData).toBuffer();

        // Write the compressed file
        await vscode.workspace.fs.writeFile(destinationUri, compressedData);

        statusBarItem.hide();
        vscode.window.showInformationMessage(
            `Successfully compressed ${getFileName(file)} to ${getFileName(destinationUri)}!`
        );
    } catch (error) {
        statusBarItem.hide();

        if (error instanceof AccountError) {
            console.error('Authentication failed. Have you set the API Key?');
            vscode.window.showErrorMessage(
                'Authentication failed. Have you set the API Key?'
            );
        } else if (error instanceof ClientError) {
            console.error('Error with source image or settings.');
            vscode.window.showErrorMessage(
                'Error: Please check your source image and settings.'
            );
        } else if (error instanceof ServerError) {
            console.error('TinyPNG API is currently not available.');
            vscode.window.showErrorMessage(
                'TinyPNG API is currently not available.'
            );
        } else if (error instanceof ConnectionError) {
            console.error('Network issue occurred.');
            vscode.window.showErrorMessage(
                'Network issue: Please check your internet connectivity.'
            );
        } else {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            vscode.window.showErrorMessage(errorMessage);
        }
    }
};

/**
 * Validate the API key
 */
const validate = async (
    onSuccess: () => void = () => {},
    onFailure?: (e: Error) => void
): Promise<void> => {
    try {
        await tinify.validate();
        onSuccess();
    } catch (err) {
        if (onFailure && err instanceof Error) {
            onFailure(err);
        }
    }
};

const afterValidation = (callback: () => void) => validate(callback);

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('TinyPNG extension activating in web mode...');

    // Get API Key from configuration
    const apiKey = vscode.workspace
        .getConfiguration('tinypng')
        .get<string>('apiKey');

    if (apiKey) {
        tinify.key = apiKey;
    }

    // Validate user credentials
    validate(
        () => console.log('TinyPNG: Validation successful!'),
        (e: Error) => {
            console.error(e.message);
            vscode.window.showInformationMessage(
                'TinyPNG: API validation failed. Be sure that you filled out tinypng.apiKey setting already.'
            );
        }
    );

    // Register command: Compress single file
    const disposableCompressFile = vscode.commands.registerCommand(
        'extension.compressFile',
        compressImage
    );
    context.subscriptions.push(disposableCompressFile);

    // Register command: Compress folder
    const disposableCompressFolder = vscode.commands.registerCommand(
        'extension.compressFolder',
        async (folder: vscode.Uri) => {
            try {
                const files = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(
                        folder.path,
                        '**/*.{png,jpg,jpeg,webp}'
                    )
                );

                for (const file of files) {
                    await compressImage(file);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Error compressing folder: ${errorMessage}`);
            }
        }
    );
    context.subscriptions.push(disposableCompressFolder);

    // Register command: Get compression count
    const disposableCompressionCount = vscode.commands.registerCommand(
        'extension.getCompressionCount',
        () => {
            afterValidation(() => {
                vscode.window.showInformationMessage(
                    `TinyPNG: You already used ${tinify.compressionCount} compression(s) this month.`
                );
            });
        }
    );
    context.subscriptions.push(disposableCompressionCount);

    console.log('TinyPNG extension activated successfully in web mode!');
}

/**
 * Deactivate the extension
 */
export function deactivate() {
    console.log('TinyPNG extension deactivated');
}
