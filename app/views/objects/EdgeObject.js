'use strict';

var BaseViewGroup = require('app/views/objects/BaseViewGroup'),
    EdgeObject,
    EdgeDirectionIndicatorObject;

EdgeObject = function(options) {
    BaseViewGroup.call(this, options);
};
EdgeObject.prototype = Object.create(BaseViewGroup.prototype);
EdgeObject.prototype.constructor = EdgeObject;

_.extend(EdgeObject.prototype, {
    edgeData: null,
    edgeType: null,
    endpointObjects: [],

    /*
     * constructor
     * @param options {} fabric Object options
     * @param model {models.GraphData.Edge} graph edge data
     * @param startVertexObject {views.objects.VertexObject} starting vertex
     * @param endVertexObject {views.objects.VertexObject} end vertex
     * @param edgeType ('incoming' or 'outgoing')
     */
    initialize: function(options) {
        var self = this;

        self.edgeData = options.model;
        self.edgeType = options.edgeType;
        self.endpointObjects = [options.startVertexObject, options.endVertexObject];

        self._onAllEndpointsInitialized();
    },

    _onAllEndpointsInitialized: function() {
        var endpoints = [],
            segmentPoints = [],
            vectorEdge,
            edgeLineObj,
            labelObjStyle,
            labelObj,
            textAnchorPoint;

        // assume edges always move right to left
        endpoints.push(this.endpointObjects[0].getConnectionPoint('right'));
        endpoints.push(this.endpointObjects[1].getConnectionPoint('left'));

        // break edge into 3 segments
        vectorEdge = {
            x: endpoints[1].x - endpoints[0].x,
            y: endpoints[1].y - endpoints[0].y
        };
        segmentPoints.push(endpoints[0]);
        segmentPoints.push({
            x: endpoints[0].x + vectorEdge.x * 1 / 3,
            y: endpoints[0].y
        });
        segmentPoints.push({
            x: endpoints[0].x + vectorEdge.x * 2 / 3,
            y: endpoints[1].y
        });
        segmentPoints.push(endpoints[1]);

        edgeLineObj = this.svg.polyline(_.map(segmentPoints, function(p) {
            return [p.x, p.y];
        })).style(SvgStyles.getStyles('edgeLine'));
        this.group.add(edgeLineObj);

        // draw the label adjacent to the first segment
        labelObjStyle = SvgStyles.getStyles('edgeText');
        labelObj = this.svg.text(this.edgeData.get('label'))
            .font({
                family: labelObjStyle.fontFamily,
                size: labelObjStyle.fontSize,
                fill: labelObjStyle.fontFill,
                style: labelObjStyle.fontStyle,
            });

        if (this.edgeType == 'incoming') {
            textAnchorPoint = segmentPoints[0];
        }
        else {
            textAnchorPoint = segmentPoints[2];
        }
        labelObj.move(textAnchorPoint.x, textAnchorPoint.y);
        this.group.add(labelObj);

        this.group.fire('initialized', this);
    }
});

EdgeDirectionIndicatorObject = function(options) {
    BaseViewGroup.call(this, options);
};
EdgeDirectionIndicatorObject.prototype = Object.create(BaseViewGroup.prototype);
EdgeDirectionIndicatorObject.prototype.constructor = EdgeDirectionIndicatorObject;

_.extend(EdgeDirectionIndicatorObject.prototype, {

    initialize: function(options) {
        var self = this;

        // TODO Try moving the SVG name into the styles
        this.addImage('arrow.svg', function(arrowObj) {
            arrowObj.dmove(
                -0.5 * (arrowObj.width() + 1),
                -0.5 * (arrowObj.height() + 1)
            );
            self.group.transform(_.pick(self.options, ['x', 'y']));
            self.group.fire('initialized', this);
        });
    }
});


module.exports = {
    EdgeObject: EdgeObject,
    EdgeDirectionIndicatorObject : EdgeDirectionIndicatorObject
};
