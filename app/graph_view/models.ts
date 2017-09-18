import {Point} from '../common/ObjectTypes';
import {Edge, IncidentEdgeDirection, Vertex} from '../root/models/Graph';
import {ImageMetadataMap} from '../root/models/Settings';
import {TextDimensionsFunction} from '../root/models/UI';

export interface GraphViewState {
    // shared constants
    vertexColumnPageSize: number;
    images: ImageMetadataMap;

    // graphics
    connectionYOffset: number;
    connectionXOffsetLeft: number;
    connectionXOffsetRight: number;
    vertexLabelAnchor: Point;

    // navigation
    currVertexId: string;
    currItemIncoming: number;
    currItemOutgoing: number;

    // helper methods
    findVertexById: (id: string) => Vertex;
    getIncidentEdges: (v: string, d: IncidentEdgeDirection) => Edge[];
    getAdjacentVertexIdFromEdge: (e: Edge, d: IncidentEdgeDirection) => string;
    getTextDimensions: TextDimensionsFunction;
}
