/// <reference types="jquery" />

import * as Backbone from 'backbone';
import * as P from 'bluebird';
import * as _ from 'lodash';

import { Graph } from '../models/GraphData';
import { Settings } from '../models/Settings';
import { LocalizedGraphView } from './DirectNeighborView';
import { ErrorView } from './ErrorView';
import { TextMeasureView } from './TextMeasureView';
import { IGraphWithTypeAhead, TypeAheadView } from './TypeAheadView';

interface ApplicationStartData {
    settings: Settings;
    graph: Graph;
    mainView: MainView;
}

export class MainView extends Backbone.View<Graph> {
    public reportError: (errorMessage: string) => void;

    private errorView: ErrorView;
    private graphView: LocalizedGraphView;
    private settings: Settings;
    private textMeasureView: TextMeasureView;
    private typeAheadView: TypeAheadView;

    constructor() {
        super({
            el: '.main-view',
        });
        this.errorView = new ErrorView();
        this.reportError = this.errorView.registerEmitter(this);
    }

    /**
     * Starts the application by fetching the server side data
     */
    public startApplication(): Promise<ApplicationStartData> {
        const self = this;
        const settings = new Settings();
        self.settings = settings;

        let graph: Graph;

        return P.resolve(settings.fetch())
            .catch((err) => {
                self.rethrowFetchError(settings, err);
            })
            .then(() => {
                graph = new Graph({}, {
                    url: settings.get('graph').url,
                });
                return P.resolve(graph.fetch())
                    .catch((err) => {
                        self.rethrowFetchError(graph, err);
                    });
            })
            .then(() => {
                self.model = graph;
                return {
                    settings,
                    graph,
                    mainView: self
                };
            });
    }

    public renderAtTarget(vertexId: string): MainView {
        if (!this.textMeasureView) {
            this.textMeasureView = new TextMeasureView();
            this.textMeasureView.render();
        }

        if (!this.typeAheadView) {
            this.typeAheadView = new TypeAheadView({model: (this.model as IGraphWithTypeAhead)});
            this.typeAheadView.render();
        }

        if (!this.graphView) {
            this.graphView = new LocalizedGraphView({
                model: this.model,
                errorView: this.errorView,
                textMeasureView: this.textMeasureView,
                vertexColumnPageSize: this.settings.get('vertexColumnPageSize')
            });
        }
        else {
            this.graphView.clearContents();
        }

        this.graphView.renderWithPromise(vertexId);
        return this;
    }

    /**
     * Rethrows a HTTP error from the Backbone.Model.fetch()
     * @throws Error
     */
    private rethrowFetchError(model: Backbone.Model, err: Error) {
        const urlRoot = _.isFunction(model.urlRoot) ? model.urlRoot() : model.urlRoot;
        const message = (err as any).statusText || err.message;

        throw new Error('Unable to fetch URL ' + urlRoot + ': ' + message);
    }
}
