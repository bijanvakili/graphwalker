import * as React from "react";
import { connect } from "react-redux";

import { ErrorDisplayComponent } from "./components/ErrorDisplayComponent";
import { ErrorSummary } from "./models";
import { GlobalState } from "../graphwalker/reducers";

import { onError } from "./actions";

interface ErrorViewMappedProps {
  applicationError?: ErrorSummary;
}

interface ErrorViewDispatchProps {
  onError: (error: Error, componentStack?: string) => void;
}

type ErrorViewProps = ErrorViewMappedProps & ErrorViewDispatchProps;

class ErrorViewContainer extends React.Component<ErrorViewProps> {
  static getDerivedStateFromError(error: Error) {
    // do nothing
    return {};
  }

  render() {
    const applicationError = this.props.applicationError;
    return (
      <>
        {applicationError && <ErrorDisplayComponent {...applicationError} />}
        {this.props.children}
      </>
    );
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.onError(error, info);
  }

  private onError(error: Error, info?: React.ErrorInfo) {
    this.props.onError(error, info ? info.componentStack : undefined);
  }
}

const mapStateToProps = (state: GlobalState) => ({
  applicationError: state.errorSummary.applicationError,
});

export default connect(mapStateToProps, { onError })(ErrorViewContainer);
