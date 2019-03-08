'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkBufferAndLength', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();
    i2c1 = i2c.openSync(1);
  });


  it('fails if buffer is a string', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 10;
    const buffer = 'one';

    const expectedErrorMessage = 'Invalid buffer one';
    let actualErrorMessage;

    try {
      i2c1.readI2cBlockSync(addr, cmd, length, buffer);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if length is a string', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 'one';
    const buffer = Buffer.alloc(10);

    const expectedErrorMessage = 'Invalid buffer length one';
    let actualErrorMessage;

    try {
      i2c1.readI2cBlockSync(addr, cmd, length, buffer);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if length is less than 0', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = -1;
    const buffer = Buffer.alloc(10);

    const expectedErrorMessage = 'Invalid buffer length -1';
    let actualErrorMessage;

    try {
      i2c1.readI2cBlockSync(addr, cmd, length, buffer);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if length is greater than maximum allowed length (32)', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 1024;
    const buffer = Buffer.alloc(1024);

    const expectedErrorMessage = 'Invalid buffer length 1024';
    let actualErrorMessage;

    try {
      i2c1.readI2cBlockSync(addr, cmd, length, buffer);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if buffer length less than length', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 32;
    const buffer = Buffer.alloc(16);

    const expectedErrorMessage = 'Buffer must contain at least 32 bytes';
    let actualErrorMessage;

    try {
      i2c1.readI2cBlockSync(addr, cmd, length, buffer);
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

