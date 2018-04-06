import {createHashHistory, History} from 'history';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';

import {UnrestrictedDictionary} from '../../common/ObjectTypes';
import ErrorViewContainer from '../../error_view/containers';
import LocalViewContainer from '../../graph_view/containers/LocalViewContainer';
import TypeAheadContainer from '../../typeahead/containers/TypeAheadContainer';
import actions from '../actions';
import {fetchGraphData, fetchSettings} from '../api';
import {TextMeasure, TextMeasureComponent} from '../components/TextMeasureComponent';
import {GlobalState} from '../models/GlobalState';
import {Settings} from '../models/Settings';
import makeRootReducer from '../reducers';
import VertexDispatchContainer from './VertexDispatchContainer';

type Window = UnrestrictedDictionary;
const enhanceStoreDevTools = (w: Window) =>
    w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__();

export interface AppContainerProps {
    compiler: string;
    framework: string;
}

interface AppContainerState {
    settings: Settings;
}

export class AppContainer extends React.Component<AppContainerProps, AppContainerState> {
    private store: Store<GlobalState>;
    private history: History;
    private textMeasure: TextMeasure;

    public componentWillMount() {
        this.history = createHashHistory();
        const middleWare = [thunk, routerMiddleware(this.history)];
        this.store = createStore(
            makeRootReducer(),
            compose(applyMiddleware(...middleWare), enhanceStoreDevTools(window))
        ) as Store<GlobalState>;
        this.textMeasure = new TextMeasure();
    }

    public render() {
        const settings = this.state && this.state.settings;

        return (
            <Provider store={ this.store }>
                <ConnectedRouter history={this.history}>
                    <div>
                        <div className="hud-view">
                            <TypeAheadContainer/>
                            <ErrorViewContainer />
                        </div>

                        <div className="main-view">
                            <div className="walker-container">
                                <Route path="/vertex/:vertexId" component={VertexDispatchContainer} />
                                {settings && this.textMeasure.isReady() && (
                                    <LocalViewContainer
                                        settings={settings}
                                        textMeasure={this.textMeasure}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="offscreen">
                            <TextMeasureComponent
                                textMeasure={this.textMeasure}
                                width={window.innerWidth}
                            />
                        </div>
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
                const graphData  = await fetchGraphData(settings.graph.url);
                dispatch(rootActions.onGraphDataLoaded(graphData));
                this.setState((prevState, props) => ({
                    ...prevState,
                    settings,
                }));

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
