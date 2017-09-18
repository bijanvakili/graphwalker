import * as React from 'react';

import {Point} from '../../common/ObjectTypes';
import {ImageInstance} from './svg';

export interface EdgeDirectionIndicatorObjectProps {
    position: Point;
}

export class EdgeDirectionIndicatorObject extends React.Component<EdgeDirectionIndicatorObjectProps> {
    public render() {
        return (
            <ImageInstance
                id="arrow.svg"
                x={this.props.position.x}
                y={this.props.position.y}
            />
        );
    }
}
