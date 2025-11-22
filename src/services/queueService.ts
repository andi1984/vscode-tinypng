import vscode = require('vscode');
import { Uri } from 'vscode';
import {
    QueueItem,
    QueueItemStatus,
    QueueStats,
    QueueState,
    CompressionResult
} from '../types';
import { CompressionService } from './compressionService';
import { ConfigService } from './configService';

/**
 * Service for managing compression queue with concurrency control
 */
export class QueueService {
    private static instance: QueueService;
    private queue: QueueItem[] = [];
    private state: QueueState = QueueState.Idle;
    private currentlyProcessing = 0;
    private statusBarItem: vscode.StatusBarItem;
    private onProgressCallbacks: Array<(stats: QueueStats) => void> = [];
    private onCompleteCallbacks: Array<(stats: QueueStats) => void> = [];

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    /**
     * Add files to the queue
     */
    public addToQueue(files: Uri[]): void {
        const newItems: QueueItem[] = files.map(file => ({
            id: `${file.fsPath}-${Date.now()}-${Math.random()}`,
            file,
            status: QueueItemStatus.Pending,
            addedAt: new Date()
        }));

        this.queue.push(...newItems);

        vscode.window.showInformationMessage(
            `Added ${files.length} file(s) to compression queue`
        );

        // Auto-start if idle
        if (this.state === QueueState.Idle) {
            this.start();
        }
    }

    /**
     * Start processing the queue
     */
    public start(): void {
        if (this.state === QueueState.Running) {
            return;
        }

        this.state = QueueState.Running;
        this.updateStatusBar();
        this.processQueue();
    }

    /**
     * Pause the queue
     */
    public pause(): void {
        if (this.state === QueueState.Running) {
            this.state = QueueState.Paused;
            this.updateStatusBar();
            vscode.window.showInformationMessage('Compression queue paused');
        }
    }

    /**
     * Resume the queue
     */
    public resume(): void {
        if (this.state === QueueState.Paused) {
            this.state = QueueState.Running;
            this.updateStatusBar();
            this.processQueue();
            vscode.window.showInformationMessage('Compression queue resumed');
        }
    }

    /**
     * Cancel the queue
     */
    public cancel(): void {
        this.state = QueueState.Cancelled;
        this.queue = this.queue.filter(
            item => item.status === QueueItemStatus.Processing
        );
        this.updateStatusBar();
        vscode.window.showWarningMessage('Compression queue cancelled');
    }

    /**
     * Clear completed items from queue
     */
    public clearCompleted(): void {
        this.queue = this.queue.filter(
            item => item.status !== QueueItemStatus.Completed &&
                    item.status !== QueueItemStatus.Failed
        );
        this.updateStatusBar();
    }

    /**
     * Get current queue statistics
     */
    public getStats(): QueueStats {
        const stats: QueueStats = {
            total: this.queue.length,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            totalSavedBytes: 0,
            averageCompressionRatio: 0
        };

        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        let itemsWithSizes = 0;

        for (const item of this.queue) {
            switch (item.status) {
                case QueueItemStatus.Pending:
                    stats.pending++;
                    break;
                case QueueItemStatus.Processing:
                    stats.processing++;
                    break;
                case QueueItemStatus.Completed:
                    stats.completed++;
                    if (item.result?.savedBytes) {
                        stats.totalSavedBytes += item.result.savedBytes;
                    }
                    if (item.result?.originalSize && item.result?.compressedSize) {
                        totalOriginalSize += item.result.originalSize;
                        totalCompressedSize += item.result.compressedSize;
                        itemsWithSizes++;
                    }
                    break;
                case QueueItemStatus.Failed:
                    stats.failed++;
                    break;
            }
        }

        if (itemsWithSizes > 0 && totalOriginalSize > 0) {
            stats.averageCompressionRatio =
                ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;
        }

        return stats;
    }

    /**
     * Register progress callback
     */
    public onProgress(callback: (stats: QueueStats) => void): void {
        this.onProgressCallbacks.push(callback);
    }

