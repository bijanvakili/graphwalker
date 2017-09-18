import * as _ from 'lodash';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import {ElementMouseEvent} from '../../common/EventTypes';
import {Point} from '../../common/ObjectTypes';
import {GlobalState} from '../../root/models/GlobalState';
import {Edge, IncidentEdgeDirection, ScrollDirection, Vertex} from '../../root/models/Graph';
import SvgStyles from '../../SvgStyles';
import {graphActions} from '../actions';
import {EdgeDirectionIndicatorObject} from '../components/EdgeDirectionIndicatorObject';
import {EdgeObject} from '../components/EdgeObject';
import {ScrollButtonComponent} from '../components/ScrollButtonComponent';
import {LabelJustification} from '../components/VertexObject';
import {GraphViewState} from '../models';
import VertexContainer from './VertexContainer';

// TODO move into CSS
function getNodeHeight(): number {
    const rectStyle = SvgStyles.getStyles('vertexRect');
    const textStyle = SvgStyles.getStyles('vertexText');

    return textStyle.textHeight + (rectStyle.strokeWidth + textStyle.textMargin) * 2;
}

interface NeighborGroupContainerInputProps {
    // input properties
    edgeDirection: IncidentEdgeDirection;
    edges: Edge[];
    currItem: number;
    groupPos: Point;
    targetVertexX: number;
}

interface NeighborGroupContainerProps extends NeighborGroupContainerInputProps {
    // mapped properties
    maxDisplayItems: number;
    labelJustification: LabelJustification;
    enableScrollUp: boolean;
    enableScrollDown: boolean;
    connectionYOffset: number;
    connectionXOffsetLeft: number;
    connectionXOffsetRight: number;
    arrowOffset: Point;

    getAdjacentVertexId: (edge: Edge) => string;
    findVertexById: (id: string) => Vertex;

    // callbacks
    onScrollUp: ActionFunctionAny<{}>;
    onScrollDown: ActionFunctionAny<{}>;
}

class NeighborGroupContainer extends React.Component<NeighborGroupContainerProps> {
    private nodeNeight: number;

    constructor(props: NeighborGroupContainerProps) {
        super(props);
        this.nodeNeight = getNodeHeight();
        this.onClick = this.onClick.bind(this);
    }

