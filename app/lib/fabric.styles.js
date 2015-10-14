(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'fabric', 'exports'], function(_, fabric, exports) {
        root.FabricStyles = factory(root, exports, _, fabric);
    });
  }
  else if (typeof exports !== 'undefined') {
    var _ = require('underscore'),
        fabric = require('fabric');

    module.exports = factory(root, exports, _, fabric);
  }
  else {
    // browser global
    root.FabricStyles = factory(root, {}, root._, root.fabric);
  }
}(this, function(root, FabricStyles, _, fabric) {
    'use strict';

    var MIN_FABRIC_VERSION = 1.5,
        isValidFabricVersion,
        oldSetOptions,
        newSetOptions;

    isValidFabricVersion = function(fabric) {
        var versionComponents,
            summaryVersion = 0;

        versionComponents = _.map(fabric.version.split('.'), function(s) {return parseInt(s, 10); });
        if (versionComponents.length < 2) {
            return false;
        }

        summaryVersion = versionComponents[0] * 1.0 + versionComponents[1] * 0.1;
        if (summaryVersion < MIN_FABRIC_VERSION) {
            return false;
        }

        return true;
    };

    if (_.has(fabric, 'fabric')) {
        fabric = fabric.fabric;
    }

    if (!isValidFabricVersion(fabric)) {
        alert('fabric-style requires fabric v' + MIN_FABRIC_VERSION);
        return;
    }

    FabricStyles = {

        VERSION: '0.0.1',

        _allStyles: {},

        addStyles: function(styles) {
            _.extend(this._allStyles, styles);
        },

        getStyles: function(styles) {
            if (_.isArray(styles)) {
                return _.map(styles, function(style) { return this._allStyles[style]; }, this);
            }
            else {
                return this._allStyles[styles];
            }
        }
    };

    _.extend(fabric.Object.prototype, {

        withStyles: function(styles) {
            var unmergedStyles,
                modifiedOptions;

            unmergedStyles = FabricStyles.getStyles(styles);
            if (_.isArray(unmergedStyles)) {
                modifiedOptions = _.reduce(
                    unmergedStyles,
                    function (memo, styleData) { return _.extend(memo, styleData); }
                );
            }
            else {
                modifiedOptions = unmergedStyles;
            }

            this.setOptions(modifiedOptions);
            return this;
        }
    });

    return FabricStyles;
}));
