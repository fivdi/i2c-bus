'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('receiveByte', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, 'receiveByteAsync').callsFake(
      (device, cb) => {
        setImmediate(cb, null, 0xcc);
      }
    );
  });


  it('receives byte from device', (done) => {
    const addr = 0x1;

    const byte = i2c1.receiveByte(addr, (err, byte) => {
      assert.strictEqual(byte, 0xcc);

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.receiveByteAsync.calledOnce);
      assert.strictEqual(mockI2c.receiveByteAsync.firstCall.args.length, 2);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.receiveByte(addr, (err, byte) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.receiveByteAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

