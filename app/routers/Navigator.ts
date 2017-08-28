import * as Backbone from 'backbone';

import { navigatorChannel } from '../EventHandlers';
import { Graph } from '../models/GraphData';
import { Settings } from '../models/Settings';
import { MainView } from '../views/MainView';

export interface INavigatorOptions extends Backbone.RouterOptions {
    settings: Settings;
    graph: Graph;
    mainView: MainView;
}

export class Navigator extends Backbone.Router {
    private settings: Settings;
    private graph: Graph;
    private view: MainView;

    constructor(options: INavigatorOptions) {
        const routes = {
            ':vertexId':  'onMoveToVertex',
            '':           'onMoveToStartVertex',
        };
        super({routes});
        this.settings = options.settings;
        this.graph = options.graph;
        this.view = options.mainView;
    }

    public initialize(options: INavigatorOptions) {
        this.listenTo(navigatorChannel, 'vertex:selected', this.onVertexSelected);
    }

    private onMoveToStartVertex() {
        this.onMoveToVertex(this.settings.get('graph').startVertexId);
    }

    private onMoveToVertex(vertexId: string) {
        this.view.renderAtTarget(vertexId);
    }

    private onVertexSelected(vertexId: string) {
        Backbone.history.navigate(vertexId, {trigger: true});
    }
}
