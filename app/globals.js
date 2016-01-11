'use strict';

var _,
    $,
    Backbone,
    SVG,
    SvgStyles;

$ = require('jquery');
_ = require('underscore');
Backbone = require('backbone');
Backbone.$ = $;
SVG = require('svg');
SvgStyles = require('./lib/svg.styles');

window.$ = $;
window._ = _;
window.Backbone = Backbone;
window.SVG = SVG;
window.SvgStyles = SvgStyles;
