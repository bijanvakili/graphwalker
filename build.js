'use strict';

var browserify = require('browserify'),
    aliasify = require('aliasify'),
    remapify = require('remapify'),
    path = require('path'),
    fs = require('fs'),
    buildPath,
    bundlePath,
    b;

function onError(err) {
    if (err.stack) {
        console.error(err.stack);
    }
    else {
        console.error(String(err));
    }
    process.exit(1);
}

function createBundle(bundlePath, browserifyIntance) {
    browserifyIntance.bundle()
                     .on('error', onError)
                     .pipe(fs.createWriteStream(bundlePath));
}

buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
}


bundlePath = path.join(buildPath, 'bundle-globals.js');
createBundle(
    bundlePath,
    browserify(['./app/globals.js'], {})
        .transform(aliasify, {
            aliases: {
                "underscore": "./bower_components/underscore/underscore.js",
                "jquery": "./bower_components/jquery/dist/jquery.js",
                "backbone": "./bower_components/backbone/backbone.js"
            },
            verbose: false
        })
);

bundlePath = path.join(buildPath, 'bundle-app.js');
createBundle(
    bundlePath,
    browserify(['./app/main.js'], {})
        .plugin(remapify, [
            {
                src: "./app/**/*.js",
                filter: function(alias, dirname, basename) {
                    return path.join(__dirname, dirname, basename);
                }
            }
        ])
);
