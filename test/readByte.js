'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('readByte', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    sinon.stub(mockI2c, 'setAddrAsync').callsFake(
      (device, addr, forceAccess, cb) => {
        if (addr === 0x7f) {
          setImmediate(cb, new Error('setAddrAsync Error'));
        } else {
          setImmediate(cb, null);
        }
      }
    );

    sinon.stub(mockI2c, 'readByteAsync').callsFake(
      (device, cmd, cb) => {
        if (cmd === 0xff) {
          setImmediate(cb, new Error('readByteAsync Error'));
        } else {
          setImmediate(cb, null, 0xaa);
        }
      }
    );
  });


  it('reads byte from register', (done) => {
    const addr = 0x1;
    const cmd = 0x2;

    i2c1.readByte(addr, cmd, (err, byte) => {
      assert.strictEqual(byte, 0xaa);

      assert(mockI2c.setAddrAsync.calledOnce);
      assert.strictEqual(mockI2c.setAddrAsync.firstCall.args.length, 4);
      const actualAddr = mockI2c.setAddrAsync.firstCall.args[1];
      assert.strictEqual(addr, actualAddr);

      assert(mockI2c.readByteAsync.calledOnce);
      assert.strictEqual(mockI2c.readByteAsync.firstCall.args.length, 3);
      const actualCmd = mockI2c.readByteAsync.firstCall.args[1];
      assert.strictEqual(cmd, actualCmd);

      done();
    });
  });

  it('does not unnecessarily call setAddrAsync', (done) => {
    const addr = 0x1;
    const cmd = 0x2;

    // setAddrAsync should only be called on first device access.
    i2c1.readByte(addr, cmd, (err, byte) => {
      i2c1.readByte(addr, cmd, (err, byte) => {
        assert(mockI2c.setAddrAsync.calledOnce);
        assert(mockI2c.readByteAsync.calledTwice);

        done();
      });
    });
  });

  it('fails if /dev/i2c-<busNumber> not found', (done) => {
    const addr = 0x1;
    const cmd = 0x2;

    const busNumber = i2c1._busNumber;
    i2c1._busNumber = 1e6;

    i2c1.readByte(addr, cmd, (err, byte) => {
      i2c1._busNumber = busNumber;
      
      assert.strictEqual(err.code, 'ENOENT');

      done();
    });
  });

  it('fails if setAddrAsync detects an error', (done) => {
    const addr = 0x7f;
    const cmd = 0x2;

    i2c1.readByte(addr, cmd, (err, byte) => {
      assert.strictEqual(err.message, 'setAddrAsync Error');

      done();
    });
  });

  it('fails if readByteAsync detects an error', (done) => {
    const addr = 0x1;
    const cmd = 0xff;

    i2c1.readByte(addr, cmd, (err, byte) => {
      assert.strictEqual(err.message, 'readByteAsync Error');

      done();
    });
  });

  it('fails if no addr specified', () => {
    const cmd = 0x2;

    const expectedErrorMessage = 'Invalid I2C address undefined';
    let actualErrorMessage;

    try {
      i2c1.readByte(undefined, cmd, () => {});
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no cmd specified', () => {
    const addr = 0x1;

    const expectedErrorMessage = 'Invalid I2C command undefined';
    let actualErrorMessage;

    try {
      i2c1.readByte(addr, undefined, () => {});
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });

  it('fails if no callback specified', () => {
    const addr = 0x1;
    const cmd = 0x2;

    const expectedErrorMessage = 'Invalid callback undefined';
    let actualErrorMessage;

    try {
      i2c1.readByte(addr, cmd);
    } catch (err) {
      actualErrorMessage = err.message;
    }

    assert.strictEqual(expectedErrorMessage, actualErrorMessage);
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.readByteAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

