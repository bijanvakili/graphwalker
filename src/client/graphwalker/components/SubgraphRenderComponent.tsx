import * as React from "react";
import { RenderSettings, Neighborhood } from "../models/Graphwalker";

import { SubgraphRenderer, VertexSelectedCallback } from "./SubgraphRenderer";

interface SubgraphRenderComponentProps {
  neighborhood: Neighborhood;
  settings: RenderSettings;
  currentIncomingVertex: number;
  currentOutgoingVertex: number;
  selectVertex: VertexSelectedCallback;
}

export const SubgraphRenderComponent: React.FC<SubgraphRenderComponentProps> = (
  props: SubgraphRenderComponentProps
) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  React.useEffect(() => {
    // on mount/update, render the graph
    const subgraphRenderer = new SubgraphRenderer({
      svg: svgRef.current as SVGSVGElement,
      settings: props.settings,
      vertexNeighborhood: props.neighborhood,
      onClickVertex: props.selectVertex,
    });
    subgraphRenderer.render({
      incoming: props.currentIncomingVertex,
      outgoing: props.currentOutgoingVertex,
    });
    return () => {
      subgraphRenderer.remove();
    };
  });
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
