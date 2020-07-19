import * as React from "react";
import {
  RenderSettings as ApiRenderSettings,
  Neighborhood,
  Vertex as ApiVertex,
} from "../models/Graphwalker";
import { getVertexRenderData, getEdgeRenderData } from "../selectors";

import {
  makeRenderer,
  RenderSettings,
  Edge as RenderEdge,
  ItemSelectedCallback,
  VertexImage,
  Vertex as RendererVertex,
} from "graphwalker-renderer";

import "images/arrow.svg";
import "images/basic_node.svg";
import "../GraphComponents.less";

interface SubgraphRenderComponentProps {
  neighborhood: Neighborhood;
  settings: ApiRenderSettings;
  currentIncomingVertex: number;
  currentOutgoingVertex: number;
  selectVertex: ItemSelectedCallback;
}

interface VertexByIdMap {
  [key: string]: RendererVertex;
}
interface VertexImageMap {
  [key: string]: VertexImage;
}

export const SubgraphRenderComponent: React.FC<SubgraphRenderComponentProps> = (
  props: SubgraphRenderComponentProps
) => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  const edges = React.useMemo<RenderEdge[]>(() => props.neighborhood.edges.map(getEdgeRenderData), [
    props.neighborhood.id,
  ]);

  const renderSettings = React.useMemo<RenderSettings>(() => {
    const verticesById: VertexByIdMap = props.neighborhood.vertices.reduce(
      (accum, v: ApiVertex) => ({
        ...accum,
        [v.id]: getVertexRenderData(v),
      }),
      {}
    );

    const images: VertexImageMap = props.settings.images.reduce(
      (accum, img) => ({
        ...accum,
        [img.name]: {
          ...img,
          id: img.name,
        },
      }),
      {}
    );

    return {
      targetVertex: props.neighborhood.id,
      vertexColumnPageSize: props.settings.vertexColumnPageSize,
      getVertexImageById: (id: string) => images[id],
      onVertexSelected: props.selectVertex,
      getVertexById: (id: string): RendererVertex => verticesById[id],
    };
    // tslint:disable-next-line:align
  }, [props.neighborhood.id]);

  React.useEffect(() => {
    const renderer = makeRenderer({
      settings: renderSettings,
      graph: { edges },
      svg: svgRef.current as SVGSVGElement,
    });

    renderer.render({
      incoming: props.currentIncomingVertex,
      outgoing: props.currentOutgoingVertex,
    });
    return () => {
      renderer.remove();
    };
    // tslint:disable-next-line:align
  }, [props.neighborhood.id, props.currentIncomingVertex, props.currentOutgoingVertex]);

  return (
    <div className="row graph-root-container">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};
