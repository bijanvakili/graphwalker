'use strict';

var SvgTemplateCache = require('app/views/objects/SvgTemplateCache'),
    BaseViewGroup = require('app/views/objects/BaseViewGroup'),
    VertexObject;

// TODO use getBoundingRect() with clients!!!
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
    getConnectionPoint: function() {
        // TODO add ability to get left or right boundary
        var vertexAbsPosition,
            iconRelativePosition;

        vertexAbsPosition = new fabric.Point(
            this.getLeft(),
            this.getTop()
        );
        iconRelativePosition = new fabric.Point(
            this.iconObj.getLeft(),
            this.iconObj.getTop()
        );

        return vertexAbsPosition.add(iconRelativePosition);
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
