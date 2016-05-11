'use strict';

var parseArgs  = require('minimist');
var browserify = require('browserify');
var exorcist   = require('exorcist');
var watchify   = require('watchify');
var aliasify   = require('aliasify');
var remapify   = require('remapify');
var stringify  = require('stringify');
var path       = require('path');
var fs         = require('fs');

var buildPath,
    bundlePath,
    args,
    isDebug;

function onError (err) {
    if (err.stack) {
        console.error(err.stack);
    }
    else {
        console.error(String(err));
    }
    process.exit(1);
}


function makeBowerPath (library_name, optional_subfolder) {
    var path = './bower_components/' + library_name + '/';

    if (optional_subfolder !== undefined) {
        path = path + optional_subfolder + '/';
    }

    // TODO add argument to use minified version
    return path + library_name + '.js';
}

function createBundle (outfile, browserifyObj, isDebug) {
    var b,
        mapFilename,
        _rebundle;

    mapFilename = outfile + '.map';
    _rebundle = function () {
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
            .on('update', function () {
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
        debug: isDebug
    }).transform(aliasify, {
        aliases: {
            'backbone': makeBowerPath('backbone'),
            'bluebird': makeBowerPath('bluebird', 'js/browser'),
            'jquery': makeBowerPath('jquery', 'dist'),
            'svg': makeBowerPath('svg', 'dist'),
            'underscore': makeBowerPath('underscore')
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
        packageCache: {}
    }).transform(
        stringify({
            extentions: ['.tpl'],
            minify: false // TODO change this once we add minification
        }), {
            global: true
        }
    ).plugin(remapify, [
        {
            src: './app/**/*.js',
            filter: function (alias, dirname, basename) {
                return path.join(__dirname, dirname, basename);
            }
        },
        {
            src: './app/**/*.tpl',
            filter: function (alias, dirname, basename) {
                return path.join(__dirname, dirname, basename);
            }
        }
    ])
    .add('./app/main.js'),
    isDebug
);