    /**
     * Register completion callback
     */
    public onComplete(callback: (stats: QueueStats) => void): void {
        this.onCompleteCallbacks.push(callback);
    }

    /**
     * Process queue with concurrency control
     */
    private async processQueue(): Promise<void> {
        const concurrency = ConfigService.getConfig().concurrency || 3;

        while (this.state === QueueState.Running) {
            const stats = this.getStats();

            // Check if queue is done
            if (stats.pending === 0 && stats.processing === 0) {
                this.handleQueueComplete();
                return;
            }

            // Process items up to concurrency limit
            if (this.currentlyProcessing < concurrency) {
                const nextItem = this.queue.find(
                    item => item.status === QueueItemStatus.Pending
                );

                if (nextItem) {
                    this.processItem(nextItem);
                } else {
                    // No pending items, wait for processing to complete
                    await this.sleep(100);
                }
            } else {
                // Wait before checking again
                await this.sleep(100);
            }
        }
    }

    /**
     * Process a single queue item
     */
    private async processItem(item: QueueItem): Promise<void> {
        item.status = QueueItemStatus.Processing;
        item.startedAt = new Date();
        this.currentlyProcessing++;
        this.updateStatusBar();

        try {
            const result = await this.compressFile(item.file);
            item.result = result;
            item.status = result.success
                ? QueueItemStatus.Completed
                : QueueItemStatus.Failed;

            if (!result.success && result.error) {
                item.error = result.error;
            }
        } catch (error) {
            item.status = QueueItemStatus.Failed;
            item.error = error as Error;
            item.result = {
                success: false,
                sourcePath: item.file.fsPath,
                destinationPath: '',
                error: error as Error
            };
        }

        item.completedAt = new Date();
        this.currentlyProcessing--;

        // Notify progress
        this.notifyProgress();
        this.updateStatusBar();
    }

    /**
     * Compress a file and return detailed result
     */
    private compressFile(file: Uri): Promise<CompressionResult> {
        return new Promise((resolve) => {
            CompressionService.compressImageWithCallback(
                file,
                (result) => resolve(result)
            );
        });
    }

    /**
     * Handle queue completion
     */
    private handleQueueComplete(): void {
        this.state = QueueState.Idle;
        const stats = this.getStats();

        this.statusBarItem.hide();

        // Show summary
        const savedKB = (stats.totalSavedBytes / 1024).toFixed(2);
        const compressionPercent = stats.averageCompressionRatio.toFixed(1);

        vscode.window.showInformationMessage(
            `Compression complete! ✓ ${stats.completed} succeeded, ✗ ${stats.failed} failed. ` +
            `Saved ${savedKB} KB (${compressionPercent}% reduction)`
        );

        // Notify completion callbacks
        this.onCompleteCallbacks.forEach(cb => cb(stats));

        // Clear completed items after a delay
        setTimeout(() => this.clearCompleted(), 5000);
    }

    /**
     * Update status bar with current progress
     */
    private updateStatusBar(): void {
        if (this.state === QueueState.Idle) {
            this.statusBarItem.hide();
            return;
        }

        const stats = this.getStats();

        let text = `$(sync~spin) TinyPNG: ${stats.completed}/${stats.total}`;
        let tooltip = `Compressing images...\n` +
                     `Completed: ${stats.completed}\n` +
                     `Failed: ${stats.failed}\n` +
                     `Pending: ${stats.pending}\n` +
                     `Processing: ${stats.processing}`;

        if (this.state === QueueState.Paused) {
            text = `$(debug-pause) TinyPNG: Paused (${stats.completed}/${stats.total})`;
            tooltip = 'Queue paused. Click to resume.';
        }

        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.show();
    }

    /**
     * Notify progress callbacks
     */
    private notifyProgress(): void {
        const stats = this.getStats();
        this.onProgressCallbacks.forEach(cb => cb(stats));
    }

    /**
     * Sleep helper
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.statusBarItem.dispose();
        this.onProgressCallbacks = [];
        this.onCompleteCallbacks = [];
    }
}
