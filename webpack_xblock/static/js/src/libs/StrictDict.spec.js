import StrictDict from './StrictDict';

const value1 = 'valUE1',
      value2 = 'vALue2',
      key1 = 'Key1',
      key2 = 'keY2';

describe('StrictDict', () => {
  let dict = StrictDict({
    [ key1 ]: value1,
    [ key2 ]: value2,
  });
  it('provides key access like a normal dict object', () => {
    expect(dict[key1]).toEqual(value1);
  });
  it('allows key listing', () => {
    expect(Object.keys(dict)).toEqual([key1, key2]);
  });
  it('allows item listing', () => {
    expect(Object.values(dict)).toEqual([value1, value2]);
  });
  it('do not throw an error on invalid key in non-dev mode', () => {
    window.console.error = jest.fn();
    expect(dict.fakeKey === undefined);
  });
  it('throws an error in development mode if called with invalid key', () => {
    // set the environment so that StrictDict will raise
    process.env.NODE_ENV = "development";
    const callBadKey = () => {
      return dict.fakeKey;
    };
    window.console.error = jest.fn();
    expect(callBadKey).toThrow();
  });
});
