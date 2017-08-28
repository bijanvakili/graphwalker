import * as Backbone from 'backbone';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as SVG from 'svg.js';

import * as EventHandlers from '../EventHandlers';
import {Graph, NeighborDescription, Vertex} from '../models/GraphData';
import SvgStyles from '../SvgStyles';
import { UnrestrictedDictionary } from '../types';
import { ErrorEmitterFunction, ErrorView } from './ErrorView';
import { PositionableGroupOptions } from './objects/BaseViewGroup';
import { EdgeDirectionIndicatorObject, EdgeObject, EdgeObjectOptions, EdgeType } from './objects/EdgeObject';
import { ConnectionSide, VertexObject } from './objects/VertexObject';
import { TextMeasureView } from './TextMeasureView';

function getNodeHeight(): number {
    const rectStyle = SvgStyles.getStyles('vertexRect');
    const textStyle = SvgStyles.getStyles('vertexText');

    return textStyle.textHeight + (rectStyle.strokeWidth + textStyle.textMargin) * 2;
}

interface NodeScrollerViewOptions extends Backbone.ViewOptions<Backbone.Model> {
    pageSize: number;
    maxSize: number;
}

class NodeColumnScrollerView extends Backbone.View<Backbone.Model> {
    private template: _.TemplateExecutor = _.template(
        '<button class="column-scroll-button column-scroll-up">Up</button>' +
        '<button class="column-scroll-button column-scroll-down">Down</button>'
    );
    private currItem: number;
    private pageSize: number;
    private maxSize: number;

    constructor(options: NodeScrollerViewOptions) {
        super({
            events: {
                'click .column-scroll-up': 'onScrollUp',
                'click .column-scroll-down': 'onScrollDown'
            },
            el: options.el
        });
        this.currItem = 0;
        this.pageSize = options.pageSize;
        this.maxSize = options.maxSize;
    }

    public render() {
        this.$el.html(this.template());

        this.updateButtons();
        return this;
    }

    private updateButtons() {
        const needsScroll = this.maxSize > this.pageSize;
        const currItem = this.currItem;

        this.$('.column-scroll-up').prop('disabled', !needsScroll || (currItem === 0));
        this.$('.column-scroll-down').prop(
            'disabled',
            !needsScroll || (currItem === this.maxSize - this.pageSize)
        );
    }

    private onScrollUp() {
        this.currItem = (this.currItem + this.maxSize - 1) % this.maxSize;
        this.onItemScrolled();
    }

    private onScrollDown() {
        this.currItem = (this.currItem + 1) % this.maxSize;
        this.onItemScrolled();
    }

    private onItemScrolled() {
        this.trigger('item:scrolled', this.currItem);
        this.updateButtons();
    }
}

interface NodeColumnViewOptions extends Backbone.ViewOptions<NeighborDescription> {
    svg: SVG.Doc;
    top: number;
    left: number;
    scrollerView: NodeColumnScrollerView;
    edgeType: EdgeType;
    targetVertexObject: VertexObject;
    maxVisibleNodes: number;
    reportError: ErrorEmitterFunction;
}

class NodeColumnView extends Backbone.View<NeighborDescription> {
    private isLoaded: boolean;
    private svg: SVG.Doc;
    private top: number;
    private left: number;
    private scrollerView?: NodeColumnScrollerView;
    private edgeType: EdgeType;
    private targetVertexObject: VertexObject;
    private pagesize: number;
    private reportError: ErrorEmitterFunction;
    private topMostNode: number;
    private vertexObjects?: VertexObject[];
    private edgeObjects?: EdgeObject[];

