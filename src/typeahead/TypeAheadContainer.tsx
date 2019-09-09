import * as React from 'react';

import './TypeAhead.less';
import TextEntryContainer from './containers/TextEntryContainer';
import ResultsContainer from './containers/ResultsContainer';

const TypeAheadContainer: React.FC<{}> = (props: {}) => (
  <div className="container-fluid'">
    <TextEntryContainer />
    <ResultsContainer />
  </div>
);

export default TypeAheadContainer;
