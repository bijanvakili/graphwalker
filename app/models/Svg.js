'use strict';

var SvgObject = Backbone.Model.extend({

    urlRoot: 'images',

    // TODO Patch fabric to include an svgCache

    /* Retrieves and parses an SVG into a Fabric object.
     * This relies on the fabric request framework.
     *
     * @event sync: (model, fabricObj, options) if the request completes and parses successfully
     *
     * Limitations: There is no error handling
     */
    fetch: function(options) {
        var fabricObject,
            model;

        model = this;
        fabric.loadSVGFromURL(this.url(), function(objects) {
            fabricObject = new fabric.PathGroup(objects);

            if (!model.set({'_parsedFabricGroup': fabricObject}, options)) {
                return false;
            }
            if (_.has(options, 'success')) {
                options.success.call(options.context, model, fabricObject, options);
            }

            model.trigger('sync', model, fabricObject, options);
        });

        return true;
    },

    getFabricObject: function() {
        return this.get('_parsedFabricGroup');
    },
});

module.exports = {
    SvgObject,
};
