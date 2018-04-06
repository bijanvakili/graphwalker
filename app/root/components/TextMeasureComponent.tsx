import * as React from 'react';

import SvgStyles from '../../SvgStyles';
import {TextDimensions} from '../models/UI';

interface VertexTextStyle {
    fontSize: number;
    fontFamily: string;
    textHeight: number;
}

export class TextMeasure {
    private textMeasureContext?: CanvasRenderingContext2D;
    private fontSettings: VertexTextStyle;

    public constructor() {
        this.textMeasureContext = undefined;
        this.fontSettings = (SvgStyles.getStyles('vertexText') as VertexTextStyle);
    }

    public setCanvas(elem: HTMLCanvasElement) {
        if (elem) {
            this.textMeasureContext = elem.getContext('2d') as CanvasRenderingContext2D;
            this.textMeasureContext.font = this.fontSettings.fontSize + 'px ' + this.fontSettings.fontFamily;
        }
        else {
            this.textMeasureContext = undefined;
        }
    }

    public isReady(): boolean {
        return this.textMeasureContext !== undefined;
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

interface TextMeasureComponentProps {
    width: number;
    textMeasure: TextMeasure;
}

export class TextMeasureComponent extends React.Component<TextMeasureComponentProps> {
    public render() {
        const textMeasure = this.props.textMeasure;
        return (
            <canvas
                ref={textMeasure.setCanvas.bind(textMeasure)}
                className="text-measure"
                width={this.props.width}
            />
        );
    }
}
