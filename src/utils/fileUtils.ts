import path = require('path');
import { Uri } from 'vscode';

/**
 * Generate the destination file path for a compressed image
 */
export function generateDestinationPath(file: Uri, shouldOverwrite: boolean, postfix: string): string {
    if (shouldOverwrite) {
        return file.fsPath;
    }

    const parsedPath = path.parse(file.fsPath);
    return path.join(
        parsedPath.dir,
        `${parsedPath.name}${postfix}${parsedPath.ext}`
    );
}
