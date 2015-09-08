'use strict';

var parseArgs = require('minimist'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    aliasify = require('aliasify'),
    remapify = require('remapify'),
    path = require('path'),
    fs = require('fs'),
    buildPath,
    bundlePath,
    args,
    isDebug,
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

function createBundle(outfile, browserifyObj, withMonitor) {
    var b,
        _rebundle;

    _rebundle = function() {
        var outstream;

        outstream = fs.createWriteStream(outfile);
        if (withMonitor) {
            outstream.on('close', function () {
                console.error('Bundle updated.');
            });
        }
        b.bundle()
         .on('error', onError)
         .pipe(outstream);
    };


    if (withMonitor) {
        b = watchify(browserifyObj)
            .on('update', function() {
                _rebundle();
            });
    }
    else {
        b = browserifyObj;
    }

    _rebundle();
}

// parse command line
args = parseArgs(process.argv.slice(2), {
    boolean: ['debug']
});
isDebug = args['debug'];

buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
}

bundlePath = path.join(buildPath, 'bundle-globals.js');
createBundle(
    bundlePath,
    browserify(['./app/globals.js'], {
        debug: isDebug,
    }).transform(aliasify, {
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
    browserify(['./app/main.js'], {
        debug: isDebug,
        cache: {},
        packageCache: {},
    }).plugin(remapify, [
        {
            src: "./app/**/*.js",
            filter: function(alias, dirname, basename) {
                return path.join(__dirname, dirname, basename);
            }
        }
    ]),
    isDebug
);
