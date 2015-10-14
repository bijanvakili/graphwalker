'use strict';

var DirectNeighborView = Backbone.View.extend({

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
            targetNode;

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
            xIncoming,
            xTargetNode,
            yArcEnd,
            arrowHeadWidth;

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
        xTargetNode = (canvas.width) / 2 - (textMetrics.width / 2);
        yArcEnd = canvasMargin.top + nodeHeight / 2;
        arrowHeadWidth = FabricStyles.getStyles('arcTriangleArrow').width;

        // draw central target node
        this.drawModelNode(canvas, xTargetNode, canvasMargin.top, modelName);

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

            // draw aggregate arrow head
            this.drawRightArrow(canvas, xTargetNode - arrowHeadWidth, yArcEnd);
        }

        // draw outgoing neighbours
        if (!_.isEmpty(outgoing)) {
            var i,
                maxOutgoingTextWidth,
                rectBorderWidth,
                xOutgoing,
                xArcOutgoingEnd,
                view = this,
                xSegment1,
                xSegment2;

            rectBorderWidth = FabricStyles.getStyles('vertexRect').strokeWidth;
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
            this.drawRightArrow(canvas, xSegment2 - arrowHeadWidth, yArcEnd);
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

        // TODO fix positions so that arrow tip is directly on line
        height = FabricStyles.getStyles('arcTriangleArrow').height;
        arcLineWidth = FabricStyles.getStyles('arcLine').strokeWidth;
        arrowTriangle = new fabric.Triangle({
            left: x,
            top: y - (height / 2.0) - (arcLineWidth / 2.0),
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

    drawModelNode: function(canvas, x, y, modelName) {
      var textMetrics,
          rectBorderWidth,
          margin,
          rect,
          text,
          group;

      textMetrics = this.getTextDimensions(canvas, modelName);

      margin = FabricStyles.getStyles('vertexText').textMargin;
      rectBorderWidth = FabricStyles.getStyles('vertexRect').strokeWidth;

      // TODO: move static properties into styles (only 'width' is dynamic)
      rect = new fabric.Rect({
        width: textMetrics.width + margin * 2,
        height: textMetrics.height + margin * 2,
      }).withStyles('vertexRect');
      text = new fabric.Text(modelName, {
        left: margin,
        top: margin,
      }).withStyles('vertexText');

      group = new fabric.Group([rect, text], {
        left: x,
        top: y,
      });

      canvas.add(group);
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
            view.drawModelNode(canvas, x, yNode, node.get('modelName'));
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