    constructor(options: NodeColumnViewOptions) {
        super({
            collection: options.collection
        });

        const self = this;

        self.isLoaded = false;
        self.svg = options.svg;
        self.top = options.top;
        self.left = options.left;

        self.edgeType = options.edgeType;
        self.targetVertexObject = options.targetVertexObject;
        self.pagesize = options.maxVisibleNodes;
        self.reportError = options.reportError;

        self.scrollerView = options.scrollerView;
        if (self.scrollerView) {
            self.listenTo(self.scrollerView, 'item:scrolled', self.onItemScrolled);
        }

        self.topMostNode = 0;

        self.vertexObjects = self.collection.map((neighbor) => {
            const vertexObject = new VertexObject({
                svg: self.svg,
                reportError: options.reportError,
                model: neighbor.vertex(),
                x: self.left,
                y: self.top
            });

            self.listenTo(vertexObject, 'model:selected', self.onNodeSelected);
            return vertexObject;
        });

        // deferred until render
        self.edgeObjects = undefined;
    }

    public remove() {
        const self = this;

        self.removeEdges();

        _.forEach(self.vertexObjects, (nodeObject) => {
            self.stopListening(nodeObject);
            nodeObject.removeSelf();
        });
        self.vertexObjects = undefined;
        self.scrollerView = undefined;

        self.isLoaded = false;
        return super.remove();
    }

    public removeEdges() {
        const self = this;

        if (self.edgeObjects) {
            self.edgeObjects.forEach((edgeObject) => {
                edgeObject.removeSelf();
            });
            self.edgeObjects = undefined;
        }
    }

    public load() {
        const self = this;

        return Promise.each(self.vertexObjects as VertexObject[], (nodeObject) => {
            return nodeObject.initialize();
        }).then(() => {
            self.isLoaded = true;
            return self;
        });
    }

    public renderWithPromise(): Promise<NodeColumnView> {
        const self = this;

        if (!self.isLoaded) {
            this.reportError('NodeColumnView not loaded');
            return new Promise(() => self);
        }

        self.removeEdges();

        // draw the current page of nodes
        const maxVisibleNodeEnd = this.topMostNode + this.pagesize;
        const nodeHeight = getNodeHeight();
        let neighborKey: string;
        const defaultEdgeOptions: UnrestrictedDictionary = {
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
        return Promise.map(self.vertexObjects as VertexObject[], (nodeObject, idxNodeObject) => {
            if (_.inRange(idxNodeObject, self.topMostNode, maxVisibleNodeEnd)) {
                nodeObject.transformSelf({
                    y: self.top + (idxNodeObject - self.topMostNode) * nodeHeight
                });
                nodeObject.setVisible(true);

                const edge = self.collection.at(idxNodeObject).edge();
                const edgeOptions = {
                    [neighborKey]: nodeObject,
                    model: edge,
                    ...defaultEdgeOptions
                } as EdgeObjectOptions;
                const edgeObject = new EdgeObject(edgeOptions);
                (self.edgeObjects as EdgeObject[]).push(edgeObject);
                return edgeObject.initialize();
            }
            else {
                nodeObject.setVisible(false);
                return Promise.resolve(null);
            }
        }).then(() => {
            return self;
        });
    }

    public getFirstNodeObject(): VertexObject {
        return (this.vertexObjects as VertexObject[])[0];
    }

    private onNodeSelected(vertexId: string) {
        EventHandlers.navigatorChannel.trigger('vertex:selected', vertexId);
    }

    private onItemScrolled(newTopItem: number) {
        this.topMostNode = newTopItem;
        return this.renderWithPromise();
    }
}

export interface LocalizedGraphViewOptions extends Backbone.ViewOptions<Graph> {
    errorView: ErrorView;
    textMeasureView: TextMeasureView;
    vertexColumnPageSize: number;
}

export class LocalizedGraphView extends Backbone.View<Graph> {
    private errorView: ErrorView;
    private reportError: ErrorEmitterFunction;
    private textMeasureView: TextMeasureView;
    private vertexColumnPageSize: number;
    private template: _.TemplateExecutor = _.template(
        '<div>' +
        '   <div class="column-scroll-container incoming"/>' +
        '   <div class="column-scroll-container outgoing"/>' +
        '</div>'
    );
    private svg?: SVG.Doc;
    private targetVertexObject?: VertexObject;
    private incomingNodesView?: NodeColumnView;
    private incomingScrollerView?: NodeColumnScrollerView;
    private outgoingNodesView?: NodeColumnView;
    private outgoingScrollerView?: NodeColumnScrollerView;

