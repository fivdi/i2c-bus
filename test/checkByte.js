'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkByte', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();
    i2c1 = i2c.openSync(1);
  });


  it('fails if byte is a string', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 'one';

    const expectedErrorMessage = 'Invalid byte one';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if byte is an integer less than 0', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = -1;

    const expectedErrorMessage = 'Invalid byte -1';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if byte is an integer greater than 255', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 256;

    const expectedErrorMessage = 'Invalid byte 256';
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

