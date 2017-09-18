export interface TextDimensions {
    width: number;
    height: number;
}

export type TextDimensionsFunction = (s: string) => TextDimensions;
