'use strict';

var BaseViewGroup;

BaseViewGroup = fabric.util.createClass(fabric.Group, {

    options: {},

    initialize: function(options) {
        var self = this;

        this.callSuper('initialize');
        this.options = options;

        if (_.has(options, 'onInitialized')) {
            self.on('initialized', function() {
                self._onInitialized();
            });
        }
    },

    _onInitialized: function() {
        this.setOptions(_.omit(this.options, 'onInitialized'));

        // call any specified client callback
        if (_.has(this.options, 'onInitialized')) {
            this.options['onInitialized'](this);
        }
    },
});

module.exports = BaseViewGroup;
