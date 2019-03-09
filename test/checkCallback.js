'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkCallback', () => {
  beforeEach(() => {
    mockLinux.mockI2c1();
  });


  it('fails if callback is a string', () => {
    const busNumber = 1;
    const options = {};
    const callback = 'string';

    const expectedErrorMessage = 'Invalid callback string';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.open(busNumber, options, callback);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if callback is null', () => {
    const busNumber = 1;
    const options = {};
    const callback = null;

    const expectedErrorMessage = 'Invalid callback null';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.open(busNumber, options, callback);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockLinux.restore();
  });
});

