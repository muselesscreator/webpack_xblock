/** @module */
import { combineReducers } from 'redux';

import * as _ from 'lodash';

export const isDebug = false;

/**
 * Log the given text, only if isDebug is set to true.
 * The output for these logs is dense, and generally we
 * will want to be able to toggle it all on or off for
 * dev/debug work when necessary.
 *
 * @function
 * @param {string} text - text to log to console.
 */
export const log = (text) => isDebug && console.log(text);

/**
 * Takes an arbitrary number of strings and returns those
 * strings joined by the '.' character for namespace pathing.
 *
 * Example Usage:
 *   join('a', 'long', 'namespace', 'path'); // 'a.long.namespace.path'
 *
 * @function
 * @param {...string} args - N strings to be joined.
 * @return {string} - joined string
 */
export const join = (...args) => _.join(args.filter(val => val !== ''), '.');

/**
 * Take an object of the form
 *   ```{ <key> : { module }, ... }```
 * and return a namespaced reducer bundle based off of the contents of
 * the modules in that object.
 *
 * output: 
 *   ```{ <key> : { module.namespacedTo(key) }, ... }```
 *
 * Calls itself recursively if the value to a key is another dictionary.
 *
 * Actions:
 *  - types will be prefaced with the given namespace and a '.' separator
 *
 * Reducers:
 *  - actions will be handled by the reducer, with a modified type:
 *   - types prefaced with the given namespace will have it stripped.
 *   - types not prefaced with the namespace will get 'Global.' prefaced.
 *
 * Selectors:
 *  - will receive a subset of the global state dictated by the namespace
 *
 * Thunk Actions:
 *  - will simply be placed in the larger structure appropriately
 *
 * Types:
 *  - will simply be placed in the larger structure appropriately
 *
 * For the sake of cleanliness and testing, this module must be instantiated, and then
 * have its load() method called to populate it, and then the connected store is available
 * via a store() accessor.
 *
 * Example usage: 
 *  ```
 *  const connectedStore = new ConnectedStore(mapping);
 *  connectedStore.load();
 *  const store = connectedStore.store();
 *  ```
 *
 * store() accessor returns an object of the same shape as the input mapping,
 * where each module is namespaced according to its position in the mapping.
 */
export class ConnectedStore {
  /**
   * Create a connected store
   * @param {Object} mapping - a nested object of redux modules to be namespaced.
   */
  constructor(mapping) {
    this.mapping = mapping;
    this.actions = {};
    this.actionTypes = {};
    this.types = {};
    this.thunkActions = {};
    this.selectors = {};
    this.reducerMapping = {};
  }

  /**
   * Accessor method to output final store configuration.
   *
   * @method
   * @return {Object} - connected redux store for final usage.
   */
  store = () => ({
    actions: this.actions,
    actionTypes: this.actionTypes,
    reducer: this.reducer,
    selectors: this.selectors,
    thunkActions: this.thunkActions,
  });

  /**
   * combine stores in the mapping into a single store.
   *
   * @method
   */
  load = () => {
    _.forIn(this.mapping, (module, ns) => {
      const _module = new Module(this, '', module, ns);
      _module.load();
    });
    log({ reducerMapping: this.reducerMapping });
    this.reducer = this._deepCombineReducers(this.reducerMapping);
    this.globalActionTypes = this._makeGlobalTypes(this.actionTypes);
  }

  /**
   * @callback reducer
   * @param {Object} state - current redux store state.
   * @param {Object} action - action being handled.
   */

  /**
   * Return a namespaced version of a reducer function.
   *
   * This upates the type of incoming actions, based on the namespace.
   * If the type starts witht he namespace, it is stripped, otherwise, the
   * string "Global" is prepended with a '.' in case the reducer really needs
   * to listen to a global action.
   *
   * Preferably, the global actions will not be used.	
   *
   * @method
   * @private
   * @param {reducer} reducer - un-namespaced reducer function.
   * @param {string} namespace - reducer namespace.
   * @return {reducer} - namespaced reducer.
   */
  _namespaceReducer = (reducer, namespace) => (
    (state=undefined, action) => {
      const mod = namespace + '.';
      let { type } = action;
      type = ( type.startsWith(mod) 
        ? type.slice(mod.length)
        : 'Global.' + type
      );
      return reducer(state, { ...action, type });
    }
  );

