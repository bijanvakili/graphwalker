'use strict';

var parseArgs = require('minimist'),
    browserify = require('browserify'),
    exorcist   = require('exorcist'),
    watchify = require('watchify'),
    aliasify = require('aliasify'),
    remapify = require('remapify'),
    stringify = require('stringify'),
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


function makeBowerPath(library_name, optional_subfolder) {
    var path = "./bower_components/" + library_name + "/";

    if (optional_subfolder != undefined) {
        path = path + optional_subfolder + "/";
    }

    // TODO add argument to use minified version
    return path + library_name + ".js";
}

function createBundle(outfile, browserifyObj, isDebug) {
    var b,
        mapFilename,
        _rebundle;

    mapFilename = outfile + '.map';
    _rebundle = function() {
        var rebundler,
            outstream;

        rebundler = b.bundle().on('error', onError);
        outstream = fs.createWriteStream(outfile);

        if (isDebug) {
            outstream.on('close', function () {
                console.log('Bundle updated.');
            });
            rebundler = rebundler.pipe(exorcist(mapFilename));
        }

        rebundler.pipe(outstream);
    };

    if (isDebug) {
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
            'underscore': makeBowerPath('underscore'),
            'jquery': makeBowerPath('jquery', 'dist'),
            'backbone': makeBowerPath('backbone'),
        },
        verbose: false
    })
);

bundlePath = path.join(buildPath, 'bundle-app.js');
createBundle(
    bundlePath,
    browserify([], {
        debug: isDebug,
        cache: {},
        packageCache: {},
    }).transform(
        stringify({
            extentions: ['.tpl'],
            minify: false, // TODO change htis once we add minification
        }), {
            global: true,
        }
    ).plugin(remapify, [
        {
            src: "./app/**/*.js",
            filter: function(alias, dirname, basename) {
                return path.join(__dirname, dirname, basename);
            }
        },
        {
            src: "./app/**/*.tpl",
            filter: function(alias, dirname, basename) {
                return path.join(__dirname, dirname, basename);
            }
        }
    ])
    .add('./app/main.js'),
    isDebug
);
