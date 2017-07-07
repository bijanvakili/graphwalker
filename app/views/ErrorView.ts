import * as Backbone from 'backbone';
import * as _ from 'lodash';

const ERROR_EVENT = 'graphwalker:error';

export type ErrorEmitterFunction = (errorMessage: string) => void;

export class ErrorView extends Backbone.View<Backbone.Model> {

    private template: _.TemplateExecutor = _.template('<span class="error-message"><%= message %></span>');
    private message: string;

    constructor(options?: Backbone.ViewOptions<Backbone.Model>) {
        super({
            el: '.error-container',
        });
    }

    public render(): Backbone.View<Backbone.Model> {
        let errorContent = '';

        if (this.message) {
            errorContent = this.template({message: this.message});
        }

        this.$el.html(errorContent);
        return this;
    }

    public onErrorMessage(message: string) {
        this.message = message;
        this.render();
    }

    /**
     * Registers an event emitter to the error review
     * @param emitter
     */
    public registerEmitter(emitter: any): ErrorEmitterFunction {
        this.listenTo(emitter, ERROR_EVENT, this.onErrorMessage);

        return (errorMessage: string) => {
            emitter.trigger(ERROR_EVENT, errorMessage);
        };
    }
}
