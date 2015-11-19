'use strict';

var ExportedStyles = {

    debugRect: {
        strokeWidth: 2,
        stroke: 'red',
        fill: 'pink',

        width: 11,
        height: 11,
    },

    debugPoint: {
        stroke: 'black',
        fill: 'black',
        strokeWidth: 1,
        width: 1,
        height: 1,
    },

    canvasMargin: {
        top: 10,
        left: 10,
        right: 10,
    },

    // styles for icon within a single vertex object
    vertexIcon: {
        left: 2,
        top: 2,
        scaleX: 0.5,
        scaleY: 0.5,
    },

    vertexText: {
        fontFamily: 'arial',
        fontSize: 14,
        fill: 'blue',

        left: 16,
        top: 38,

        // TODO: Find a more accurate way to measure/handle text height
        textHeight: 15,
        textMargin: 15,
    },

    // TODO: remove this
    vertexRect: {
        strokeWidth: 5,
    },

    edgeLine: {
        strokeWidth: 2,
        stroke: 'black',
    },

    edgeText: {
        fontFamily: 'arial',
        fontStyle: 'italic',
        fontSize: 10,
        fill: 'black',

        left: 40,
        top: 10,
    },

    arcTriangleArrow: {
        width: 24,
        height: 16,
        angle: 90,

        strokeWidth: 2,
        stroke: 'black',
        fill: 'black'
    },
};

module.exports = ExportedStyles;