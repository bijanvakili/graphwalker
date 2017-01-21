'use strict';

var _,
    $,
    Backbone,
    P,
    SVG,
    SvgStyles;

$ = require('jquery');
_ = require('lodash');

// TODO remove this hack once backbone.typeahead approves and merges PR #29
// https://github.com/mojotech/backbone.typeahead/pull/29
_.all = _.every;

P = require('bluebird');
Backbone = require('backbone');
Backbone.$ = $;
SVG = require('svg');
SvgStyles = require('./lib/svg.styles');

window.$ = $;
window._ = _;
window.Backbone = Backbone;
require('backbone.typeahead');
window.P = P;
window.SVG = SVG;
window.SvgStyles = SvgStyles;
