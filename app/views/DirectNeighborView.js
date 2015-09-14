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
            xTargetNode,
            xOutgoing;

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

        // compute x positions of 3 columns (incoming -> model -> outgoing)
        xIncoming = canvasMargin.width;
        xTargetNode = (canvas.width) / 2 - (textMetrics.width / 2);
        if (!_.isEmpty(outgoing)) {
            var maxOutgoingTextWidth,
                view = this;

            maxOutgoingTextWidth = _.max(
                _.map(outgoing, function (node) {
                    return view.getTextDimensions(context, node['model']).width;
                })
            );
            xOutgoing = canvas.width - canvasMargin.width - maxOutgoingTextWidth;
        }

        // draw central target node
        this.drawModelNode(context, xTargetNode, canvasMargin.height, modelName);

        // draw incoming neighbours
        this.drawStackFromNodeList(context, xIncoming, canvasMargin.height, incoming);

        // draw outgoing neighbours
        this.drawStackFromNodeList(context, xOutgoing, canvasMargin.height, outgoing);

        // draw incoming arcs
        var xArcIncomingStart = xIncoming + maxOutgoingTextWidth,
            yArcIncomingEnd,
            nodeHeight = this.getNodeHeight(),
            margin = this.uiSettings.node.textMargin,
            i = 0,
            view = this;

        yArcIncomingEnd = canvasMargin.height + nodeHeight / 2;
        context.lineWidth = view.uiSettings.arc.lineWidth;
        context.strokeStyle = 'black';
        _.each(incoming, function(node) {
            var yArc,
                textMetrics;

            textMetrics = view.getTextDimensions(context, node['model']);
            yArc = canvasMargin.height + nodeHeight * (i + 0.5);

            context.beginPath();
            context.moveTo(xIncoming + textMetrics.width + margin * 2, yArc);
            context.lineTo(xTargetNode, yArcIncomingEnd);
            context.stroke();
            context.closePath();

            i += 1;
        });

        var textMetricsTarget = view.getTextDimensions(context, modelName),
            xArcOutgoingEnd;

        xArcOutgoingEnd = xTargetNode + textMetrics.width + margin * 2;
        i = 0;
        _.each(outgoing, function(node) {
            var modelName = node['model'],
                yArc,
                textMetrics;

            textMetrics = view.getTextDimensions(context, node['model']);
            yArc = canvasMargin.height + nodeHeight * (i + 0.5);

            context.beginPath();
            context.moveTo(xOutgoing, yArc);
            context.lineTo(xArcOutgoingEnd, yArcIncomingEnd);
            context.stroke();
            context.closePath();

            i += 1;
        });
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
      context.closePath();

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
