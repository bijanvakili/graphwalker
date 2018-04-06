import {Point} from '../common/ObjectTypes';
import { GraphData } from '../root/models/Graph';

export interface GraphViewState {
    // data
    graphData: GraphData;

    // navigation
    currVertexId: string;
    currItemIncoming: number;
    currItemOutgoing: number;
}

export interface VisualOffsets {
    connectionLeft: Point;
    connectionRight: Point;
    vertexLabel: Point;
    arrow: Point;
}
