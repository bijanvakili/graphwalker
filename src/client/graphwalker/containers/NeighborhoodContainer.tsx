import * as React from "react";
import { connect } from "react-redux";

import { IncidentEdgeDirection, Justification } from "../constants";
import { RenderSettings, Neighborhood } from "../models/Graphwalker";
import { GlobalState } from "../reducers";

import VertexPaginatorContainer from "./VertexPaginatorContainer";
import { selectVertex } from "../actions";
import { SubgraphRenderComponent } from "../components/SubgraphRenderComponent";
import { ItemSelectedCallback } from "graphwalker-renderer";
import { IncidentEdgeMetrics, IncidentEdgeFlags } from "../models/GraphViewState";
import { getIncidentEdgeCounts } from "../selectors";

import "../GraphComponents.less";

interface NeighborhoodContainerMappedProps {
  neighborhood: Neighborhood;
  settings: RenderSettings;
  currentVertexId: string;
  currentScrollPositions: IncidentEdgeMetrics;
  showPaginator: IncidentEdgeFlags;
}

interface NeighborHoodContainerDispatchProps {
  selectVertex: ItemSelectedCallback;
}

type NeighborhoodContainerProps = NeighborhoodContainerMappedProps & NeighborHoodContainerDispatchProps;

// decouple react/redux from d3 via component mounting/update (via useEffect hook)
const NeighborhoodContainer: React.FC<NeighborhoodContainerProps> = (props: NeighborhoodContainerProps) => {
  return (
    <div className="container-fluid mt-3">
      <div className="row justify-content-between">
        <div className="col-2">
          {props.showPaginator.incoming && (
            <VertexPaginatorContainer
              justification={Justification.Left}
              vertexType={IncidentEdgeDirection.Incoming}
            />
          )}
        </div>
        <div className="col-2">
          {props.showPaginator.outgoing && (
            <VertexPaginatorContainer
              justification={Justification.Right}
              vertexType={IncidentEdgeDirection.Outgoing}
            />
          )}
        </div>
      </div>
      <SubgraphRenderComponent
        neighborhood={props.neighborhood}
        settings={props.settings}
        currentIncomingVertex={props.currentScrollPositions.incoming}
        currentOutgoingVertex={props.currentScrollPositions.outgoing}
        selectVertex={props.selectVertex}
      />
    </div>
  );
};

function mapStateToProps(state: GlobalState) {
  const settings = state.graphView.settings;
  const { neighborhood, currentVertexId, currentScrollPositions } = state.graphView;
  const edgeCounts = getIncidentEdgeCounts(state.graphView);
  if (settings && neighborhood && currentVertexId) {
    return {
      neighborhood,
      settings,
      currentVertexId,
      currentScrollPositions,
      showPaginator: {
        incoming: edgeCounts.incoming > settings.vertexColumnPageSize,
        outgoing: edgeCounts.outgoing > settings.vertexColumnPageSize,
      },
    };
  }
}

export default connect(mapStateToProps, { selectVertex })(React.memo(NeighborhoodContainer));