  /**
   * Takes a reducer mapping and returns the output of combineReducers on
   * a mapping of those reducers, in the same mapping, but namespaced to their
   * location/path within the mapping.
   *
   * @method
   * @private
   * @param {Object} mapping - reducer mapping object
   * @param {string} namespace - current namespace.
   * @return {reducer} - combined namespaced reducer function
   */
  _deepCombineReducers = (mapping, namespace) => {
    const outMapping = _.mapValues(mapping, (reducer, path) => {
      const ns = namespace ? `${namespace}.${path}` : path;
      const isFn = typeof(reducer) === 'function';
      const operation = isFn ? this._namespaceReducer : this._deepCombineReducers;
      log({ path, reducer, namespace, ns, isFn });
      return operation(reducer, ns);
    });
    log({ combinedReducerMapping: outMapping, namespace });
    return combineReducers(outMapping);
  }
  
  /**
   * Recursively make a dictionary of global action types in case any reducers need them.
   *
   * @method
   * @private
   * @param {Object} actionTypes - dict of object types
   * @return {Object} - dict of global action types.
   */
  _makeGlobalTypes = (actionTypes) => {
    return _.mapValues(actionTypes, (type, key) => {
      if (typeof type === 'string') {
        return 'Global.' + type;
      }
      return this._makeGlobalTypes(type);
    });
  }
};

/**
 * Main workhorse of the namespacing operation.
 *
 * Performs the direct checking and conversion for an individual module, and then
 * recursively checks for children modules.
 */
export class Module {
  /**
   * Create a module
   *
   * @param {ConnectedStore} store - ConnectedStore instance
   * @param {string} path -  post-namespace path
   * @param module { Module } - module to be converted/namespaced
   * @param ns { string } - namespace string (global location of module)
   */
  constructor(store, path, module, ns) {
    this.store = store;
    this.module = module;
    this.namespace = path ? join(path, ns) : ns;
    log({ namesapce: this.namespace });
  }

  /**
   * Loads and namespaces relevant parts of the module, ending by recursively
   * looking for more modules.
   *
   * @method
   */
  load = () => {
    this._loadActions();
    this._loadreducer();
    this._loadSelectors('', this.namespace);
    this._loadThunkActions();
    this._loadTypes();
    this._loadModules();
  }

  /**
   * Simple accessor for appending strings to the namespace.
   *
   * Example usage:
   *  _mkPath('some', 'path') // 'My.Current.Namespace.some.path'
   *
   * @method
   * @private
   * @param {string[]} args - list of strings to append.
   * @return {string} namespaced path string.
   */
  _mkPath = (...args) => join(this.namespace, ...args);

  /**
   * load all actions and types into the store module.
   * @method
   * @private
   */
  _loadActions = () => {
    const { actions={} } = this.module;
    _.forIn(actions, (action, actionType) => {
      const path = this._mkPath(actionType);
      const type = this._mkPath(action.type);
      const _action = (...props) => ({ ...action.fn(...props), type });
      _.set(this.store.actionTypes, path, type);
      _.set(this.store.actions, path, _action);
    });
  }

  /**
   * Build reducer mapping for later connection.
   *
   * @method
   * @private
   */
  _loadreducer = () => {
    if (this.module.reducer !== undefined) {
      _.set(this.store.reducerMapping, this.namespace, this.module.reducer);
    }
  }

  /**
   * Copy the thunkActions directly into the outgoing store.
   *
   * @method
   * @private
   */
  _loadThunkActions = () => {
    const { thunkActions={} } = this.module;
    _.forIn(thunkActions, (thunkAction, key) => {
      _.set(this.store.thunkActions, this._mkPath(key), thunkAction);
    });
  }

