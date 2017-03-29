/* eslint strict: 0 */

/* global define */
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'svg.js', 'exports'], function (_, SVG, exports) {
            root.SvgStyles = factory(root, exports, _, SVG);
        });
    }
    else if (typeof exports !== 'undefined') {
        var _ = require('underscore');
        var SVG = require('svg.js');

        module.exports = factory(root, exports, _, SVG);
    }
    else {
        // browser global
        root.SvgStyles = factory(root, {}, root._, root.SVG);
    }
}(this, function (root, SvgStyles, _, SVG) {
    'use strict';

    _.extend(SvgStyles, {

        VERSION: '0.0.1',

        _allStyles: {},

        addStyles: function (styles) {
            _.extend(this._allStyles, styles);
        },

        getStyles: function (styles) {
            if (_.isArray(styles)) {
                return _.map(styles, function (style) {
                    return this._allStyles[style];
                }, this);
            }
            else {
                return this._allStyles[styles];
            }
        }
    });

    _.extend(SVG.Element.prototype, {

        withStyles: function (styles) {
            var unmergedStyles,
                modifiedOptions;

            unmergedStyles = SvgStyles.getStyles(styles);
            if (_.isArray(unmergedStyles)) {
                modifiedOptions = _.reduce(
                    unmergedStyles,
                    function (memo, styleData) {
                        return _.extend(memo, styleData);
                    }
                );
            }
            else {
                modifiedOptions = unmergedStyles;
            }

            this.style(modifiedOptions);
            return this;
        }
    });

    return SvgStyles;
}));
