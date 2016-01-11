'use strict';

var BaseViewGroup = require('app/views/objects/BaseViewGroup'),
    VertexObject;

VertexObject = function(options) {
    BaseViewGroup.call(this, options);
};
VertexObject.prototype = Object.create(BaseViewGroup.prototype);
VertexObject.prototype.constructor = VertexObject;

_.extend(VertexObject.prototype, Backbone.Events, {

    vertexData: null,
    iconObj: null,
    labelObj: null,

    /*
     * constructor
     * @event initialized: fabric event to indicate that the object is ready to be added to the canvas
     */
    initialize: function(options) {
        var self = this;

        self.vertexData = options.model;
        // TODO Try moving the SVG name into the styles
        self.addImage('basic_node.svg', function(iconObj) {
            self.iconObj = iconObj;
            self._initializeComponents();
        });
    },

    /*
     * Retrieves the coordinate for which to connect an edge
     */
    getConnectionPoint: function(side) {
        var iconInfo,
            vertexAbsPosition,
            xOffset;

        iconInfo = _.extend({}, this.iconObj.attr());
        vertexAbsPosition = _.pick(this.options, ['x', 'y']);
        if (side == 'left') {
            xOffset = 0;
        }
        else if (side == 'right') {
            xOffset = iconInfo.width - 1;
        }
        else {
            // TODO add better error handling
            alert('unrecognized side');
        }

        return {
            x: vertexAbsPosition.x + iconInfo.x + xOffset,
            y: vertexAbsPosition.y + ((iconInfo.y + iconInfo.height) / 2.0) + 1
        };
    },

    _initializeComponents: function() {
        var self,
            labelText,
            vertexIconStyle,
            labelTextStyle;

        self = this;
        vertexIconStyle = SvgStyles.getStyles('vertexIcon');
        self.iconObj.move(vertexIconStyle.x, vertexIconStyle.y);
        self.iconObj.click(function () {
            self.onClick();
        });

        labelTextStyle = SvgStyles.getStyles('vertexText');
        labelText = self.vertexData.get('modelName');
        self.labelObj = self.svg.text(labelText)
            .attr(_.pick(labelTextStyle, ['x', 'y', 'fill']))
            .font({
                family: labelTextStyle.fontFamily,
                size: labelTextStyle.fontSize,
            })
            .click( function () {
                self.onClick();
            });

        self.group.add(this.labelObj);
        self.group.transform(_.pick(this.options, ['x', 'y']));
        self.group.fire('initialized', this);
    },

    onClick: function () {
        this.trigger('model:selected', this.vertexData);
    }
});

module.exports = VertexObject;
