import { Uri } from 'vscode';

/**
 * Configuration for TinyPNG extension
 */
export interface TinyPngConfig {
    apiKey?: string;
    forceOverwrite: boolean;
    compressedFilePostfix: string;
}

/**
 * Result of a compression operation
 */
export interface CompressionResult {
    success: boolean;
    sourcePath: string;
    destinationPath: string;
    error?: Error;
}

/**
 * Options for compressing an image
 */
export interface CompressionOptions {
    file: Uri;
    shouldOverwrite: boolean;
    postfix: string;
}
