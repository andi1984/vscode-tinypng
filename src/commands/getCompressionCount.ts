import vscode = require('vscode');
import { CompressionService } from '../services/compressionService';

/**
 * Command handler for getting the compression count
 */
export function getCompressionCountCommand(): void {
    CompressionService.validate(() => {
        const count = CompressionService.getCompressionCount();
        vscode.window.showInformationMessage(
            `TinyPNG: You already used ${count} compression(s) this month.`
        );
    });
}
