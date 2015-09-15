'use strict';

var DirectNeighborView = Backbone.View.extend({

    el: "#view",

    events: {
      "graphLoaded": "onGraphLoaded",
    },

    // TODO MOVE to CSS or config settings
    uiSettings: {
        font: "24px serif",
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
            targetNode,
            graphNode,
            incomingNeighbours,
            outgoingNeighbours;

        graph = this.model;
        targetNode = this.target;

        // TODO replace this with proper error display
        if (!graph.isExistingNode(targetNode['app'], targetNode['model'])) {
            alert('Unable to find matching app,model');
            return;
        }
        incomingNeighbours = graph.getIncomingNeighbours(targetNode['app'], targetNode['model']);
        outgoingNeighbours = graph.getOutgoingNeigbours(targetNode['app'], targetNode['model']);

        this.drawLocalModelGraph(targetNode, incomingNeighbours, outgoingNeighbours);
    },

    drawLocalModelGraph: function(model, incoming, outgoing) {
        var canvas,
            context,
            modelName,
            textMetrics,
            canvasMargin,
            xIncoming,
            xTargetNode;

        canvas = this.$el[0];
        if (!canvas || !canvas.getContext) {
            alert('Error: Unable to retrieve canvas context!')
            return;
        }

        // TODO: resize based on data
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        context = canvas.getContext('2d');
        context.font = this.uiSettings.font;

        modelName = model['model'];
        textMetrics = this.getTextDimensions(context, modelName);

        canvasMargin = {
            width: this.uiSettings.canvasMargin.width,
            height: textMetrics.height,
        };

        xTargetNode = (canvas.width) / 2 - (textMetrics.width / 2);

        // draw central target node
        this.drawModelNode(context, xTargetNode, canvasMargin.height, modelName);

        // draw incoming neighbours
        if (!_.isEmpty(incoming)) {
            // draw incoming arcs
            var xArcIncomingStart = xIncoming + maxOutgoingTextWidth,
                yArcIncomingEnd,
                maxIncomingTextWidth,
                xSegment1,
                xSegment2,
                nodeHeight = this.getNodeHeight(),
                margin = this.uiSettings.node.textMargin,
                i = 0,
                view = this;

            xIncoming = canvasMargin.width;
            this.drawStackFromNodeList(context, xIncoming, canvasMargin.height, incoming);

            yArcIncomingEnd = canvasMargin.height + nodeHeight / 2;

            maxIncomingTextWidth = _.max(
                _.map(incoming, function (node) {
                    return view.getTextDimensions(context, node['model']).width;
                })
            );
            xSegment1 = xIncoming + maxIncomingTextWidth + margin * 2;
            xSegment2 = xSegment1 + (xTargetNode - xSegment1) / 2.0;

            _.each(incoming, function(node) {
                var yArc,
                    textMetrics;

                textMetrics = view.getTextDimensions(context, node['model']);
                yArc = canvasMargin.height + nodeHeight * (i + 0.5);
                view.drawSegmentedArc(
                    context,
                    xIncoming + textMetrics.width + margin * 2,
                    yArc,
                    xTargetNode,
                    yArcIncomingEnd,
                    xSegment1,
                    xSegment2
                );

                i += 1;
            });

            // draw aggregate arrow head
            this.drawRightArrow(context, xTargetNode - this.uiSettings.arc.arrowHead.width, yArcIncomingEnd);
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
                    return view.getTextDimensions(context, node['model']).width;
                })
            );
            xOutgoing = canvas.width - canvasMargin.width - maxOutgoingTextWidth;

            // draw outgoing nodes
            this.drawStackFromNodeList(context, xOutgoing, canvasMargin.height, outgoing);

            // draw outgoing arcs
            xArcOutgoingEnd = xTargetNode + textMetrics.width + margin * 2;
            xSegment1 = xArcOutgoingEnd + 2/3 * (xOutgoing - xArcOutgoingEnd);
            xSegment2 = xArcOutgoingEnd + 1/3 * (xOutgoing - xArcOutgoingEnd);
            i = 0;

            _.each(outgoing, function(node) {
                var modelName = node['model'],
                    yArc,
                    textMetrics;

                textMetrics = view.getTextDimensions(context, node['model']);
                yArc = canvasMargin.height + nodeHeight * (i + 0.5);

                view.drawSegmentedArc(
                    context,
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
            this.drawRightArrow(context, xSegment2 - this.uiSettings.arc.arrowHead.width, yArcIncomingEnd);
        }
    },

    drawSegmentedArc: function(context, xStart, yStart, xEnd, yEnd, xSegment1, xSegment2) {
        context.lineWidth = this.uiSettings.arc.lineWidth;
        context.strokeStyle = 'black';
        context.beginPath();

        context.moveTo(xStart, yStart);
        context.lineTo(xSegment1, yStart);
        context.lineTo(xSegment2, yEnd);
        context.lineTo(xEnd, yEnd);

        context.stroke();
    },

    drawRightArrow: function(context, x, y) {
        var w = this.uiSettings.arc.arrowHead.width,
            h = this.uiSettings.arc.arrowHead.height;

        context.lineWidth = this.uiSettings.arc.lineWidth;
        context.strokeStyle = 'black';
        context.fillStyle = 'black';

        context.beginPath();
        context.moveTo(x, y - h / 2.0);
        context.lineTo(x, y + h / 2.0);
        context.lineTo(x + w, y);
        context.closePath();
        context.stroke();
        context.fill();
    },

    getTextDimensions: function(context, s) {
        return {
            width: context.measureText(s).width,
            // TODO: Find a more accurate way to measure/handle text height
            height: this.uiSettings.node.textHeight,
        }
    },

    drawModelNode: function(context, x, y, modelName) {
      var textMetrics,
          rectBorderWidth,
          margin;

      textMetrics = this.getTextDimensions(context, modelName);

      // TODO: shift colors and styles into CSS or config settings
      margin = this.uiSettings.node.textMargin;
      rectBorderWidth = this.uiSettings.node.borderWidth;
      context.beginPath();
      context.fillStyle = 'yellow';
      context.lineWidth = rectBorderWidth;
      context.strokeStyle = 'black';
      context.rect(x, y, textMetrics.width + margin * 2, textMetrics.height + margin * 2);
      context.fill();
      context.stroke();

      context.fillStyle = 'blue';
      context.fillText(modelName, x + margin, y + textMetrics.height + margin);
    },

    drawStackFromNodeList: function(context, x, y, nodeList) {
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
            view.drawModelNode(context, x, yNode, node['model']);
        });
    },

    getNodeHeight: function() {
        return this.uiSettings.node.textHeight +
            (this.uiSettings.node.borderWidth + this.uiSettings.node.textMargin) * 2;
    },
});

module.exports = DirectNeighborView;
