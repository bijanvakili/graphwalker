import * as React from 'react';

import { ErrorSummary } from '../models';

export const ErrorDisplayComponent = (props: ErrorSummary) => {
  const { error, componentStack } = props;
  return (
    <div className="alert alert-danger" role="alert">
      <h4 className="alert-heading">ERROR</h4>
      <span>{error.message}</span>
      {componentStack && <pre className="mt-3">{componentStack}</pre>}
      {error.stack && <pre className="mt-3">{error.stack}</pre>}
    </div>
  );
};