    constructor(options: LocalizedGraphViewOptions) {
        super({
            el: '.walker-container',
            model: options.model
        });
        this.errorView = options.errorView;
        this.textMeasureView = options.textMeasureView;
        this.vertexColumnPageSize = options.vertexColumnPageSize;

        this.reportError = this.errorView.registerEmitter(this);
    }

    public clearContents() {
        if (this.outgoingScrollerView) {
            this.outgoingScrollerView.remove();
            this.outgoingScrollerView = undefined;
        }
        if (this.incomingScrollerView) {
            this.incomingScrollerView.remove();
            this.incomingScrollerView = undefined;
        }
        if (this.outgoingNodesView) {
            this.outgoingNodesView.remove();
            this.outgoingNodesView = undefined;
        }
        if (this.incomingNodesView) {
            this.incomingNodesView.remove();
            this.incomingNodesView = undefined;
        }
        if (this.targetVertexObject) {
            this.targetVertexObject.removeSelf();
            this.targetVertexObject = undefined;
        }

        // TODO test for memory leaks
        this.svg = undefined;

        // clear all contents
        this.$el.html('');
    }

    public renderWithPromise(targetVertexId: string): Promise<LocalizedGraphView> {
        const self = this;

        const graph = this.model;
        const targetNode = graph.findVertex(targetVertexId);
        if (_.isUndefined(targetNode)) {
            this.reportError(`Unable to find matching vertex = ${targetVertexId}`);
            return new Promise(() => self);
        }

        self.$el.html(self.template());

        self.svg = SVG(self.$el[0]);
        if (_.isUndefined(self.svg)) {
            self.reportError('Unable to create svg!');
            return new Promise(() => self);
        }

        const svg: SVG.Doc = self.svg;
        svg.toggleClass('walker-image-container');
        svg.size(
            window.innerWidth,
            window.innerHeight
        );

        const textMetrics = this.textMeasureView.getTextDimensions(targetNode.get('label'));
        const textMargin = SvgStyles.getStyles('vertexText').textMargin;
        const canvasMargin = SvgStyles.getStyles('canvasMargin');
        const rectBorderWidth = SvgStyles.getStyles('vertexRect').strokeWidth;
        const incomingNeighbors = graph.getIncomingNeighbors(targetNode);
        const outgoingNeighbors = graph.getOutgoingNeighbors(targetNode);

        // scroller views
        const commonScrollerViewOptions = {pageSize: self.vertexColumnPageSize};
        let scrollViewElement = self.$('.column-scroll-container.incoming');
        if (incomingNeighbors.length > self.vertexColumnPageSize) {
            self.incomingScrollerView = new NodeColumnScrollerView({
                ...commonScrollerViewOptions,
                maxSize: incomingNeighbors.length,
                el: scrollViewElement
            });
            self.incomingScrollerView.render();
        }
        else {
            scrollViewElement.hide();
            self.incomingScrollerView = undefined;
        }

        scrollViewElement = self.$('.column-scroll-container.outgoing');
        if (outgoingNeighbors.length > self.vertexColumnPageSize) {
            self.outgoingScrollerView = new NodeColumnScrollerView({
                ...commonScrollerViewOptions,
                maxSize: outgoingNeighbors.length,
                el: scrollViewElement
            });
            self.outgoingScrollerView.render();
        }
        else {
            scrollViewElement.hide();
            self.outgoingScrollerView = undefined;
        }

        // central target
        const targetNodePos: UnrestrictedDictionary = {};
        targetNodePos.left = (svg.width() / 2) - (textMetrics.width / 2);
        targetNodePos.top = canvasMargin.top;

        self.targetVertexObject = new VertexObject({
            svg,
            reportError: self.reportError,
            model: targetNode,
            x: targetNodePos.left,
            y: targetNodePos.top
        });
        const targetVertexObject: VertexObject = self.targetVertexObject;

        return targetVertexObject.initialize().then(() => {
            // incoming node column
            self.incomingNodesView = new NodeColumnView({
                svg,
                targetVertexObject,
                left: canvasMargin.left,
                top: canvasMargin.top,
                maxVisibleNodes: self.vertexColumnPageSize,
                collection: incomingNeighbors,
                edgeType: EdgeType.Incoming,
                scrollerView: self.incomingScrollerView as NodeColumnScrollerView,
                reportError: self.reportError
            });
            return self.incomingNodesView.load();
        }).then(() => {
            // outgoing node column
            const maxOutgoingTextWidth: number = _.max(
                outgoingNeighbors.map((neighbor) => {
                    return self.textMeasureView.getTextDimensions(
                        neighbor.vertex().get('modelName')
                    ).width;
                })
            ) as number;

            const outgoingPos: UnrestrictedDictionary = {};
            outgoingPos.left = svg.width() - canvasMargin.right - maxOutgoingTextWidth -
                (textMargin * 2) - (rectBorderWidth * 2);
            outgoingPos.top = canvasMargin.top;

            self.outgoingNodesView = new NodeColumnView({
                svg,
                targetVertexObject,
                left: outgoingPos.left,
                top: outgoingPos.top,
                maxVisibleNodes: self.vertexColumnPageSize,
                collection: outgoingNeighbors,
                edgeType: EdgeType.Outgoing,
                scrollerView: self.outgoingScrollerView as NodeColumnScrollerView,
                reportError: self.reportError
            });

            // adjust the right scroller view if visible
            if (self.outgoingScrollerView) {
                self.outgoingScrollerView.$el.css('left', outgoingPos.left);
            }

            return self.outgoingNodesView.load();
        }).then(() => {
            // resize SVG based on the number of nodes
            svg.height(
                _.max([
                    window.innerHeight,
                    canvasMargin.top + (_.max([
                        incomingNeighbors.length,
                        outgoingNeighbors.length
                    ]) as number) * getNodeHeight()
                ])
            );

            return Promise.all([
                (self.incomingNodesView as NodeColumnView).renderWithPromise(),
                (self.outgoingNodesView as NodeColumnView).renderWithPromise()
            ]);
        }).then(() => {
            // arrow indicators
            const yArcEnd = targetVertexObject.getConnectionPoint(ConnectionSide.Left).y +
                SvgStyles.getStyles('edgeLine').strokeWidth / 2.0;

            const edgeOptions: PositionableGroupOptions = {
                svg,
                reportError: self.reportError,
                y: yArcEnd,
                x: 0 // will be overriden
            };

            const indicators = [];
            if (incomingNeighbors.length > 0) {
                const firstNodeObject = (self.incomingNodesView as NodeColumnView).getFirstNodeObject();
                const xLeftmost = firstNodeObject.getConnectionPoint(ConnectionSide.Right).x;
                const xMid = xLeftmost + (
                    targetVertexObject.getConnectionPoint(ConnectionSide.Left).x -
                    xLeftmost
                ) * 5 / 6;

                indicators.push(
                    new EdgeDirectionIndicatorObject({
                        ...edgeOptions,
                        x: xMid
                    }).initialize()
                );
            }
            if (outgoingNeighbors.length > 0) {
                const firstNodeObject = (self.outgoingNodesView as NodeColumnView).getFirstNodeObject();
                const xLeftmost = targetVertexObject.getConnectionPoint(ConnectionSide.Right).x;
                const xMid = xLeftmost + (firstNodeObject.getConnectionPoint(ConnectionSide.Left).x - xLeftmost) / 6;
                indicators.push(
                    new EdgeDirectionIndicatorObject({
                        ...edgeOptions,
                        x: xMid
                    }).initialize()
                );
            }

            return Promise.all(indicators);
        }).then(() => {
            return self;
        });
    }
}
