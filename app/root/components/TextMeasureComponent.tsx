import * as React from 'react';

import SvgStyles from '../../SvgStyles';
import {TextDimensions} from '../models/UI';

interface VertexTextStyle {
    fontSize: number;
    fontFamily: string;
    textHeight: number;
}

interface TextMeasureProps {
    width: number;
}

export class TextMeasureComponent extends React.Component<TextMeasureProps> {
    private textMeasureContext?: CanvasRenderingContext2D;
    private fontSettings: VertexTextStyle;

    constructor(props: TextMeasureProps) {
        super(props);
        this.fontSettings = (SvgStyles.getStyles('vertexText') as VertexTextStyle);
    }

    public render() {
        return (
            <canvas
                ref={(elem: HTMLCanvasElement) =>
                    this.textMeasureContext = elem.getContext('2d') as CanvasRenderingContext2D
                }
                className="text-measure"
                width={this.props.width}
            />
        );
    }

    public componentDidMount() {
        if (!this.textMeasureContext) {
            throw new Error('TextMeasureComponent did not set this.textMeasureContext');
        }
        this.textMeasureContext.font = this.fontSettings.fontSize + 'px ' + this.fontSettings.fontFamily;
    }

    /**
     * Computes the text dimensions for an arbitrary string
     *
     * @param s - string to measure
     */
    public getTextDimensions(s: string): TextDimensions {
        if (!this.textMeasureContext) {
            throw new Error('getTextDimensions called before TextMeasureComponent mounted');
        }

        const textMetrics = this.textMeasureContext.measureText(s);

        return {
            width: textMetrics.width,
            height: this.fontSettings.textHeight
        };
    }
}
