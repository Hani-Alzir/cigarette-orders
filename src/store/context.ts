import React from 'react';
import { AppState, Action } from './types';
import { initialState } from './reducer';

export const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});
