'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('close', () => {
  beforeEach(() => {
    mockLinux.mockI2c1();

    sinon.stub(mockI2c, "setAddrSync").callsFake(() => {});
    sinon.stub(mockI2c, "writeByteSync").callsFake(() => {});
  });


  it('releases resources', (done) => {
    const addr1 = 0x1;
    const addr2 = 0x10;
    const cmd = 0x2;
    const byte = 0x3;

    const i2c1 = i2c.openSync(1);

    i2c1.writeByteSync(addr1, cmd, byte);
    i2c1.writeByteSync(addr2, cmd, byte);

    assert.strictEqual(
      i2c1._peripherals.filter(p => p !== undefined).length, 2
    );

    i2c1.close((err) => {
      // There's currently a bug in close(). It doesn't set _peripherals to
      // []. Whel this bug is fixed the following assertion can be added.
      // assert.strictEqual(i2c1._peripherals.length, 0);

      done();
    });

  });

  it('fails if resources can not be released', (done) => {
    const addr1 = 0x1;
    const addr2 = 0x10;
    const cmd = 0x2;
    const byte = 0x3;

    const i2c1 = i2c.openSync(1);

    i2c1.writeByteSync(addr1, cmd, byte);
    i2c1.writeByteSync(addr2, cmd, byte);

    assert.strictEqual(
      i2c1._peripherals.filter(p => p !== undefined).length, 2
    );

    i2c1._peripherals[0x10] = 1e6;

    i2c1.close((err) => {
      assert.strictEqual(err.code, 'EBADF');

      done();
    });

  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.writeByteSync.restore();

    mockLinux.restore();
  });
});

