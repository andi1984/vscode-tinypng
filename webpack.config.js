/**
 * Webpack configuration for building the web extension
 */
//@ts-check
'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const webConfig = {
    target: 'webworker', // extensions run in a webworker context
    entry: './extension.web.ts', // source of the web extension main file
    output: {
        filename: 'extension.web.js',
        path: path.join(__dirname, './dist/web'),
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../../[resource-path]'
    },
    devtool: 'nosources-source-map',
    externals: {
        vscode: 'commonjs vscode' // ignored because it doesn't exist
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.ts', '.js'],
        alias: {
            // provides alternate implementation for node module
        },
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically.
            // If you need them, add them to fallback.
            // If you don't need them, you can set them to false.
            assert: false,
            buffer: false,
            console: false,
            constants: false,
            crypto: false,
            domain: false,
            events: false,
            http: false,
            https: false,
            os: false,
            path: false,
            punycode: false,
            process: false,
            querystring: false,
            stream: false,
            string_decoder: false,
            sys: false,
            timers: false,
            tty: false,
            url: false,
            util: false,
            vm: false,
            zlib: false
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules|test/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                module: 'esnext' // override tsconfig for web
                            },
                            transpileOnly: false,
                            onlyCompileBundledFiles: true
                        }
                    }
                ]
            }
        ]
    }
};

/**@type {import('webpack').Configuration}*/
const nodeConfig = {
    target: 'node', // regular extension runs in a Node.js context
    entry: './extension.ts',
    output: {
        filename: 'extension.js',
        path: path.join(__dirname, './dist/node'),
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'nosources-source-map',
    externals: {
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules|test/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            onlyCompileBundledFiles: true
                        }
                    }
                ]
            }
        ]
    }
};

module.exports = [webConfig, nodeConfig];
