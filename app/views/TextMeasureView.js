'use strict';

var TextMeasureView = Backbone.View.extend({

    el: '.textMeasure',

    initialize: function () {
        this.fontSettings = SvgStyles.getStyles('vertexText');
        this.textMeasureContext = null;
    },

    render: function () {
        this.$el.width(window.innerWidth);

        this.textMeasureContext = this.$el[0].getContext('2d');
        this.textMeasureContext.font = this.fontSettings.fontSize + 'px ' + this.fontSettings.fontFamily;

        return this;
    },

    /**
     * Computes the text dimensions for an arbitrary string
     *
     * @param s - string to measure
     * @returns {{width: Number, height: number}} - text dimensions in pixels
     */
    getTextDimensions: function (s) {
        var textMetrics = this.textMeasureContext.measureText(s);

        return {
            width: textMetrics.width,
            height: this.fontSettings.textHeight
        };
    }
});


module.exports = TextMeasureView;
