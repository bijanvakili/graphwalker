import * as Promise from 'bluebird';
import * as _ from 'lodash';

import {Edge} from '../../models/GraphData';
import SvgStyles from '../../SvgStyles';
import {BaseViewGroup, BaseViewGroupOptions, PositionableGroupOptions} from './BaseViewGroup';
import {ConnectionSide, VertexObject} from './VertexObject';

export enum EdgeType {
    Incoming = 'incoming',
    Outgoing = 'outgoing',
}

export interface EdgeObjectOptions extends BaseViewGroupOptions {
    edgeType: EdgeType;
    startVertexObject: VertexObject;
    endVertexObject: VertexObject;
    model: Edge;
}

export class EdgeObject extends BaseViewGroup {
    private edgeData: Edge;
    private edgeType: EdgeType;
    private endpointObjects: VertexObject[];

    constructor(options: EdgeObjectOptions) {
        super(options);

        this.edgeData = options.model;
        this.edgeType = options.edgeType;
        this.endpointObjects = [options.startVertexObject, options.endVertexObject];
    }

    public initialize(): Promise<BaseViewGroup> {
        const self = this;

        // assume edges always move right to left
        const endpoints = [];
        endpoints.push(self.endpointObjects[0].getConnectionPoint(ConnectionSide.Right));
        endpoints.push(self.endpointObjects[1].getConnectionPoint(ConnectionSide.Left));

        // break edge into 3 segments
        const vectorEdge = {
            x: endpoints[1].x - endpoints[0].x,
            y: endpoints[1].y - endpoints[0].y
        };
        const segmentPoints = [];
        segmentPoints.push(endpoints[0]);
        segmentPoints.push({
            x: endpoints[0].x + vectorEdge.x * 1 / 3,
            y: endpoints[0].y
        });
        segmentPoints.push({
            x: endpoints[0].x + vectorEdge.x * 2 / 3,
            y: endpoints[1].y
        });
        segmentPoints.push(endpoints[1]);

        const edgeLineObj = self.options.svg.polyline(
            _(segmentPoints).map((p) => [p.x, p.y]).flatten().value() as number[]
        ).style(SvgStyles.getStyles('edgeLine'));
        self.addChild(edgeLineObj);

        // draw the label adjacent to the first segment
        const labelObjStyle = SvgStyles.getStyles('edgeText');
        const labelObj = self.options.svg.text(self.edgeData.get('label'))
            .attr({fill: labelObjStyle.fontFill})
            .font({
                family: labelObjStyle.fontFamily,
                size: labelObjStyle.fontSize,
                style: labelObjStyle.fontStyle
            });

        let textAnchorPoint;
        if (self.edgeType === 'incoming') {
            textAnchorPoint = segmentPoints[0];
        }
        else {
            textAnchorPoint = segmentPoints[2];
        }
        labelObj.move(textAnchorPoint.x, textAnchorPoint.y);

        self.addChild(labelObj);
        return Promise.resolve(self);
    }
}

export class EdgeDirectionIndicatorObject extends BaseViewGroup {

    constructor(options: PositionableGroupOptions) {
        super(options);
    }

    public initialize(): Promise<BaseViewGroup> {
        const self = this;

        // TODO Try moving the SVG name into the styles
        return this.addImage('arrow.svg')
            .then((arrowObj) => {
                arrowObj.dmove(
                    -0.5 * (arrowObj.width() + 1),
                    -0.5 * (arrowObj.height() + 1)
                );

                const {x, y} = self.options as PositionableGroupOptions;
                self.transformSelf({x, y});

                return self;
            });
    }
}
