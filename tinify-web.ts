/**
 * Web-compatible TinyPNG API wrapper using Fetch API
 * This replaces the Node.js tinify library for use in web extensions
 */

const API_ENDPOINT = 'https://api.tinify.com/shrink';

// Custom error classes matching tinify library
export class TinifyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TinifyError';
    }
}

export class AccountError extends TinifyError {
    constructor(message: string) {
        super(message);
        this.name = 'AccountError';
    }
}

export class ClientError extends TinifyError {
    constructor(message: string) {
        super(message);
        this.name = 'ClientError';
    }
}

export class ServerError extends TinifyError {
    constructor(message: string) {
        super(message);
        this.name = 'ServerError';
    }
}

export class ConnectionError extends TinifyError {
    constructor(message: string) {
        super(message);
        this.name = 'ConnectionError';
    }
}

interface TinifySource {
    toBuffer(): Promise<Uint8Array>;
}

class TinifyClient {
    private apiKey: string = '';
    public compressionCount: number = 0;

    set key(value: string) {
        this.apiKey = value;
    }

    get key(): string {
        return this.apiKey;
    }

    /**
     * Create Basic Auth header
     */
    private getAuthHeader(): string {
        // Basic auth format: "api:API_KEY" encoded in base64
        const credentials = `api:${this.apiKey}`;
        // Using btoa for base64 encoding (available in web workers)
        const encoded = btoa(credentials);
        return `Basic ${encoded}`;
    }

    /**
     * Validate the API key
     */
    async validate(callback?: (error: Error | null) => void): Promise<void> {
        if (!this.apiKey) {
            const error = new AccountError('Provide an API key with tinify.key = ...');
            if (callback) {
                callback(error);
                return;
            }
            throw error;
        }

        try {
            // Create a minimal 1x1 PNG for validation
            const testImage = this.createMinimalPNG();

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/octet-stream'
                },
                body: testImage as any
            });

            // Update compression count from response header
            const compressionHeader = response.headers.get('compression-count');
            if (compressionHeader) {
                this.compressionCount = parseInt(compressionHeader, 10);
            }

            if (!response.ok) {
                const error = this.handleErrorResponse(response);
                if (callback) {
                    callback(error);
                    return;
                }
                throw error;
            }

            if (callback) {
                callback(null);
            }
        } catch (error) {
            if (error instanceof TinifyError) {
                if (callback) {
                    callback(error);
                    return;
                }
                throw error;
            }
            const connectionError = new ConnectionError(
                error instanceof Error ? error.message : 'Network error occurred'
            );
            if (callback) {
                callback(connectionError);
                return;
            }
            throw connectionError;
        }
    }

    /**
     * Compress image from buffer
     */
    fromBuffer(buffer: Uint8Array): TinifySource {
        return {
            toBuffer: async (): Promise<Uint8Array> => {
                if (!this.apiKey) {
                    throw new AccountError('Provide an API key with tinify.key = ...');
                }

                try {
                    // Upload image for compression
                    const response = await fetch(API_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Authorization': this.getAuthHeader(),
                            'Content-Type': 'application/octet-stream'
                        },
                        body: buffer as any
                    });

                    // Update compression count
                    const compressionHeader = response.headers.get('compression-count');
                    if (compressionHeader) {
                        this.compressionCount = parseInt(compressionHeader, 10);
                    }

                    if (!response.ok) {
                        throw this.handleErrorResponse(response);
                    }

                    // Get the location of the compressed image
                    const location = response.headers.get('location');
                    if (!location) {
                        throw new ServerError('No location header in response');
                    }

                    // Download the compressed image
                    const downloadResponse = await fetch(location, {
                        headers: {
                            'Authorization': this.getAuthHeader()
                        }
                    });

                    if (!downloadResponse.ok) {
                        throw this.handleErrorResponse(downloadResponse);
                    }

                    const arrayBuffer = await downloadResponse.arrayBuffer();
                    return new Uint8Array(arrayBuffer);
                } catch (error) {
                    if (error instanceof TinifyError) {
                        throw error;
                    }
                    throw new ConnectionError(
                        error instanceof Error ? error.message : 'Network error occurred'
                    );
                }
            }
        };
    }

    /**
     * Handle error responses from the API
     */
    private handleErrorResponse(response: Response): TinifyError {
        const status = response.status;
        const statusText = response.statusText;

        if (status === 401 || status === 429) {
            return new AccountError(
                status === 401
                    ? 'Credentials are invalid (HTTP 401)'
                    : 'Your monthly limit has been exceeded (HTTP 429)'
            );
        } else if (status >= 400 && status < 500) {
            return new ClientError(`Request failed with status ${status}: ${statusText}`);
        } else if (status >= 500 && status < 600) {
            return new ServerError(`API server error (HTTP ${status})`);
        }

        return new TinifyError(`Unexpected error (HTTP ${status}): ${statusText}`);
    }

    /**
     * Create a minimal 1x1 PNG for validation
     */
    private createMinimalPNG(): Uint8Array {
        // This is a minimal valid 1x1 transparent PNG
        const png = [
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // bit depth, color type, etc.
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // CRC
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
            0x42, 0x60, 0x82
        ];
        return new Uint8Array(png);
    }
}

// Export a singleton instance to match tinify API
export const tinify = new TinifyClient();
export default tinify;
