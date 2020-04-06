import * as React from "react";
import * as _ from "lodash";
import { connect } from "react-redux";

import { getSettings } from "../api";
import { onError } from "../errorview/actions";
import { onSettingsLoaded, selectVertex, queryNeighborhood } from "./actions";
import { GlobalState } from "./reducers";
import { extractVertexIdFromHash } from "./selectors";
import TypeAheadContainer from "../typeahead/TypeAheadContainer";
import ErrorViewContainer from "../errorview/ErrorViewContainer";
import NeighborhoodContainer from "./containers/NeighborhoodContainer";
import { RenderSettings } from "./models/Graphwalker";

interface AppMappedProps {
  isGraphReady: boolean;
}

interface AppDispatchProps {
  onError: (error: Error, componentStack?: string) => void;
  onSettingsLoaded: (settings: RenderSettings) => void;
  selectVertex: (vertexId: string) => void;
  queryNeighborhood: (vertexId: string) => void;
}

type AppProps = AppMappedProps & AppDispatchProps;

const GraphWalkerApp: React.FC<AppProps> = (props: AppProps) => {
  // load the graph and application once the app is mounted
  const onHashChange = React.useCallback(() => {
    if (!props.queryNeighborhood) {
      return;
    }

    const hash = window.location.hash;
    if (_.isEmpty(hash)) {
      return;
    }

    props.queryNeighborhood(extractVertexIdFromHash(hash));
    // tslint:disable:align
  }, []);

  React.useEffect(() => {
    const loadApp = async () => {
      try {
        const settings = await getSettings();
        props.onSettingsLoaded(settings);

        // setup the route listener
        window.addEventListener("hashchange", onHashChange, false);
        if (!_.isEmpty(window.location.hash)) {
          onHashChange();
        } else {
          // explicitly set the hash route here to the default start vertex
          props.selectVertex(settings.startVertexId);
        }
        return () => window.removeEventListener("hashchange", onHashChange, false);
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
    const hsaErrored = state.errorSummary.applicationError !== undefined;
    const { neighborhood, currentVertexId } = state.graphView;
    return {
      isGraphReady: !hsaErrored && neighborhood !== undefined && currentVertexId !== undefined,
    };
  }
  return {
    isGraphReady: false,
  };
}

export default connect(mapStateToProps, {
  onError,
  onSettingsLoaded,
  selectVertex,
  queryNeighborhood,
})(GraphWalkerApp);
