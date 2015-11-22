'use strict';

var VertexObject = require('app/views/objects/VertexObject'),
    EdgeObject = require('app/views/objects/EdgeObject'),
    DirectNeighborView;

DirectNeighborView = Backbone.View.extend({

    el: "#view",

    events: {
      "graphLoaded": "onGraphLoaded",
    },

    reportError: function(message, response) {
        alert(message);
        console.log(response.responseText);
    },

    initialize: function(options) {
        this.target = options.target;
    },

    render: function() {
        var graph,
            targetNode,
            view,
            vertexTemplateObject;

        graph = this.model;
        targetNode = graph.findVertex(this.target);
        // TODO replace this with proper error display
        if (_.isUndefined(targetNode)) {
            alert('Unable to find matching app,model');
            return;
        }

        this.drawLocalModelGraph(
            targetNode,
            graph.getIncomingNeighbors(targetNode),
            graph.getOutgoingNeighbors(targetNode)
        );
    },

    drawLocalModelGraph: function(model, incoming, outgoing) {
        var canvas,
            modelName,
            textMargin,
            textMetrics,
            canvasMargin,
            nodeHeight,
            rectBorderWidth,
            xIncoming,
            xTargetNode,
            yArcEnd,
            targetNodeObject,
            incomingNodeObjects,
            outgoingNodeObjects,
            i,
            afterAllNodesInitialized;

        canvas = new fabric.StaticCanvas(this.$el[0], {
            width: window.innerWidth,
            height: window.innerHeight,
        });
        if (_.isUndefined(canvas)) {
            alert('Error: Unable to create canvas!')
            return;
        }

        // TODO remove this hack
        modelName = model.get('modelName');
        textMetrics = this.getTextDimensions(canvas, modelName);
        textMargin = FabricStyles.getStyles('vertexText').textMargin;

        canvasMargin = FabricStyles.getStyles('canvasMargin');
        nodeHeight = this.getNodeHeight();
        rectBorderWidth = FabricStyles.getStyles('vertexRect').strokeWidth;
        xTargetNode = (canvas.width) / 2 - (textMetrics.width / 2);
        yArcEnd = canvasMargin.top + nodeHeight / 2;


        afterAllNodesInitialized = _.after(incoming.length + outgoing.length + 1, function() {
            var onEdgeInitialized,
                edgeOptions;

            // add the nodes to the canvas
            _.each(_.union([targetNodeObject], incomingNodeObjects, outgoingNodeObjects), function(object) {
                canvas.add(object);
            });

            onEdgeInitialized = function(edgeObject) {
               canvas.add(edgeObject);
            };

            // draw all edges
            edgeOptions = {
                onInitialized: onEdgeInitialized,
            };
            for (i = 0; i < incoming.length; ++i) {
                new EdgeObject(
                    incoming[i].edge,
                    incomingNodeObjects[i],
                    targetNodeObject,
                    'incoming',
                    edgeOptions
                );
            }
            for (i = 0; i < outgoing.length; ++i) {
                new EdgeObject(
                    outgoing[i].edge,
                    targetNodeObject,
                    outgoingNodeObjects[i],
                    'outgoing',
                    edgeOptions
                );
            }
        });

        // draw central target node
        targetNodeObject = this.createModelNode(xTargetNode, canvasMargin.top, model, afterAllNodesInitialized);

        // draw incoming neighbours
        if (!_.isEmpty(incoming)) {
            // draw incoming arcs
            var xArcIncomingStart = xIncoming + maxOutgoingTextWidth,
                maxIncomingTextWidth,
                xSegment1,
                xSegment2,
                i = 0,
                view = this;

            xIncoming = canvasMargin.left;
            incomingNodeObjects = this.drawStackFromNodeList(
                xIncoming,
                canvasMargin.top,
                incoming,
                afterAllNodesInitialized
            );

            maxIncomingTextWidth = _.max(
                _.map(incoming, function (neighbor) {
                    return view.getTextDimensions(canvas, neighbor.vertex.get('modelName')).width;
                })
            );
            xSegment1 = xIncoming + maxIncomingTextWidth + textMargin * 2;
            xSegment2 = xSegment1 + (xTargetNode - xSegment1) / 2.0;

            // draw incoming arrow head
            this.drawRightArrow(canvas, (xTargetNode + xSegment2) / 2.0, yArcEnd);
        }

        // draw outgoing neighbours
        if (!_.isEmpty(outgoing)) {
            var i,
                maxOutgoingTextWidth,
                xOutgoing,
                xArcOutgoingEnd,
                view = this,
                xSegment1,
                xSegment2;

            maxOutgoingTextWidth = _.max(
                _.map(outgoing, function (neighbor) {
                    return view.getTextDimensions(canvas, neighbor.vertex.get('modelName')).width;
                })
            );

            xOutgoing = canvas.width - canvasMargin.right - maxOutgoingTextWidth
                - (textMargin * 2) - (rectBorderWidth * 2);

            outgoingNodeObjects = this.drawStackFromNodeList(
                xOutgoing,
                canvasMargin.top,
                outgoing,
                afterAllNodesInitialized
            );

            // draw outgoing arcs
            xArcOutgoingEnd = xTargetNode + textMetrics.width + textMargin * 2;
            xSegment1 = xArcOutgoingEnd + 2/3 * (xOutgoing - xArcOutgoingEnd);
            xSegment2 = xArcOutgoingEnd + 1/3 * (xOutgoing - xArcOutgoingEnd);

            // draw outgoing arrow head
            var targetNodeEnd = xTargetNode + textMetrics.width + textMargin * 2 + rectBorderWidth;

            this.drawRightArrow(canvas,
                targetNodeEnd + (xSegment2 - targetNodeEnd) / 2.0,
                yArcEnd
            );
        }
    },

    drawRightArrow: function(canvas, x, y) {
        var height,
            pathCommands,
            arrowPath,
            arrowTriangle,
            arcLineWidth;

        height = FabricStyles.getStyles('arcTriangleArrow').height;
        arcLineWidth = FabricStyles.getStyles('arcTriangleArrow').strokeWidth;
        arrowTriangle = new fabric.Triangle({
            left: x + (height * 2.0 / 3.0),
            top: y - height + (arcLineWidth * 2.0),
        }).withStyles('arcTriangleArrow');

        canvas.add(arrowTriangle);
    },

    getTextDimensions: function(canvas, s) {
        var fontSettings,
            fontDescription;

        // TODO remove this hack
        fontSettings = FabricStyles.getStyles('vertexText');
        fontDescription = fontSettings.fontSize + 'px ' + fontSettings.fontFamily;
        canvas.getContext().font = fontDescription;

        return {
            width: canvas.getContext().measureText(s).width,
            height: fontSettings.textHeight,
        }
    },

    createModelNode: function(x, y, model, callback) {
        return new VertexObject(model, {
            left: x,
            top: y,
            onInitialized: function(vertexObject) {
                callback();
            },
        });
    },

    drawStackFromNodeList: function(x, y, neighborList, callback) {
        var nodeHeight,
            self = this;

        if (_.isNull(neighborList)) {
            return [];
        }

        nodeHeight = this.getNodeHeight();
        return _.collect(neighborList, function(neighbor, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            return self.createModelNode(x, yNode, neighbor.vertex, callback);
        });
    },

    getNodeHeight: function() {
        var rectStyle = FabricStyles.getStyles('vertexRect'),
            textStyle = FabricStyles.getStyles('vertexText');

        return textStyle.textHeight +
            (rectStyle.strokeWidth + textStyle.textMargin) * 2;
    },
});

module.exports = DirectNeighborView;
