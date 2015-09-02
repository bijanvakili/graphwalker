"use strict";

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
        }
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
            incomingNeighbours,
            outgoingNeighbours;

        graph = this.model;
        targetNode = this.target;
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

        nodeHeight = this.uiSettings.node.textHeight +
            (this.uiSettings.node.borderWidth + this.uiSettings.node.textMargin) * 2;

        view = this;
        _.each(nodeList, function(node, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            view.drawModelNode(context, x, yNode, node['model']);
        });
    },
});