    public render() {
        if (_.isEmpty(this.props.edges)) {
            return null;
        }
        const idxEdge = this.props.currItem;
        const visibleEdges = this.props.edges.slice(idxEdge, idxEdge + this.props.maxDisplayItems);

        let edgeStartX: number;
        let edgeEndX: number;
        let arrowIndicatorXPos: number;
        let scrollX: number;
        const relTargetVertexX = this.props.targetVertexX - this.props.groupPos.x + 1;

        if (this.props.edgeDirection === IncidentEdgeDirection.Incoming) {
            edgeStartX = this.props.connectionXOffsetRight;
            edgeEndX = relTargetVertexX + this.props.connectionXOffsetLeft;
            arrowIndicatorXPos = edgeStartX + (
                relTargetVertexX + this.props.connectionXOffsetLeft - edgeStartX
            ) * 5 / 6;
            scrollX = 0;
        } else {
            edgeStartX = relTargetVertexX + this.props.connectionXOffsetRight;
            edgeEndX = this.props.connectionXOffsetRight;
            arrowIndicatorXPos = edgeStartX + (
                edgeEndX - edgeStartX
            ) / 6;
            // TODO use styling to determine width so that this is flush against the vertex on the right
            scrollX = edgeStartX + (edgeEndX - edgeStartX) * 2 / 3;
        }

        const arrowIndicatorYPos = this.props.connectionYOffset +
            SvgStyles.getStyles('edgeLine').strokeWidth / 2.0;

        return (
            <g transform={`translate(${this.props.groupPos.x} ${this.props.groupPos.y})`}>
                <foreignObject width="200" height="18" x={scrollX} y="-18">
                    <div>
                        <ScrollButtonComponent
                            label="Up"
                            enable={this.props.enableScrollUp}
                            onClick={(e) => this.onClick(e, ScrollDirection.Up)}
                        />
                        <ScrollButtonComponent
                            label="Down"
                            enable={this.props.enableScrollDown}
                            onClick={(e) => this.onClick(e, ScrollDirection.Down)}
                        />
                    </div>
                </foreignObject>
                <g>
                    {visibleEdges.map((edge: Edge, idxNodeObject: number) => {
                        const vertexId = this.props.getAdjacentVertexId(edge);
                        const vertex = this.props.findVertexById(vertexId);
                        const nodeYPosition = idxNodeObject * this.nodeNeight;

                        let edgeStartY = this.props.connectionYOffset;
                        if (this.props.edgeDirection === IncidentEdgeDirection.Incoming) {
                            edgeStartY += nodeYPosition;
                        }
                        let edgeEndY = this.props.connectionYOffset;
                        if (this.props.edgeDirection === IncidentEdgeDirection.Outgoing) {
                            edgeEndY += nodeYPosition;
                        }

                        return ([
                            <EdgeObject
                                key={edge.id}
                                labelText={edge.label}
                                edgeType={this.props.edgeDirection}
                                start={{x: edgeStartX, y: edgeStartY}}
                                end={{x: edgeEndX, y: edgeEndY}}
                            />,
                            <VertexContainer
                                key={vertexId}
                                vertex={vertex}
                                neighborType={this.props.edgeDirection}
                                x={0}
                                y={nodeYPosition}
                            />
                        ]);
                    })}
                </g>
                <EdgeDirectionIndicatorObject
                    position={
                        {
                            x: arrowIndicatorXPos + this.props.arrowOffset.x,
                            y: arrowIndicatorYPos + this.props.arrowOffset.y
                        }
                    }
                />
            </g>
        );
    }

    private onClick(e: ElementMouseEvent, direction: ScrollDirection) {
        e.stopPropagation();
        e.preventDefault();
        direction === ScrollDirection.Up ? this.props.onScrollUp() : this.props.onScrollDown();
    }
}

function mapStateToProps(state: GlobalState, ownProps: NeighborGroupContainerInputProps) {
    const graphState = state.graphState as GraphViewState;

    const labelJustification = ownProps.edgeDirection === IncidentEdgeDirection.Incoming ?
        LabelJustification.Left : LabelJustification.Right;
    const idxStartVertex = ownProps.edgeDirection === IncidentEdgeDirection.Incoming ?
        graphState.currItemIncoming : graphState.currItemOutgoing;
    const arrowImageMetaData = graphState.images['arrow.svg'];

    return {
        labelJustification,
        maxDisplayItems: graphState.vertexColumnPageSize,
        enableScrollUp: idxStartVertex > 0,
        enableScrollDown: (idxStartVertex + graphState.vertexColumnPageSize) < ownProps.edges.length,
        connectionYOffset: graphState.connectionYOffset,
        connectionXOffsetLeft: graphState.connectionXOffsetLeft,
        connectionXOffsetRight: graphState.connectionXOffsetRight,
        arrowOffset: {
            x: -0.5 * (arrowImageMetaData.width + 1),
            y: -0.5 * (arrowImageMetaData.height + 1)
        },

        findVertexById: graphState.findVertexById,
        getAdjacentVertexId: (edge: Edge) => graphState.getAdjacentVertexIdFromEdge(edge, ownProps.edgeDirection),
    };
}

// TODO find out how to avoid this cast
const gActions = graphActions.graph as any;

function mapDispatchToProps(dispatch: Dispatch<GlobalState>, ownProps: NeighborGroupContainerInputProps) {
    return bindActionCreators({
        onScrollUp: () => gActions.scrollColumn(ScrollDirection.Up, ownProps.edgeDirection, ownProps.edges.length),
        onScrollDown: () => gActions.scrollColumn(ScrollDirection.Down, ownProps.edgeDirection, ownProps.edges.length),
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NeighborGroupContainer);
