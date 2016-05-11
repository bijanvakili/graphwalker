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
        var yArcEnd;

        // draw central target node
        var view = this;
        return this.createModelNode(svg, xTargetNode, canvasMargin.top, model)
            .then(function (vertexObject) {
                targetNodeObject = vertexObject;

                // draw incoming neighbours
                return view.createStackFromNodeList(
                    svg,
                    canvasMargin.left,
                    canvasMargin.top,
                    incoming
                );
            })
            .then(function (_incomingNodeObjects) {
                var xOutgoing = 0;

                incomingNodeObjects = _incomingNodeObjects;

                // draw outgoing neighbours
                if (!_.isEmpty(outgoing)) {
                    var maxOutgoingTextWidth = _.max(
                        _.map(outgoing, function (neighbor) {
                            return view.getTextDimensions(neighbor.vertex.get('modelName')).width;
                        })
                    );

                    xOutgoing = svg.width() - canvasMargin.right - maxOutgoingTextWidth -
                        (textMargin * 2) - (rectBorderWidth * 2);
                }

                return view.createStackFromNodeList(
                    svg,
                    xOutgoing,
                    canvasMargin.top,
                    outgoing
                );
            })
            .then(function (_outgoingNodeObjects) {
                outgoingNodeObjects = _outgoingNodeObjects;
                var edgeOptions;

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
                return P.join(
                    P.map(incoming, function (item, i) {
                        var edgeObject = new EdgeObject(_.extend({}, edgeOptions, { // eslint-disable-line no-new
                            model: incoming[i].edge,
                            edgeType: 'incoming',
                            startVertexObject: incomingNodeObjects[i],
                            endVertexObject: targetNodeObject
                        }));
                        return edgeObject.initialize();
                    }),
                    P.map(outgoing, function (item, i) {
                        var edgeObject = new EdgeObject(_.extend({}, edgeOptions, {  // eslint-disable-line no-new
                            model: outgoing[i].edge,
                            edgeType: 'outgoing',
                            startVertexObject: targetNodeObject,
                            endVertexObject: outgoingNodeObjects[i]
                        }));
                        return edgeObject.initialize();
                    })
                );
            })
            .then(function () {
                var indicatorPromises = [];
                var xLeftmost;
                var xMid;

                if (incoming.length > 0) {
                    xLeftmost = incomingNodeObjects[0].getConnectionPoint('right').x;
                    xMid = xLeftmost + (
                            targetNodeObject.getConnectionPoint('left').x -
                            xLeftmost
                        ) * 5 / 6;
                    indicatorPromises.push(
                        new EdgeDirectionIndicatorObject({ // eslint-disable-line no-new
                            svg: svg,
                            x: xMid,
                            y: yArcEnd
                        }).initialize()
                    );
                }
                if (outgoing.length > 0) {
                    xLeftmost = targetNodeObject.getConnectionPoint('right').x;
                    xMid = xLeftmost + (outgoingNodeObjects[0].getConnectionPoint('left').x - xLeftmost) / 6;
                    indicatorPromises.push(
                        new EdgeDirectionIndicatorObject({ // eslint-disable-line no-new
                            svg: svg,
                            x: xMid,
                            y: yArcEnd
                        }).initialize()
                    );
                }
                return P.all(indicatorPromises);
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

    /**
     * Creates a model node object
     *
     * @param {svg} svg - SVG object ro render into
     * @param {integer} x - x position
     * @param {integer} y - y position
     * @param {Backbone.Model} model
     * @returns {Promise<BaseViewGroup>}
     */
    createModelNode: function (svg, x, y, model) {
        var vertexObject = new VertexObject({
            svg: svg,
            model: model,
            x: x,
            y: y
        });
        this.listenTo(vertexObject, 'model:selected', this.onModelSelected);

        return vertexObject.initialize();
    },

    /**
     * Creates a stack of model node objects from a neighbor list
     *
     * @param {svg} svg - SVG object ro render into
     * @param {integer} x - x position
     * @param {integer} y - y position
     * @param neighborList
     * @returns {Promise<Array<VertexObject>>}
     */
    createStackFromNodeList: function (svg, x, y, neighborList) {
        if (_.isNull(neighborList)) {
            return P.resolve([]);
        }

        var nodeHeight = this.getNodeHeight();
        var self = this;
        return P.map(neighborList, function (neighbor, index) {
            var yNode;

            yNode = y + (nodeHeight * index);
            return self.createModelNode(svg, x, yNode, neighbor.vertex);
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
