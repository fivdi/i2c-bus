'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readWord', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrAsync").callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, "readWordAsync").callsFake(
      (device, cmd, cb) => {
        setImmediate(cb, null, 0xaa55);
      }
    );
  });


  it('reads word from register', (done) => {
    const addr = 0x1;
    const cmd = 0x2;

    i2c1.readWord(addr, cmd, (err, word) => {
      assert.strictEqual(word, 0xaa55);

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.readWordAsync.calledOnce);
      assert.strictEqual(mockI2c.readWordAsync.firstCall.args.length, 3);
      const actualCmd = mockI2c.readWordAsync.firstCall.args[1];
      assert.strictEqual(cmd, actualCmd);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const cmd = 0x2;

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.readWord(addr, cmd, (err, word) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.readWordAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

