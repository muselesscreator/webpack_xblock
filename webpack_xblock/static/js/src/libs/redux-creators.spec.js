import { action, mkReducer, simpleSelectors } from './redux-creators';

describe('Redux utiltites - creators', () => {
  describe('action', () => {
    it('creates an action creator in the format necessary for connectReducers', () => {
      const type = 'TyPE';
      const param1 = 'P1';
      const param2 = 'p3';
      const out = action(type, ['param1', 'param2']);
      expect(out.type).toEqual(type);
      expect(out.fn(param1, param2)).toEqual({ param1, param2 });
    });
  });
  describe('mkReducer', () => {
    const initialState = { initial: 'state' };
    const newState = { a: 'state' };
    const badAction = { type: 'BAD ACTION' };
    const goodAction = { type: 'Type', key: 'VALUE' };
    let reducer;
    beforeEach(() => {
      reducer = mkReducer(initialState, {
        [goodAction.type]: (state, action) => ({ ...state, ...action }),
      });
    });
    it('returns current state if action type is not included in actions arg', () => {
      expect(reducer(newState, badAction)).toEqual(newState);
    });
    it('defaults to initial state if none is passed', () => {
      expect(reducer(initialState, badAction)).toEqual(initialState);
    });
    it('handles actions whose keys are included', () => {
      expect(reducer(newState, goodAction)).toEqual({ ...newState, ...goodAction });
    });
  });
  describe('simpleSelectors', () => {
    const state = { a: 1, b: 2, c: 3 };
    test('given a list of strings, returns a dict w/ a simple selector per string', () => {
      const keys = ['a', 'b'];
      const selectors = simpleSelectors(keys);
      expect(Object.keys(selectors)).toEqual(['root', ...keys]);
      expect(selectors.a(state)).toEqual(state.a);
      expect(selectors.b(state)).toEqual(state.b);
    });
    test('given a list of strings, returns a dict w/ a simple selector per string', () => {
      const selectors = simpleSelectors(state);
      expect(Object.keys(selectors)).toEqual(['root', ...Object.keys(state)]);
      expect(selectors.a(state)).toEqual(state.a);
      expect(selectors.b(state)).toEqual(state.b);
      expect(selectors.c(state)).toEqual(state.c);
    });
  });
});
