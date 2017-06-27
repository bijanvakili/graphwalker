'use strict';

var _,
    $,
    Backbone,
    P,
    SVG,
    SvgStyles;

$ = require('jquery');
_ = require('lodash');

P = require('bluebird');
Backbone = require('backbone');
Backbone.$ = $;
SVG = require('svg.js');
SvgStyles = require('./lib/svg.styles');

window.$ = $;
window._ = _;
window.Backbone = Backbone;

/**
 * Workaround until backbone.typeahead acceps PR #30
 * https://github.com/mojotech/backbone.typeahead/pull/30
 */

require('backbone.typeahead/dist/backbone.typeahead');

// TODO replace the above line with the following once the PR is merged and released
// require('backbone.typeahead');

window.P = P;
window.SVG = SVG;
window.SvgStyles = SvgStyles;
