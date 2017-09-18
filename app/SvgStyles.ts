import { UnrestrictedDictionary} from './common/ObjectTypes';

interface IAllStyles {
    [key: string]: UnrestrictedDictionary;
}

// TODO move as much as possible into CSS
const allStyles: IAllStyles = {

    canvasMargin: {
        left: 10,
        right: 10,
        top: 20,
    },

    edgeLine: {
        fill: 'none',
        stroke: 'black',
        strokeWidth: 2,
    },

    edgeText: {
        fontFamily: 'arial',
        fontFill: 'black',
        fontSize: 12,
        fontStyle: 'italic',
    },

    // styles for icon within a single vertex object
    vertexIcon: {
        x: 2,
        y: 2,
    },

    vertexRect: {
        strokeWidth: 5,
    },

    vertexText: {
        fill: 'blue',
        fontFamily: 'arial',
        fontSize: 14,

        // TODO: Find a more accurate way to measure/handle text height
        textHeight: 15,
        textMargin: 10,

        x: 4,
        y: 20,
    },
};

class SvgStyles {
    public getStyles(name: string): UnrestrictedDictionary {
        return allStyles[name];
    }
}

export default new SvgStyles();
