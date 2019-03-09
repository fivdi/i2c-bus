'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('deviceIdSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrSync").callsFake(() => {});

    sinon.stub(mockI2c, "deviceIdSync").callsFake(
      (device, addr) => {
        return (addr << 12) + (0x1 << 3) + 0x5;
      }
    );
  });


  it('reads device id of an atmel product', () => {
    const addr = 0xd; // Atmel

    const id = i2c1.deviceIdSync(addr);
    assert.strictEqual(id.manufacturer, addr);
    assert.strictEqual(id.product, (0x1 << 3) + 0x5);
    assert.strictEqual(id.name, 'Atmel');

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    let actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.deviceIdSync.calledOnce);
    assert.strictEqual(mockI2c.deviceIdSync.firstCall.args.length, 2);
    actualAddr = mockI2c.deviceIdSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);
  });

  it('reads device id of an unknown manufacturer', () => {
    const addr = 0x7f; // Unknown manufacturer

    const id = i2c1.deviceIdSync(addr);
    assert.strictEqual(id.manufacturer, addr);
    assert.strictEqual(id.product, (0x1 << 3) + 0x5);
    assert.strictEqual(id.name, '<0x7f>');

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    let actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.deviceIdSync.calledOnce);
    assert.strictEqual(mockI2c.deviceIdSync.firstCall.args.length, 2);
    actualAddr = mockI2c.deviceIdSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.deviceIdSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

