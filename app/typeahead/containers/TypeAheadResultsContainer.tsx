import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import {ElementMouseEvent} from '../../common/EventTypes';
import rootActions from '../../root/actions';
import {GlobalState} from '../../root/models/GlobalState';
import {ResultItemComponent} from '../components';

interface ResultItemData {
    displayName: string;
    vertexId: string;
}

interface ResultsContainerProps {
    data: {
        results: ResultItemData[];
        // NOTE: using ? suffix doesn't seem to work
        currentSelection: number | undefined;
    };
    actions: {
        onItemSelected: ActionFunctionAny<{vertexId: string}>;
    };
}

class ResultsContainer extends React.Component<ResultsContainerProps> {
    public render() {
        const hasResults: boolean = this.props.data.results.length > 0;
        return (
            <div className={'typeahead-results-container' + (hasResults ? ' active' : '')} tabIndex={-1}>
                {this.props.data.results.map((vertex, idx) => (
                    <ResultItemComponent
                        key={vertex.vertexId}
                        data={
                            {
                                displayName: vertex.displayName,
                                isSelected: this.props.data.currentSelection === idx
                            }
                        }
                        callbacks={
                            {
                                onClick: (e: ElementMouseEvent) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    this.props.actions.onItemSelected(vertex.vertexId);
                                }
                            }
                        }
                    />
                ))}
            </div>
        );
    }
}

const mapStateToProps = (state: GlobalState) => {
    const typeaheadState = state.typeaheadState;
    if (!typeaheadState) {
        throw new Error('mapStateToProps called prematurely');
    }

    return {
        data: {
            results: typeaheadState.results.map((v) => {
                return {displayName: v.label, vertexId: v.id };
            }),
            currentSelection: typeaheadState.currentSelection,
        }
    };
};

// TODO find out how to avoid this cast
const rActions = (rootActions as any).root;

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>) => {
    return {
        actions: bindActionCreators({
            onItemSelected: (vertexId: string) => rActions.selectVertex(vertexId),
        }, dispatch)
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResultsContainer);
