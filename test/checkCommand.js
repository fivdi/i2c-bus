'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkCommand', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();
    i2c1 = i2c.openSync(1);
  });


  it('fails if cmd is a string', () => {
    const addr = 0x1;
    const cmd = 'one';
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C command one';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if cmd is an integer less than 0', () => {
    const addr = 0x1;
    const cmd = -1;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C command -1';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if cmd is an integer greater than 255', () => {
    const addr = 0x1;
    const cmd = 256;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C command 256';
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

