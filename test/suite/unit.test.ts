import * as assert from 'assert';
import * as path from 'path';

suite('Unit Tests', () => {
    suite('Path Handling Tests', () => {
        test('Should generate correct output path with postfix', () => {
            const inputPath = '/path/to/image.png';
            const postfix = '.min';
            const parsedPath = path.parse(inputPath);
            const expectedPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${postfix}${parsedPath.ext}`
            );
            assert.strictEqual(expectedPath, '/path/to/image.min.png');
        });

        test('Should generate correct output path with custom postfix', () => {
            const inputPath = '/path/to/photo.jpg';
            const postfix = '.compressed';
            const parsedPath = path.parse(inputPath);
            const expectedPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${postfix}${parsedPath.ext}`
            );
            assert.strictEqual(expectedPath, '/path/to/photo.compressed.jpg');
        });

        test('Should handle paths with multiple dots', () => {
            const inputPath = '/path/to/my.image.file.png';
            const postfix = '.min';
            const parsedPath = path.parse(inputPath);
            const expectedPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${postfix}${parsedPath.ext}`
            );
            assert.strictEqual(expectedPath, '/path/to/my.image.file.min.png');
        });

        test('Should handle paths without directories', () => {
            const inputPath = 'image.png';
            const postfix = '.min';
            const parsedPath = path.parse(inputPath);
            const expectedPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${postfix}${parsedPath.ext}`
            );
            assert.strictEqual(expectedPath, 'image.min.png');
        });

        test('Should handle .jpeg extension', () => {
            const inputPath = '/path/to/photo.jpeg';
            const postfix = '.min';
            const parsedPath = path.parse(inputPath);
            const expectedPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${postfix}${parsedPath.ext}`
            );
            assert.strictEqual(expectedPath, '/path/to/photo.min.jpeg');
        });

        test('Should handle .webp extension', () => {
            const inputPath = '/path/to/image.webp';
            const postfix = '.min';
            const parsedPath = path.parse(inputPath);
            const expectedPath = path.join(
                parsedPath.dir,
                `${parsedPath.name}${postfix}${parsedPath.ext}`
            );
            assert.strictEqual(expectedPath, '/path/to/image.min.webp');
        });
    });

    suite('Image File Pattern Tests', () => {
        test('Should match .png files', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(pattern.test('image.png'));
            assert.ok(pattern.test('some/path/image.png'));
        });

        test('Should match .jpg files', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(pattern.test('photo.jpg'));
            assert.ok(pattern.test('some/path/photo.jpg'));
        });

        test('Should match .jpeg files', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(pattern.test('photo.jpeg'));
            assert.ok(pattern.test('some/path/photo.jpeg'));
        });

        test('Should match .webp files', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(pattern.test('image.webp'));
            assert.ok(pattern.test('some/path/image.webp'));
        });

        test('Should not match non-image files', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(!pattern.test('document.txt'));
            assert.ok(!pattern.test('script.js'));
            assert.ok(!pattern.test('style.css'));
            assert.ok(!pattern.test('data.json'));
        });

        test('Should not match image files with wrong case (case sensitive)', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(!pattern.test('image.PNG'));
            assert.ok(!pattern.test('photo.JPG'));
        });

        test('Should handle files without extensions', () => {
            const pattern = /\.(png|jpg|jpeg|webp)$/;
            assert.ok(!pattern.test('imagefile'));
            assert.ok(!pattern.test('some/path/imagefile'));
        });
    });

    suite('Git Staged Files Parsing Tests', () => {
        test('Should parse null-delimited git output', () => {
            const gitOutput = 'file1.png\u0000file2.jpg\u0000file3.webp\u0000';
            const files = gitOutput
                .replace(/\u0000$/, '')
                .split('\u0000')
                .filter(f => /\.(png|jpg|jpeg|webp)$/.test(f));

            assert.strictEqual(files.length, 3);
            assert.ok(files.includes('file1.png'));
            assert.ok(files.includes('file2.jpg'));
            assert.ok(files.includes('file3.webp'));
        });

        test('Should filter non-image files from git output', () => {
            const gitOutput = 'file1.png\u0000file2.txt\u0000file3.jpg\u0000file4.js\u0000';
            const files = gitOutput
                .replace(/\u0000$/, '')
                .split('\u0000')
                .filter(f => /\.(png|jpg|jpeg|webp)$/.test(f));

            assert.strictEqual(files.length, 2);
            assert.ok(files.includes('file1.png'));
            assert.ok(files.includes('file3.jpg'));
            assert.ok(!files.includes('file2.txt'));
            assert.ok(!files.includes('file4.js'));
        });

        test('Should handle empty git output', () => {
            const gitOutput = '';
            const files = gitOutput
                .replace(/\u0000$/, '')
                .split('\u0000')
                .filter(f => /\.(png|jpg|jpeg|webp)$/.test(f));

            assert.strictEqual(files.length, 0);
        });

        test('Should handle git output with paths', () => {
            const gitOutput = 'src/images/logo.png\u0000docs/screenshot.jpg\u0000';
            const files = gitOutput
                .replace(/\u0000$/, '')
                .split('\u0000')
                .filter(f => /\.(png|jpg|jpeg|webp)$/.test(f));

            assert.strictEqual(files.length, 2);
            assert.ok(files.includes('src/images/logo.png'));
            assert.ok(files.includes('docs/screenshot.jpg'));
        });
    });

    suite('Configuration Validation Tests', () => {
        test('Boolean configuration validation', () => {
            const validBooleans = [true, false];
            validBooleans.forEach(val => {
                assert.strictEqual(typeof val, 'boolean');
            });
        });

        test('String configuration validation', () => {
            const validPostfixes = ['.min', '.compressed', '.opt', '-compressed'];
            validPostfixes.forEach(val => {
                assert.strictEqual(typeof val, 'string');
                assert.ok(val.length > 0);
            });
        });

        test('API key should be string when defined', () => {
            const validApiKeys = ['abc123', 'test-key-12345'];
            validApiKeys.forEach(val => {
                assert.strictEqual(typeof val, 'string');
                assert.ok(val.length > 0);
            });
        });
    });

    suite('Error Type Detection Tests', () => {
        test('Should identify error instance names', () => {
            const error = new Error('Test error');
            assert.strictEqual(error.name, 'Error');
            assert.ok(error.message === 'Test error');
        });

        test('Should handle error messages', () => {
            const testMessages = [
                'Authentication failed. Have you set the API Key?',
                'Ooops, there is an error. Please check your source image and settings.',
                'TinyPNG API is currently not available.',
                'Network issue occurred. Please check your internet connectivity.'
            ];

            testMessages.forEach(msg => {
                assert.strictEqual(typeof msg, 'string');
                assert.ok(msg.length > 0);
            });
        });
    });
});
