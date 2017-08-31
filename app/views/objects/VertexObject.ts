import * as Backbone from 'backbone';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as SVG from 'svg.js';

import { Vertex } from '../../models/GraphData';
import SvgStyles from '../../SvgStyles';
import { UnrestrictedDictionary } from '../../types';
import { BaseViewGroup, PositionableGroupOptions } from './BaseViewGroup';

export enum ConnectionSide {
    Left = 'left',
    Right = 'down',
}

// maps to SVG text-anchor attribute
export enum LabelJustification {
    Left = 'start',
    Center = 'middle',
    Right = 'end'
}

export interface ConnectionPoint {
    x: number;
    y: number;
}

export interface VertexObjectOptions extends PositionableGroupOptions {
    model: Vertex;
    labelJustification: LabelJustification;
}

export class VertexObject extends BaseViewGroup {
    private vertexData: Vertex;
    private iconObj: SVG.Image;
    private labelJustification: LabelJustification;
    private labelObj: SVG.Text;

    constructor(options: VertexObjectOptions) {
        super(options);
        this.vertexData = options.model;
        this.labelJustification = options.labelJustification;
        _.extend(this, Backbone.Events);
    }

    /* tslint:disable:no-empty */
    // these will be overridden during construction
    public trigger(eventName: string, ...args: any[]): any {}
    /* tslint:enable:no-empty */

    public initialize(): Promise<BaseViewGroup> {
        const self = this;

        // TODO Try moving the SVG name into the styles
        return self.addImage('basic_node.svg')
            .then((iconObj) => {

                self.iconObj = iconObj;
                const vertexIconStyle = SvgStyles.getStyles('vertexIcon');
                self.iconObj.move(vertexIconStyle.x, vertexIconStyle.y);
                self.iconObj.click(() => {
                    self.onClick();
                });

                const labelTextStyle = SvgStyles.getStyles('vertexText');
                const labelAttributes: UnrestrictedDictionary = _.pick(labelTextStyle, ['x', 'y', 'fill']);
                const labelText = self.vertexData.get('label');

                if (self.labelJustification === LabelJustification.Center) {
                    labelAttributes.x += self.iconObj.width();
                } else if (self.labelJustification === LabelJustification.Right) {
                    labelAttributes.x += self.iconObj.width() / 2;
                }

                self.labelObj = self.options.svg.text(labelText)
                    .attr(labelAttributes)
                    .font({
                        family: labelTextStyle.fontFamily,
                        size: labelTextStyle.fontSize,
                        anchor: self.labelJustification
                    })
                    .click(() => {
                        self.onClick();
                    });

                self.addChild(self.labelObj);
                const {x, y} = self.options as PositionableGroupOptions;
                self.transformSelf({x, y});
                return self;
            });
    }

    /*
     * Retrieves the coordinate for which to connect an edge
     */
    public getConnectionPoint(side: ConnectionSide): ConnectionPoint {
        const self = this;

        const iconInfo = {...this.iconObj.attr()} as any;
        const vertexAbsPosition = {
            x: self.group.x(),
            y: self.group.y()
        };

        let xOffset: number;
        switch (side) {
            case ConnectionSide.Left: {
                xOffset = 0;
                break;
            }
            case ConnectionSide.Right: {
                xOffset = iconInfo.width - 1;
                break;
            }
            default: {
                throw new Error(
                    'model(' + this.vertexData.id + ') got unrecognized side: ' +
                    (side || '(undefined)')
                );
            }
        }

        return {
            x: vertexAbsPosition.x + iconInfo.x + xOffset,
            y: vertexAbsPosition.y + ((iconInfo.y + iconInfo.height) / 2.0) + 1
        };
    }

    private onClick() {
        this.trigger('model:selected', this.vertexData.id);
    }
}
