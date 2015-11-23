'use strict';

var SvgTemplateCache = require('app/views/objects/SvgTemplateCache'),
    BaseViewGroup = require('app/views/objects/BaseViewGroup'),
    VertexObject;

var VertexObject = fabric.util.createClass(BaseViewGroup, {

    vertexData: null,
    iconObj: null,
    labelObj: null,

    /*
     * constructor
     * @param {models.GraphData.Vertex} graph vertex data
     * @param options {} fabric Object options
     *
     * @event initialized: fabric event to indicate that the object is ready to be added to the canvas
     */
    initialize: function(model, options) {
        var self = this;

        this.callSuper('initialize', options);
        this.vertexData = model;

        // TODO Try moving the SVG name into the styles
        SvgTemplateCache.fetch('basic_node.svg', {
            success: function(iconObj) {
                self.iconObj = iconObj;
                self._initializeComponents();
            }
        });
    },

    /*
     * Retrieves the coordinate for which to connect an edge
     */
    getConnectionPoint: function(side) {
        var iconBoundingRect,
            vertexAbsPosition,
            xOffset;

        iconBoundingRect = this.iconObj.getBoundingRect();
        vertexAbsPosition = new fabric.Point(this.getLeft(),this.getTop());
        if (side == 'left') {
            xOffset = 0;
        }
        else if (side == 'right') {
            xOffset = iconBoundingRect.width;
        }
        else {
            // TODO add better error handling
            alert('unrecognized side');
        }

        return vertexAbsPosition.add({
            // TODO find a simpler way to handle scalar transforms
            x: (iconBoundingRect.left + xOffset) * this.iconObj.getScaleX(),
            y: ((iconBoundingRect.top + iconBoundingRect.height) / 2.0) * this.iconObj.getScaleY()
        });
    },

    _initializeComponents: function() {
        var labelText;

        this.iconObj = this.iconObj.withStyles('vertexIcon');
        labelText = this.vertexData.get('modelName');
        this.labelObj = new fabric.Text(labelText).withStyles('vertexText');

        this.add(this.iconObj);
        this.add(this.labelObj);

        this.trigger('initialized', this);
    },
});

module.exports = VertexObject;
