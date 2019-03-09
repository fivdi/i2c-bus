'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readBlock', () => {
  const BLOCK_LENGTH = 5;
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, "setAddrAsync").callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, "readBlockAsync").callsFake(
      (device, cmd, buffer, cb) => {
        buffer.fill('a', 0, BLOCK_LENGTH);
        setImmediate(cb, null, BLOCK_LENGTH, buffer);
      }
    );
  });


  it('reads block from register', (done) => {
    const addr = 0x1;
    const cmd = 0x2;
    const buffer = Buffer.alloc(BLOCK_LENGTH);
    const expectedBuffer = Buffer.alloc(BLOCK_LENGTH, 'a');

    const bytesRead = i2c1.readBlock(addr, cmd, buffer, (err, bytesRead, buf) => {
      assert.strictEqual(bytesRead, BLOCK_LENGTH);
      assert.strictEqual(buffer, buf);
      assert.deepEqual(buffer, expectedBuffer);

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.readBlockAsync.calledOnce);
      assert.strictEqual(mockI2c.readBlockAsync.firstCall.args.length, 4);
      const actualCmd = mockI2c.readBlockAsync.firstCall.args[1];
      assert.strictEqual(cmd, actualCmd);
      const actualBuffer = mockI2c.readBlockAsync.firstCall.args[2];
      assert.strictEqual(buffer, actualBuffer);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const cmd = 0x2;
    const buffer = Buffer.alloc(BLOCK_LENGTH);

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.readBlock(addr, cmd, buffer, (err, bytesRead, buf) => {
      i2c1._busNumber = busNumber;

      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.readBlockAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

