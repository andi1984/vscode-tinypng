import vscode = require('vscode');
import { Uri } from 'vscode';
import { spawnSync } from 'child_process';
import { QueueService } from '../services/queueService';

/**
 * Compress staged image files in git
 */
function compressStageFiles(editorPath: string): void {
    try {
        const lines = spawnSync(
            'git',
            ['diff', '--staged', '--diff-filter=ACMR', '--name-only', '-z'],
            { encoding: 'utf-8', cwd: editorPath }
        );

        const files = lines.stdout
            .replace(/\u0000$/, '')
            .split('\u0000')
            .filter((f: string) => /\.(png|jpg|jpeg|webp)$/.test(f));

        if (files.length === 0) {
            vscode.window.showInformationMessage(
                `TinyPNG: No images found in the git stage.`
            );
            return;
        }

        const fileUris = files.map((f: string) => Uri.file(`${editorPath}/${f}`));
        const queue = QueueService.getInstance();
        queue.addToQueue(fileUris);
    } catch (err) {
        vscode.window.showErrorMessage(
            `TinyPNG: ${(err as Error).message}`
        );
    }
}

/**
 * Command handler for compressing git staged images
 */
export function compressGitStageCommand(): void {
    const folders = vscode.workspace.workspaceFolders;

    if (!folders) {
        vscode.window.showInformationMessage(
            `TinyPNG: No editor path found.`
        );
        return;
    }

    if (folders.length <= 1) {
        compressStageFiles(folders[0].uri.fsPath);
        return;
    }

    const folderNames = folders.map((folder) => folder.name);
    vscode.window.showQuickPick(folderNames).then((folderName: string | undefined) => {
        const folder = folders.find((f) => f.name === folderName);
        if (folder) {
            compressStageFiles(folder.uri.fsPath);
        }
    });
}
