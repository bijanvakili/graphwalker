'use strict';

var BaseViewGroup = require('app/views/objects/BaseViewGroup'),
    SvgTemplateCache = require('app/views/objects/SvgTemplateCache'),
    EdgeObject,
    EdgeDirectionIndicatorObject;


EdgeObject = fabric.util.createClass(BaseViewGroup, {
    edgeData: null,
    edgeType: null,
    endpointObjects: [],
    initOptions: {},

    /*
     * constructor
     * @param model {models.GraphData.Edge} graph edge data
     * @param startVertexObject {views.objects.VertexObject} starting vertex
     * @param endVertexObject {views.objects.VertexObject} end vertex
     * @param edgeType ('incoming' or 'outgoing')
     * @param options {} fabric Object options
     */
    initialize: function(model, startVertexObject, endVertexObject, edgeType, options) {
        this.callSuper('initialize', options);

        var self = this;


        self.edgeData = model;
        self.edgeType = edgeType;
        self.initOptions = options;
        self.endpointObjects = [startVertexObject, endVertexObject];

        self._onAllEndpointsInitialized();
    },

    _onAllEndpointsInitialized: function() {
        var endpoints = [],
            segmentPoints = [],
            vectorEdge,
            i,
            labelObj,
            textAnchorPoint;

        // assume edges always move right to left
        endpoints.push(this.endpointObjects[0].getConnectionPoint('right'));
        endpoints.push(this.endpointObjects[1].getConnectionPoint('left'));

        // break edge into 3 segments
        vectorEdge = endpoints[1].subtract(endpoints[0]);
        segmentPoints.push(endpoints[0]);
        segmentPoints.push(new fabric.Point(
            endpoints[0].x + vectorEdge.x * 1/3,
            endpoints[0].y
        ));
        segmentPoints.push(new fabric.Point(
            endpoints[0].x + vectorEdge.x * 2/3,
            endpoints[1].y
        ));
        segmentPoints.push(endpoints[1]);

        for (i = 1; i < segmentPoints.length; ++i) {
            this.add(
                new fabric.Line(
                    [segmentPoints[i-1].x, segmentPoints[i-1].y, segmentPoints[i].x, segmentPoints[i].y]
                ).withStyles('edgeLine')
            );
        }

        // draw the label adjacent to the first segment
        labelObj = new fabric.Text(
            this.edgeData.get('label')
        ).withStyles('edgeText');

        if (this.edgeType == 'incoming') {
            textAnchorPoint = segmentPoints[0];
        }
        else {
            textAnchorPoint = segmentPoints[2];
        }
        labelObj.setOptions({
            left: textAnchorPoint.x + labelObj.left,
            top: textAnchorPoint.y + labelObj.top,
        })

        this.add(labelObj);

        this.trigger('initialized', this);
    },
});


EdgeDirectionIndicatorObject = fabric.util.createClass(BaseViewGroup, {

    initialize: function(options) {
        var self = this;

        this.callSuper('initialize', options);

        // TODO Try moving the SVG name into the styles
        SvgTemplateCache.fetch('arrow.svg', {
            success: function(arrowObj) {
                self.addWithUpdate(arrowObj);
                self.trigger('initialized', self);
            }
        });
    },

});

module.exports = {
    EdgeObject,
    EdgeDirectionIndicatorObject
};
