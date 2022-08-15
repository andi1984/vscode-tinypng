// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode = require('vscode');
import tinify = require('tinify');
import path = require('path');

import { ExtensionContext, Disposable, Uri } from 'vscode';

/**
 * Function to compress a single image.
 * @param {Object} file
 */
const compressImage = (file: Uri) => {
    const shouldOverwrite: boolean =
        vscode.workspace
            .getConfiguration('tinypng')
            .get<boolean>('forceOverwrite') || false;

    // Note: Define the destination file path for the compressed image.
    let destinationFilePath = file.fsPath;
    // In case the extension should not overwrite the source file (default)…
    if (!shouldOverwrite) {
        // …take the postfix defined in the settings.
        const postfix = vscode.workspace
            .getConfiguration('tinypng')
            .get<string>('compressedFilePostfix');

        const parsedPath = path.parse(file.fsPath);

        // Generate file in format: <name><postfix>.<ext>
        destinationFilePath = path.join(
            parsedPath.dir,
            `${parsedPath.name}${postfix}${parsedPath.ext}`
        );
    }

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
    );
    statusBarItem.text = `Compressing file ${file.fsPath}...`;
    statusBarItem.show();
    return tinify.fromFile(file.fsPath).toFile(destinationFilePath, (error) => {
        statusBarItem.hide();
        if (error) {
            if (error instanceof tinify.AccountError) {
                // Verify your API key and account limit.
                console.error(
                    'Authentication failed. Have you set the API Key?'
                );
                vscode.window.showErrorMessage(
                    'Authentication failed. Have you set the API Key?'
                );
            } else if (error instanceof tinify.ClientError) {
                // Check your source image and request options.
                console.error(
                    'Ooops, there is an error. Please check your source image and settings.'
                );
                vscode.window.showErrorMessage(
                    'Ooops, there is an error. Please check your source image and settings.'
                );
            } else if (error instanceof tinify.ServerError) {
                // Temporary issue with the Tinify API.
                console.error('TinyPNG API is currently not available.');
                vscode.window.showErrorMessage(
                    'TinyPNG API is currently not available.'
                );
            } else if (error instanceof tinify.ConnectionError) {
                // A network connection error occurred.
                console.error(
                    'Network issue occurred. Please check your internet connectivity.'
                );
                vscode.window.showErrorMessage(
                    'Network issue occurred. Please check your internet connectivity.'
                );
            } else {
                // Something else went wrong, unrelated to the Tinify API.
                console.error(error.message);
                vscode.window.showErrorMessage(error.message);
            }
        } else {
            vscode.window.showInformationMessage(
                `Successfully compressed ${file.fsPath} to ${destinationFilePath}!`
            );
        }
    });
};

/**
 * Validate the user.
 * @param {function} onSuccess - Function to call on success
 * @param {function} onFailure - Function to call on failure
 */
const validate = (
    onSuccess: Function = () => {},
    onFailure = (e: Error) => {}
) =>
    tinify.validate(function (err: Error | null) {
        if (err) {
            onFailure(err);
        } else {
            onSuccess();
        }
    });

const afterValidation = (callback: Function) => validate(callback);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context: ExtensionContext) {
    // Get API Key
    const apiKey = vscode.workspace
        .getConfiguration('tinypng')
        .get<string>('apiKey');

    if (!!apiKey) {
        tinify.key = apiKey;
    }

    // Validate user
    validate(
        () => console.log('Validation successful!'),
        (e: Error) => {
            console.error(e.message);
            vscode.window.showInformationMessage(
                'TinyPNG: API validation failed. Be sure that you filled out tinypng.apiKey setting already.'
            );
        }
    );

    let disposableCompressFile = vscode.commands.registerCommand(
        'extension.compressFile',
        compressImage
    );

    context.subscriptions.push(disposableCompressFile);

    let disposableCompressFolder: Disposable = vscode.commands.registerCommand(
        'extension.compressFolder',
        function (folder: Uri) {
            vscode.workspace
                .findFiles(
                    new vscode.RelativePattern(
                        folder.path,
                        `**/*.{png,jpg,jpeg}`
                    )
                )
                .then((files: any) => files.forEach(compressImage));
        }
    );

    context.subscriptions.push(disposableCompressFolder);

    let disposableCompressionCount: Disposable =
        vscode.commands.registerCommand('extension.getCompressionCount', () =>
            afterValidation(() =>
                vscode.window.showInformationMessage(
                    `TinyPNG: You already used ${tinify.compressionCount} compression(s) this month.`
                )
            )
        );
    context.subscriptions.push(disposableCompressionCount);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
