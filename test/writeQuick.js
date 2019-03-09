'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('writeQuick', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrAsync").callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, "writeQuickAsync").callsFake(
      (device, bit, cb) => {
        setImmediate(cb, null);
      }
    );
  });


  it('writes bit to device', (done) => {
    const addr = 0x1;
    const bit = 0x0;

    i2c1.writeQuick(addr, bit, (err) => {
      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.writeQuickAsync.calledOnce);
      assert.strictEqual(mockI2c.writeQuickAsync.firstCall.args.length, 3);
      const actualBit = mockI2c.writeQuickAsync.firstCall.args[1];
      assert.strictEqual(bit, actualBit);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const bit = 0x0;

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.writeQuick(addr, bit, (err) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.writeQuickAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

