'use strict';

var SvgTemplateCache = require('app/views/objects/SvgTemplateCache'),
    SvgObject,
    VertexObject;

// TODO use getBoundingRect() with clients!!!
var VertexObject = fabric.util.createClass(fabric.Group, {

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
        var vertexObject;

        this.callSuper('initialize');
        this.vertexData = model;
        if (_.has(options, 'onInitialized')) {
            this.on('initialized', options['onInitialized']);
            options = _.omit(options, 'onInitialized');
        }

        // TODO Try moving the SVG name into the styles
        vertexObject = this;
        SvgTemplateCache.fetch('basic_node.svg', {
            success: function(iconObj) {
                vertexObject.iconObj = iconObj;
                vertexObject._initializeComponents(options);
            }
        });
    },

    _initializeComponents: function(options) {
        var labelText;

        this.iconObj = this.iconObj.withStyles('vertexIcon');
        labelText = this.vertexData.get('modelName');
        this.labelObj = new fabric.Text(labelText).withStyles('vertexText');

        this.add(this.iconObj);
        this.add(this.labelObj);
        this.setOptions(options);

        this.trigger('initialized', this);
    },
});

module.exports = VertexObject;
