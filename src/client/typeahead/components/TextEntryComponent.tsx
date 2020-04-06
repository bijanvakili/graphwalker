import * as React from "react";

import { InputClipboardEventHandler, InputKeyboardEventHandler } from "../../types/EventTypes";

import "../TypeAhead.less";

export interface TextEntryProps {
  // inputs
  query: string;

  // callbacks
  onKeyUp?: InputKeyboardEventHandler;
  onKeyDown?: InputKeyboardEventHandler;
  onCut: InputClipboardEventHandler;
  onPaste: InputClipboardEventHandler;
}

export const TextEntryComponent: React.FC<TextEntryProps> = (props: TextEntryProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    // focus and update the text entry
    const inputElem = inputRef && inputRef.current;
    if (inputElem) {
      inputElem.focus();
      inputElem.value = props.query;
    }
  });

  return (
    <div className="input-group mt-3">
      <div className="input-group-prepend">
        <span className="input-group-text">Query</span>
      </div>
      <input
        ref={inputRef}
        className="form-control"
        onKeyUp={props.onKeyUp}
        onKeyDown={props.onKeyDown}
        onCut={props.onCut}
        onPaste={props.onPaste}
      />
    </div>
  );
};
