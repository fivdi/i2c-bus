'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkWord', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();
    i2c1 = i2c.openSync(1);
  });


  it('fails if word is a string', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const word = 'one';

    const expectedErrorMessage = 'Invalid word one';
    let actualErrorMessage;

    try {
      i2c1.writeWordSync(addr, cmd, word);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if word is an integer less than 0', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const word = -1;

    const expectedErrorMessage = 'Invalid word -1';
    let actualErrorMessage;

    try {
      i2c1.writeWordSync(addr, cmd, word);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if word is an integer greater than 65535', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const word = 65536;

    const expectedErrorMessage = 'Invalid word 65536';
    let actualErrorMessage;

    try {
      i2c1.writeWordSync(addr, cmd, word);
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

