'use strict';

var VertexObject = require('app/views/objects/VertexObject'),
    EdgeObjectModule = require('app/views/objects/EdgeObject'),
    EdgeObject,
    EdgeDirectionIndicatorObject,
    DirectNeighborView;

EdgeObject = EdgeObjectModule.EdgeObject;
EdgeDirectionIndicatorObject = EdgeObjectModule.EdgeDirectionIndicatorObject;

DirectNeighborView = Backbone.View.extend({

    tagName: 'svg',

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

    render: function(parent) {
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

    drawLocalModelGraph: function(parent, model, incoming, outgoing) {
        var self = this,
            svg,
            modelName,
            textMargin,
            textMetrics,
            canvasMargin,
            rectBorderWidth,
            xIncoming,
            xTargetNode,
            targetNodeObject,
            incomingNodeObjects,
            outgoingNodeObjects,
            anyVertexObjectInitialized;

        svg = new SVG(parent).size(
            window.innerWidth,
            window.innerHeight
        );
        if (_.isUndefined(svg)) {
            alert('Error: Unable to create svg!');
            return;
        }
        this.setElement(svg.node);

        // TODO remove this hack
        modelName = model.get('modelName');
        textMetrics = this.getTextDimensions(modelName);
        textMargin = SvgStyles.getStyles('vertexText').textMargin;

        canvasMargin = SvgStyles.getStyles('canvasMargin');
        rectBorderWidth = SvgStyles.getStyles('vertexRect').strokeWidth;
        xTargetNode = (svg.width() / 2) - (textMetrics.width / 2);

        anyVertexObjectInitialized = _.after(incoming.length + outgoing.length + 1, function() {
            var onEdgeInitialized,
                edgeOptions,
                yArcEnd;

            yArcEnd = targetNodeObject.getConnectionPoint('left').y +
                SvgStyles.getStyles('edgeLine').strokeWidth / 2.0;

            // add the nodes to the canvas
            //_.each(_.union([targetNodeObject], incomingNodeObjects, outgoingNodeObjects), function(vertexObject) {
            //    canvas.add(vertexObject);
            //});
            //
            onEdgeInitialized = function(edgeObject) {
               //canvas.add(edgeObject);
            };

            // draw all edges
            edgeOptions = {
                svg: svg,
                onInitialized: onEdgeInitialized
            };
            if (incoming.length > 0) {
                var xMid,
                    xLeftmost;

                for (i = 0; i < incoming.length; ++i) {
                    new EdgeObject(_.extend({}, edgeOptions, {
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
                ) * 5/6;
                self.drawRightArrow(svg, xMid, yArcEnd);
            }
            if (outgoing.length > 0) {
                var xMid,
                    xLeftmost;

                for (i = 0; i < outgoing.length; ++i) {
                    new EdgeObject(_.extend({}, edgeOptions, {
                        model: outgoing[i].edge,
                        edgeType: 'outgoing',
                        startVertexObject: targetNodeObject,
                        endVertexObject: outgoingNodeObjects[i],
                    }));
                }

                xLeftmost = targetNodeObject.getConnectionPoint('right').x;
                xMid = xLeftmost + (
                    outgoingNodeObjects[0].getConnectionPoint('left').x -
                    xLeftmost
                ) * 1/6;
                self.drawRightArrow(svg, xMid, yArcEnd);
            }
        });

        // draw central target node
        this.createModelNode(svg, xTargetNode, canvasMargin.top, model, function(vertexObject) {
            targetNodeObject = vertexObject;
            anyVertexObjectInitialized();
        });

        // draw incoming neighbours
        if (!_.isEmpty(incoming)) {
            var xArcIncomingStart = xIncoming + maxOutgoingTextWidth,
                maxIncomingTextWidth;

            xIncoming = canvasMargin.left;
            incomingNodeObjects = [];
            this.createStackFromNodeList(
                svg,
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
                view = this;

            maxOutgoingTextWidth = _.max(
                _.map(outgoing, function (neighbor) {
                    return view.getTextDimensions(neighbor.vertex.get('modelName')).width;
                })
            );

            xOutgoing = svg.width() - canvasMargin.right - maxOutgoingTextWidth
                - (textMargin * 2) - (rectBorderWidth * 2);
            outgoingNodeObjects = [];
            this.createStackFromNodeList(
                svg,
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

    drawRightArrow: function(svg, x, y) {
        new EdgeDirectionIndicatorObject({
            svg: svg,
            x: x,
            y: y,
            onInitialized: function(obj) {
                // set styles here prior since SVG may be loaded from cache

                // TODO remove this
                //obj.withStyles('arcTriangleArrow');
            }
        });
    },

    getTextDimensions: function(s) {
        var measureContext,
            fontDescription,
            fontSettings,
            textMetrics;

        if (_.isUndefined(this.textMeasureContext)) {
            // TODO textMeasure should move into a separate View
            var textMeasure = $('#textMeasure');
            textMeasure.width(window.innerWidth);
            this.textMeasureContext = textMeasure[0].getContext('2d');
        }

        fontSettings = SvgStyles.getStyles('vertexText');
        fontDescription = fontSettings.fontSize + 'px ' + fontSettings.fontFamily;
        this.textMeasureContext.font = fontDescription;
        textMetrics = this.textMeasureContext.measureText(s);

        return {
            width: textMetrics.width,
            height: fontSettings.textHeight
        }
    },

    createModelNode: function(svg, x, y, model, callback) {
        var vertexObject = new VertexObject({
            svg: svg,
            model: model,
            x: x,
            y: y,
            onInitialized: function(object) {
                callback(object);
            }
        });
        this.listenTo(vertexObject, 'model:selected', this.onModelSelected);

        return vertexObject;
    },

    createStackFromNodeList: function(svg, x, y, neighborList, callback) {
        var nodeHeight,
            self = this;

        if (_.isNull(neighborList)) {
            return [];
        }

        nodeHeight = this.getNodeHeight();
        return _.each(neighborList, function(neighbor, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            self.createModelNode(svg, x, yNode, neighbor.vertex, callback);
        });
    },

    getNodeHeight: function() {
        var rectStyle = SvgStyles.getStyles('vertexRect'),
            textStyle = SvgStyles.getStyles('vertexText');

        return textStyle.textHeight +
            (rectStyle.strokeWidth + textStyle.textMargin) * 2;
    },

    onModelSelected: function(vertexModel) {
        Backbone.history.navigate(
            vertexModel.get('appName') + '/' + vertexModel.get('modelName'),
            true
        );
    }
});

module.exports = DirectNeighborView;
