'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkAddress', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();
    i2c1 = i2c.openSync(1);
  });


  it('fails if addr is a string', () => {
    const addr = 'one';
    const cmd = 0x2;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C address one';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if addr is an integer less than 0', () => {
    const addr = -1;
    const cmd = 0x2;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C address -1';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if addr is an integer greater than 127', () => {
    const addr = 128;
    const cmd = 0x2;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C address 128';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    i2c1.closeSync();
    mockLinux.restore();
  });
});