  /**
   * Copy the thunkActions directly into the outgoing store.
   *
   * @method
   * @private
   */
  _loadTypes = () => {
    const { types={} } = this.module;
    _.forIn(types, (key, type) => {
      _.set(this.store.types, this._mkPath(key), type);
    });
  }

  /**
   * Loads new modules recursively from the 'modules' key of passed module.
   *
   * @method
   * @private
   */

  _loadModules = () => {
    const { modules={} } = this.module;
    _.forIn(modules, (module, ns) => {
      const _module = new Module(this.store, this.namespace, module, ns);
      _module.load();
    });
  }

  /**
   * Load the selectors from a module.
   *
   * Grabs the selectors from the module's selectors by path.
   *
   * For each item in the associated object:
   *  - if the item is a selector, calls nsSelector to namespace it
   *  - else calls loadSelectors recursively with an updated selector path
   *
   * @method
   * @private
   * @param {string} path - path to the selectors after the current namespace path.
   */
  _loadSelectors = (path) => {
    log("load selectors");
    log({ selectors: this.module.selectors, path, nsPath: this.namespace });

    const selectors = (
      path === ''
        ? this.module.selectors
        : _.get(this.module.selectors, path, {})
    );
    _.forIn(selectors, (selector, selPath) => {
      const isFn = typeof selector === 'function';
      log({ selector, isFn, path, nsPath: this.namespace, selPath });
      if (isFn) {
        this._nsSelector(selector, selPath, path);
      }
      else {
        const outPath = join(path, selPath);
        log(outPath, this._mkPath(path));
        this._loadSelectors(outPath);
      }
    });
  }

  /**
   * @callback selector
   * @param {Object} state - current redux store state
   * @param {...args} - additional selector args
   */

  /**
   * Creates a namespaced selector based on a given
   * selector, object path, and selector path.
   *
   * Example usage:
   * ```
   *   // module.Module.selectors = { a_value: (state) => ..., }
   *   const out = _nsSelector(localSelector, 'a_value', 'module.Module')
   *   import { selectors } from 'store';
   *   selectors.<Module path>.a_value(state, ...args);
   *```
   *
   * @method
   * @private
   * @param {selector} selector - selector definition to namespace
   * @param {string} selPath -  selector path/name
   * @param {string} path - path to the parent selectors group.
   */
  _nsSelector = (selector, selPath, path) => {
    log("ns selector");
    const nsPath = this._mkPath(path);
    log({ selector, selPath, path });
    const newSelector = (state, ...args) => selector(_.get(state, nsPath), ...args);
    const nsSelPath = join(nsPath, selPath);
    _.set(this.store.selectors, nsSelPath, newSelector);
    log({ nsSelPath: path, newSelector, selectors: this.store.selectors });
  }
}

 /**
 * Takes a redux store mapping and returns the store output from a
 * ConnectedReducer instance based on that mapping.
 *
 * @function
 * @param {Object} mapping - redux store mapping
 * @return {Object} -
 *   usable connected namespaced redux store object.
 *   ```
 *   {
 *     actions,
 *     actionTypes,
 *     reducer,
 *     selectors,
 *     thunkActions,
 *   }
 *   ```
 */
export const connectReducers = (mapping) => {
  const store = new ConnectedStore(mapping);
  store.load();
  return store.store();
}

/**
 * Takes an object of action creators and an object of action handlers, each with the same keys.
 * Returns an object of action handlers keyed by the action type of the created action.
 * @param {object} actions - object of action creators keyed by their api-accessible name
 * @param {object} handlers - object of action handlers keyed by their api-accessible name
 * @return {object} - object of action handlers keyed by created action types
 */
export const connectHandlers = (actions, handlers) => (
  Object.keys(handlers).reduce(
    (obj, key) => ({
      ...obj,
      [actions[key].type]: handlers[key],
    }),
    {}
  )
);  


export default connectReducers;
