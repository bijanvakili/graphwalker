import {UnrestrictedDictionary} from '../../common/ObjectTypes';

export interface Vertex {
    id: string;
    label: string;
    searchableComponents: string[];
    properties: UnrestrictedDictionary;
}

export interface Edge {
    id: string;
    label: string;
    source: string;
    dest: string;
    properties: UnrestrictedDictionary;
}

export interface Graph {
    vertices: Vertex[];
    edges: Edge[];
}

export enum IncidentEdgeDirection {
    Incoming = 'incoming',
    Outgoing = 'outgoing',
}

export enum ScrollDirection {
    Up = 'up',
    Down = 'down',
}
