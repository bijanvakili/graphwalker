import * as React from 'react';
import {connect} from 'react-redux';

import {Point} from '../../common/ObjectTypes';
import {TextMeasure} from '../../root/components/TextMeasureComponent';
import {GlobalState} from '../../root/models/GlobalState';
import {Edge, Graph, IncidentEdgeDirection} from '../../root/models/Graph';
import {Settings} from '../../root/models/Settings';
import SvgStyles from '../../SvgStyles';
import {ImageTemplate} from '../components/svg';
import {GraphViewState, VisualOffsets} from '../models';
import NeighborGroupContainer from './NeighborGroupContainer';
import VertexContainer from './VertexContainer';

interface LocalViewContainerInputProps {
    settings: Settings;
    textMeasure: TextMeasure;
}

interface LocalViewContainerProps extends LocalViewContainerInputProps {
    // mapped redux props
    graph: Graph;
    currVertexId: string;
    currItemIncoming: number;
    currItemOutgoing: number;
}

interface LocalViewState {
    // cached state
    currVertexId: string;
    incomingEdges: Edge[];
    outgoingEdges: Edge[];
}

class LocalViewContainer extends React.Component<LocalViewContainerProps, LocalViewState> {
    public componentDidMount() {
        this.cacheVertexState(this.props);
    }

    public componentWillReceiveProps(nextProps: LocalViewContainerProps) {
        this.cacheVertexState(nextProps);
    }

    public render() {
        if (!this.props.currVertexId || !this.state) {
            return null;
        }
        const state = this.state as LocalViewState;
        const images = this.props.settings.images;
        const targetVertex = this.props.graph.findVertexById(this.props.currVertexId);
        const targetLabelMetrics = this.props.textMeasure.getTextDimensions(targetVertex.label);
        const svgWidth = window.innerWidth;
        const vertexTextStyle = SvgStyles.getStyles('vertexText');
        const canvasMargin = SvgStyles.getStyles('canvasMargin');
        const rectBorderWidth = SvgStyles.getStyles('vertexRect').strokeWidth;
        const targetVertexPos: Point = {
            x: (svgWidth / 2) - (targetLabelMetrics.width / 2),
            y: canvasMargin.top
        };
        const outgoingGroupPos: Point = {
            x: svgWidth - canvasMargin.right - (vertexTextStyle.textMargin * 2) - (rectBorderWidth * 2),
            y: canvasMargin.top
        };

        const iconDimensions = images['basic_node.svg'];
        const arrowDimensions = images['arrow.svg'];
        const vertexIconStyle = SvgStyles.getStyles('vertexIcon');
        const connectionYOffset = ((vertexIconStyle.y + iconDimensions.height) / 2.0) + 1;
        const offsets: VisualOffsets = {
            arrow: {
                x: -0.5 * (arrowDimensions.width + 1),
                y: -0.5 * (arrowDimensions.height + 1)
            },
            connectionLeft: {x: vertexIconStyle.x, y: connectionYOffset},
            connectionRight: {x: iconDimensions.width, y: connectionYOffset},
            vertexLabel: {
                x: vertexTextStyle.x + iconDimensions.width / 2.0,
                y: vertexTextStyle.y + iconDimensions.height
            },
        };

        return (
            <svg
                className="walker-image-container"
                width={svgWidth}
                height={window.innerHeight}
            >
                {/* TODO Move to a separate React.Component so that it doesn't get re-rendered on each route */}
                {/* Image templates */}
                {Object.keys(images).map((imageFilename: string) => {
                    const metadata = images[imageFilename];
                    return (
                        <ImageTemplate
                            id={imageFilename}
                            key={imageFilename}
                            href={`images/${imageFilename}`}
                            width={metadata.width}
                            height={metadata.height}
                        />
                    );
                })}
                <g>
                    {/* Central Node */}
                    <VertexContainer
                        vertex={targetVertex}
                        x={targetVertexPos.x}
                        y={targetVertexPos.y}
                        labelAnchor={offsets.vertexLabel}
                    />

                    {/* Neighbors */}
                    <NeighborGroupContainer
                        graph={this.props.graph}
                        settings={this.props.settings}
                        edgeDirection={IncidentEdgeDirection.Incoming}
                        edges={state.incomingEdges}
                        offsets={offsets}
                        groupPos={{x: canvasMargin.left, y: canvasMargin.top}}
                        targetVertexX={targetVertexPos.x}
                        currItem={this.props.currItemIncoming}
                    />

                    <NeighborGroupContainer
                        graph={this.props.graph}
                        settings={this.props.settings}
                        edgeDirection={IncidentEdgeDirection.Outgoing}
                        edges={state.outgoingEdges}
                        offsets={offsets}
                        groupPos={outgoingGroupPos}
                        targetVertexX={targetVertexPos.x}
                        currItem={this.props.currItemOutgoing}
                    />
                </g>
            </svg>
        );
    }

    private cacheVertexState(props: LocalViewContainerProps) {
        const newVertexId = props.currVertexId;
        const currVertex = this.state && this.state.currVertexId;
        const graph = this.props.graph;
        if (!newVertexId || currVertex === newVertexId || !graph) {
            return;
        }

        this.setState({
            currVertexId: newVertexId,
            incomingEdges: graph.getIncidentEdges(newVertexId, IncidentEdgeDirection.Incoming),
            outgoingEdges: graph.getIncidentEdges(newVertexId, IncidentEdgeDirection.Outgoing),
        });
    }
}

function mapStateToProps(state: GlobalState, ownProps: LocalViewContainerInputProps): LocalViewContainerProps {
    const graphState = state.graphState as GraphViewState;

    return {
        ...ownProps,
        graph: new Graph(graphState.graphData),
        currVertexId: graphState.currVertexId,
        currItemIncoming: graphState.currItemIncoming,
        currItemOutgoing: graphState.currItemOutgoing,
    };
}

export default connect(mapStateToProps)(LocalViewContainer);
