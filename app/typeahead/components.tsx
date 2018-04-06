import * as React from 'react';

import {
    ElementMouseEventHandler,
    InputClipboardEventHandler,
    InputKeyboardEventHandler,
} from '../common/EventTypes';

export interface TextEntryProps {
    data: {
        query: string;
    };
    callbacks: {
        onKeyUp?: InputKeyboardEventHandler;
        onKeyDown?: InputKeyboardEventHandler;
        onCut: InputClipboardEventHandler;
        onPaste: InputClipboardEventHandler;
    };
}

export class TextEntryComponent extends React.Component<TextEntryProps> {
    private inputElement?: HTMLInputElement;

    public render() {
        // TODO Attempt to reduce attribute assignment code by deconstructing 'data' and 'callbacks' properties
        return (
            <input
                ref={(elem: HTMLInputElement) => this.inputElement = elem}
                className="typeahead-textentry"
                onKeyUp={this.props.callbacks.onKeyUp}
                onKeyDown={this.props.callbacks.onKeyDown}
                onCut={this.props.callbacks.onCut}
                onPaste={this.props.callbacks.onPaste}
            />
        );
    }

    public componentDidMount() {
        if (!this.inputElement) {
            return;
        }

        this.inputElement.focus();
    }

    public componentDidUpdate() {
        if (!this.inputElement) {
            return;
        }

        this.inputElement.value = this.props.data.query;
    }
}

export interface ItemProps {
    data: {
        displayName: string;
        isSelected: boolean;
    };

    callbacks: {
        onClick: ElementMouseEventHandler;
    };
}

export class ResultItemComponent extends React.Component<ItemProps> {
    public render() {
        return (
            <div
                // TODO use classnames library
                className={'typeahead-results-item' + (this.props.data.isSelected ? ' active' : '')}
                onClick={this.props.callbacks.onClick}
            >
                {this.props.data.displayName}
            </div>
        );
    }
}
