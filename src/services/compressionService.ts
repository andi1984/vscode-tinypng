import vscode = require('vscode');
import tinify = require('tinify');
import { Uri } from 'vscode';
import { generateDestinationPath } from '../utils/fileUtils';
import { handleCompressionError } from '../utils/errorHandler';
import { ConfigService } from './configService';
import { CompressionResult } from '../types';
import fs = require('fs');

/**
 * Service for handling image compression operations
 */
export class CompressionService {
    /**
     * Initialize the TinyPNG API with the API key from SecretStorage
     */
    public static async initialize(context: vscode.ExtensionContext): Promise<void> {
        const apiKey = await ConfigService.getApiKey(context);
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

    /**
     * Compress image with detailed result callback (for queue system)
     */
    public static compressImageWithCallback(
        file: Uri,
        callback: (result: CompressionResult) => void
    ): void {
        const shouldOverwrite = ConfigService.shouldOverwrite();
        const postfix = ConfigService.getCompressedFilePostfix();

        const destinationFilePath = generateDestinationPath(
            file,
            shouldOverwrite,
            postfix
        );

        // Get original file size
        let originalSize = 0;
        try {
            const stats = fs.statSync(file.fsPath);
            originalSize = stats.size;
        } catch (error) {
            // Ignore size read errors
        }

        tinify.fromFile(file.fsPath).toFile(destinationFilePath, (error: Error | null) => {
            if (error) {
                callback({
                    success: false,
                    sourcePath: file.fsPath,
                    destinationPath: destinationFilePath,
                    originalSize,
                    error
                });
            } else {
                // Get compressed file size
                let compressedSize = 0;
                try {
                    const stats = fs.statSync(destinationFilePath);
                    compressedSize = stats.size;
                } catch (err) {
                    // Ignore size read errors
                }

                const savedBytes = originalSize > 0 && compressedSize > 0
                    ? originalSize - compressedSize
                    : 0;

                callback({
                    success: true,
                    sourcePath: file.fsPath,
                    destinationPath: destinationFilePath,
                    originalSize,
                    compressedSize,
                    savedBytes
                });
            }
        });
    }
}
