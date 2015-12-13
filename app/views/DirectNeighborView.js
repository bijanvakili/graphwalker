'use strict';

var VertexObject = require('app/views/objects/VertexObject'),
    EdgeObjectModule = require('app/views/objects/EdgeObject'),
    EdgeObject,
    EdgeDirectionIndicatorObject,
    DirectNeighborView;

EdgeObject = EdgeObjectModule.EdgeObject;
EdgeDirectionIndicatorObject = EdgeObjectModule.EdgeDirectionIndicatorObject;

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
        var self = this,
            canvas,
            modelName,
            textMargin,
            textMetrics,
            canvasMargin,
            nodeHeight,
            rectBorderWidth,
            xIncoming,
            xTargetNode,
            targetNodeObject,
            incomingNodeObjects,
            outgoingNodeObjects,
            i,
            anyVertexObjectInitialized;

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

        anyVertexObjectInitialized = _.after(incoming.length + outgoing.length + 1, function() {
            var onEdgeInitialized,
                edgeOptions,
                yArcEnd;

            yArcEnd = targetNodeObject.getConnectionPoint('left').y +
                FabricStyles.getStyles('edgeLine').strokeWidth / 2.0;

            // add the nodes to the canvas
            _.each(_.union([targetNodeObject], incomingNodeObjects, outgoingNodeObjects), function(vertexObject) {
                canvas.add(vertexObject);
            });

            onEdgeInitialized = function(edgeObject) {
               canvas.add(edgeObject);
            };

            // draw all edges
            edgeOptions = {
                onInitialized: onEdgeInitialized,
            };
            if (incoming.length > 0) {
                var xMid,
                    xLeftmost;

                for (i = 0; i < incoming.length; ++i) {
                    new EdgeObject(
                        incoming[i].edge,
                        incomingNodeObjects[i],
                        targetNodeObject,
                        'incoming',
                        edgeOptions
                    );
                }

                xLeftmost = incomingNodeObjects[0].getConnectionPoint('right').x;
                xMid = xLeftmost + (
                    targetNodeObject.getConnectionPoint('left').x -
                    xLeftmost
                ) * 5/6;
                self.drawRightArrow(canvas, xMid, yArcEnd);
            }
            if (outgoing.length > 0) {
                var xMid,
                    xLeftmost;

                for (i = 0; i < outgoing.length; ++i) {
                    new EdgeObject(
                        outgoing[i].edge,
                        targetNodeObject,
                        outgoingNodeObjects[i],
                        'outgoing',
                        edgeOptions
                    );
                }

                xLeftmost = targetNodeObject.getConnectionPoint('right').x;
                xMid = xLeftmost + (
                    outgoingNodeObjects[0].getConnectionPoint('left').x -
                    xLeftmost
                ) * 1/6;
                self.drawRightArrow(canvas, xMid, yArcEnd);
            }
        });

        // draw central target node
        this.createModelNode(xTargetNode, canvasMargin.top, model, function(vertexObject) {
            targetNodeObject = vertexObject;
            anyVertexObjectInitialized();
        });

        // draw incoming neighbours
        if (!_.isEmpty(incoming)) {
            var xArcIncomingStart = xIncoming + maxOutgoingTextWidth,
                maxIncomingTextWidth,
                xSegment1,
                xSegment2,
                i = 0,
                view = this;

            xIncoming = canvasMargin.left;
            incomingNodeObjects = [];
            this.createStackFromNodeList(
                xIncoming,
                canvasMargin.top,
                incoming,
                function(vertexObject) {
                    incomingNodeObjects.push(vertexObject);
                    anyVertexObjectInitialized();
                }
            );
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
            outgoingNodeObjects = [];
            this.createStackFromNodeList(
                xOutgoing,
                canvasMargin.top,
                outgoing,
                function(vertexObject) {
                    outgoingNodeObjects.push(vertexObject);
                    anyVertexObjectInitialized();
                }
            );
        }
    },

    drawRightArrow: function(canvas, x, y) {
        new EdgeDirectionIndicatorObject({
            left: x,
            top: y,
            onInitialized: function(obj) {
                // set styles here prior since SVG may be loaded from cache
                obj.withStyles('arcTriangleArrow');
                canvas.add(obj);
            },
        });
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
            onInitialized: function(object) {
                callback(object);
            },
        });
    },

    createStackFromNodeList: function(x, y, neighborList, callback) {
        var nodeHeight,
            self = this;

        if (_.isNull(neighborList)) {
            return [];
        }

        nodeHeight = this.getNodeHeight();
        return _.each(neighborList, function(neighbor, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            self.createModelNode(x, yNode, neighbor.vertex, callback);
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
