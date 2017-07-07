import * as Backbone from 'backbone';
import { UnrestrictedDictionary } from './types';

import { INavigatorOptions, Navigator} from './routers/Navigator';
import { MainView } from './views/MainView';

const w: UnrestrictedDictionary = window;

function init() {
    const view = new MainView();
    return view.startApplication()
        .then((results: INavigatorOptions) => {
            w.router = new Navigator(results);

            return Backbone.history.start();
        })
        .catch((err: Error) => {
            view.reportError(err.message);
        });
}

w.init = init;
