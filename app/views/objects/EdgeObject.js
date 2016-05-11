'use strict';

var BaseViewGroup = require('app/views/objects/BaseViewGroup');
var EdgeObject;
var EdgeDirectionIndicatorObject;

EdgeObject = function (options) {
    BaseViewGroup.call(this, options);
};
EdgeObject.prototype = Object.create(BaseViewGroup.prototype);
EdgeObject.prototype.constructor = EdgeObject;

_.extend(EdgeObject.prototype, {
    edgeData: null,
    edgeType: null,
    endpointObjects: [],

    initialize: function () {
        var self = this;

        self.edgeData = self.options.model;
        self.edgeType = self.options.edgeType;
        self.endpointObjects = [self.options.startVertexObject, self.options.endVertexObject];

        // assume edges always move right to left
        var endpoints = [];
        endpoints.push(this.endpointObjects[0].getConnectionPoint('right'));
        endpoints.push(this.endpointObjects[1].getConnectionPoint('left'));

        // break edge into 3 segments
        var vectorEdge = {
            x: endpoints[1].x - endpoints[0].x,
            y: endpoints[1].y - endpoints[0].y
        };
        var segmentPoints = [];
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

        var edgeLineObj = this.svg.polyline(_.map(segmentPoints, function (p) {
            return [p.x, p.y];
        })).style(SvgStyles.getStyles('edgeLine'));
        this.group.add(edgeLineObj);

        var labelText = this.edgeData.get('label');
        if (!_.isNull(this.edgeData.get('multiplicity'))) {
            labelText = labelText + ' (' + this.edgeData.get('multiplicity') + ')';
        }

        // draw the label adjacent to the first segment
        var labelObjStyle = SvgStyles.getStyles('edgeText');
        var labelObj = this.svg.text(labelText)
            .font({
                family: labelObjStyle.fontFamily,
                size: labelObjStyle.fontSize,
                fill: labelObjStyle.fontFill,
                style: labelObjStyle.fontStyle
            });

        var textAnchorPoint;
        if (this.edgeType === 'incoming') {
            textAnchorPoint = segmentPoints[0];
        }
        else {
            textAnchorPoint = segmentPoints[2];
        }
        labelObj.move(textAnchorPoint.x, textAnchorPoint.y);
        this.group.add(labelObj);

        return P.resolve(self);
    }
});

EdgeDirectionIndicatorObject = function (options) {
    BaseViewGroup.call(this, options);
};
EdgeDirectionIndicatorObject.prototype = Object.create(BaseViewGroup.prototype);
EdgeDirectionIndicatorObject.prototype.constructor = EdgeDirectionIndicatorObject;

_.extend(EdgeDirectionIndicatorObject.prototype, {

    initialize: function () {
        var self = this;

        // TODO Try moving the SVG name into the styles
        return this.addImage('arrow.svg')
            .then(function (arrowObj) {
                arrowObj.dmove(
                    -0.5 * (arrowObj.width() + 1),
                    -0.5 * (arrowObj.height() + 1)
                );
                self.group.transform(_.pick(self.options, ['x', 'y']));
                return self;
            });
    }
});


module.exports = {
    EdgeObject: EdgeObject,
    EdgeDirectionIndicatorObject: EdgeDirectionIndicatorObject
};
