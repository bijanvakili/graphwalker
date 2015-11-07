'use strict';

var SvgTemplateCache,
    s_cache;

if (_.has(window,'s_cache')) {
    s_cache = window.s_cache;
}
else {
    SvgTemplateCache = fabric.util.createClass({

        urlRoot: 'images',
        cachedObjects: {},
        pendingRequests: {},

        fetch: function(id, callback) {
            // TODO error callback

            // already in cache
            if (_.has(this.cachedObjects, id)) {
                this.onTemplateReady(id, callback);
            }
            // retrieval in progress
            else if (_.has(this.pendingRequests, id)) {
                this.pendingRequests[id].push(callback);
            }
            // first request
            else {
                var url = 'images/' + id,
                    loader = this;

                loader.pendingRequests[id] = [callback];
                fabric.loadSVGFromURL(url, function(objects) {
                    var templateObject = new fabric.PathGroup(objects);

                    loader.cachedObjects[id] = templateObject;
                    _.each(loader.pendingRequests[id], function(callback) {
                        loader.onTemplateReady(id, callback);
                    });
                    delete loader.pendingRequests[id];
                });
            }
        },

        onTemplateReady: function(id, callback) {
            this.cachedObjects[id].clone(function(newObject) {
                callback.success(newObject);
            });

        },
    });

    s_cache = new SvgTemplateCache();
    window.s_cache = s_cache;
}

module.exports = s_cache;
