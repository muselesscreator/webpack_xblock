import StrictDict from 'libs/StrictDict';
import * as counterComms from 'comms/counter';
import { actions } from 'store';

export const counter = StrictDict({
  updateCount: () => (dispatch, getState, { makeUrl, xblock }) => {
    counterComms.updateCount(makeUrl).then(result => {
      dispatch(actions.counter.load(result.data.count))
      xblock.updateCount(result.data);
    });
  },
});
