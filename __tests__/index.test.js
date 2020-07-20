const strategy = require('../lib');

describe('passport-keybase', () => {
  test('should be a function', () => {
    expect(strategy).toBeInstanceOf(Function);
  });

  test('should export Strategy constructor directly from package', () => {
    expect(strategy).toEqual(strategy.Strategy);
  });
});
