'use strict';

var DirectNeighborView = Backbone.View.extend({

    el: "#view",

    events: {
      "graphLoaded": "onGraphLoaded",
    },

    // TODO MOVE to CSS or config settings
    uiSettings: {
        font: {
            size: 24, // in pixels
            family: "serif",
        },
        canvasMargin: {
            width: 10,
        },
        node: {
            borderWidth: 5,
            textMargin: 15,
            // TODO: Find a more accurate way to measure/handle text height
            textHeight: 15,
        },
        arc: {
            lineWidth: 2,
            arrowHead: {
                width: 24,
                height: 16,
            },
        },
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
            xIncoming,
            xTargetNode;

        canvas = new fabric.Canvas(this.$el[0], {
            // TODO: resize based on data
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
        textMargin = this.uiSettings.node.textMargin

        canvasMargin = {
            width: this.uiSettings.canvasMargin.width,
            height: textMetrics.height,
        };

        xTargetNode = (canvas.width) / 2 - (textMetrics.width / 2);

        // draw central target node
        this.drawModelNode(canvas, xTargetNode, canvasMargin.height, modelName);

        // draw incoming neighbours
        if (!_.isEmpty(incoming)) {
            // draw incoming arcs
            var xArcIncomingStart = xIncoming + maxOutgoingTextWidth,
                yArcIncomingEnd,
                maxIncomingTextWidth,
                xSegment1,
                xSegment2,
                nodeHeight = this.getNodeHeight(),
                i = 0,
                view = this;

            xIncoming = canvasMargin.width;
            this.drawStackFromNodeList(canvas, xIncoming, canvasMargin.height, incoming);

            yArcIncomingEnd = canvasMargin.height + nodeHeight / 2;

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
                yArc = canvasMargin.height + nodeHeight * (i + 0.5);
                view.drawSegmentedArc(
                    canvas,
                    xIncoming + textMetrics.width + textMargin * 2,
                    yArc,
                    xTargetNode,
                    yArcIncomingEnd,
                    xSegment1,
                    xSegment2
                );

                i += 1;
            });

            // draw aggregate arrow head
            this.drawRightArrow(canvas, xTargetNode - this.uiSettings.arc.arrowHead.width, yArcIncomingEnd);
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

            rectBorderWidth = this.uiSettings.node.borderWidth
            maxOutgoingTextWidth = _.max(
                _.map(outgoing, function (node) {
                    return view.getTextDimensions(canvas, node.get('modelName')).width;
                })
            );

            xOutgoing = canvas.width - canvasMargin.width - maxOutgoingTextWidth
                - (textMargin * 2) - (rectBorderWidth * 2);

            // draw outgoing nodes
            this.drawStackFromNodeList(canvas, xOutgoing, canvasMargin.height, outgoing);

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
                yArc = canvasMargin.height + nodeHeight * (i + 0.5);

                view.drawSegmentedArc(
                    canvas,
                    xOutgoing,
                    yArc,
                    xArcOutgoingEnd,
                    yArcIncomingEnd,
                    xSegment1,
                    xSegment2
                );

                i += 1;
            });

            // draw outgoing arrow head
            this.drawRightArrow(canvas, xSegment2 - this.uiSettings.arc.arrowHead.width, yArcIncomingEnd);
        }
    },

    drawSegmentedArc: function(canvas, xStart, yStart, xEnd, yEnd, xSegment1, xSegment2) {
        var arcLines = [],
            arcGroup,
            lineOptions;

        lineOptions = {
           strokeWidth: this.uiSettings.arc.lineWidth,
           stroke: 'black',
        };
        arcLines.push(new fabric.Line([xStart, yStart, xSegment1, yStart], lineOptions));
        arcLines.push(new fabric.Line([xSegment1, yStart, xSegment2, yEnd], lineOptions));
        arcLines.push(new fabric.Line([xSegment2, yEnd, xEnd, yEnd], lineOptions));

        arcGroup = new fabric.Group(arcLines);
        canvas.add(arcGroup);
    },

    drawRightArrow: function(canvas, x, y) {
        var w = this.uiSettings.arc.arrowHead.width,
            h = this.uiSettings.arc.arrowHead.height,
            pathCommands,
            arrowPath;
            //arrowTriangle;

        // TODO fix to account for rotation
//        arrowTriangle = new fabric.Triangle({
//            left: x,
//            top: y - h / 2.0,
//            width: w,
//            height: h,
//            angle: 90,
//        });
//        canvas.add(arrowTriangle);

        pathCommands = 'M ' + x + ' ' + (y - h / 2.0) +
            ' V ' +  (y + h / 2.0) +
            ' L ' + (x + w) + ' ' + y +
            ' Z';
        arrowPath = new fabric.Path(pathCommands, {
            width: this.uiSettings.arc.lineWidth,
            stroke: 'black',
            fill: 'black'
        });

        canvas.add(arrowPath);
    },

    getTextDimensions: function(canvas, s) {
        var fontSettings,
            fontDescription;

        // TODO remove this hack
        fontSettings = this.uiSettings.font;
        fontDescription = fontSettings.size + 'px ' + fontSettings.family
        canvas.getContext().font = fontDescription;

        return {
            width: canvas.getContext().measureText(s).width,
            // TODO: Find a more accurate way to measure/handle text height
            height: this.uiSettings.node.textHeight,
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

      // TODO: shift colors and styles into CSS or config settings
      margin = this.uiSettings.node.textMargin;
      rectBorderWidth = this.uiSettings.node.borderWidth;

      rect = new fabric.Rect({
        width: textMetrics.width + margin * 2,
        height: textMetrics.height + margin * 2,

        fill: 'yellow',
        stroke: 'black',
        strokeWidth: rectBorderWidth,
      });
      text = new fabric.Text(modelName, {
        left: margin,
        top: margin,

        fontFamily: this.uiSettings.font.family,
        fontSize: this.uiSettings.font.size,

        fill: 'blue',
      });

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
        return this.uiSettings.node.textHeight +
            (this.uiSettings.node.borderWidth + this.uiSettings.node.textMargin) * 2;
    },
});

module.exports = DirectNeighborView;
