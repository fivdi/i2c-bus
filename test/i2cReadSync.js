'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('i2cReadSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});
  });


  it('read block from device', () => {
    const addr = 0x1;
    const length = 5;
    const buffer = Buffer.alloc(10);

    mockLinux.writeI2c1('hello world');

    const bytesRead = i2c1.i2cReadSync(addr, length, buffer);
    assert.strictEqual(bytesRead, length);
    assert.strictEqual(
      buffer.slice(0, length).toString(), 'hello'
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

