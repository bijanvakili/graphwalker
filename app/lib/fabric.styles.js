(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'fabric', 'exports'], function(_, fabric, exports) {
        root.FabricStyles = factory(root, exports, _, fabric.fabric);
    });
  }
  else if (typeof exports !== 'undefined') {
    var _ = require('underscore'),
        fabric = require('fabric');

    module.exports = factory(root, exports, _, fabric.fabric);
  }
  else {
    // browser global
    // TODO fix call to fabric sub-object
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
            return _.map(styles, function(style) { return this._allStyles[style]; }, this)
        }
    };

    // override setOptions to allow styling injection
    oldSetOptions = fabric.Object.prototype.setOptions;

    newSetOptions = function(options) {
        var modifiedOptions;

        if (_.has(options, 'FabricStyles')) {
            var unmergedStyles = FabricStyles.getStyles(options['FabricStyles']);
            modifiedOptions = _.extend(
                _.reduce(
                    unmergedStyles,
                    function (memo, styleData) { return _.extend(memo, styleData); }
                ),
                _.omit(options, 'FabricStyles')
            );
        }
        else {
            modifiedOptions = options;
        }

        _.bind(oldSetOptions, this)(modifiedOptions);
    }

    fabric.Object.prototype.setOptions = newSetOptions;

    return FabricStyles;
}));