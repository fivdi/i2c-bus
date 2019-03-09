'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('i2cWriteSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});
  });


  it('writes block to device', () => {
    const addr = 0x1;
    const length = 5;
    const buffer = Buffer.from('0123456789');

    const bytesWritten = i2c1.i2cWriteSync(addr, length, buffer);
    assert.strictEqual(bytesWritten, length);
    assert.strictEqual(
      buffer.slice(0, length).toString(), mockLinux.readI2c1()
    );

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

