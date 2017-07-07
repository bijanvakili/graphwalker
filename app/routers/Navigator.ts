import * as Backbone from 'backbone';

import { navigatorChannel } from '../EventHandlers';
import { Graph, VertexTarget } from '../models/GraphData';
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
            ':appName/:modelName':  'moveToQualifiedVertex',
            ':modelName':           'moveToUnqualifiedVertex',
            '':                     'moveToStartVertex',
        };
        super({routes});
        this.settings = options.settings;
        this.graph = options.graph;
        this.view = options.mainView;
    }

    public initialize(options: INavigatorOptions) {
        this.listenTo(navigatorChannel, 'vertex:selected', this.onVertexSelected);
    }

    private moveToStartVertex() {
        const startNode: VertexTarget = this.settings.get('start');

        this.onMove(startNode.appName, startNode.modelName);
    }

    private moveToQualifiedVertex(appName: string, modelName: string) {
        this.onMove(appName, modelName);
    }

    private moveToUnqualifiedVertex(modelName: string) {
        const defaultApp = this.settings.get('start').appName;
        this.onMove(defaultApp, modelName);
    }

    private onMove(appName: string, modelName: string) {
        this.view.renderAtTarget({appName, modelName});
    }

    private onVertexSelected(vertexModel: Backbone.Model) {
        Backbone.history.navigate(
            vertexModel.get('appName') + '/' + vertexModel.get('modelName'),
            true,
        );
    }
}
