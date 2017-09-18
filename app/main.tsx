import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { UnrestrictedDictionary } from './common/ObjectTypes';

import { AppContainer } from './root/containers/AppContainer';

const w: UnrestrictedDictionary = window;

function init() {
    // initialize React
    ReactDOM.render(
        <AppContainer compiler="TypeScript" framework="React" />,
        document.getElementsByClassName('react-container')[0]
    );
}

w.init = init;
