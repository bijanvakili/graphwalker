'use strict';

var VertexObject = require('app/views/objects/VertexObject');
var EdgeObjectModule = require('app/views/objects/EdgeObject');
var EdgeObject;
var EdgeDirectionIndicatorObject;
var DirectNeighborView;

EdgeObject = EdgeObjectModule.EdgeObject;
EdgeDirectionIndicatorObject = EdgeObjectModule.EdgeDirectionIndicatorObject;

DirectNeighborView = Backbone.View.extend({

    tagName: 'svg',

    events: {
        graphLoaded: 'onGraphLoaded'
    },

    reportError: function (message, response) {
        alert(message);
        console.log(response.responseText);
    },

    initialize: function (options) {
        this.target = options.target;
    },

    render: function (parent) {
        var graph,
            targetNode;

        graph = this.model;
        targetNode = graph.findVertex(this.target);
        // TODO replace this with proper error display
        if (_.isUndefined(targetNode)) {
            alert('Unable to find matching app,model');
            return;
        }

        this.drawLocalModelGraph(
            parent,
            targetNode,
            graph.getIncomingNeighbors(targetNode),
            graph.getOutgoingNeighbors(targetNode)
        );
        return this;
    },

    drawLocalModelGraph: function (parent, model, incoming, outgoing) {
        var svg = new SVG(parent).size(
            window.innerWidth,
            window.innerHeight
        );
        if (_.isUndefined(svg)) {
            alert('Error: Unable to create svg!');
            return;
        }
        this.setElement(svg.node);

        // TODO remove this hack
        var modelName = model.get('modelName');
        var textMetrics = this.getTextDimensions(modelName);
        var textMargin = SvgStyles.getStyles('vertexText').textMargin;

        var canvasMargin = SvgStyles.getStyles('canvasMargin');
        var rectBorderWidth = SvgStyles.getStyles('vertexRect').strokeWidth;
        var xTargetNode = (svg.width() / 2) - (textMetrics.width / 2);

        var self = this;
        var targetNodeObject;
        var incomingNodeObjects;
        var outgoingNodeObjects;

        var anyVertexObjectInitialized = _.after(incoming.length + outgoing.length + 1, function () {
            var edgeOptions,
                yArcEnd;

            // resize SVG based on the number of nodes
            svg.height(
                _.max([
                    window.innerHeight,
                    canvasMargin.top + _.max([incoming.length, outgoing.length]) * self.getNodeHeight()
                ])
            );

            yArcEnd = targetNodeObject.getConnectionPoint('left').y +
                SvgStyles.getStyles('edgeLine').strokeWidth / 2.0;

            // draw all edges
            edgeOptions = {
                svg: svg
            };
            var xLeftmost;
            var xMid;
            if (incoming.length > 0) {
                for (i = 0; i < incoming.length; ++i) {
                    new EdgeObject(_.extend({}, edgeOptions, { // eslint-disable-line no-new
                        model: incoming[i].edge,
                        edgeType: 'incoming',
                        startVertexObject: incomingNodeObjects[i],
                        endVertexObject: targetNodeObject
                    }));
                }

                xLeftmost = incomingNodeObjects[0].getConnectionPoint('right').x;
                xMid = xLeftmost + (
                    targetNodeObject.getConnectionPoint('left').x -
                    xLeftmost
                ) * 5 / 6;
                self.drawRightArrow(svg, xMid, yArcEnd);
            }
            if (outgoing.length > 0) {
                for (var i = 0; i < outgoing.length; ++i) {
                    new EdgeObject(_.extend({}, edgeOptions, {  // eslint-disable-line no-new
                        model: outgoing[i].edge,
                        edgeType: 'outgoing',
                        startVertexObject: targetNodeObject,
                        endVertexObject: outgoingNodeObjects[i]
                    }));
                }

                xLeftmost = targetNodeObject.getConnectionPoint('right').x;
                xMid = xLeftmost + (outgoingNodeObjects[0].getConnectionPoint('left').x - xLeftmost) / 6;
                self.drawRightArrow(svg, xMid, yArcEnd);
            }
        });

        // draw central target node
        this.createModelNode(svg, xTargetNode, canvasMargin.top, model, function (vertexObject) {
            targetNodeObject = vertexObject;
            anyVertexObjectInitialized();
        });

        // draw incoming neighbours
        if (!_.isEmpty(incoming)) {
            incomingNodeObjects = [];
            this.createStackFromNodeList(
                svg,
                canvasMargin.left,
                canvasMargin.top,
                incoming,
                function (vertexObject) {
                    incomingNodeObjects.push(vertexObject);
                    anyVertexObjectInitialized();
                }
            );
        }

        // draw outgoing neighbours
        if (!_.isEmpty(outgoing)) {
            var view = this;

            var maxOutgoingTextWidth = _.max(
                _.map(outgoing, function (neighbor) {
                    return view.getTextDimensions(neighbor.vertex.get('modelName')).width;
                })
            );

            var xOutgoing = svg.width() - canvasMargin.right - maxOutgoingTextWidth -
                (textMargin * 2) - (rectBorderWidth * 2);
            outgoingNodeObjects = [];
            this.createStackFromNodeList(
                svg,
                xOutgoing,
                canvasMargin.top,
                outgoing,
                function (vertexObject) {
                    outgoingNodeObjects.push(vertexObject);
                    anyVertexObjectInitialized();
                }
            );
        }
    },

    drawRightArrow: function (svg, x, y) {
        new EdgeDirectionIndicatorObject({ // eslint-disable-line no-new
            svg: svg,
            x: x,
            y: y
        });
    },

    getTextDimensions: function (s) {
        if (_.isUndefined(this.textMeasureContext)) {
            // TODO textMeasure should move into a separate View
            var textMeasure = $('#textMeasure');
            textMeasure.width(window.innerWidth);
            this.textMeasureContext = textMeasure[0].getContext('2d');
        }

        var fontSettings = SvgStyles.getStyles('vertexText');
        var fontDescription = fontSettings.fontSize + 'px ' + fontSettings.fontFamily;
        this.textMeasureContext.font = fontDescription;
        var textMetrics = this.textMeasureContext.measureText(s);

        return {
            width: textMetrics.width,
            height: fontSettings.textHeight
        };
    },

    createModelNode: function (svg, x, y, model, callback) {
        var vertexObject = new VertexObject({
            svg: svg,
            model: model,
            x: x,
            y: y,
            onInitialized: function (object) {
                callback(object);
            }
        });
        this.listenTo(vertexObject, 'model:selected', this.onModelSelected);

        return vertexObject;
    },

    createStackFromNodeList: function (svg, x, y, neighborList, callback) {
        if (_.isNull(neighborList)) {
            return [];
        }

        var nodeHeight = this.getNodeHeight();
        var self = this;
        return _.each(neighborList, function (neighbor, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            self.createModelNode(svg, x, yNode, neighbor.vertex, callback);
        });
    },

    getNodeHeight: function () {
        var rectStyle = SvgStyles.getStyles('vertexRect');
        var textStyle = SvgStyles.getStyles('vertexText');

        return textStyle.textHeight +
            (rectStyle.strokeWidth + textStyle.textMargin) * 2;
    },

    onModelSelected: function (vertexModel) {
        Backbone.history.navigate(
            vertexModel.get('appName') + '/' + vertexModel.get('modelName'),
            true
        );
    }
});

module.exports = DirectNeighborView;
