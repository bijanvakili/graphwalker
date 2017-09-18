import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import actions from '../actions';
import {TextMeasureComponent} from '../components/TextMeasureComponent';
import {GlobalState} from '../models/GlobalState';
import {TextDimensionsFunction} from '../models/UI';

interface OffscreenUtilsContainerProps {
    onUtilsLoaded: ActionFunctionAny<{getTextDimensions: TextDimensionsFunction}>;
}

class OffscreenUtilsContainer extends React.Component<OffscreenUtilsContainerProps> {
    private textMeasure?: TextMeasureComponent;

    public render() {
        return (
            <div className="offscreen">
                <TextMeasureComponent
                    ref={(elem: TextMeasureComponent) => this.textMeasure = elem}
                    width={window.innerWidth}
                />
            </div>
        );
    }

    public componentDidMount() {
        if (!this.textMeasure) {
            throw new Error('TextMeasureComponent unavailable in componentDidMount');
        }

        this.props.onUtilsLoaded(this.textMeasure.getTextDimensions.bind(this.textMeasure));
    }
}

function mapDispatchToProps(dispatch: Dispatch<GlobalState>) {
    // TODO remove cast
    const rootActions = actions.root as any;

    return bindActionCreators({
        onUtilsLoaded: rootActions.offscreenUtilsLoaded
    }, dispatch);
}

export default connect(
    null,
    mapDispatchToProps
)(OffscreenUtilsContainer);
