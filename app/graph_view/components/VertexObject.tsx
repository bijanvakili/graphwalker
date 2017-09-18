import * as React from 'react';

import {ElementMouseEventHandler} from '../../common/EventTypes';
import {Point} from '../../common/ObjectTypes';
import SvgStyles from '../../SvgStyles';
import {ImageInstance} from './svg';

// maps to SVG text-anchor attribute
export enum LabelJustification {
    Left = 'start',
    Center = 'middle',
    Right = 'end'
}

export interface VertexObjectProps {
    // data
    labelText: string;
    labelJustification: LabelJustification;
    x: number;
    y: number;
    labelAnchor: Point;

    // callbacks
    onClick?: ElementMouseEventHandler;
}

export class VertexObject extends React.Component<VertexObjectProps> {
    private grouping?: SVGGElement;
    private icon?: ImageInstance;
    private label?: SVGTextElement;

    public render() {
        const vertexIconStyle = SvgStyles.getStyles('vertexIcon');
        const labelTextStyle = SvgStyles.getStyles('vertexText');

        return (
            <g
                ref={(elem) => this.grouping = elem as SVGGElement}
                transform={`translate(${this.props.x} ${this.props.y})`}
            >
                <ImageInstance
                    id="basic_node.svg"
                    ref={(elem) => this.icon = elem as ImageInstance}
                    x={vertexIconStyle.x}
                    y={vertexIconStyle.y}
                    onClick={this.props.onClick}
                />
                <text
                    ref={(elem) => this.label = elem as SVGTextElement}
                    x={this.props.labelAnchor.x}
                    y={this.props.labelAnchor.y}
                    fill={labelTextStyle.fill}
                    fontFamily={labelTextStyle.fontFamily}
                    fontSize={labelTextStyle.fontSize}
                    textAnchor={this.props.labelJustification}
                    onClick={this.props.onClick}
                >
                    {this.props.labelText}
                </text>
            </g>
        );
    }
}
