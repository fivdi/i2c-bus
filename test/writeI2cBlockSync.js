'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('writeI2cBlockSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});
    sinon.stub(mockI2c, 'writeI2cBlockSync').callsFake(() => {});
  });


  it('writes block to register', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 5;
    const buffer = Buffer.from('0123456789');

    i2c1.writeI2cBlockSync(addr, cmd, length, buffer);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.writeI2cBlockSync.calledOnce);
    assert.strictEqual(mockI2c.writeI2cBlockSync.firstCall.args.length, 4);
    const actualCmd = mockI2c.writeI2cBlockSync.firstCall.args[1];
    assert.strictEqual(cmd, actualCmd);
    const actualLength = mockI2c.writeI2cBlockSync.firstCall.args[2];
    assert.strictEqual(length, actualLength);
    const actualBuffer = mockI2c.writeI2cBlockSync.firstCall.args[3];
    assert.strictEqual(buffer, actualBuffer);
  });

  it('returns this', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 5;
    const buffer = Buffer.from('0123456789');

    assert.strictEqual(i2c1, i2c1.writeI2cBlockSync(addr, cmd, length, buffer));
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.writeI2cBlockSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

