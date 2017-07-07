import * as Backbone from 'backbone';
import * as _ from 'lodash';

interface IEventHandler {
    trigger(eventName: string, ...args: any[]): any;
}

class EventHandler implements IEventHandler {
    constructor() {
        _.extend(this, Backbone.Events);
    }

    /* tslint:disable:no-empty */
    // these will be overridden during construction
    public trigger(eventName: string, ...args: any[]): any {}
    /* tslint:enable:no-empty */
}

// used to communicate events without worrying about view ancestry
export const navigatorChannel = new EventHandler();
