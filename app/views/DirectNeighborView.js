'use strict';

var VertexObject = require('app/views/objects/VertexObject'),
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

        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "error", function (model, response, options) {
            this.reportError('Unable to load graph data', response);
        });
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
            context,
            modelName,
            textMargin,
            textMetrics,
            canvasMargin,
            nodeHeight,
            rectBorderWidth,
            xIncoming,
            xTargetNode,
            yArcEnd;

        canvas = new fabric.Canvas(this.$el[0], {
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

        // draw central target node
        this.drawModelNode(canvas, xTargetNode, canvasMargin.top, model);

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
            this.drawStackFromNodeList(canvas, xIncoming, canvasMargin.top, incoming);

            maxIncomingTextWidth = _.max(
                _.map(incoming, function (node) {
                    return view.getTextDimensions(canvas, node.get('modelName')).width;
                })
            );
            xSegment1 = xIncoming + maxIncomingTextWidth + textMargin * 2;
            xSegment2 = xSegment1 + (xTargetNode - xSegment1) / 2.0;

            _.each(incoming, function(node) {
                var yArc,
                    textMetrics;

                textMetrics = view.getTextDimensions(canvas, node.get('modelName'));
                yArc = canvasMargin.top + nodeHeight * (i + 0.5);
                view.drawSegmentedArc(
                    canvas,
                    xIncoming + textMetrics.width + textMargin * 2,
                    yArc,
                    xTargetNode,
                    yArcEnd,
                    xSegment1,
                    xSegment2
                );

                i += 1;
            });

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
                _.map(outgoing, function (node) {
                    return view.getTextDimensions(canvas, node.get('modelName')).width;
                })
            );

            xOutgoing = canvas.width - canvasMargin.right - maxOutgoingTextWidth
                - (textMargin * 2) - (rectBorderWidth * 2);

            // draw outgoing nodes
            this.drawStackFromNodeList(canvas, xOutgoing, canvasMargin.top, outgoing);

            // draw outgoing arcs
            xArcOutgoingEnd = xTargetNode + textMetrics.width + textMargin * 2;
            xSegment1 = xArcOutgoingEnd + 2/3 * (xOutgoing - xArcOutgoingEnd);
            xSegment2 = xArcOutgoingEnd + 1/3 * (xOutgoing - xArcOutgoingEnd);
            i = 0;

            _.each(outgoing, function(node) {
                var modelName = node.get('modelName'),
                    yArc,
                    textMetrics;

                textMetrics = view.getTextDimensions(canvas, node.get('modelName'));
                yArc = canvasMargin.top + nodeHeight * (i + 0.5);

                view.drawSegmentedArc(
                    canvas,
                    xOutgoing,
                    yArc,
                    xArcOutgoingEnd,
                    yArcEnd,
                    xSegment1,
                    xSegment2
                );

                i += 1;
            });

            // draw outgoing arrow head
            var targetNodeEnd = xTargetNode + textMetrics.width + textMargin * 2 + rectBorderWidth;

            this.drawRightArrow(canvas,
                targetNodeEnd + (xSegment2 - targetNodeEnd) / 2.0,
                yArcEnd
            );
        }
    },

    drawSegmentedArc: function(canvas, xStart, yStart, xEnd, yEnd, xSegment1, xSegment2) {
        var arcLines = [],
            arcGroup,
            lineOptions;

        lineOptions = {
           FabricStyles: ['arcLine']
        };
        arcLines.push(new fabric.Line([xStart, yStart, xSegment1, yStart]).withStyles('arcLine'));
        arcLines.push(new fabric.Line([xSegment1, yStart, xSegment2, yEnd]).withStyles('arcLine'));
        arcLines.push(new fabric.Line([xSegment2, yEnd, xEnd, yEnd]).withStyles('arcLine'));

        arcGroup = new fabric.Group(arcLines);
        canvas.add(arcGroup);
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

    drawModelNode: function(canvas, x, y, model) {
        new VertexObject(model, {
            left: x,
            top: y,
            onInitialized: function(vertexObject) {
                canvas.add(vertexObject);
            },
        });

    },

    drawStackFromNodeList: function(canvas, x, y, nodeList) {
        var nodeHeight,
            view;

        if (_.isNull(nodeList)) {
            return;
        }

        nodeHeight = this.getNodeHeight();
        view = this;
        _.each(nodeList, function(node, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            view.drawModelNode(canvas, x, yNode, node);
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
