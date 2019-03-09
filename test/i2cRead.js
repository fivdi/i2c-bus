'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('i2cRead', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        setImmediate(cb, null);
      }
    );
  });


  it('read block from device', (done) => {
    const addr = 0x1;
    const length = 5;
    const buffer = Buffer.alloc(10);

    mockLinux.writeI2c1('hello world');

    i2c1.i2cRead(addr, length, buffer, (err, bytesRead, buf) => {
      assert.strictEqual(bytesRead, length);
      assert.strictEqual(buf, buffer);
      assert.strictEqual(
        buffer.slice(0, length).toString(), 'hello'
      );

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      done();
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const length = 5;
    const buffer = Buffer.alloc(10);

    mockLinux.writeI2c1('hello world');

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.i2cRead(addr, length, buffer, (err, bytesRead, buf) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

