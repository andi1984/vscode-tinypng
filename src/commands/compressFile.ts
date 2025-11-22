import { Uri } from 'vscode';
import { CompressionService } from '../services/compressionService';

/**
 * Command handler for compressing a single file
 */
export function compressFileCommand(file: Uri): void {
    CompressionService.compressImage(file);
}
