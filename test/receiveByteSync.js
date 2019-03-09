'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('receiveByteSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});

    sinon.stub(mockI2c, 'receiveByteSync').callsFake(
      (device) => {
        return 0x55;
      }
    );
  });


  it('receives byte from device', () => {
    const addr = 0x1;

    const byte = i2c1.receiveByteSync(addr);
    assert.strictEqual(byte, 0x55);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.receiveByteSync.calledOnce);
    assert.strictEqual(mockI2c.receiveByteSync.firstCall.args.length, 1);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.receiveByteSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

