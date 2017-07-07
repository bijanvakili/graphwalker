import * as Backbone from 'backbone';
import * as _ from 'lodash';

import * as EventHandlers from '../EventHandlers';
import { Vertex } from '../models/GraphData';

const IGNORE_KEYS = ['Alt', 'Control', 'Shift', 'ArrowUp', 'ArrowDown', 'Escape', 'Enter'];
const MIN_QUERY_LENGTH = 2;
const MAX_ITEM_RESULTS = 6;
const QUERY_INPUT_DELAY = 250;

// TODO add mouse enter/leave events to results view to enable/disable highlighted selection
// TODO add mouse enter/leave events on row items to automatically move selection
// TODO add focus events to match with mouse events
// TODO add visible disable styles when switching out of the view

// TODO convert multiline strings in this module to use backticks when upgrading to ES6
// TODO move class manipulation into render after refactoring to React.js

type KeyCallback = (e: string) => void;
type NoModelView = Backbone.View<Backbone.Model>;
type NoModelViewOptions = Backbone.ViewOptions<Backbone.Model>;

function setDebounceKeyboardHandler(
    emitter: JQuery,
    eventName: string,
    receiver: NoModelView,
    callback: KeyCallback,
    wait: number,
) {
    const emitterCallback = _.bind(callback, receiver);
    const emitterTarget = emitter[0];
    const debouncedHandler = _.debounce((e: KeyboardEvent) => {
        if (e.target === emitterTarget) {
            emitterCallback(e.key);
            e.stopPropagation();
            e.preventDefault();
        }
        return emitter;
    }, wait);

    emitter.on((eventName as any), debouncedHandler);
}

class TypeAheadTextEntryView extends Backbone.View<Backbone.Model> {

    constructor(options?: NoModelViewOptions) {
        super({
            el: '.typeahead-textentry',
            events: {
                cut: 'signalUpdate',
                paste: 'signalUpdate',
            },
            ...options,
        });
    }

    public initialize(options?: NoModelViewOptions) {
        setDebounceKeyboardHandler(this.$el, 'keyup', this, this.onKeyUp, QUERY_INPUT_DELAY);
        setDebounceKeyboardHandler(this.$el, 'keydown', this, this.onKeyDown, 0);
    }

    public getText(): string {
        return (this.$el.val() as string);
    }

    public resetText() {
        return this.$el.val('');
    }

    public setFocus(isFocused: boolean) {
        isFocused ? this.$el.focus() : this.$el.blur();
    }

    private onKeyDown(keyName: string) {
        if (keyName === 'ArrowUp') {
            this.trigger('query:item:move', 'up');
        }
        else if (keyName === 'ArrowDown') {
            this.trigger('query:item:move', 'down');
        }
        else if (keyName === 'Escape') {
            this.trigger('query:cancel');
        }
        else if (keyName === 'Enter') {
            this.trigger('query:item:selected');
        }
    }

    private onKeyUp(keyName: string) {
        if (!_.includes(IGNORE_KEYS, keyName)) {
            this.signalUpdate();
        }
    }

    private signalUpdate() {
        this.trigger('query:update');
    }
}

interface ITypeAheadResultRowView {
    itemText: string;
    isSelected?: boolean;
}

class TypeAheadResultRowView extends Backbone.View<Backbone.Model> {
    private itemText: string;
    private isSelected: boolean;
    private template: _.TemplateExecutor = _.template('<%= itemText %>');

    constructor(options: ITypeAheadResultRowView) {
        super({
            tagName: 'div',
            className: 'typeahead-results-item',
            events: {
                click: 'onClick',
            },
        });
        this.itemText = options.itemText;
        this.isSelected = options.isSelected || false;
    }

    public render() {
        this.$el.html(this.template({itemText: this.itemText}));
        this._setSelected(this.isSelected);
        return this;
    }

    public setSelected(isSelected: boolean) {
        this.isSelected = isSelected;
        this._setSelected(this.isSelected);
        return this;
    }

    private onClick(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        this.trigger('row:clicked', this);
    }

    private _setSelected(isSelected: boolean) {
        if (isSelected) {
            this.$el.addClass('active');
        }
        else {
            this.$el.removeClass('active');
        }
    }
}

export enum TypeAheadSelectDirection {
    Up = 'up',
    Down = 'down',
}

class TypeAheadResultsView extends Backbone.View<Backbone.Model> {

    private currentSelection?: number;
    private items: TypeAheadResultRowView[] | null;

    constructor(options?: NoModelViewOptions) {
        super({
            el: '.typeahead-results-container',
            ...options,
        });
        this.items = null;
    }

    public render() {
        this.$el.html('');

        if (this.items) {
            const self = this;

            this.$el.append(
                (this.items.map(
                    (item: TypeAheadResultRowView) => {
                        self.listenTo(item, 'row:clicked', self.onRowClicked);
                        return item.render().$el;
                    },
                ) as any[]),
            );

            this.$el.addClass('active');
        }
        else {
            this.$el.removeClass('active');
        }

        return this;
    }

