import {Vertex} from '../root/models/Graph';

export interface UtilsSet {
    findVertex: (vertexId: string) => Vertex;
    queryTypeahead: (query: string) => Vertex[];
}

export interface TypeAheadState {
    query: string;
    results: Vertex[];
    currentSelection?: number;
    utils?: UtilsSet;
}
