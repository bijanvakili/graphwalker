import * as React from 'react';

import {Point} from '../../common/ObjectTypes';
import {IncidentEdgeDirection} from '../../root/models/Graph';
import SvgStyles from '../../SvgStyles';

export interface EdgeObjectProps {
    start: Point;
    end: Point;
    edgeType: IncidentEdgeDirection;
    labelText: string;
}

export class EdgeObject extends React.Component<EdgeObjectProps> {
    public render() {
        const start = this.props.start;
        const end = this.props.end;
        const edgeLineStyle = SvgStyles.getStyles('edgeLine');
        const edgeTextStyle = SvgStyles.getStyles('edgeText');

        const vectorEdge = {
            x: end.x - start.x,
            y: end.y - start.y,
        };

        // assume line moves left to right
        const segmentPoints = [start];
        segmentPoints.push({
            x: start.x + vectorEdge.x / 3,
            y: start.y
        });
        segmentPoints.push({
            x: start.x + vectorEdge.x * 2 / 3,
            y: end.y
        });
        segmentPoints.push(end);

        let textAnchorPoint = this.props.edgeType === IncidentEdgeDirection.Incoming ?
            segmentPoints[0] : segmentPoints[2];
        textAnchorPoint = {...textAnchorPoint};
        textAnchorPoint.y += edgeTextStyle.fontSize;

        return (
            <g>
                <polyline
                    points={segmentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill={edgeLineStyle.fill}
                    stroke={edgeLineStyle.stroke}
                    strokeWidth={edgeLineStyle.strokeWidth}
                />
                <text
                    x={textAnchorPoint.x}
                    y={textAnchorPoint.y}
                    fontFamily={edgeTextStyle.fontFamily}
                    fontSize={edgeTextStyle.fontSize}
                    fontStyle={edgeTextStyle.fontStyle}
                    fill={edgeTextStyle.fontFill}
                    textAnchor="left"
                >
                    {this.props.labelText}
                </text>
            </g>
        );
    }
}
