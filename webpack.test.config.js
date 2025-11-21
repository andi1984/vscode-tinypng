/**
 * Webpack configuration for building web extension tests
 * Following the official @vscode/test-web sample pattern
 */
//@ts-check
'use strict';

const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const webTestConfig = {
    mode: 'none',
    target: 'webworker',
    entry: {
        'index.web': './test/suite/index.web.ts'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './out/test/suite'),
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../../../[resource-path]'
    },
    devtool: 'nosources-source-map',
    externals: {
        vscode: 'commonjs vscode'
    },
    resolve: {
        mainFields: ['module', 'main'],
        extensions: ['.ts', '.js'],
        fallback: {
            assert: require.resolve('assert/'),
            path: require.resolve('path-browserify')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser'
        })
    ],
    performance: {
        hints: false
    }
};

module.exports = webTestConfig;
