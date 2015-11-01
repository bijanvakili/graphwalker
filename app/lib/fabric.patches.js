(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'fabric', 'exports'], function(_, fabric, exports) {
        root.FabricPatches = factory(root, exports, _, fabric);
    });
  }
  else if (typeof exports !== 'undefined') {
    var _ = require('underscore'),
        fabric = require('fabric');

    module.exports = factory(root, exports, _, fabric);
  }
  else {
    // browser global
    root.FabricPatches = factory(root, {}, root._, root.fabric);
  }
}(this, function(root, FabricPatches, _, fabric) {
    'use strict';

    if (_.has(fabric, 'fabric')) {
        fabric = fabric.fabric;
    }

    _.extend(fabric.StaticCanvas.prototype, {
        // temporary patch for Canvas._setImageSmoothing() until fabric 1.6
        // https://github.com/kangax/fabric.js/issues/2047
        _setImageSmoothing: function() {
            var ctx = this.getContext();

            if (typeof ctx.imageSmoothingEnabled !== 'undefined') {
                ctx.imageSmoothingEnabled = this.imageSmoothingEnabled;
                return;
            }
            ctx.webkitImageSmoothingEnabled = this.imageSmoothingEnabled;
            ctx.mozImageSmoothingEnabled    = this.imageSmoothingEnabled;
            ctx.msImageSmoothingEnabled     = this.imageSmoothingEnabled;
            ctx.oImageSmoothingEnabled      = this.imageSmoothingEnabled;
        },
    });

    return FabricPatches;
}));
