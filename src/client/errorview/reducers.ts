import { createReducer } from "typesafe-actions";

import * as actions from "./actions";
import { ErrorSummary } from "./models";

interface ErrorState {
  applicationError?: ErrorSummary;
}

export const errorViewReducer = createReducer<ErrorState>({}).handleAction(
  actions.onError,
  (state, action) => ({
    ...state,
    applicationError: action.payload,
  })
);
