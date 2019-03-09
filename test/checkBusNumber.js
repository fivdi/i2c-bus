'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('checkBusNumber', () => {
  beforeEach(() => {
    mockLinux.mockI2c1();
  });


  it('fails if busNumber is a string', () => {
    const busNumber = 'one';

    const expectedErrorMessage = 'Invalid I2C bus number one';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.openSync(busNumber);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if busNumber is an integer less than 0', () => {
    const busNumber = -1;

    const expectedErrorMessage = 'Invalid I2C bus number -1';
    let actualErrorMessage;

    try {
      const i2c1 = i2c.openSync(busNumber);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockLinux.restore();
  });
});

