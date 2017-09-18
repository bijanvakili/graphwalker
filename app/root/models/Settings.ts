export interface ImageDimensions {
    height: number;
    width: number;
}

export interface ImageMetadataMap {
    [key: string]: ImageDimensions;
}

export interface Settings {
    graph: {
        url: string;
        startVertexId: string;
    };
    images: ImageMetadataMap;
    vertexColumnPageSize: number;
}
