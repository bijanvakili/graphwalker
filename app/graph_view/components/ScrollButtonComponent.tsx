import * as React from 'react';

import {ElementMouseEventHandler} from '../../common/EventTypes';

interface ScrollButtonProps {
    // data
    enable: boolean;
    label: string;

    // callbacks
    onClick: ElementMouseEventHandler;
}

export class ScrollButtonComponent extends React.Component<ScrollButtonProps> {
    public render() {
        return (
            <button
                // TODO switch to using less rather than force combining styles
                className="column-scroll-button pure-button"
                disabled={!this.props.enable}
                onClick={this.props.onClick}
            >{this.props.label}</button>
        );
    }
}
