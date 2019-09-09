import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';

import { fetchGraphData, fetchSettings } from '../api';
import { onError } from '../errorview/actions';
import { onSettingsLoaded, onGraphLoaded, selectVertex, onVertexSelected } from './actions';
import { GlobalState } from './reducers';
import { extractVertexIdFromHash } from './selectors';
import TypeAheadContainer from '../typeahead/TypeAheadContainer';
import ErrorViewContainer from '../errorview/ErrorViewContainer';
import NeighborhoodContainer from './containers/NeighborhoodContainer';
import { Settings } from './models/Settings';
import { Graph } from './models/Graph';

interface AppMappedProps {
  isGraphReady: boolean;
}

interface AppDispatchProps {
  onError: (error: Error, componentStack?: string) => void;
  onSettingsLoaded: (settings: Settings) => void;
  onGraphLoaded: (graph: Graph) => void;
  selectVertex: (vertexId: string) => void;
  onVertexSelected: (vertexId: string) => void;
}

type AppProps = AppMappedProps & AppDispatchProps;

const GraphWalkerApp: React.FC<AppProps> = (props: AppProps) => {
  // load the graph and application once the app is mounted
  const onHashChange = React.useCallback(() => {
    if (!props.onGraphLoaded) {
      return;
    }

    const hash = window.location.hash;
    if (_.isEmpty(hash)) {
      return;
    }

    props.onVertexSelected(extractVertexIdFromHash(hash));
    // tslint:disable:align
  }, []);

  React.useEffect(() => {
    const loadApp = async () => {
      try {
        const settings = await fetchSettings();
        props.onSettingsLoaded(settings);

        const graphData = await fetchGraphData(settings.graph.url);
        const graph = new Graph(graphData);
        props.onGraphLoaded(graph);

        // setup the route listener
        window.addEventListener('hashchange', onHashChange, false);
        if (!_.isEmpty(window.location.hash)) {
          onHashChange();
        } else {
          // explicitly set the hash route here to the default start vertex
          props.selectVertex(settings.graph.startVertexId);
        }
        return () => window.removeEventListener('hashchange', onHashChange, false);
      } catch (error) {
        props.onError(error);
      }
    };
    loadApp();
    // tslint:disable:align
  }, []);

  return (
    <ErrorViewContainer>
      <TypeAheadContainer />
      {props.isGraphReady && <NeighborhoodContainer />}
    </ErrorViewContainer>
  );
};

function mapStateToProps(state: GlobalState) {
  if (state.graphView) {
    const { graph, currentVertexId } = state.graphView;
    return {
      isGraphReady: graph !== undefined && currentVertexId !== undefined
    };
  }
  return {
    isGraphReady: false
  };
}

export default connect(
  mapStateToProps,
  { onError, onSettingsLoaded, onGraphLoaded, selectVertex, onVertexSelected }
)(GraphWalkerApp);
