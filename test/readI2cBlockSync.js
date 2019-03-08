'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readI2cBlockSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrSync").callsFake(() => {});

    sinon.stub(mockI2c, "readI2cBlockSync").callsFake(
      (device, cmd, length, buffer) => {
        buffer.fill('a', 0, length);
        return length;
      }
    );
  });


  it('reads block from register', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 10;
    const buffer = Buffer.alloc(1024);

    const bytesRead = i2c1.readI2cBlockSync(addr, cmd, length, buffer);
    assert.strictEqual(bytesRead, length);
    assert.strictEqual(buffer.slice(0, length).toString(), 'aaaaaaaaaa');

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.readI2cBlockSync.calledOnce);
    assert.strictEqual(mockI2c.readI2cBlockSync.firstCall.args.length, 4);
    const actualCmd = mockI2c.readI2cBlockSync.firstCall.args[1];
    assert.strictEqual(cmd, actualCmd);
    const actualLength = mockI2c.readI2cBlockSync.firstCall.args[2];
    assert.strictEqual(length, actualLength);
    const actualBuffer = mockI2c.readI2cBlockSync.firstCall.args[3];
    assert.strictEqual(buffer, actualBuffer);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.readI2cBlockSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

