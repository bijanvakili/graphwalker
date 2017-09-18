import {createBrowserHistory, createHashHistory, History} from 'history';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';

import {UnrestrictedDictionary} from '../../common/ObjectTypes';
import actions from '../actions';
import {GlobalState} from '../models/GlobalState';
import makeRootReducer from '../reducers';

import {fetchGraph, fetchSettings} from '../api';

import ErrorViewContainer from '../../error_view/containers';
import LocalViewContainer from '../../graph_view/containers/LocalViewContainer';
import TypeAheadResultsContainer from '../../typeahead/containers/TypeAheadResultsContainer';
import TypeAheadTextEntryContainer from '../../typeahead/containers/TypeAheadTextEntryContainer';
import OffscreenUtilsContainer from './OffscreenUtilsContainer';
import VertexDispatchContainer from './VertexDispatchContainer';

type Window = UnrestrictedDictionary;
const enhanceStoreDevTools = (w: Window) =>
    w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__();

export interface AppContainerProps {
    compiler: string;
    framework: string;
}

export class AppContainer extends React.Component<AppContainerProps, GlobalState> {
    private store: Store<GlobalState>;
    private history: History;

    public componentWillMount() {
        this.history = createHashHistory();
        const middleWare = [thunk, routerMiddleware(this.history)];
        this.store = createStore(
            makeRootReducer(),
            compose(applyMiddleware(...middleWare), enhanceStoreDevTools(window))
        ) as Store<GlobalState>;
    }

    public render() {
        return (
            <Provider store={ this.store }>
                <ConnectedRouter history={this.history}>
                    <div>
                        <div className="hud-view">
                            <div className="typeahead-container">
                                <TypeAheadTextEntryContainer />
                                <TypeAheadResultsContainer />
                            </div>
                            <div className="error-container">
                                <ErrorViewContainer />
                            </div>
                        </div>

                        <div className="main-view">
                            <div className="walker-container">
                                <Route path="/vertex/:vertexId" component={VertexDispatchContainer} />
                                <LocalViewContainer />
                            </div>
                        </div>

                        <OffscreenUtilsContainer />
                    </div>
                </ConnectedRouter>
            </Provider>
        );
    }

    public componentDidMount() {
        // TODO find out how to avoid this cast
        const rootActions = actions.root as any;

        this.store.dispatch(async (dispatch) => {
            try {
                // TODO add action for progress indicator
                const settings = await fetchSettings();
                const graph  = await fetchGraph(settings.graph.url);

                dispatch(rootActions.allDataLoaded(settings, graph));

                // route to start vertex if the router did not already select one
                const graphState = this.store.getState().graphState;
                const currVertexId = graphState && graphState.currVertexId;
                if (!currVertexId) {
                    dispatch(rootActions.selectVertex(settings.graph.startVertexId));
                }
            }
            catch (err) {
                dispatch(rootActions.error(err));
            }
        });
    }
}
