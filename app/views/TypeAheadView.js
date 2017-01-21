'use strict';

var EventHandlers = require('app/EventHandlers');

var TypeAheadView,
    TypeAheadTextEntryView,
    TypeAheadResultRowView,
    TypeAheadResultsView,
    IGNORE_KEYS,
    MIN_QUERY_LENGTH,
    MAX_ITEM_RESULTS,
    QUERY_INPUT_DELAY;


IGNORE_KEYS = ['Alt', 'Control', 'Shift', 'ArrowUp', 'ArrowDown', 'Escape', 'Enter'];
MIN_QUERY_LENGTH = 2;
MAX_ITEM_RESULTS = 6;
QUERY_INPUT_DELAY = 250;


// TODO add mouse enter/leave events to results view to enable/disable highlighted selection
// TODO add mouse enter/leave events on row items to automatically move selection
// TODO add focus events to match with mouse events
// TODO add visible disable styles when switching out of the view

// TODO convert multiline strings in this module to use backticks when upgrading to ES6
// TODO move class manipulation into render after refactoring to React.js

function setDebounceKeyboardHandler (emitter, eventName, receiver, callback, wait) {
    var emitterCallback = _.bind(callback, receiver);
    var emitterTarget = emitter[0];

    emitter.on(eventName, _.debounce(function (e) {
        if (e.target === emitterTarget) {
            emitterCallback(e.key);
            e.stopPropagation();
            e.preventDefault();
        }
    }, wait));
}


TypeAheadTextEntryView = Backbone.View.extend({
    el: '.typeahead-textentry',

    events: {
        'cut': 'signalUpdate',
        'paste': 'signalUpdate'
    },

    initialize: function () {
        setDebounceKeyboardHandler(this.$el, 'keyup', this, this.onKeyUp, QUERY_INPUT_DELAY);
        setDebounceKeyboardHandler(this.$el, 'keydown', this, this.onKeyDown, 0);
    },

    onKeyDown: function (keyName) {
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
    },

    onKeyUp: function (keyName) {
        if (!_.includes(IGNORE_KEYS, keyName)) {
            this.signalUpdate();
        }
    },

    signalUpdate: function () {
        this.trigger('query:update');
    },

    getText: function () {
        return this.$el.val();
    },

    resetText: function () {
        return this.$el.val('');
    },

    setFocus: function (isFocused) {
        isFocused ? this.$el.focus() : this.$el.blur();
    }
});


TypeAheadResultRowView = Backbone.View.extend({
    tagName: 'div',

    className: 'typeahead-results-item',

    template: _.template('<%= itemText %>'),

    events: {
        'click': 'onClick'
    },

    initialize: function (options) {
        this.itemText = options.itemText;
        this.isSelected = options.isSelected || false;
    },

    render: function () {
        this.$el.html(this.template({itemText: this.itemText}));
        this._setSelected(this.isSelected);
        return this;
    },

    onClick: function (e) {
        e.stopPropagation();
        e.preventDefault();

        this.trigger('row:clicked', this);
    },

    setSelected: function (isSelected) {
        this.isSelected = isSelected;
        this._setSelected(this.isSelected);
        return this;
    },

    _setSelected: function (isSelected) {
        if (isSelected) {
            this.$el.addClass('active');
        }
        else {
            this.$el.removeClass('active');
        }
    }
});


TypeAheadResultsView = Backbone.View.extend({

    el: '.typeahead-results-container',

    initialize: function (options) {
        this.currentSelection = null;
        this.items = null;
    },

    render: function () {
        this.$el.html('');

        if (this.items) {
            var self = this;

            this.$el.append(_.map(this.items, function (item) {
                self.listenTo(item, 'row:clicked', self.onRowClicked);
                return item.render().$el;
            }));

            this.$el.addClass('active');
        }
        else {
            this.$el.removeClass('active');
        }

        return this;
    },

    updateResults: function (results) {
        if (this.items) {
            _.forEach(this.items, function (item) {
                item.remove();
            });
        }

        if (results) {
            this.items = _.map(results, function (r, i) {
                return new TypeAheadResultRowView({itemText: r});
            });
        }
        else {
            this._reset();
        }

        return this.render();
    },

    getCurrentSelection: function () {
        return this.currentSelection;
    },

    move: function (direction) {
        var newSelection = this.currentSelection;

        if (newSelection === null) {
            newSelection = 0;
        }
        else if (direction === 'up') {
            newSelection -= 1;
        }
        else if (direction === 'down') {
            newSelection += 1;
        }

        this.onNewSelection(newSelection);
    },

    onNewSelection: function (idxSelection) {
        if (this.items === null) {
            return;
        }

        idxSelection = _.clamp(idxSelection, 0, this.items.length - 1);
        if (idxSelection !== this.currentSelection) {
            this.currentSelection = idxSelection;
            this._updateSelectionStates();
        }
    },

    onRowClicked: function (item) {
        var newSelection = _.indexOf(this.items, item);
        if (_.isNumber(newSelection)) {
            this.onNewSelection(newSelection);
            this.trigger('query:item:selected', newSelection);
        }
    },

    _reset: function () {
        this.currentSelection = null;
        this.items = null;
    },

    _updateSelectionStates: function () {
        var currentSelection = this.currentSelection;

        _.forEach(this.items, function (item, i) {
            item.setSelected(i === currentSelection);
        });
    }
});


TypeAheadView = Backbone.View.extend({

    el: '.typeahead-container',

    template: _.template(
        '<input type="text" class="typeahead-textentry" />' +
        '<div class="typeahead-results-container" taxindex="-1" />'
    ),

    initialize: function (options) {
        this.graph = options.graph;

        this.queryInputView = null;
        this.queryResultsView = null;
        this.queryResults = null;
    },

    render: function () {
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
    },

    onReset: function () {
        this.queryResults = null;
        this.queryResultsView.updateResults();
    },

    onUpdateQuery: function () {
        var query,
            results;

        query = this.queryInputView.getText();
        if (!query || query.length < MIN_QUERY_LENGTH) {
            this.onReset();
            return;
        }

        results = this.graph.queryTypeahead(query);
        if (!results || _.isEmpty(results)) {
            this.onReset();
            return;
        }

        this.queryResultsView.updateResults(
            _(results)
                .slice(0, MAX_ITEM_RESULTS)
                .map(function (r) {
                    return r.displayName();
                })
                .value()
        );

        this.queryResults = results;
    },

    onItemSelected: function (idxItem) {
        var vertex;

        if (idxItem === undefined) {
            idxItem = this.queryResultsView.getCurrentSelection();
        }

        if (idxItem < 0 || idxItem > this.queryResults.length) {
            return;
        }

        vertex = this.queryResults[idxItem];

        this.onReset();
        this.queryInputView.resetText();
        EventHandlers.navigatorChannel.trigger('vertex:selected', vertex);
    },

    onQueryItemMove: function (direction) {
        this.queryResultsView.move(direction);
    }
});


module.exports = TypeAheadView;
