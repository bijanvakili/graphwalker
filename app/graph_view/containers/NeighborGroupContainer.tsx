import * as _ from 'lodash';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import {ElementMouseEvent} from '../../common/EventTypes';
import {Point} from '../../common/ObjectTypes';
import {GlobalState} from '../../root/models/GlobalState';
import {Edge, Graph, IncidentEdgeDirection, ScrollDirection} from '../../root/models/Graph';
import {Settings} from '../../root/models/Settings';
import SvgStyles from '../../SvgStyles';
import {graphActions} from '../actions';
import {EdgeDirectionIndicatorObject} from '../components/EdgeDirectionIndicatorObject';
import {EdgeObject} from '../components/EdgeObject';
import {ScrollButtonComponent} from '../components/ScrollButtonComponent';
import {LabelJustification} from '../components/VertexObject';
import {GraphViewState, VisualOffsets} from '../models';
import VertexContainer from './VertexContainer';

// TODO move into CSS
function getNodeHeight(): number {
    const rectStyle = SvgStyles.getStyles('vertexRect');
    const textStyle = SvgStyles.getStyles('vertexText');

    return textStyle.textHeight + (rectStyle.strokeWidth + textStyle.textMargin) * 2;
}

interface NeighborGroupContainerInputProps {
    graph: Graph;
    settings: Settings;
    edgeDirection: IncidentEdgeDirection;
    edges: Edge[];
    currItem: number;

    offsets: VisualOffsets;
    groupPos: Point;
    targetVertexX: number;
}

interface NeighborGroupContainerProps extends NeighborGroupContainerInputProps {
    // mapped properties
    labelJustification: LabelJustification;
    enableScrollUp: boolean;
    enableScrollDown: boolean;

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
        const numEdges = this.props.edges.length;
        const maxDisplayItems = this.props.settings.vertexColumnPageSize;
        const showEdgeScollButtons = (numEdges > maxDisplayItems);
        const idxLastVisible = Math.min(idxEdge + maxDisplayItems, numEdges - 1);
        const visibleEdges = this.props.edges.slice(idxEdge, idxEdge + maxDisplayItems);

        let edgeStartX: number;
        let edgeEndX: number;
        let arrowIndicatorXPos: number;
        let scrollX: number;
        const relTargetVertexX = this.props.targetVertexX - this.props.groupPos.x + 1;

        const connectionXOffsetLeft = this.props.offsets.connectionLeft.x;
        const connectionXOffsetRight = this.props.offsets.connectionRight.x;
        if (this.props.edgeDirection === IncidentEdgeDirection.Incoming) {
            edgeStartX = connectionXOffsetRight;
            edgeEndX = relTargetVertexX + connectionXOffsetLeft;
            arrowIndicatorXPos = edgeStartX + (
                relTargetVertexX + connectionXOffsetLeft - edgeStartX
            ) * 5 / 6;
            scrollX = 0;
        } else {
            edgeStartX = relTargetVertexX + connectionXOffsetRight;
            edgeEndX = connectionXOffsetRight;
            arrowIndicatorXPos = edgeStartX + (
                edgeEndX - edgeStartX
            ) / 6;
            // TODO use styling to determine width so that this is flush against the vertex on the right
            scrollX = edgeStartX + (edgeEndX - edgeStartX) * 2 / 3;
        }

        const connectionYOffset = this.props.offsets.connectionLeft.y;
        const arrowIndicatorYPos = connectionYOffset + SvgStyles.getStyles('edgeLine').strokeWidth / 2.0;

        return (
            <g transform={`translate(${this.props.groupPos.x} ${this.props.groupPos.y})`}>
                {showEdgeScollButtons && (
                    <g>
                        <foreignObject width="200" height="18" x={scrollX} y="-22">
                            <div className="pure-button-group" role="group">
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
                        <text className="graph-scroll-summary" x={scrollX + 94} y="-4">
                            ({idxEdge + 1} - {idxLastVisible + 1}) / {numEdges}
                        </text>
                    </g>
                )}
                <g>
                    {visibleEdges.map((edge: Edge, idxNodeObject: number) => {
                        const vertexId = (this.props.edgeDirection === IncidentEdgeDirection.Incoming) ?
                            edge.source : edge.dest;
                        const vertex = this.props.graph.findVertexById(vertexId);
                        const nodeYPosition = idxNodeObject * this.nodeNeight;

                        let edgeStartY = connectionYOffset;
                        if (this.props.edgeDirection === IncidentEdgeDirection.Incoming) {
                            edgeStartY += nodeYPosition;
                        }
                        let edgeEndY = connectionYOffset;
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
                                labelAnchor={this.props.offsets.vertexLabel}
                            />
                        ]);
                    })}
                </g>
                <EdgeDirectionIndicatorObject
                    position={
                        {
                            x: arrowIndicatorXPos + this.props.offsets.arrow.x,
                            y: arrowIndicatorYPos + this.props.offsets.arrow.y
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

    return {
        ...ownProps,
        labelJustification,
        enableScrollUp: idxStartVertex > 0,
        enableScrollDown: (idxStartVertex + ownProps.settings.vertexColumnPageSize) < ownProps.edges.length,
    };
}

// TODO find out how to avoid this cast
const gActions = graphActions.graph as any;

function mapDispatchToProps(dispatch: Dispatch<GlobalState>, ownProps: NeighborGroupContainerInputProps) {
    const commonArgs = [
        ownProps.edges.length,
        ownProps.settings.vertexColumnPageSize,
    ];

    return bindActionCreators({
        onScrollUp: () => gActions.scrollColumn(ScrollDirection.Up, ownProps.edgeDirection, ...commonArgs),
        onScrollDown: () => gActions.scrollColumn(ScrollDirection.Down, ownProps.edgeDirection, ...commonArgs),
    }, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NeighborGroupContainer);
