import * as path from 'path';
import { runTests } from '@vscode/test-web';

// Suppress harmless ERR_STREAM_PREMATURE_CLOSE warnings from the test server
process.on('warning', (warning) => {
    if (warning.message.includes('ERR_STREAM_PREMATURE_CLOSE')) {
        return; // Suppress this specific warning
    }
    console.warn(warning);
});

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to the extension test runner script
        const extensionTestsPath = path.resolve(__dirname, './suite/index.web.js');

        // Download VS Code, unzip it and run the web extension tests
        await runTests({
            browserType: 'chromium',
            extensionDevelopmentPath,
            extensionTestsPath,
            // Optional: specify a custom folder for downloading VS Code
            // cachePath: path.resolve(__dirname, '../../.vscode-test-web')
        });
    } catch (err) {
        console.error('Failed to run web extension tests', err);
        process.exit(1);
    }
}

main();
