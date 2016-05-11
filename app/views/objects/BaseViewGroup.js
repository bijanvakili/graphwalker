'use strict';

var BaseViewGroup;

BaseViewGroup = function (options) {

    var self = this;

    self.svg = options.svg;
    self.group = self.svg.group();
    self.options = options;
};

_.extend(BaseViewGroup.prototype, {
    /**
     * Initializes the view group (all derived classes must implement this)
     * @returns {Promise<this>}
     */
    initialize: function () {
        throw new Error('Must provide implementation for initialize()');
    },

    /**
     * Loads the SVG source for an image
     * @param {string} filename
     * @returns {Promise<svg.image>}
     */
    addImage: function (filename) {
        var self = this;

        var newImage = self.svg.image('images/' + filename);
        return new Promise(function (resolve, reject) {
            newImage.loaded(function (loader) {
                newImage.size(loader.width, loader.height);
                self.group.add(newImage);
                resolve(newImage);
            });
        });
    }
});

module.exports = BaseViewGroup;
