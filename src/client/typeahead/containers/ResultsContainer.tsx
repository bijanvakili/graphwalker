import classnames from "classnames";
import * as React from "react";
import { connect } from "react-redux";

import { ResultItemComponent } from "../components/ResultItemComponent";
import { ElementMouseEvent } from "../../types/EventTypes";
import { selectVertex } from "../../graphwalker/actions";
import { GlobalState } from "../../graphwalker/reducers";

import "../TypeAhead.less";
import { ResultItemData } from "../models";
import { getResultItems } from "../selectors";

interface ResultsContainerMappedProps {
  results: ResultItemData[];
  currentSelection?: number;
}

interface ResultsContainerDispatchProps {
  selectVertex: (vertexId: string) => void;
}

type ResultsContainerProps = ResultsContainerMappedProps & ResultsContainerDispatchProps;

const ResultsContainer: React.FC<ResultsContainerProps> = (props: ResultsContainerProps) => {
  return (
    <div className="dropdown typeahead-results-container">
      <div className={classnames("dropdown-menu", { show: props.results.length > 0 })} tabIndex={-1}>
        {props.results.map((vertex, idx) => (
          <ResultItemComponent
            key={vertex.vertexId}
            displayName={vertex.displayName}
            isSelected={props.currentSelection === idx}
            onClick={(e: ElementMouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              props.selectVertex(vertex.vertexId);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    results: getResultItems(state.typeahead.results),
    currentSelection: state.typeahead.currentSelection,
  };
};

export default connect(mapStateToProps, { selectVertex })(ResultsContainer);
