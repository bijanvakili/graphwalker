'use strict';

// used to communicate events without worrying about view ancestry
var navigatorChannel;

navigatorChannel = _.extend({}, Backbone.Events);

module.exports = {
    navigatorChannel: navigatorChannel
};
