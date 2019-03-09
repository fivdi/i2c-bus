'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('i2cFuncsSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});

    sinon.stub(mockI2c, 'i2cFuncsSync').callsFake(
      () => {
        return mockI2c.I2C_FUNC_I2C | mockI2c.I2C_FUNC_SMBUS_WRITE_I2C_BLOCK;
      }
    );
  });


  it('determine functionality of the bus/adapter', () => {
    const addr = 0;

    const funcs = i2c1.i2cFuncsSync();

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.i2cFuncsSync.calledOnce);
    assert.strictEqual(mockI2c.i2cFuncsSync.firstCall.args.length, 1);

    assert(funcs.i2c);
    assert(!funcs.tenBitAddr);
    assert(!funcs.protocolMangling);
    assert(!funcs.smbusPec);
    assert(!funcs.smbusBlockProcCall);
    assert(!funcs.smbusQuick);
    assert(!funcs.smbusReceiveByte);
    assert(!funcs.smbusSendByte);
    assert(!funcs.smbusReadByte);
    assert(!funcs.smbusWriteByte);
    assert(!funcs.smbusReadWord);
    assert(!funcs.smbusWriteWord);
    assert(!funcs.smbusProcCall);
    assert(!funcs.smbusReadBlock);
    assert(!funcs.smbusWriteBlock);
    assert(!funcs.smbusReadI2cBlock);
    assert(funcs.smbusWriteI2cBlock);
  });

  it('does not unnecessarily call setAddrSync or i2cFuncsSync', () => {
    i2c1.i2cFuncsSync();
    assert(mockI2c.setAddrSync.calledOnce);
    assert(mockI2c.i2cFuncsSync.calledOnce);

    i2c1.i2cFuncsSync();
    assert(mockI2c.setAddrSync.calledOnce);
    assert(mockI2c.i2cFuncsSync.calledOnce);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.i2cFuncsSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

