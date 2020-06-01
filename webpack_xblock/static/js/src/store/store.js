import { connectReducers } from 'libs/connectReducers';
import * as counter from './modules/counter';
import * as thunkActions from './thunkActions';

const { thunkActions: _thunkActions, actions, reducer, selectors } = connectReducers({
  counter,
});

export { 
  actions,
  reducer,
  selectors,
  thunkActions,
};
