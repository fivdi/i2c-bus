'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readI2cBlock', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );

    sinon.stub(mockI2c, 'readI2cBlockAsync').callsFake(
      (device, cmd, length, buffer, cb) => {
        buffer.fill('a', 0, length);
        setImmediate(cb, null, length, buffer);
      }
    );
  });


  it('reads block from register', (done) => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 10;
    const buffer = Buffer.alloc(1024);

    i2c1.readI2cBlock(addr, cmd, length, buffer, (err, bytesRead, buf) => {
      assert.strictEqual(bytesRead, length);
      assert.strictEqual(buffer, buf);
      assert.strictEqual(buffer.slice(0, length).toString(), 'aaaaaaaaaa');

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.readI2cBlockAsync.calledOnce);
      assert.strictEqual(mockI2c.readI2cBlockAsync.firstCall.args.length, 5);
      const actualCmd = mockI2c.readI2cBlockAsync.firstCall.args[1];
      assert.strictEqual(cmd, actualCmd);
      const actualLength = mockI2c.readI2cBlockAsync.firstCall.args[2];
      assert.strictEqual(length, actualLength);
      const actualBuffer = mockI2c.readI2cBlockAsync.firstCall.args[3];
      assert.strictEqual(buffer, actualBuffer);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const cmd = 0x2;
    const length = 10;
    const buffer = Buffer.alloc(10);

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.readI2cBlock(addr, cmd, length, buffer, (err, bytesRead, buf) => {
      i2c1._busNumber = busNumber;

      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.readI2cBlockAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

