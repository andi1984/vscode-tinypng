import vscode = require('vscode');
import tinify = require('tinify');
import { Uri } from 'vscode';
import { generateDestinationPath } from '../utils/fileUtils';
import { handleCompressionError } from '../utils/errorHandler';
import { ConfigService } from './configService';

/**
 * Service for handling image compression operations
 */
export class CompressionService {
    /**
     * Initialize the TinyPNG API with the API key
     */
    public static initialize(): void {
        const apiKey = ConfigService.getApiKey();
        if (apiKey) {
            tinify.key = apiKey;
        }
    }

    /**
     * Validate the TinyPNG API key
     */
    public static validate(
        onSuccess: () => void = () => {},
        onFailure?: (error: Error) => void
    ): void {
        tinify.validate((err: Error | null) => {
            if (err) {
                if (onFailure) {
                    onFailure(err);
                }
            } else {
                onSuccess();
            }
        });
    }

    /**
     * Compress a single image file
     */
    public static compressImage(file: Uri): void {
        const shouldOverwrite = ConfigService.shouldOverwrite();
        const postfix = ConfigService.getCompressedFilePostfix();

        const destinationFilePath = generateDestinationPath(
            file,
            shouldOverwrite,
            postfix
        );

        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left
        );
        statusBarItem.text = `Compressing file ${file.fsPath}...`;
        statusBarItem.show();

        tinify.fromFile(file.fsPath).toFile(destinationFilePath, (error: Error | null) => {
            statusBarItem.hide();
            if (error) {
                handleCompressionError(error);
            } else {
                vscode.window.showInformationMessage(
                    `Successfully compressed ${file.fsPath} to ${destinationFilePath}!`
                );
            }
        });
    }

    /**
     * Get the current compression count
     */
    public static getCompressionCount(): number {
        return tinify.compressionCount || 0;
    }
}
