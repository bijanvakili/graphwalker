import * as React from 'react';
import {connect} from 'react-redux';

import {Point} from '../../common/ObjectTypes';
import {GlobalState} from '../../root/models/GlobalState';
import {Edge, IncidentEdgeDirection, Vertex} from '../../root/models/Graph';
import {ImageMetadataMap} from '../../root/models/Settings';
import {TextDimensionsFunction} from '../../root/models/UI';
import SvgStyles from '../../SvgStyles';
import {ImageTemplate} from '../components/svg';
import {GraphViewState} from '../models';
import VertexContainer from './VertexContainer';

import NeighborGroupContainer from './NeighborGroupContainer';

interface LocalViewContainerProps {
    // static properties
    images: ImageMetadataMap;

    // main data
    currVertexId: string;
    currItemIncoming: number;
    currItemOutgoing: number;

    // helper functions
    findVertexById: (id: string) => Vertex;
    getTextDimensions: TextDimensionsFunction;
    getIncidentEdges: (vertexId: string, direction: IncidentEdgeDirection) => Edge[];
}

interface LocalViewState {
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
        if (!this.props.currVertexId || !this.props.findVertexById || !this.state) {
            return null;
        }
        const state = this.state as LocalViewState;
        const targetVertex = this.props.findVertexById(this.props.currVertexId);
        const targetLabelMetrics = this.props.getTextDimensions(targetVertex.label);
        const svgWidth = window.innerWidth;
        const textMargin = SvgStyles.getStyles('vertexText').textMargin;
        const canvasMargin = SvgStyles.getStyles('canvasMargin');
        const rectBorderWidth = SvgStyles.getStyles('vertexRect').strokeWidth;
        const targetVertexPos: Point = {
            x: (svgWidth / 2) - (targetLabelMetrics.width / 2),
            y: canvasMargin.top
        };
        const outgoingGroupPos: Point = {
            x: svgWidth - canvasMargin.right - (textMargin * 2) - (rectBorderWidth * 2),
            y: canvasMargin.top
        };

        return (
            <svg
                className="walker-image-container"
                width={svgWidth}
                height={window.innerHeight}
            >
                {/* TODO Move to a separate React.Component so that it doesn't get re-rendered on each route */}
                {/* Image templates */}
                {Object.keys(this.props.images).map((imageFilename: string) => {
                    const metadata = this.props.images[imageFilename];
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
                    />

                    {/* Neighbors */}
                    <NeighborGroupContainer
                        edgeDirection={IncidentEdgeDirection.Incoming}
                        edges={state.incomingEdges}
                        groupPos={{x: canvasMargin.left, y: canvasMargin.top}}
                        targetVertexX={targetVertexPos.x}
                        currItem={this.props.currItemIncoming}
                    />

                    <NeighborGroupContainer
                        edgeDirection={IncidentEdgeDirection.Outgoing}
                        edges={state.outgoingEdges}
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
        const getIncidentEdges = props.getIncidentEdges;
        if (!newVertexId || currVertex === newVertexId || !getIncidentEdges) {
            return;
        }

        this.setState({
            currVertexId: newVertexId,
            incomingEdges: getIncidentEdges(newVertexId, IncidentEdgeDirection.Incoming),
            outgoingEdges: getIncidentEdges(newVertexId, IncidentEdgeDirection.Outgoing),
        });
    }
}

function mapStateToProps(state: GlobalState): LocalViewContainerProps {
    const graphState = state.graphState as GraphViewState;

    return {
        images: graphState.images,

        currVertexId: graphState.currVertexId,
        currItemIncoming: graphState.currItemIncoming,
        currItemOutgoing: graphState.currItemOutgoing,

        findVertexById: graphState.findVertexById,
        getTextDimensions: graphState.getTextDimensions,
        getIncidentEdges: graphState.getIncidentEdges,
    };
}

export default connect(mapStateToProps)(LocalViewContainer);
