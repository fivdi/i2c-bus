'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('writeByteSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrSync").callsFake(() => {});
    sinon.stub(mockI2c, "writeByteSync").callsFake(() => {});
  });


  it('writes byte to register', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 0x3;

    i2c1.writeByteSync(addr, cmd, byte);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.writeByteSync.calledOnce);
    assert.strictEqual(mockI2c.writeByteSync.firstCall.args.length, 3);
    const actualCmd = mockI2c.writeByteSync.firstCall.args[1];
    const actualByte = mockI2c.writeByteSync.firstCall.args[2];
    assert.strictEqual(cmd, actualCmd);
    assert.strictEqual(byte, actualByte);
  });

  it('returns this', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 0x3;

    assert.strictEqual(i2c1, i2c1.writeByteSync(addr, cmd, byte));
  });

  it('fails if no addr specified', () => {
    const addr = undefined;
    const cmd = 0x2;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C address undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no cmd specified', () => {
    const addr = 0x1;
    const cmd = undefined;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C command undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no byte specified', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = undefined;

    const expectedErrorMessage = 'Invalid byte undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByteSync(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.writeByteSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

