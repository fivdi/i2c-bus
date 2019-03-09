'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('sendByteSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});
    sinon.stub(mockI2c, 'sendByteSync').callsFake(() => {});
  });


  it('sends byte to device', () => {
    const addr = 0x1;
    const byte = 0x2;

    i2c1.sendByteSync(addr, byte);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.sendByteSync.calledOnce);
    assert.strictEqual(mockI2c.sendByteSync.firstCall.args.length, 2);
    const actualByte = mockI2c.sendByteSync.firstCall.args[1];
    assert.strictEqual(byte, actualByte);
  });

  it('returns this', () => {
    const addr = 0x1;
    const byte = 0x3;

    assert.strictEqual(i2c1, i2c1.sendByteSync(addr, byte));
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.sendByteSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

