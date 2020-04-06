import * as React from "react";
import { IncidentEdgeDirection, Justification, VertexScrollDirection } from "../constants";
import { VertexPaginatorComponent } from "../components/VertexPaginatorComponent";
import { onScrollVertices } from "../actions";
import { GlobalState } from "../reducers";
import { getVertexPageSummary, canScrollDown } from "../selectors";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";

interface VertexPaginatorContainerOwnProps {
  justification: Justification;
  vertexType: IncidentEdgeDirection;
}

interface VertexPaginatorContainerMappedProps {
  isUpEnabled: boolean;
  isDownEnabled: boolean;
  summary: string;
}

interface VertexpaginatorContainerDispatchProps {
  onClickUp: () => void;
  onClickDown: () => void;
}

type VertexPaginatorContainerProps = VertexPaginatorContainerOwnProps &
  VertexPaginatorContainerMappedProps &
  VertexpaginatorContainerDispatchProps;

const VertexPaginatorContainer: React.FC<VertexPaginatorContainerProps> = (
  props: VertexPaginatorContainerProps
) => <VertexPaginatorComponent {...props} />;

function mapStateToProps(state: GlobalState, ownProps: VertexPaginatorContainerOwnProps) {
  return {
    isUpEnabled: state.graphView.currentScrollPositions[ownProps.vertexType] > 0,
    isDownEnabled: canScrollDown(state.graphView)[ownProps.vertexType],
    summary: getVertexPageSummary(state.graphView)[ownProps.vertexType],
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>, ownProps: VertexPaginatorContainerOwnProps) {
  return {
    onClickUp: () =>
      dispatch(
        onScrollVertices({ groupType: ownProps.vertexType, scrollDirection: VertexScrollDirection.Up })
      ),
    onClickDown: () =>
      dispatch(
        onScrollVertices({ groupType: ownProps.vertexType, scrollDirection: VertexScrollDirection.Down })
      ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VertexPaginatorContainer);
