import { StrictDict } from 'libs/StrictDict';
import { action, mkReducer, simpleSelectors } from 'libs/redux-creators';
import { connectHandlers } from 'libs/connectReducers';

export const initialState = {
  value: 0,
}

export const actions = StrictDict({
  load: action('LOAD', ['value']),
});

export const actionHandlers = {
  load: (state, { value }) => ({ ...state, value }),
};

export const reducer = mkReducer(
  initialState,
  connectHandlers(actions, actionHandlers)
);

export const selectors = StrictDict({
  ...simpleSelectors(initialState),
});
