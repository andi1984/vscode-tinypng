// Web extension test runner following the official @vscode/test-web pattern
// imports mocha for the browser, defining the `mocha` global.
require('mocha/mocha');

export function run(): Promise<void> {
    return new Promise((resolve, reject) => {
        mocha.setup({
            ui: 'tdd',
            reporter: undefined
        });

        // bundles all files in the current directory matching `*.test`
        const importAll = (r: __WebpackModuleApi.RequireContext) => r.keys().forEach(r);
        importAll(require.context('.', true, /\.test$/));

        try {
            // Run the mocha test
            mocha.run(failures => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}
