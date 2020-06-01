/** @module */
import _ from 'lodash';
import util from 'util';

export const raiseException = () => process.env.NODE_ENV === "development";

/**
 * Defines a special meta-dictionary, which throws an error if an undefined
 * key is accessed.
 *
 * This is specifically useful for places where you need to access an API, and
 * attempting to access an invalid function needs to fail immediately rather than
 * silently returning an "undefined" variable, causing problems further down the line.
 *
 * @function
 * @param {Object} dict - single-level object to be "strict"-ified.
 * @return {Object} - strict dictionary
 */
export const StrictDict = (dict) => new Proxy(dict, handle);

/**
 * Applies the StrictDict checker to a nested/deep object.
 *
 * @function
 * @param {Object} dict - nested/deep object to be "strict"-ified.
 * @return {Object} - strict dictionary
 */
export const DeepStrict = (dict) => typeof dict === "object"
  ? StrictDict(_.mapValues(dict, DeepStrict))
  : dict;

const handle = {
  get: (target, name) => {
    if (name === Symbol.toStringTag) {
      return target;
    }
    if (name === 'length') {
      return target.length;
    }
    if (
      [
        'dict',
        'inspect',
        Symbol.toStringTag,
        util.inspect.custom,
        Symbol.for('nodejs.util.inspect.custom'),
      ].indexOf(name) >= 0
    ) {
      return target;
    }
    if (name === Symbol.iterator) {
      return { ...target };
    }
    if (name in target || name === "_reactFragment") {
      return target[name];
    }
    else {
      console.log(name.toString());
      console.error({target, name});
      let e = Error(`invalid property "${name.toString()}"`);
      console.error(e.stack);
      if (raiseException())
        throw(e);
    }
  }
};

export default StrictDict;
