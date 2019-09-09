import { createStandardAction } from 'typesafe-actions';

export const onError = createStandardAction('errorview/ON_ERROR').map(
  (error: Error, componentStack?: string) => ({
    payload: {
      error,
      componentStack
    },
    error: true
  })
);
