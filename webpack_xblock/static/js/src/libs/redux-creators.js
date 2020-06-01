/** @module */

import _ from 'lodash';

/**
 * Action creator... creator
 * takes a type string and a list of string arguments, and produces an object
 * with that type and the resulting action creator.
 *
 * @function
 * @param {string} type - action type
 * @param {...string} args - ordered list of names to assign to sequential arguments
 *                           passed to the produced action creator.
 * @return {Object} - `{ type: <type>, fn: <action creator function> }`
 */
export const action = (type, args) => ({
  type,
  fn: (...params) => args.reduce(
    (obj, arg, index) => ({ ...obj, [arg]: params[index] }),
    {}
  ),
});

/**
 * @callback reducer
 * @param {Object} state - current react redux store state.
 * @param {Object.<string, number|string>} action - redux action being handled.
 */

/**
 * Reducer creator
 * takes an intial state and a dictionary with keys for all actions that reducer
 * cares about, keyed to a mini-reducer function each.
 *
 * @function
 * @param {Object} initialState - initial redux store state
 * @param {Object.<string, reducer>} action - object of `{[action type]: (state, action) => new_state }`
 * @return {reducer} - reducer function.
 */
export const mkReducer = (initialState, actions) => (state=initialState, action) => {
  const type = _.defaultTo(action.type, action);
  const identity = (state) => state;
  return _.defaultTo(actions[type], identity)(state, action);
}

/**
 * Simple selector factory.
 * Takes a list of string keys, and returns a simple slector for each.
 *
 * @function
 * @param {Object|string[]} keys - If passed as object, Object.keys(keys) is used.
 * @return {Object} - object of `{[key]: ({key}) => key}`
 */
export const simpleSelectors = (keys) => {
  let selKeys = Array.isArray(keys) ? keys : Object.keys(keys);
  return selKeys.reduce((obj, key) => ({
    ...obj, [key]: (state) => state[key]
  }), { root: (state) => state });
}
