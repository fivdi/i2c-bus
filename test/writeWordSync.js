'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('writeWordSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrSync").callsFake(() => {});
    sinon.stub(mockI2c, "writeWordSync").callsFake(() => {});
  });


  it('writes word to register', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const word = 0xaa55;

    i2c1.writeWordSync(addr, cmd, word);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.writeWordSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualCmd = mockI2c.writeWordSync.firstCall.args[1];
    const actualWord = mockI2c.writeWordSync.firstCall.args[2];
    assert.strictEqual(cmd, actualCmd);
    assert.strictEqual(word, actualWord);
  });

  it('returns this', () => {
    const addr = 0x1;
    const cmd = 0x2;
    const word = 0xaa55;

    assert.strictEqual(i2c1, i2c1.writeWordSync(addr, cmd, word));
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.writeWordSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

