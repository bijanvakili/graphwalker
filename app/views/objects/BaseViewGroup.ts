import * as Promise from 'bluebird';
import * as SVG from 'svg.js';

import { ErrorEmitterFunction } from '../ErrorView';

export interface BaseViewGroupOptions {
    svg: SVG.Doc;
    reportError: ErrorEmitterFunction;
}

export interface PositionableGroupOptions extends BaseViewGroupOptions {
    x: number;
    y: number;
}

export class BaseViewGroup {
    protected options: BaseViewGroupOptions;
    protected svg: SVG.Doc;
    protected group: SVG.G;
    protected reportError: ErrorEmitterFunction;

    constructor(options: BaseViewGroupOptions) {
        this.options = options;
        this.svg = options.svg;
        this.reportError = this.options.reportError;

        this.group = this.svg.group();
    }

    /**
     * Initializes the view group (all derived classes must implement this)
     */
    public initialize(): Promise<BaseViewGroup> {
        throw new Error(this.constructor + ' needs to implement initialize()');
    }

    /**
     * Loads the SVG source for an image
     */
    public addImage(filename: string): Promise<SVG.Image> {
        const self = this;

        const newImage = self.svg.image('images/' + filename);
        return new Promise<SVG.Image>((resolve, reject) => {
            try {
                newImage.loaded((loader) => {
                    newImage.size(loader.width, loader.height);
                    self.addChild(newImage);
                    resolve(newImage);
                });
            }
            catch (ex) {
                reject(ex);
            }
        }).catch((error) => {
            self.onError(error);
        });
    }

    /**
     * Self removes from the SVG
     */
    public removeSelf() {
        this.group.remove();
    }

    /**
     * Transforms the object
     */
    public transformSelf(transform: SVG.Transform): void {
        this.group.transform(transform);
    }

    public setVisible(visible: boolean) {
        if (visible) {
            this.group.show();
        } else {
            this.group.hide();
        }
    }

    /**
     * Error handler
     */
    protected onError(errorMessage: string) {
        this.reportError(errorMessage);
    }

    /**
     * Adds an SVG child object
     */
    protected addChild(child: SVG.Element) {
        this.group.add(child);
    }
}
