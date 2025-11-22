import vscode = require('vscode');
import tinify = require('tinify');

/**
 * Handle errors from TinyPNG API
 */
export function handleCompressionError(error: Error): void {
    if (error instanceof tinify.AccountError) {
        console.error('Authentication failed. Have you set the API Key?');
        vscode.window.showErrorMessage(
            'Authentication failed. Have you set the API Key?'
        );
    } else if (error instanceof tinify.ClientError) {
        console.error('Ooops, there is an error. Please check your source image and settings.');
        vscode.window.showErrorMessage(
            'Ooops, there is an error. Please check your source image and settings.'
        );
    } else if (error instanceof tinify.ServerError) {
        console.error('TinyPNG API is currently not available.');
        vscode.window.showErrorMessage(
            'TinyPNG API is currently not available.'
        );
    } else if (error instanceof tinify.ConnectionError) {
        console.error('Network issue occurred. Please check your internet connectivity.');
        vscode.window.showErrorMessage(
            'Network issue occurred. Please check your internet connectivity.'
        );
    } else {
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
    }
}

/**
 * Handle validation errors
 */
export function handleValidationError(error: Error): void {
    console.error(error.message);
    vscode.window.showInformationMessage(
        'TinyPNG: API validation failed. Be sure that you filled out tinypng.apiKey setting already.'
    );
}
