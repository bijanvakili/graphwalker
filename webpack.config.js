var path = require('path');

var UglifyJSPlugin = require('uglifyjs-webpack-plugin');


var isProduction = process.env.NODE_ENV === 'production';


module.exports = {
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    entry: {
        globals: './app/globals.js',
        app: './app/main.js'
    },
    output: {
        filename: 'bundle-[name].js',
        path: path.resolve(__dirname, 'build')
    },
    plugins: [
        new UglifyJSPlugin({
            sourceMap: true
        })
    ],
    resolve: {
        alias: {
            app: path.resolve(__dirname, 'app')
        }
    }
};
