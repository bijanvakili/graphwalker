'use strict';

var EventHandlers = require('app/EventHandlers');
var EdgeObjectModule = require('app/views/objects/EdgeObject');
var EdgeObject;
var EdgeDirectionIndicatorObject;
var VertexObject = require('app/views/objects/VertexObject');

EdgeObject = EdgeObjectModule.EdgeObject;
EdgeDirectionIndicatorObject = EdgeObjectModule.EdgeDirectionIndicatorObject;

var NodeColumnScrollerView,
    LocalizedGraphView,
    NodeColumnView;

var DEFAULT_VISIBLE_NODES_IN_COLUMN = 5;


var getNodeHeight = function () {
    var rectStyle = SvgStyles.getStyles('vertexRect');
    var textStyle = SvgStyles.getStyles('vertexText');

    return textStyle.textHeight + (rectStyle.strokeWidth + textStyle.textMargin) * 2;
};


NodeColumnScrollerView = Backbone.View.extend({
    template: _.template(
        '<button class="column-scroll-button column-scroll-up">Up</button>' +
        '<button class="column-scroll-button column-scroll-down">Down</button>'
    ),

    /**
     * Initializes the view
     * @param {object} options
     * @param {Number} options.pageSize - number of visible items
     * @param {Number} options.maxSize - maximum number of items
     */
    initialize: function (options) {
        this.model = {
            currItem: 0
        };
        this.pageSize = options.pageSize;
        this.maxSize = options.maxSize;
    },

    render: function () {
        this.$el.html(this.template());

        this.updateButtons();
        return this;
    },

    events: {
        'click .column-scroll-up': 'onScrollUp',
        'click .column-scroll-down': 'onScrollDown'
    },

    updateButtons: function () {
        var needsScroll = this.maxSize > this.pageSize;
        var currItem = this.model.currItem;

        this.$('.column-scroll-up').prop('disabled', !needsScroll || (currItem === 0));
        this.$('.column-scroll-down').prop(
            'disabled',
            !needsScroll || (currItem === this.maxSize - this.pageSize)
        );
    },

    onScrollUp: function () {
        this.model.currItem = (this.model.currItem + this.maxSize - 1) % this.maxSize;
        this.onItemScrolled();
    },

    onScrollDown: function () {
        this.model.currItem = (this.model.currItem + 1) % this.maxSize;
        this.onItemScrolled();
    },

    onItemScrolled: function () {
        this.trigger('item:scrolled', this.model.currItem);
        this.updateButtons();
    }
});


NodeColumnView = Backbone.View.extend({

    /**
     * Initializes the view
     *
     * @param {Object} options
     *
     * @param {Svg} options.svg
     * @param {Number} options.top
     * @param {Number} options.left
     * @param {NodeColumnScrollerView} options.scrollerView
     *
     * @param {String} options.edgeType - 'incoming' or 'outgoing'
     * @param {VertexObject} options.targetVertexObject
     * @param {Collection} options.collection - neighbors to the target vertex (see GraphData.getNeighbors)
     *
     * @param {Number} options.maxVisibleNodes
     */
    initialize: function (options) {
        var self = this;

        self.isLoaded = false;
        self.svg = options.svg;
        self.top = options.top;
        self.left = options.left;

        self.collection = options.collection;
        self.edgeType = options.edgeType;
        self.targetVertexObject = options.targetVertexObject;
        self.pagesize = options.maxVisibleNodes || DEFAULT_VISIBLE_NODES_IN_COLUMN;

        self.scrollerView = options.scrollerView;
        if (self.scrollerView) {
            self.listenTo(self.scrollerView, 'item:scrolled', self.onItemScrolled);
        }

        self.topMostNode = 0;
        self.vertexObjects = self.collection.map(function (neighbor) {
            var vertexObject = new VertexObject({
                svg: self.svg,
                parent: self,
                model: neighbor.vertex,
                x: self.left,
                y: self.top
            });

            self.listenTo(vertexObject, 'model:selected', self.onNodeSelected);
            return vertexObject;
        });

        // deferred until render
        self.edgeObjects = null;

    },

    remove: function () {
        var self = this;

        self.removeEdges();

        _.forEach(self.vertexObjects, function (nodeObject) {
            self.stopListening(nodeObject);
            nodeObject.remove();
        });
        self.vertexObjects = null;

        self.scrollerView = null;

        self.isLoaded = false;
        Backbone.View.prototype.remove.call(self);
    },

    removeEdges: function () {
        var self = this;

        if (self.edgeObjects) {
            self.edgeObjects.forEach(function (edgeObject) {
                edgeObject.remove();
            });

            self.edgeObjects = null;
        }
    },

    load: function () {
        var self = this;

        return P.each(self.vertexObjects, function (nodeObject) {
            return nodeObject.initialize();
        }).then(function () {
            self.isLoaded = true;
            return self;
        });
    },

    render: function () {
        var self = this;

        if (!self.isLoaded) {
            this.reportError('Nodeself not loaded');
            return;
        }

        self.removeEdges();

        // draw the current page of nodes
        var maxVisibleNodeEnd = this.topMostNode + this.pagesize;
        var nodeHeight = getNodeHeight();
        var neighborKey;
        var defaultEdgeOptions = {
            edgeType: self.edgeType,
            svg: self.svg,
            parent: self
        };
        if (self.edgeType === 'incoming') {
            defaultEdgeOptions.endVertexObject = self.targetVertexObject;
            neighborKey = 'startVertexObject';
        }
        else {
            defaultEdgeOptions.startVertexObject = self.targetVertexObject;
            neighborKey = 'endVertexObject';
        }

        self.edgeObjects = [];
        return P.map(self.vertexObjects, function (nodeObject, idxNodeObject) {
            if (_.inRange(idxNodeObject, self.topMostNode, maxVisibleNodeEnd)) {
                var edgeObject;

                nodeObject.y(
                    self.top + (idxNodeObject - self.topMostNode) * nodeHeight
                );
                nodeObject.show();

                var edgeOptions = _.extend({}, defaultEdgeOptions);
                edgeOptions.model = self.collection[idxNodeObject].edge;
                edgeOptions[neighborKey] = nodeObject;

                edgeObject = new EdgeObject(edgeOptions);
                self.edgeObjects.push(edgeObject);
                return edgeObject.initialize();
            }
            else {
                nodeObject.hide();
                return P.resolve(null);
            }
        }).then(function () {
            return self;
        });
    },

    onNodeSelected: function (vertexModel) {
        EventHandlers.navigatorChannel.trigger('vertex:selected', vertexModel);
    },

    onItemScrolled: function (newTopItem) {
        this.topMostNode = newTopItem;
        return this.render();
    },

    getFirstNodeObject: function () {
        return this.vertexObjects[0];
    }
});


