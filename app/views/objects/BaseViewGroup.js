'use strict';


/**
 * Constructs a base view group object
 *
 * @param {Object} options
 * @param {Svg} options.svg -- parent SVG instance
 * @param {MainView} options.parent -- parent Backbone view
 */
var BaseViewGroup = function (options) {
    this.options = options;
    this.svg = options.svg;
    this.parentView = this.options.parent;

    SVG.G.prototype.constructor.call(this, SVG.create('g'));

    this.svg.put(this);
};
BaseViewGroup.prototype = Object.create(SVG.G.prototype);
BaseViewGroup.prototype.constructor = BaseViewGroup;


_.extend(BaseViewGroup.prototype, {
   /**
     * Initializes the view group (all derived classes must implement this)
     * @returns {Promise<BaseViewGroup>}
     */
    initialize: function () {
        throw new Error(this.prototype.constructor.name + ' needs to implement initialize()');
    },

    /**
     * Loads the SVG source for an image
     * @param {string} filename
     * @returns {Promise<svg.image>}
     */
    addImage: function (filename) {
        var self = this;

        var newImage = self.options.svg.image('images/' + filename);
        return new Promise(function (resolve, reject) {
            try {
                newImage.loaded(function (loader) {
                    newImage.size(loader.width, loader.height);
                    self.add(newImage);
                    resolve(newImage);
                });
            }
            catch (ex) {
                reject(ex);
            }
        }).catch(function (error) {
            self.onError(error);
        });
    },

    /**
     * Error handler
     * @param {string} errorMessage
     */
    onError: function (errorMessage) {
        this.parentView.reportError(errorMessage);
    }
});

module.exports = BaseViewGroup;
