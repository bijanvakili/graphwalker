import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import {ElementMouseEvent} from '../../common/EventTypes';
import {Point} from '../../common/ObjectTypes';
import rootActions from '../../root/actions';
import {GlobalState} from '../../root/models/GlobalState';
import {IncidentEdgeDirection, Vertex} from '../../root/models/Graph';
import SvgStyles from '../../SvgStyles';
import {LabelJustification, VertexObject} from '../components/VertexObject';

interface VertexContainerProps {
    // data
    vertex: Vertex;
    neighborType?: IncidentEdgeDirection;
    x: number;
    y: number;
    labelAnchor: Point;

    // callbacks
    onItemSelected: ActionFunctionAny<{vertexId: string}>;
}

class VertexContainer extends React.Component<VertexContainerProps, GlobalState> {
    constructor(props: VertexContainerProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        const labelAnchor = {...this.props.labelAnchor};
        const labelTextStyle = SvgStyles.getStyles('vertexText');

        let justification;
        switch (this.props.neighborType) {
            case IncidentEdgeDirection.Incoming:
                justification = LabelJustification.Left;
                labelAnchor.x = labelTextStyle.x;
                break;
            case IncidentEdgeDirection.Outgoing:
                justification = LabelJustification.Right;
                break;
            default:
                justification = LabelJustification.Center;
                break;
        }

        return (
            <VertexObject
                labelText={this.props.vertex.label}
                labelJustification={justification}
                x={this.props.x}
                y={this.props.y}
                onClick={this.onClick}
                labelAnchor={labelAnchor}
            />
        );
    }

    private onClick(e: ElementMouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        this.props.onItemSelected(this.props.vertex.id);
    }
}

// TODO find out how to avoid this cast
const rActions = rootActions.root as any;

function mapDispatchToProps(dispatch: Dispatch<GlobalState>) {
    return bindActionCreators({
        onItemSelected: rActions.selectVertex
    }, dispatch);
}

export default connect(
    null,
    mapDispatchToProps
)(VertexContainer);
