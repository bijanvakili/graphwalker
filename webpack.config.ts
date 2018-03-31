import * as path from 'path';
import * as process from 'process';

import * as webpack from 'webpack';
/* tslint:disable:no-var-requires */
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
/* tslint:enable:no-var-requires */

const isProduction = process.env.NODE_ENV === 'production';
const buildDirectory = path.resolve(__dirname, 'build');

const defaultOptions = {
    devtool: (isProduction ? 'source-map' : 'inline-source-map') as webpack.Options.Devtool,
};

const defaultPlugins = [
    new ExtractTextPlugin('styles-[name].css')
];
if (isProduction) {
    defaultPlugins.push(new UglifyJSPlugin({ sourceMap: true }));
}

const defaultOutputOptions = {
    filename: 'bundle-[name].js',
    path: buildDirectory,
};

const defaultRules = [
    {
        // All files with a '.css' extension will be handled by
        // 'extract-text-webpack-plugin, css-loader and style-loader'.
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                { loader: 'css-loader', options: { minimize: isProduction } }
            ],
        })
    }
];

// Bug in @types/webpack with fix implemented here:
// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/18902
//
// webpack documentation needs to be clarified as per this issue:
// https://github.com/webpack/webpack.js.org/issues/1513
const referencePluginOptions: webpack.DllReferencePlugin.Options = {
    context: __dirname,
    name: 'vendor',
    manifest: path.join(__dirname, 'build', 'vendor-manifest.json') as any
} as webpack.DllReferencePlugin.Options;

const config: webpack.Configuration[] = [
    {
        ...defaultOptions,
        name: 'vendor',
        entry: {
            vendor: [
                'history',
                'lodash',
                'purecss',
                'react',
                'react-dom',
                'react-redux',
                'react-router',
                'react-router-redux',
                'redux',
                'redux-actions',
                'redux-thunk',
                'whatwg-fetch',
            ]
        },
        output: {
            ...defaultOutputOptions,
            library: 'vendor'
        },
        module: {
            rules: defaultRules
        },
        plugins: [
            new webpack.DllPlugin({
                context: __dirname,
                name: '[name]',
                path: path.join(__dirname, 'build', '[name]-manifest.json')
            }),
            ...defaultPlugins
        ]
    },
    {
        ...defaultOptions,
        name: 'app',
        devServer: {
            contentBase: __dirname
        },
        entry: {
            app: [
                './app/main.tsx',
                './app/css/graph.css',
            ]
        },
        output: defaultOutputOptions,
        module: {
            rules: [
                ...defaultRules,
                {
                    // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
                    test: /\.tsx?$/,
                    loader: 'awesome-typescript-loader'
                },
                {
                    // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader'
                }
            ]
        },
        plugins: [
            new webpack.DllReferencePlugin(referencePluginOptions),
            // Bug in @types/webpack with fix implemented here:
            // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/19013
            //
            // For now, we use an array of RegExp instances
            new webpack.WatchIgnorePlugin([
                /node_modules/,
                /build/,
                /dist/
            ]),
            ...defaultPlugins
        ],
        resolve: {
            alias: {
                app: path.resolve(__dirname, 'app')
            },
            extensions: ['.ts', '.tsx', '.js']
        }
    }
];

export default config;