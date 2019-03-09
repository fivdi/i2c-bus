'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('i2cFuncs', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, 'i2cFuncsAsync').callsFake(
      (device, cb) => {
        setImmediate(
          cb,
          null,
          mockI2c.I2C_FUNC_SMBUS_READ_BYTE_DATA | mockI2c.I2C_FUNC_SMBUS_WRITE_BYTE_DATA
        );
      }
    );
  });


  it('determine functionality of the bus/adapter', (done) => {
    const addr = 0;

    i2c1.i2cFuncs((err, funcs) => {
      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.i2cFuncsAsync.calledOnce);
      assert.strictEqual(mockI2c.i2cFuncsAsync.firstCall.args.length, 2);

      assert(!funcs.i2c);
      assert(!funcs.tenBitAddr);
      assert(!funcs.protocolMangling);
      assert(!funcs.smbusPec);
      assert(!funcs.smbusBlockProcCall);
      assert(!funcs.smbusQuick);
      assert(!funcs.smbusReceiveByte);
      assert(!funcs.smbusSendByte);
      assert(funcs.smbusReadByte);
      assert(funcs.smbusWriteByte);
      assert(!funcs.smbusReadWord);
      assert(!funcs.smbusWriteWord);
      assert(!funcs.smbusProcCall);
      assert(!funcs.smbusReadBlock);
      assert(!funcs.smbusWriteBlock);
      assert(!funcs.smbusReadI2cBlock);
      assert(!funcs.smbusWriteI2cBlock);

      done();
    });
  });

  it('does not unnecessarily call setAddrAsync or i2cFuncsAsync', (done) => {
    // setAddrAsync and i2cFuncsAsync should only be called the first time
    // i2cFuncs is called.
    i2c1.i2cFuncs((err, funcs) => {
      assert(mockI2c.setAddrAsync.calledOnce);
      assert(mockI2c.i2cFuncsAsync.calledOnce);

      i2c1.i2cFuncs((err, byte) => {
        assert(mockI2c.setAddrAsync.calledOnce);
        assert(mockI2c.i2cFuncsAsync.calledOnce);

        done();
      });
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.i2cFuncs((err, funcs) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });

  it('fails if i2cFuncsAsync detects an error', (done) => {
    mockI2c.i2cFuncsAsync.restore();

    sinon.stub(mockI2c, 'i2cFuncsAsync').callsFake(
      (device, cb) => {
        setImmediate(
          cb,
          new Error('i2cFuncsAsync Error')
        );
      }
    );

    i2c1.i2cFuncs((err, funcs) => {
      assert.strictEqual(err.message, 'i2cFuncsAsync Error');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.i2cFuncsAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

