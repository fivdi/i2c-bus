'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readBlockSync', () => {
  const BLOCK_LENGTH = 5;
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrSync").callsFake(() => {});

    sinon.stub(mockI2c, "readBlockSync").callsFake(
      (device, cmd, buffer) => {
        buffer.fill('a', 0, BLOCK_LENGTH);
        return BLOCK_LENGTH;
      }
    );
  });


  it('reads block from register', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const buffer = Buffer.alloc(BLOCK_LENGTH);
    const expectedBuffer = Buffer.alloc(BLOCK_LENGTH, 'a');

    const bytesRead = i2c1.readBlockSync(addr, cmd, buffer);
    assert.strictEqual(bytesRead, BLOCK_LENGTH);
    assert.deepEqual(buffer, expectedBuffer);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.readBlockSync.calledOnce);
    assert.strictEqual(mockI2c.readBlockSync.firstCall.args.length, 3);
    const actualCmd = mockI2c.readBlockSync.firstCall.args[1];
    assert.strictEqual(cmd, actualCmd);
    const actualBuffer = mockI2c.readBlockSync.firstCall.args[2];
    assert.strictEqual(buffer, actualBuffer);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.readBlockSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

