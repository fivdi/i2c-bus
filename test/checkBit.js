'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkBit', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();
    i2c1 = i2c.openSync(1);
  });


  it('fails if bit is a string', () => {
    const addr = 0x1;
    const bit = 'one';

    const expectedErrorMessage = 'Invalid bit one';
    let actualErrorMessage;

    try {
      i2c1.writeQuickSync(addr, bit);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if bit is an integer less than 0', () => {
    const addr = 0x1;
    const bit = -1;

    const expectedErrorMessage = 'Invalid bit -1';
    let actualErrorMessage;

    try {
      i2c1.writeQuickSync(addr, bit);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if bit is an integer greater than 1', () => {
    const addr = 0x1;
    const bit = 2;

    const expectedErrorMessage = 'Invalid bit 2';
    let actualErrorMessage;

    try {
      i2c1.writeQuickSync(addr, bit);
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

