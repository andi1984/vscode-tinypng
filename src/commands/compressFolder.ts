import vscode = require('vscode');
import { Uri } from 'vscode';
import { QueueService } from '../services/queueService';

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
        .then((files: Uri[]) => {
            if (files.length === 0) {
                vscode.window.showInformationMessage(
                    'No image files found in this folder.'
                );
                return;
            }

            const queue = QueueService.getInstance();
            queue.addToQueue(files);
        });
}
