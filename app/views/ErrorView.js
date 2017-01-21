'use strict';

var ERROR_EVENT,
    ErrorView;

ERROR_EVENT = 'graphwalker:error';

ErrorView = Backbone.View.extend({

    el: '.error-container',

    template: _.template('<span class="error-message"><%= message %></span>'),

    render: function (message) {
        var errorContent = '';

        if (message) {
            errorContent = this.template({message: message});
        }

        this.$el.html(errorContent);
        return this;
    },

    onErrorMessage: function (message) {
        this.render(message);
    },

    /**
     * Registers an event emitter to the error review
     * @param emitter
     * @returns {Function({String})} use this function to report errors
     */
    registerEmitter: function (emitter) {
        this.listenTo(emitter, ERROR_EVENT, this.onErrorMessage);

        return function (errorMessage) {
            emitter.trigger(ERROR_EVENT, errorMessage);
        };
    }
});


module.exports = ErrorView;
