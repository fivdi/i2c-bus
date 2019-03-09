'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('deviceId', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, 'deviceIdAsync').callsFake(
      (device, addr, cb) => {
        if (addr === 0x0) {
          setImmediate(cb, new Error('deviceIdAsync error'));
        } else {
          setImmediate(cb, null, (addr << 12) + (0x1 << 3) + 0x5);
        }
      }
    );
  });


  it('reads device id of an atmel product', (done) => {
    const addr = 0xd; // Atmel

    i2c1.deviceId(addr, (err, id) => {
      assert.strictEqual(id.manufacturer, addr);
      assert.strictEqual(id.product, (0x1 << 3) + 0x5);
      assert.strictEqual(id.name, 'Atmel');

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      let actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.deviceIdAsync.calledOnce);
      assert.strictEqual(mockI2c.deviceIdAsync.firstCall.args.length, 3);
      actualAddr = mockI2c.deviceIdAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      done();
    });
  });

  it('reads device id of an unknown manufacturer', (done) => {
    const addr = 0x7f; // Unknown manufacturer

    i2c1.deviceId(addr, (err, id) => {
      assert.strictEqual(id.manufacturer, addr);
      assert.strictEqual(id.product, (0x1 << 3) + 0x5);
      assert.strictEqual(id.name, '<0x7f>');

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      let actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.deviceIdAsync.calledOnce);
      assert.strictEqual(mockI2c.deviceIdAsync.firstCall.args.length, 3);
      actualAddr = mockI2c.deviceIdAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0xd; // Atmel

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.deviceId(addr, (err, id) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });

  it('fails if deviceIdAsync detects an error', (done) => {
    const addr = 0x0; // Makes deviceIdAsync throw

    i2c1.deviceId(addr, (err, id) => {
      assert.strictEqual(err.message, 'deviceIdAsync error');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.deviceIdAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

