import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {bindActionCreators} from 'redux';
import {ActionFunctionAny} from 'redux-actions';

import RootActions from '../actions';
import {GlobalState} from '../models/GlobalState';

interface VertexDispatchContainerState {
    prevVertexId?: string;
}

interface VertexDispatchContainerProps extends RouteComponentProps<any> {
    onVertexSelected: ActionFunctionAny<{}>;
}

// propagates react-router property to redux store
class VertexDispatchContainer extends React.Component<VertexDispatchContainerProps, VertexDispatchContainerState> {

    public constructor(props: VertexDispatchContainerProps) {
        super(props);
        this.state = {};
    }

    public componentDidMount() {
        this.dispatchIfNewVertex(this.props);
    }

    public componentWillReceiveProps(nextProps: VertexDispatchContainerProps) {
        this.dispatchIfNewVertex(nextProps);
    }

    public render() {
        return null;
    }

    private dispatchIfNewVertex(props: VertexDispatchContainerProps) {
        const newVertexId = props.match.params.vertexId;
        const prevVertexId = this.state && this.state.prevVertexId;

        // only propagate if the vertex changes
        if (newVertexId !== prevVertexId) {
            this.setState((prevState) => ({
                ...prevState,
                prevVertexId: newVertexId,
            }));
            this.props.onVertexSelected(newVertexId);
        }
    }
}

// TODO find out how to avoid this cast
const rActions = RootActions.root as any;

function mapDispatchToProps(dispatch: Dispatch<GlobalState>) {
    return bindActionCreators({
        onVertexSelected: rActions.onVertexSelected,
    }, dispatch);
}

export default withRouter(
    connect(null, mapDispatchToProps)(VertexDispatchContainer)
);
