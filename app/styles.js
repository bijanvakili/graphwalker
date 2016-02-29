'use strict';

var ExportedStyles = {

    canvasMargin: {
        top: 10,
        left: 10,
        right: 10
    },

    // styles for icon within a single vertex object
    vertexIcon: {
        x: 2,
        y: 2
    },

    vertexText: {
        fontFamily: 'arial',
        fontSize: 14,
        fill: 'blue',

        x: 4,
        y: 20,

        // TODO: Find a more accurate way to measure/handle text height
        textHeight: 15,
        textMargin: 10
    },

    // TODO: remove this
    vertexRect: {
        strokeWidth: 5
    },

    edgeLine: {
        strokeWidth: 2,
        stroke: 'black',
        fill: 'none'
    },

    edgeText: {
        fontFamily: 'arial',
        fontStyle: 'italic',
        fontSize: 12,
        fontFill: 'black',

        x: 40,
        y: 10
    }
};

module.exports = ExportedStyles;
