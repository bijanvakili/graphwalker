import * as _ from 'lodash';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import {
    InputClipboardEvent,
    InputKeyboardEvent,
    InputKeyboardEventHandler,
} from '../../common/EventTypes';
import rootActions from '../../root/actions';
import {GlobalState} from '../../root/models/GlobalState';
import {typeaheadActions, TypeAheadSelectDirection} from '../actions';
import {TextEntryComponent} from '../components';

interface TextEntryContainerProps {
    query: string;
    actions: {
        queryAction: ActionFunctionAny<{query: string}>,
        itemMoveAction: ActionFunctionAny<{direction: TypeAheadSelectDirection}>,
        resetAction: ActionFunctionAny<{}>,
        submitAction: () =>
            (dispatch: Dispatch<GlobalState>, getState: () => GlobalState) => ActionFunctionAny<{}>,
    };
}

const QUERY_INPUT_DELAY = 250;
const IGNORE_KEYUP_KEYS = ['Alt', 'Control', 'Shift', 'ArrowUp', 'ArrowDown', 'Escape', 'Enter'];

type KeyHandler = (key: string, inputValue: string) => void;

// TODO add mouse enter/leave events to results view to enable/disable highlighted selection
// TODO add mouse enter/leave events on row items to automatically move selection
// TODO add focus events to match with mouse events
// TODO add visible disable styles when switching out of the view
class TextEntryContainer extends React.Component<TextEntryContainerProps> {
    private debouncedOnKeyUp: InputKeyboardEventHandler;
    private debouncedOnKeyDown: InputKeyboardEventHandler;

    public componentWillMount() {
        // create debounced keyboard callbacks once per lifetime of container
        this.debouncedOnKeyUp = this.debounceCallback(this.onKeyUp, QUERY_INPUT_DELAY);
        this.debouncedOnKeyDown = this.debounceCallback(this.onKeyDown, 0);
    }

    public render() {
        return (
            <TextEntryComponent
                data={
                    {
                        query: this.props.query
                    }
                }
                callbacks={
                    {
                        onKeyUp: this.debouncedOnKeyUp,
                        onKeyDown: this.debouncedOnKeyDown,
                        onCut: this.onClipboard.bind(this),
                        onPaste: this.onClipboard.bind(this),
                    }
                }
            />
        );
    }

    private onKeyUp(key: string, inputValue: string) {
        // TODO: Switch to Array.includes() if upgrading to ES7 (es2016.array.include)
        if (!_.includes(IGNORE_KEYUP_KEYS, key)) {
            this.props.actions.queryAction(inputValue);
        }
    }

    private onKeyDown(key: string) {
        switch (key) {
            case 'ArrowUp':
                this.props.actions.itemMoveAction(TypeAheadSelectDirection.Up);
                break;
            case 'ArrowDown':
                this.props.actions.itemMoveAction(TypeAheadSelectDirection.Down);
                break;
            case 'Escape':
                this.props.actions.resetAction();
                break;
            case 'Enter':
                this.props.actions.submitAction();
                break;
        }
    }

    private onClipboard(e: InputClipboardEvent) {
        this.props.actions.queryAction(e.currentTarget.value);
    }

    private debounceCallback(handler: KeyHandler, wait: number) {
        const boundHandler = handler.bind(this);
        const debouncedHandler = _.debounce((e: InputKeyboardEvent) => {
            boundHandler(e.key, (e.target as HTMLInputElement).value);
            e.stopPropagation();
            e.preventDefault();
        }, wait);

        return (e: InputKeyboardEvent) => {
            e.persist();
            debouncedHandler(e);
        };
    }
}

const mapStateToProps = (state: GlobalState) => {
    const typeaheadState = state.typeaheadState;
    if (!typeaheadState) {
        throw new Error('mapStateToProps called prematurely');
    }

    return {
        query: typeaheadState.query
    };
};

// TODO find a way to avoid this cast
const taActions = typeaheadActions.typeahead as any;

const asyncOnSubmit = (dispatch: Dispatch<GlobalState>, getState: () => GlobalState) => {
    const state = getState();
    if (!state.typeaheadState) {
        throw new Error('submit called prematurely');
    }

    const currentSelection = state.typeaheadState.currentSelection;
    if (currentSelection === undefined) {
        return;
    }

    const vertexId = state.typeaheadState.results[currentSelection].id;
    return dispatch((rootActions as any).root.selectVertex(vertexId));
};

const mapDispatchToProps = (dispatch: Dispatch<GlobalState>) => {
    return {
        actions: bindActionCreators({
            queryAction: taActions.query,
            itemMoveAction: taActions.results.item.move,
            resetAction: taActions.reset,
            submitAction: () => asyncOnSubmit
        }, dispatch)
    };
};

const ConnectedTextEntryContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TextEntryContainer);

export default ConnectedTextEntryContainer;
