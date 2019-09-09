import * as React from 'react';
import { Justification, VertexScrollDirection } from '../constants';
import { VertexPaginatorComponent } from '../components/VertexPaginatorComponent';
import { IncidentEdgeDirection } from '../models/Graph';
import { onScrollVertices } from '../actions';
import { GlobalState } from '../reducers';
import { getVertexPageSummary, canScrollDown } from '../selectors';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';

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
  const currentVertexIndex =
    ownProps.vertexType === IncidentEdgeDirection.Incoming
      ? state.graphView.currentIncomingVertex
      : state.graphView.currentOutgoingVertex;

  return {
    isUpEnabled: currentVertexIndex > 0,
    isDownEnabled: canScrollDown(state.graphView, ownProps.vertexType, currentVertexIndex),
    summary: getVertexPageSummary(state.graphView, ownProps.vertexType)
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
      )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VertexPaginatorContainer);
