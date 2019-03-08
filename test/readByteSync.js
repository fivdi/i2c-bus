'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readByteSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrSync").callsFake(
      (device, addr, forceAccess) => {
        if (addr === 0x7f) {
          throw new Error('setAddrSync Error');
        }
      }
    );

    sinon.stub(mockI2c, "readByteSync").callsFake(
      (device, cmd) => {
        if (cmd === 0xff) {
          throw new Error('readByteSync Error');
        }

        return 0xaa;
      }
    );
  });


  it('reads byte from register', () => {
    const addr = 0x1;
    const cmd = 0x2;

    const byte = i2c1.readByteSync(addr, cmd);
    assert.strictEqual(byte, 0xaa);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.readByteSync.calledOnce);
    assert.strictEqual(mockI2c.readByteSync.firstCall.args.length, 2);
    const actualCmd = mockI2c.readByteSync.firstCall.args[1];
    assert.strictEqual(cmd, actualCmd);
  });

  it('does not unnecessarily call setAddrSync', () => {
    const addr = 0x1;
    const cmd = 0x2;

    // setAddrSync should only be called on first device access.
    i2c1.readByteSync(addr, cmd);
    i2c1.readByteSync(addr, cmd);

    assert(mockI2c.setAddrSync.calledOnce);
    assert(mockI2c.readByteSync.calledTwice);
  });

  it('fails if /dev/i2c-<busNumber> not found', () => {
    const addr = 0x1;
    const cmd = 0x2;

    const expectedErrorCode = 'ENOENT';
    let actualErrorCode;

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    try {
      i2c1.readByteSync(addr, cmd);
    } catch (err) {
      actualErrorCode = err.code;
    }

    i2c1._busNumber = busNumber;

    assert.strictEqual(expectedErrorCode, actualErrorCode);
  });

  it('fails if setAddrSync detects an error', () => {
    const addr = 0x7f;
    const cmd = 0x2;

    const expectedErrorMessage = 'setAddrSync Error';
    let actualErrorMessage;

    try {
      i2c1.readByteSync(addr, cmd);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if readByteSync detects an error', () => {
    const addr = 0x1;
    const cmd = 0xff;

    const expectedErrorMessage = 'readByteSync Error';
    let actualErrorMessage;

    try {
      i2c1.readByteSync(addr, cmd);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no addr specified', () => {
    const addr = undefined;
    const cmd = 0x2;

    const expectedErrorMessage = 'Invalid I2C address undefined';
    let actualErrorMessage;

    try {
      i2c1.readByteSync(addr, cmd);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no cmd specified', () => {
    const addr = 0x1;
    const cmd = undefined;

    const expectedErrorMessage = 'Invalid I2C command undefined';
    let actualErrorMessage;

    try {
      i2c1.readByteSync(addr, cmd);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.readByteSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

