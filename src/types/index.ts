import { Uri } from 'vscode';

/**
 * Configuration for TinyPNG extension
 */
export interface TinyPngConfig {
    apiKey?: string;
    forceOverwrite: boolean;
    compressedFilePostfix: string;
    concurrency?: number;
}

/**
 * Result of a compression operation
 */
export interface CompressionResult {
    success: boolean;
    sourcePath: string;
    destinationPath: string;
    originalSize?: number;
    compressedSize?: number;
    savedBytes?: number;
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

/**
 * Queue item status
 */
export enum QueueItemStatus {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed'
}

/**
 * Item in the compression queue
 */
export interface QueueItem {
    id: string;
    file: Uri;
    status: QueueItemStatus;
    result?: CompressionResult;
    error?: Error;
    addedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

/**
 * Queue statistics
 */
export interface QueueStats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    totalSavedBytes: number;
    averageCompressionRatio: number;
}

/**
 * Queue state
 */
export enum QueueState {
    Idle = 'idle',
    Running = 'running',
    Paused = 'paused',
    Cancelled = 'cancelled'
}
