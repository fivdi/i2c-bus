'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readWordSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrSync').callsFake(() => {});

    sinon.stub(mockI2c, 'readWordSync').callsFake(
      (device, cmd) => {
        return 0xaa55;
      }
    );
  });


  it('reads word from register', () => {
    const addr = 0x1;
    const cmd = 0x2;

    const word = i2c1.readWordSync(addr, cmd);
    assert.strictEqual(word, 0xaa55);

    assert(mockI2c.setAddrSync.calledOnce);
    assert.strictEqual(mockI2c.setAddrSync.firstCall.args.length, 3);
    const actualAddr = mockI2c.setAddrSync.firstCall.args[1];
    assert.strictEqual(addr, actualAddr);

    assert(mockI2c.readWordSync.calledOnce);
    assert.strictEqual(mockI2c.readWordSync.firstCall.args.length, 2);
    const actualCmd = mockI2c.readWordSync.firstCall.args[1];
    assert.strictEqual(cmd, actualCmd);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.readWordSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

