'use strict';

var FabricDebugger = function(canvas) {

    // TODO still contains bug which can suddenly force debug coordinates to 0,0

    var fabricDebugger = {

        _canvas: canvas,
        _marker: null,

        set: function(x, y) {
            var rectStyle = FabricStyles.getStyles('debugRect');

            if (_.isNull(this._marker)) {
                var inner,
                    outer,
                    outerStyle;

                inner = new fabric.Rect({
                   'left': rectStyle.width / 2.0 - 0.5,
                   'top': rectStyle.height / 2.0 - 0.5
                }).withStyles('debugPoint');
                outer = new fabric.Rect({}).withStyles('debugRect');
                this._marker = new fabric.Group([ outer, inner ]);

                this._canvas.add(this._marker);
            }

            this._marker.set(
               'left', x - rectStyle.width / 2.0
            );
            this._marker.set(
               'top', y - rectStyle.height / 2.0
            );
        },
    };

    return fabricDebugger;
};

module.exports = FabricDebugger;
