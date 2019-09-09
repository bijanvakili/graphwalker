import * as React from 'react';

import { ErrorSummary } from '../models';

export const ErrorDisplayComponent = (props: ErrorSummary) => {
  return (
    <div className="alert alert-danger" role="alert">
      <h4 className="alert-heading">ERROR</h4>
      <span>{props.message}</span>
      {props.componentStack && <pre className="mt-3">{props.componentStack}</pre>}
    </div>
  );
};