    public getCurrentSelection() {
        return this.currentSelection;
    }

    public updateResults(results?: string[]) {
        if (this.items) {
            _.forEach(this.items, (item) => {
                item.remove();
            });
        }

        if (results) {
            this.items = _.map(results, (r: string) => {
                return new TypeAheadResultRowView({itemText: r});
            });
        }
        else {
            this._reset();
        }

        return this.render();
    }

    public move(direction: TypeAheadSelectDirection) {
        let newSelection = this.currentSelection;

        if (newSelection === undefined) {
            newSelection = 0;
        }
        else if (direction === TypeAheadSelectDirection.Up) {
            newSelection -= 1;
        }
        else if (direction === TypeAheadSelectDirection.Down) {
            newSelection += 1;
        }

        this.onNewSelection(newSelection);
    }

    private onNewSelection(idxSelection: number) {
        if (this.items === null) {
            return;
        }

        idxSelection = _.clamp(idxSelection, 0, this.items.length - 1);
        if (idxSelection !== this.currentSelection) {
            this.currentSelection = idxSelection;
            this._updateSelectionStates();
        }
    }

    private onRowClicked(item: TypeAheadResultRowView) {
        const newSelection = _.indexOf(this.items, item);
        if (_.isNumber(newSelection)) {
            this.onNewSelection(newSelection);
            this.trigger('query:item:selected', newSelection);
        }
    }

    private _reset() {
        this.currentSelection = undefined;
        this.items = null;
    }

    private _updateSelectionStates() {
        const currentSelection = this.currentSelection;

        _.forEach(this.items, (item, i) => {
            item.setSelected(i === currentSelection);
        });
    }
}

export interface IGraphWithTypeAhead extends Backbone.Model {
    queryTypeahead: (query: string) => Vertex[];
}

export class TypeAheadView extends Backbone.View<IGraphWithTypeAhead> {

    private queryInputView?: TypeAheadTextEntryView;
    private queryResultsView?: TypeAheadResultsView;
    private queryResults: Vertex[];

    private template: _.TemplateExecutor = _.template(
        '<input type="text" class="typeahead-textentry" />' +
        '<div class="typeahead-results-container" taxindex="-1" />'
    );

    constructor(options?: Backbone.ViewOptions<IGraphWithTypeAhead>) {
        super({
            el: '.typeahead-container',
            ...options,
        });
    }

    public initialize(options?: Backbone.ViewOptions<IGraphWithTypeAhead>) {
        this.queryResults = [];
    }

    public render() {
        this.$el.html(this.template());

        this.queryInputView = new TypeAheadTextEntryView();
        this.queryResultsView = new TypeAheadResultsView();

        this.listenTo(this.queryInputView, 'query:update', this.onUpdateQuery);
        this.listenTo(this.queryInputView, 'query:cancel', this.onReset);
        this.listenTo(this.queryInputView, 'query:item:move', this.onQueryItemMove);
        this.listenTo(this.queryInputView, 'query:item:selected', this.onItemSelected);
        this.listenTo(this.queryResultsView, 'query:item:selected', this.onItemSelected);

        this.queryInputView.render();
        this.queryResultsView.render();

        // default to the query control having focus
        this.queryInputView.setFocus(true);
        return this;
    }

    private onReset() {
        this.queryResults = [];
        if (this.queryResultsView) {
            this.queryResultsView.updateResults();
        }

    }

    private onUpdateQuery() {
        if (!this.queryInputView || !this.queryResultsView) {
            return;
        }

        const query = this.queryInputView.getText();
        if (!query || query.length < MIN_QUERY_LENGTH) {
            this.onReset();
            return;
        }

        const results = this.model.queryTypeahead(query);
        if (!results || _.isEmpty(results)) {
            this.onReset();
            return;
        }

        this.queryResultsView.updateResults(
            _(results)
                .slice(0, MAX_ITEM_RESULTS)
                .map((r) => r.displayName())
                .value()
        );

        this.queryResults = results;
    }

    private onItemSelected(idxItem: number) {
        if (!this.queryInputView || !this.queryResultsView) {
            return;
        }

        if (idxItem === undefined) {
            const viewSelection = this.queryResultsView.getCurrentSelection();
            if (viewSelection === undefined) {
                return;
            }
            else {
                idxItem = viewSelection;
            }
        }

        if (idxItem < 0 || idxItem > this.queryResults.length) {
            return;
        }

        const vertex = this.queryResults[idxItem];

        this.onReset();
        this.queryInputView.resetText();
        EventHandlers.navigatorChannel.trigger('vertex:selected', vertex);
    }

    private onQueryItemMove(direction: TypeAheadSelectDirection) {
        if (this.queryResultsView) {
            this.queryResultsView.move(direction);
        }
    }
}
