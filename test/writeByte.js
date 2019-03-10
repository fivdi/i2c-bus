'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('writeByte', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, 'writeByteAsync').callsFake(
      (device, cmd, byte, cb) => {
        setImmediate(cb, null);
      }
    );
  });


  it('writes byte to register', (done) => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 0x3;

    i2c1.writeByte(addr, cmd, byte, (err, byte) => {
      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.writeByteAsync.calledOnce);
      assert.strictEqual(mockI2c.writeByteAsync.firstCall.args.length, 4);
      const actualCmd = mockI2c.writeByteAsync.firstCall.args[1];
      assert.strictEqual(cmd, actualCmd);
      const actualByte = mockI2c.writeByteAsync.firstCall.args[2];
      assert.strictEqual(actualByte, actualByte);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 0x3;

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.writeByte(addr, cmd, byte, (err) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });

  it('fails if no addr specified', () => {
    const cmd = 0x2;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C address undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByte(undefined, cmd, byte, () => {});
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no cmd specified', () => {
    const addr = 0x1;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid I2C command undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByte(addr, undefined, byte, () => {});
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no byte specified', () => {
    const addr = 0x1;
    const cmd = 0x2;

    const expectedErrorMessage = 'Invalid byte undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByte(addr, cmd, undefined);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no callback specified', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const byte = 0x3;

    const expectedErrorMessage = 'Invalid callback undefined';
    let actualErrorMessage;

    try {
      i2c1.writeByte(addr, cmd, byte);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.writeByteAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

