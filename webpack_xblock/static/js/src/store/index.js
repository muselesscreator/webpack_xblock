/* Main import point for redux store.
 * The base versions of pretty much everything exported from here is actually 
 * defined in './store.js'.  This import trick is so that we can have a set of
 * global selectors with access to the finalized selectors without introducing
 * import loops.
 *
 * The only ting actually changed here is the thunkActions, which merge in a
 * local collection to those imported via connected modules.
 */

import {
  actions,
  reducer,
  selectors,
  thunkActions,
} from './store';

export {
  actions,
  reducer as default,
  selectors,
  thunkActions,
};
