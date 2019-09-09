import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '../../graphwalker/reducers';
import { InputClipboardEvent, InputKeyboardEvent, InputKeyboardEventHandler } from '../../types/EventTypes';
import { moveSelection, query, reset, submit } from '../actions';
import { TypeAheadSelectDirection } from '../constants';
import { TextEntryComponent } from '../components/TextEntryComponent';

interface TextEntryContainerMappedProps {
  query: string;
}

interface TextEntryContainerDispatchProps {
  moveSelection: (direction: TypeAheadSelectDirection) => void;
  onQuery: (inputValue: string) => void;
  reset: () => void;
  submit: () => void;
}

type TextEntryContainerProps = TextEntryContainerMappedProps & TextEntryContainerDispatchProps;

const QUERY_INPUT_DELAY = 250;
const IGNORE_KEYUP_KEYS = ['Alt', 'Control', 'Shift', 'ArrowUp', 'ArrowDown', 'Escape', 'Enter'];

type KeyHandler = (key: string, inputValue: string) => void;

function useDebouncedKeyboardCallback(handler: KeyHandler, wait: number, deps: any[]) {
  const rawKeyboardHandler = (e: InputKeyboardEvent) => {
    handler(e.key, (e.target as HTMLInputElement).value);
    e.stopPropagation();
    e.preventDefault();
  };
  const debouncedHandler = _.debounce(rawKeyboardHandler, wait);

  return React.useMemo(
    () => (e: InputKeyboardEvent) => {
      e.persist();
      debouncedHandler(e);
    },
    deps
  );
}

// TODO add mouse enter/leave events to results view to enable/disable highlighted selection
// TODO add mouse enter/leave events on row items to automatically move selection
// TODO add focus events to match with mouse events
// TODO add visible disable styles when switching out of the view

const TextEntryContainer: React.FC<TextEntryContainerProps> = (props: TextEntryContainerProps) => {
  const onKeyUp = useDebouncedKeyboardCallback(
    (key: string, inputValue: string) => {
      // TODO: Switch to Array.includes() if upgrading to ES7 (es2016.array.include)
      if (!_.includes(IGNORE_KEYUP_KEYS, key)) {
        props.onQuery(inputValue);
      }
    },
    QUERY_INPUT_DELAY,
    [props.onQuery]
  );

  const onKeyDown = useDebouncedKeyboardCallback(
    (key: string) => {
      switch (key) {
        case 'ArrowUp':
          props.moveSelection(TypeAheadSelectDirection.Up);
          return;
        case 'ArrowDown':
          props.moveSelection(TypeAheadSelectDirection.Down);
          return;
        case 'Escape':
          props.reset();
          return;
        case 'Enter':
          props.submit();
          return;
      }
    },
    0,
    [props.moveSelection, props.reset, props.submit]
  );

  const onClipboard = React.useMemo(() => (e: InputClipboardEvent) => props.onQuery(e.currentTarget.value), [
    props.onQuery
  ]);

  return (
    <TextEntryComponent
      query={props.query}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      onCut={onClipboard}
      onPaste={onClipboard}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  query: state.typeahead.query
});

export default connect(
  mapStateToProps,
  { moveSelection, reset, submit, onQuery: query }
)(TextEntryContainer);
