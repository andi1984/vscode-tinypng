import vscode = require('vscode');
import { Uri } from 'vscode';
import { CompressionService } from '../services/compressionService';

/**
 * Command handler for compressing all images in a folder
 */
export function compressFolderCommand(folder: Uri): void {
    vscode.workspace
        .findFiles(
            new vscode.RelativePattern(
                folder.path,
                `**/*.{png,jpg,jpeg,webp}`
            )
        )
        .then((files: Uri[]) => files.forEach(CompressionService.compressImage));
}
