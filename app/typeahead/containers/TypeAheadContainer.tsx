import * as React from 'react';

import TypeAheadResultsContainer from './TypeAheadResultsContainer';
import TypeAheadTextEntryContainer from './TypeAheadTextEntryContainer';

export default class TypeAheadContainer extends React.Component {
    public render() {
        return (
            <div className="typeahead-container">
                <TypeAheadTextEntryContainer />
                <TypeAheadResultsContainer />
            </div>
        );
    }
}
