import * as React from 'react';
import { Graph } from '../models/Graph';
import { Settings } from '../models/Settings';

import { SubgraphRenderer, VertexSelectedCallback } from './SubgraphRenderer';

interface SubgraphRenderComponentProps {
  graph: Graph;
  settings: Settings;
  currentVertexId: string;
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
      graph: props.graph,
      onClickVertex: props.selectVertex
    });
    subgraphRenderer.render(props.currentVertexId, {
      incoming: props.currentIncomingVertex,
      outgoing: props.currentOutgoingVertex
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
