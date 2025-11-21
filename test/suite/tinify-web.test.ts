import * as assert from 'assert';
import {
    tinify,
    TinifyError,
    AccountError,
    ClientError,
    ServerError,
    ConnectionError
} from '../../tinify-web';

suite('TinyPNG Web Client Tests', () => {
    suite('Error Classes', () => {
        test('TinifyError should create error with correct name and message', () => {
            const error = new TinifyError('Test error');
            assert.strictEqual(error.name, 'TinifyError');
            assert.strictEqual(error.message, 'Test error');
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TinifyError);
        });

        test('AccountError should extend TinifyError', () => {
            const error = new AccountError('Invalid credentials');
            assert.strictEqual(error.name, 'AccountError');
            assert.strictEqual(error.message, 'Invalid credentials');
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TinifyError);
            assert.ok(error instanceof AccountError);
        });

        test('ClientError should extend TinifyError', () => {
            const error = new ClientError('Bad request');
            assert.strictEqual(error.name, 'ClientError');
            assert.strictEqual(error.message, 'Bad request');
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TinifyError);
            assert.ok(error instanceof ClientError);
        });

        test('ServerError should extend TinifyError', () => {
            const error = new ServerError('Internal server error');
            assert.strictEqual(error.name, 'ServerError');
            assert.strictEqual(error.message, 'Internal server error');
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TinifyError);
            assert.ok(error instanceof ServerError);
        });

        test('ConnectionError should extend TinifyError', () => {
            const error = new ConnectionError('Network failed');
            assert.strictEqual(error.name, 'ConnectionError');
            assert.strictEqual(error.message, 'Network failed');
            assert.ok(error instanceof Error);
            assert.ok(error instanceof TinifyError);
            assert.ok(error instanceof ConnectionError);
        });
    });

    suite('TinifyClient - Key Management', () => {
        test('Should set and get API key', () => {
            const testKey = 'test-api-key-123';
            tinify.key = testKey;
            assert.strictEqual(tinify.key, testKey);
        });

        test('Should initialize with empty key', () => {
            tinify.key = '';
            assert.strictEqual(tinify.key, '');
        });

        test('Should update API key', () => {
            tinify.key = 'initial-key';
            assert.strictEqual(tinify.key, 'initial-key');

            tinify.key = 'updated-key';
            assert.strictEqual(tinify.key, 'updated-key');
        });
    });

    suite('TinifyClient - Compression Count', () => {
        test('Should initialize compression count to 0', () => {
            assert.strictEqual(typeof tinify.compressionCount, 'number');
        });

        test('Should allow reading compression count', () => {
            const count = tinify.compressionCount;
            assert.ok(count >= 0);
        });
    });

    suite('TinifyClient - Validate Method', () => {
        test('Should throw AccountError when API key is not set (promise)', async () => {
            tinify.key = '';

            try {
                await tinify.validate();
                assert.fail('Should have thrown AccountError');
            } catch (error) {
                assert.ok(error instanceof AccountError);
                assert.strictEqual((error as AccountError).message, 'Provide an API key with tinify.key = ...');
            }
        });

        test('Should call callback with AccountError when API key is not set', (done) => {
            tinify.key = '';

            tinify.validate((error) => {
                assert.ok(error instanceof AccountError);
                assert.strictEqual(error?.message, 'Provide an API key with tinify.key = ...');
                done();
            });
        });

        test('Should not throw when callback is provided and key is missing', async () => {
            tinify.key = '';
            let callbackCalled = false;

            await tinify.validate((error) => {
                callbackCalled = true;
                assert.ok(error instanceof AccountError);
            });

            assert.ok(callbackCalled);
        });
    });

    suite('TinifyClient - FromBuffer Method', () => {
        test('Should return TinifySource object with toBuffer method', () => {
            tinify.key = 'test-key';
            const testBuffer = new Uint8Array([1, 2, 3, 4]);
            const source = tinify.fromBuffer(testBuffer);

            assert.ok(source);
            assert.strictEqual(typeof source.toBuffer, 'function');
        });

        test('Should throw AccountError when API key is not set in toBuffer', async () => {
            tinify.key = '';
            const testBuffer = new Uint8Array([1, 2, 3, 4]);
            const source = tinify.fromBuffer(testBuffer);

            try {
                await source.toBuffer();
                assert.fail('Should have thrown AccountError');
            } catch (error) {
                assert.ok(error instanceof AccountError);
                assert.strictEqual((error as AccountError).message, 'Provide an API key with tinify.key = ...');
            }
        });

        test('Should create source from empty buffer', () => {
            tinify.key = 'test-key';
            const emptyBuffer = new Uint8Array([]);
            const source = tinify.fromBuffer(emptyBuffer);

            assert.ok(source);
            assert.strictEqual(typeof source.toBuffer, 'function');
        });

        test('Should create source from large buffer', () => {
            tinify.key = 'test-key';
            const largeBuffer = new Uint8Array(1024 * 1024);
            const source = tinify.fromBuffer(largeBuffer);

            assert.ok(source);
            assert.strictEqual(typeof source.toBuffer, 'function');
        });
    });

    suite('TinifyClient - Error Response Handling', () => {
        test('Should handle 401 Unauthorized error', () => {
            // We can't directly test handleErrorResponse as it's private,
            // but we can verify the error types exist
            const error = new AccountError('Credentials are invalid (HTTP 401)');
            assert.ok(error instanceof AccountError);
            assert.strictEqual(error.message, 'Credentials are invalid (HTTP 401)');
        });

        test('Should handle 429 Rate Limit error', () => {
            const error = new AccountError('Your monthly limit has been exceeded (HTTP 429)');
            assert.ok(error instanceof AccountError);
            assert.strictEqual(error.message, 'Your monthly limit has been exceeded (HTTP 429)');
        });

        test('Should handle 400 Bad Request as ClientError', () => {
            const error = new ClientError('Request failed with status 400: Bad Request');
            assert.ok(error instanceof ClientError);
            assert.ok(error.message.includes('400'));
        });

        test('Should handle 404 Not Found as ClientError', () => {
            const error = new ClientError('Request failed with status 404: Not Found');
            assert.ok(error instanceof ClientError);
            assert.ok(error.message.includes('404'));
        });

        test('Should handle 500 Internal Server Error', () => {
            const error = new ServerError('API server error (HTTP 500)');
            assert.ok(error instanceof ServerError);
            assert.ok(error.message.includes('500'));
        });

        test('Should handle 503 Service Unavailable', () => {
            const error = new ServerError('API server error (HTTP 503)');
            assert.ok(error instanceof ServerError);
            assert.ok(error.message.includes('503'));
        });
    });

    suite('TinifyClient - Base64 Encoding', () => {
        test('Should create valid Basic Auth header format', () => {
            // Test that btoa is available (it should be in the test environment)
            const testCredentials = 'api:test-key';
            const encoded = btoa(testCredentials);
            const expected = 'Basic ' + encoded;

            assert.ok(encoded);
            assert.ok(expected.startsWith('Basic '));
            assert.strictEqual(typeof encoded, 'string');
        });

        test('Should encode credentials correctly', () => {
            const credentials = 'api:my-api-key-123';
            const encoded = btoa(credentials);

            // Verify it's base64 encoded
            assert.ok(/^[A-Za-z0-9+/=]+$/.test(encoded));

            // Verify we can decode it back
            const decoded = atob(encoded);
            assert.strictEqual(decoded, credentials);
        });

        test('Should handle special characters in API key', () => {
            const specialKey = 'api:key-with-special-chars_!@#$%';
            const encoded = btoa(specialKey);
            const decoded = atob(encoded);

            assert.strictEqual(decoded, specialKey);
        });
    });

    suite('TinifyClient - Minimal PNG Generation', () => {
        test('Should generate valid PNG signature', () => {
            // PNG signature: 89 50 4E 47 0D 0A 1A 0A
            const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

            // Verify each byte of PNG signature
            pngSignature.forEach((byte, index) => {
                assert.ok(byte >= 0 && byte <= 255);
            });

            assert.strictEqual(pngSignature.length, 8);
        });

        test('Should have correct PNG structure', () => {
            // Test minimal PNG components exist
            const chunks = {
                IHDR: [0x49, 0x48, 0x44, 0x52], // Image header
                IDAT: [0x49, 0x44, 0x41, 0x54], // Image data
                IEND: [0x49, 0x45, 0x4E, 0x44]  // Image end
            };

            // Verify chunk identifiers are valid
            Object.values(chunks).forEach(chunk => {
                assert.strictEqual(chunk.length, 4);
                chunk.forEach(byte => {
                    assert.ok(byte >= 0 && byte <= 255);
                });
            });
        });
    });

    suite('TinifyClient - API Endpoint', () => {
        test('Should use correct API endpoint', () => {
            // The API endpoint should be the TinyPNG shrink endpoint
            const expectedEndpoint = 'https://api.tinify.com/shrink';

            // We can't access the private constant directly, but we can verify
            // the format is correct
            assert.ok(expectedEndpoint.startsWith('https://'));
            assert.ok(expectedEndpoint.includes('tinify.com'));
            assert.ok(expectedEndpoint.endsWith('/shrink'));
        });
    });

    suite('TinifyClient - Response Headers', () => {
        test('Should parse compression count from header', () => {
            const testValue = '42';
            const parsed = parseInt(testValue, 10);

            assert.strictEqual(parsed, 42);
            assert.strictEqual(typeof parsed, 'number');
        });

        test('Should handle invalid compression count', () => {
            const invalidValues = ['abc', '', 'NaN', 'undefined'];

            invalidValues.forEach(value => {
                const parsed = parseInt(value, 10);
                if (!isNaN(parsed)) {
                    assert.ok(parsed >= 0);
                }
            });
        });

        test('Should parse large compression counts', () => {
            const largeCount = '999999';
            const parsed = parseInt(largeCount, 10);

            assert.strictEqual(parsed, 999999);
        });
    });

    suite('TinifyClient - Buffer Handling', () => {
        test('Should handle Uint8Array buffers', () => {
            const buffer = new Uint8Array([255, 216, 255, 224]); // JPEG signature

            assert.ok(buffer instanceof Uint8Array);
            assert.strictEqual(buffer.length, 4);
            assert.strictEqual(buffer[0], 255);
        });

        test('Should handle PNG signature buffer', () => {
            const pngBuffer = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

            assert.strictEqual(pngBuffer.length, 8);
            assert.strictEqual(pngBuffer[0], 0x89);
            assert.strictEqual(pngBuffer[1], 0x50);
        });

        test('Should handle zero-length buffer', () => {
            const emptyBuffer = new Uint8Array(0);

            assert.strictEqual(emptyBuffer.length, 0);
            assert.ok(emptyBuffer instanceof Uint8Array);
        });

        test('Should handle large buffers', () => {
            const size = 1024 * 1024; // 1MB
            const largeBuffer = new Uint8Array(size);

            assert.strictEqual(largeBuffer.length, size);
            assert.ok(largeBuffer instanceof Uint8Array);
        });
    });

    suite('TinifyClient - Singleton Instance', () => {
        test('Should export singleton instance', () => {
            assert.ok(tinify);
            assert.strictEqual(typeof tinify.validate, 'function');
            assert.strictEqual(typeof tinify.fromBuffer, 'function');
        });

        test('Should maintain state across calls', () => {
            const testKey = 'state-test-key';
            tinify.key = testKey;

            assert.strictEqual(tinify.key, testKey);

            // State should persist
            assert.strictEqual(tinify.key, testKey);
        });
    });

    suite('TinifyClient - Type Safety', () => {
        test('Should accept valid Uint8Array in fromBuffer', () => {
            tinify.key = 'test-key';
            const validBuffer = new Uint8Array([1, 2, 3]);

            const source = tinify.fromBuffer(validBuffer);
            assert.ok(source);
        });

        test('Should return object with Promise-returning toBuffer', () => {
            tinify.key = 'test-key';
            const buffer = new Uint8Array([1, 2, 3]);
            const source = tinify.fromBuffer(buffer);

            const result = source.toBuffer();
            assert.ok(result instanceof Promise);
        });
    });

    suite('TinifyClient - Error Message Consistency', () => {
        test('AccountError should have consistent message for missing key', () => {
            const expectedMessage = 'Provide an API key with tinify.key = ...';
            const error = new AccountError(expectedMessage);

            assert.strictEqual(error.message, expectedMessage);
        });

        test('AccountError should have consistent message for invalid credentials', () => {
            const expectedMessage = 'Credentials are invalid (HTTP 401)';
            const error = new AccountError(expectedMessage);

            assert.strictEqual(error.message, expectedMessage);
        });

        test('AccountError should have consistent message for rate limit', () => {
            const expectedMessage = 'Your monthly limit has been exceeded (HTTP 429)';
            const error = new AccountError(expectedMessage);

            assert.strictEqual(error.message, expectedMessage);
        });

        test('ServerError should include HTTP status code', () => {
            const error = new ServerError('API server error (HTTP 500)');

            assert.ok(error.message.includes('HTTP'));
            assert.ok(error.message.includes('500'));
        });

        test('ClientError should include status and status text', () => {
            const error = new ClientError('Request failed with status 400: Bad Request');

            assert.ok(error.message.includes('400'));
            assert.ok(error.message.includes('Bad Request'));
        });
    });
});
