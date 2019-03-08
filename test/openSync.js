'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('openSync', () => {
  beforeEach(() => {
    mockLinux.mockI2c1();
  });


  it('opens without options', () => {
    const i2c1 = i2c.openSync(1);

    const expectedBusNumber = 1;
    const actualBusNumber = i2c1._busNumber;
    assert.strictEqual(expectedBusNumber, actualBusNumber);

    const expectedForceAccess = false;
    const actualForceAccess = i2c1._forceAccess;
    assert.strictEqual(expectedForceAccess, actualForceAccess);

    i2c1.closeSync();
  });

  it('opens if option forceAccess is true', () => {
    const i2c1 = i2c.openSync(1, {forceAccess: true});

    const expectedForceAccess = true;
    const actualForceAccess = i2c1._forceAccess;
    assert.strictEqual(expectedForceAccess, actualForceAccess);

    i2c1.closeSync();
  });

  it('opens if option forceAccess is false', () => {
    const i2c1 = i2c.openSync(1, {forceAccess: false});

    const expectedForceAccess = false;
    const actualForceAccess = i2c1._forceAccess;
    assert.strictEqual(expectedForceAccess, actualForceAccess);

    i2c1.closeSync();
  });

  it('fails if no busNumber specified', () => {
    const expectedErrorMessage = 'Invalid I2C bus number undefined';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.openSync();
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  afterEach(() => {
    mockLinux.restore();
  });
});

