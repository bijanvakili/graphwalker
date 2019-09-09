import { Point } from '../../types/ObjectTypes';

export interface ImageInfo {
  filename: string;
  height: number;
  width: number;
}

export interface ImageMetadataMap {
  [key: string]: ImageInfo;
}

export interface RelativePositionMap {
  [key: string]: Point;
}

export interface Settings {
  graph: {
    url: string;
    startVertexId: string;
  };
  images: ImageMetadataMap;
  vertexColumnPageSize: number;
}
