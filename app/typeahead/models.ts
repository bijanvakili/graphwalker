import {Vertex} from '../root/models/Graph';

export interface TypeAheadState {
    query: string;
    results: Vertex[];
    currentSelection?: number;
}
