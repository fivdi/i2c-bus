'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('open', () => {
  beforeEach(() => {
    mockLinux.mockI2c1();
  });


  it('opens without options', (done) => {
    const i2c1 = i2c.open(1, (err) => {
      const expectedBusNumber = 1;
      const actualBusNumber = i2c1._busNumber;
      assert.strictEqual(expectedBusNumber, actualBusNumber);

      const expectedForceAccess = false;
      const actualForceAccess = i2c1._forceAccess;
      assert.strictEqual(expectedForceAccess, actualForceAccess);

      i2c1.closeSync();

      done();
    });
  });

  it('opens if option forceAccess is true', (done) => {
    const i2c1 = i2c.open(1, {forceAccess: true}, (err) => {
      const expectedForceAccess = true;
      const actualForceAccess = i2c1._forceAccess;
      assert.strictEqual(expectedForceAccess, actualForceAccess);

      i2c1.closeSync();

      done();
    });
  });

  it('opens if option forceAccess is false', (done) => {
    const i2c1 = i2c.open(1, {forceAccess: false}, (err) => {
      const expectedForceAccess = false;
      const actualForceAccess = i2c1._forceAccess;
      assert.strictEqual(expectedForceAccess, actualForceAccess);

      i2c1.closeSync();

      done();
    });
  });

  it('fails if no busNumber specified', () => {
    const expectedErrorMessage = 'Invalid I2C bus number undefined';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.open(undefined, () => {});
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no callback specified', () => {
    const expectedErrorMessage = 'Invalid callback undefined';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.open(1);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockLinux.restore();
  });
});

