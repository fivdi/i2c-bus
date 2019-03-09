'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('writeQuickSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});
    sinon.stub(mockI2c, 'writeQuickSync').callsFake(() => {});
  });


  it('writes bit to device', () => {
    const addr = 0x1;
    const bit = 0x1;

    i2c1.writeQuickSync(addr, bit);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.writeQuickSync.calledOnce);
    assert.strictEqual(mockI2c.writeQuickSync.firstCall.args.length, 2);
    const actualBit = mockI2c.writeQuickSync.firstCall.args[1];
    assert.strictEqual(bit, actualBit);
  });

  it('returns this', () => {
    const addr = 0x1;
    const bit = 0x1;

    assert.strictEqual(i2c1, i2c1.writeQuickSync(addr, bit));
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.writeQuickSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

