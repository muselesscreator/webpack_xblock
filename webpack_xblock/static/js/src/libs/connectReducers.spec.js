import { default as connectReducers, connectHandlers } from './connectReducers';

const module1initialState = {a: 1, b: 2};
const module2initialState = {a: 2, b: 3};
const modules = {
  module1: {
    actions: {
      load: {
        type: 'LOAD',
        fn: value => ({ value }),
      },
    },
    selectors: {
      value: (state) => state.value,
    },
    types: { a: 3 },
    reducer: (state=module1initialState, action) => {
      switch(action.type) {
        case 'LOAD':
          return { val: action.value };
        default:
          return state;
      }
    },
  },
  module2: {
    actions: {
      load: {
        type: 'LOAD',
        fn: (value, otherVal) => ({ value, otherVal }),
      },
    },
    selectors: {
      value: (state) => state.value,
    },
    types: { a: 2 },
    reducer: (state=module2initialState, action) => {
      switch(action.type) {
        case 'LOAD':
          return action.otherVal;
        case 'Global.UPDATE':
          return {};
        default:
          return state;
      }
    },
  },
}

describe("connectReducers", () => {
  let { actions, selectors, reducer, types } = connectReducers(modules);
  const testVal = 'testVALUE',
        testVal2 = 'TESTvalue';
  describe('actions', () => {
    it('creates namespaced action cretor with configured arguments', () => {
      expect(actions.module1.load(testVal)).toEqual({
        type: 'module1.LOAD',
        value: testVal,
      });
      expect(actions.module2.load(testVal, testVal2)).toEqual({
        type: 'module2.LOAD',
        value: testVal,
        otherVal: testVal2,
      });
    });
  });
  describe('reducers', () => {
    const state = { module1: {}, module2: { temp: true } };
    it("strips namespace from actions with type matching current namespace", () => {
      expect(reducer(state, { type: 'module1.LOAD', value: testVal })).toEqual({
        ...state,
        module1: { val: testVal },
      });
    });
    it("prepends Global to actions types without current namespace", () => {
      expect(reducer(state, { type: 'UPDATE'})).toEqual({
        ...state,
        module2: {},
      });
    });
  });
  describe('selectors', () => {
    const state = { module1: { value: testVal }, module2: { value: testVal2 } };
    it('only passes the namespaced path of state to the selector', () => {
      expect(selectors.module1.value(state)).toEqual(testVal);
      expect(selectors.module2.value(state)).toEqual(testVal2);
    });
  });
});

describe("connectHandlers", () => {
  const keys = ['key1', 'key2', 'key3', 'key4'];
  const actionNames = ['action1', 'action2', 'action3', 'action4'];
  const actions = {
    action1: { type: keys[0] },
    action2: { type: keys[1] },
    action3: { type: keys[2] },
    action4: { type: keys[3] },
  };
  const handlers = {
    action1: jest.fn().mockName(actionNames[0]),
    action2: jest.fn().mockName(actionNames[1]),
    action3: jest.fn().mockName(actionNames[2]),
    action4: jest.fn().mockName(actionNames[3]),
  };
  expect(connectHandlers(actions, handlers)).toEqual({
    [keys[0]]: handlers.action1,
    [keys[1]]: handlers.action2,
    [keys[2]]: handlers.action3,
    [keys[3]]: handlers.action4,
  });
});
