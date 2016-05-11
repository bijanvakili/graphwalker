'use strict';

var _,
    $,
    Backbone,
    P,
    SVG,
    SvgStyles;

$ = require('jquery');
_ = require('underscore');
P = require('bluebird');
Backbone = require('backbone');
Backbone.$ = $;
SVG = require('svg');
SvgStyles = require('./lib/svg.styles');

window.$ = $;
window._ = _;
window.Backbone = Backbone;
window.P = P;
window.SVG = SVG;
window.SvgStyles = SvgStyles;
