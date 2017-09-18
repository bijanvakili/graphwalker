import * as React from 'react';

import {ElementMouseEventHandler} from '../../common/EventTypes';

export interface ImageTemplateProps {
    id: string;
    href: string;
    width: number;
    height: number;
}

/*
 The image dimensions (height and width) are required for image templates.
 Although they are contained in the SVG XML content, we would need to write extra code
 to load the SVGs via plain XMLHttpRequest to simultaneously retrieve the XML content for display
 and parse the XML just to get the height and width.
 Given the small number of images, for now we'll stick with href URIs and merely replicate
 the image dimensions from the application's configuration file (config.json).
*/
export class ImageTemplate extends React.Component<ImageTemplateProps> {
    public render() {
        return (
            <symbol id={this.props.id}>
                <image
                    xlinkHref={this.props.href}
                    height={this.props.height}
                    width={this.props.width}
                />
            </symbol>
        );
    }
}

export interface ImageInstanceProps {
    // data
    id: string;
    x: number;
    y: number;
    // callbacks
    onClick?: ElementMouseEventHandler;
}

export class ImageInstance extends React.Component<ImageInstanceProps> {
    private elem?: SVGUseElement;

    public render() {
        return (
            <use
                ref={(elem) => this.elem = elem as SVGUseElement}
                xlinkHref={`#${this.props.id}`}
                x={this.props.x}
                y={this.props.y}
                onClick={this.props.onClick}
            />
        );
    }

    public getBBox() {
        if (!this.elem) {
            throw new Error('ImageInstance not rendered properly');
        }

        return this.elem.getBBox();
    }
}