LocalizedGraphView = Backbone.View.extend({
    el: '.walker-container',

    template: _.template(
        '<div>' +
        '   <div class="column-scroll-container incoming"/>' +
        '   <div class="column-scroll-container outgoing"/>' +
        '</div>'
    ),


    initialize: function (options) {
        this.model = options.model;

        this.errorView = options.errorView;
        this.textMeasureView = options.textMeasureView;

        this.reportError = this.errorView.registerEmitter(this);

        this.svg = null;
        this.targetVertexObject = null;
        this.incomingNodesView = null;
        this.incomingScrollerView = null;
        this.outgoingNodesView = null;
        this.outgoingScrollerView = null;
    },

    clearContents: function () {
        if (this.outgoingScrollerView) {
            this.outgoingScrollerView.remove();
            this.outgoingScrollerView = null;
        }
        if (this.incomingScrollerView) {
            this.incomingScrollerView.remove();
            this.incomingScrollerView = null;
        }
        this.outgoingNodesView.remove();
        this.outgoingNodesView = null;
        this.incomingNodesView.remove();
        this.incomingNodesView = null;

        this.targetVertexObject.remove();
        this.targetVertexObject = null;

        // TODO test for memory leaks
        this.svg = null;

        // clear all contents
        this.$el.html('');
    },

    render: function (target) {
        var self,
            graph,
            targetNode;

        self = this;
        graph = this.model;
        targetNode = graph.findVertex(target);
        if (_.isUndefined(targetNode)) {
            this.reportError(
              'Unable to find matching app/model = ' +
              _.get(target, 'appName', '(undefined)') + '/' +
              _.get(target, 'modelName', '(undefined)')
            );
            return;
        }

        self.$el.html(self.template());

        self.svg = SVG(self.$el[0]);
        if (_.isUndefined(self.svg)) {
            self.reportError('Unable to create svg!');
            return;
        }
        self.svg.toggleClass('walker-image-container');
        self.svg.size(
            window.innerWidth,
            window.innerHeight
        );

        var textMetrics = this.textMeasureView.getTextDimensions(targetNode.get('modelName'));
        var textMargin = SvgStyles.getStyles('vertexText').textMargin;
        var canvasMargin = SvgStyles.getStyles('canvasMargin');
        var rectBorderWidth = SvgStyles.getStyles('vertexRect').strokeWidth;
        var incomingNeighbors = graph.getIncomingNeighbors(targetNode);
        var outgoingNeighbors = graph.getOutgoingNeighbors(targetNode);

        // scroller views
        var commonScrollerViewOptions = {pageSize: DEFAULT_VISIBLE_NODES_IN_COLUMN};
        var scrollViewElement = self.$('.column-scroll-container.incoming');
        if (incomingNeighbors.length > DEFAULT_VISIBLE_NODES_IN_COLUMN) {
            self.incomingScrollerView = new NodeColumnScrollerView(_.extend({}, commonScrollerViewOptions, {
                maxSize: incomingNeighbors.length,
                el: scrollViewElement
            }));
            self.incomingScrollerView.render();
        }
        else {
            scrollViewElement.hide();
            self.incomingScrollerView = null;
        }

        scrollViewElement = self.$('.column-scroll-container.outgoing');
        if (outgoingNeighbors.length > DEFAULT_VISIBLE_NODES_IN_COLUMN) {
            self.outgoingScrollerView = new NodeColumnScrollerView(_.extend({}, commonScrollerViewOptions, {
                maxSize: outgoingNeighbors.length,
                el: scrollViewElement
            }));
            self.outgoingScrollerView.render();
        }
        else {
            scrollViewElement.hide();
            self.outgoingScrollerView = null;
        }

        // central target
        var targetNodePos = {};
        targetNodePos.left = (this.svg.width() / 2) - (textMetrics.width / 2);
        targetNodePos.top = canvasMargin.top;

        self.targetVertexObject = new VertexObject({
            svg: self.svg,
            parent: self,
            model: targetNode,
            x: targetNodePos.left,
            y: targetNodePos.top
        });

        self.targetVertexObject.initialize()
        .then(function () {
            // incoming node column
            self.incomingNodesView = new NodeColumnView({
                left: canvasMargin.left,
                top: canvasMargin.top,
                maxVisibleNodes: DEFAULT_VISIBLE_NODES_IN_COLUMN,
                collection: incomingNeighbors,
                svg: self.svg,
                targetVertexObject: self.targetVertexObject,
                edgeType: 'incoming',
                scrollerView: self.incomingScrollerView
            });
            return self.incomingNodesView.load();
        }).then(function () {
            // outgoing node column
            var outgoingPos,
                maxOutgoingTextWidth;

            maxOutgoingTextWidth = _.max(
                _.map(outgoingNeighbors, function (neighbor) {
                    return self.textMeasureView.getTextDimensions(
                        neighbor.vertex.get('modelName')
                    ).width;
                })
            );

            outgoingPos = {};
            outgoingPos.left = self.svg.width() - canvasMargin.right - maxOutgoingTextWidth -
                (textMargin * 2) - (rectBorderWidth * 2);
            outgoingPos.top = canvasMargin.top;

            self.outgoingNodesView = new NodeColumnView({
                left: outgoingPos.left,
                top: outgoingPos.top,
                maxVisibleNodes: DEFAULT_VISIBLE_NODES_IN_COLUMN,
                collection: outgoingNeighbors,
                svg: self.svg,
                targetVertexObject: self.targetVertexObject,
                edgeType: 'outgoing',
                scrollerView: self.outgoingScrollerView
            });

            // adjust the right scroller view if visible
            if (self.outgoingScrollerView) {
                self.outgoingScrollerView.$el.css('left', outgoingPos.left);
            }

            return self.outgoingNodesView.load();
        }).then(function () {
            // resize SVG based on the number of nodes
            self.svg.height(
                _.max([
                    window.innerHeight,
                    canvasMargin.top + _.max([incomingNeighbors.length, outgoingNeighbors.length]) * getNodeHeight()
                ])
            );

            return P.join(
                self.incomingNodesView.render(),
                self.outgoingNodesView.render()
            );
        }).then(function () {
            // arrow indicators
            var yArcEnd = self.targetVertexObject.getConnectionPoint('left').y +
                SvgStyles.getStyles('edgeLine').strokeWidth / 2.0;

            var edgeOptions = {
                svg: self.svg,
                parent: self,
                y: yArcEnd
            };

            var indicators = [];
            var firstNodeObject;
            var xLeftmost;
            var xMid;
            if (incomingNeighbors.length > 0) {
                firstNodeObject = self.incomingNodesView.getFirstNodeObject();
                xLeftmost = firstNodeObject.getConnectionPoint('right').x;
                xMid = xLeftmost + (
                    self.targetVertexObject.getConnectionPoint('left').x -
                    xLeftmost
                ) * 5 / 6;

                indicators.push(
                  new EdgeDirectionIndicatorObject(_.extend({}, edgeOptions, { // eslint-disable-line no-new
                      x: xMid
                  })).initialize()
                );
            }
            if (outgoingNeighbors.length > 0) {
                firstNodeObject = self.outgoingNodesView.getFirstNodeObject();
                xLeftmost = self.targetVertexObject.getConnectionPoint('right').x;
                xMid = xLeftmost + (firstNodeObject.getConnectionPoint('left').x - xLeftmost) / 6;
                indicators.push(
                    new EdgeDirectionIndicatorObject(_.extend({}, edgeOptions, { // eslint-disable-line no-new
                        x: xMid
                    })).initialize()
              );
            }

            return P.all(indicators);
        });

        return this;
    }
});


module.exports = LocalizedGraphView;
