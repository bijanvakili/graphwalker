import * as React from 'react';
import {connect} from 'react-redux';

import {GlobalState} from '../root/models/GlobalState';
import {ErrorDisplayComponent} from './components';
import {ErrorState} from './models';

class ErrorViewContainer extends React.Component<ErrorState> {
    public render() {
        return (
            <ErrorDisplayComponent message={this.props.message} />
        );
    }
}

function mapStateToProps(state: GlobalState): ErrorState {
    return {message: state.errorState.message};
}

export default connect(
    mapStateToProps,
)(ErrorViewContainer);
