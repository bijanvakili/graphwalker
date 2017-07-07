import * as Backbone from 'backbone';
import SvgStyles from '../SvgStyles';

interface VertexTextStyle {
    fontSize: number;
    fontFamily: string;
    textHeight: number;
}

interface TextDimensions {
    width: number;
    height: number;
}

export class TextMeasureView extends Backbone.View<Backbone.Model> {

    private fontSettings: VertexTextStyle;
    private textMeasureContext: CanvasRenderingContext2D;

    constructor(options?: Backbone.ViewOptions<Backbone.Model>) {
        super({
            el: '.text-measure',
        });
    }

    public initialize() {
        this.fontSettings = (SvgStyles.getStyles('vertexText') as VertexTextStyle);
    }

    public render() {
        this.$el.width(window.innerWidth);

        this.textMeasureContext = ((this.$el[0] as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D);
        this.textMeasureContext.font = this.fontSettings.fontSize + 'px ' + this.fontSettings.fontFamily;

        return this;
    }

    /**
     * Computes the text dimensions for an arbitrary string
     *
     * @param s - string to measure
     */
    public getTextDimensions(s: string): TextDimensions {
        const textMetrics = this.textMeasureContext.measureText(s);

        return {
            width: textMetrics.width,
            height: this.fontSettings.textHeight
        };
    }
}
