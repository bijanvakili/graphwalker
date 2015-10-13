'use strict';

var ExportedStyles = {

    canvasMargin: {
        top: 10,
        left: 10,
        right: 10,
    },

    vertexRect: {
        fill: 'yellow',
        stroke: 'black',
        strokeWidth: 5,
    },

    vertexText: {
        fontFamily: 'serif',
        fontSize: 24,
        fill: 'blue',

        // TODO: Find a more accurate way to measure/handle text height
        textHeight: 15,
        textMargin: 15,
    },

    arcLine: {
        strokeWidth: 2,
        stroke: 'black',
    },

    arcTriangleArrow: {
        width: 24,
        height: 16,
        angle: 90,

        stroke: 'black',
        fill: 'black'
    },
};

module.exports = ExportedStyles;