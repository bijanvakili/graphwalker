'use strict';

var BaseViewGroup;

BaseViewGroup = function(options) {

    var self = this;

    self.svg = options.svg;
    self.group = self.svg.group();
    self.options = options;

    if (_.has(self.options, 'onInitialized')) {
        self.group.on('initialized', function () {
            self._onInitialized();
        });
    }

    this.initialize.apply(this, [options]);
};

_.extend(BaseViewGroup.prototype, {
    _onInitialized: function () {
        this.group.attr(_.omit(this.options, 'onInitialized'));

        // call any specified client callback
        if (_.has(this.options, 'onInitialized')) {
            this.options['onInitialized'](this);
        }
    },

    addImage: function (filename, onLoaded) {
        var newImage,
            self = this;

        newImage = self.svg.image('images/' + filename);
        newImage.loaded(function (loader) {
            newImage.size(loader.width, loader.height);
            self.group.add(newImage);
            onLoaded(newImage);
        });
    }
});

module.exports = BaseViewGroup;
