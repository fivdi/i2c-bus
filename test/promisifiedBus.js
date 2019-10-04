'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require('sinon');

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('promisifiedBus delegates to bus', () => {
  beforeEach(() => {
    mockLinux.mockI2c1();
  });


  it('close delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'close').callsFake(
        (cb) => setImmediate(cb, null)
      );
      i2c1.close().then(_ => {
        assert(i2c1.bus().close.calledOnce);
        assert.strictEqual(i2c1.bus().close.firstCall.args.length, 1);
        assert.strictEqual(typeof i2c1.bus().close.firstCall.args[0], 'function');
        i2c1.bus().close.restore();
        done();
      });
    });
  });

  it('deviceId delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'deviceId').callsFake(
        (addr, cb) => setImmediate(cb, null)
      );
      i2c1.deviceId(0x55).then(_ => {
        assert(i2c1.bus().deviceId.calledOnce);
        assert.strictEqual(i2c1.bus().deviceId.firstCall.args.length, 2);
        assert.strictEqual(i2c1.bus().deviceId.firstCall.args[0], 0x55);
        assert.strictEqual(typeof i2c1.bus().deviceId.firstCall.args[1], 'function');
        i2c1.bus().deviceId.restore();
        done();
      });
    });
  });

  it('i2cFuncs delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'i2cFuncs').callsFake(
        (cb) => setImmediate(cb, null)
      );
      i2c1.i2cFuncs().then(_ => {
        assert(i2c1.bus().i2cFuncs.calledOnce);
        assert.strictEqual(i2c1.bus().i2cFuncs.firstCall.args.length, 1);
        assert.strictEqual(typeof i2c1.bus().i2cFuncs.firstCall.args[0], 'function');
        i2c1.bus().i2cFuncs.restore();
        done();
      });
    });
  });

  it('i2cRead delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'i2cRead').callsFake(
        (addr, length, buffer, cb) => setImmediate(cb, null)
      );
      const buffer = Buffer.alloc(6);
      i2c1.i2cRead(0x55, buffer.length, buffer).then(_ => {
        assert(i2c1.bus().i2cRead.calledOnce);
        assert.strictEqual(i2c1.bus().i2cRead.firstCall.args.length, 4);
        assert.strictEqual(i2c1.bus().i2cRead.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().i2cRead.firstCall.args[1], buffer.length);
        assert.strictEqual(i2c1.bus().i2cRead.firstCall.args[2], buffer);
        assert.strictEqual(typeof i2c1.bus().i2cRead.firstCall.args[3], 'function');
        i2c1.bus().i2cRead.restore();
        done();
      });
    });
  });

  it('i2cWrite delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'i2cWrite').callsFake(
        (addr, length, buffer, cb) => setImmediate(cb, null)
      );
      const buffer = Buffer.alloc(6);
      i2c1.i2cWrite(0x55, buffer.length, buffer).then(_ => {
        assert(i2c1.bus().i2cWrite.calledOnce);
        assert.strictEqual(i2c1.bus().i2cWrite.firstCall.args.length, 4);
        assert.strictEqual(i2c1.bus().i2cWrite.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().i2cWrite.firstCall.args[1], buffer.length);
        assert.strictEqual(i2c1.bus().i2cWrite.firstCall.args[2], buffer);
        assert.strictEqual(typeof i2c1.bus().i2cWrite.firstCall.args[3], 'function');
        i2c1.bus().i2cWrite.restore();
        done();
      });
    });
  });

  it('readBlock delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'readBlock').callsFake(
        (addr, cmd, buffer, cb) => setImmediate(cb, null)
      );
      const buffer = Buffer.alloc(6);
      i2c1.readBlock(0x55, 0xaa, buffer).then(_ => {
        assert(i2c1.bus().readBlock.calledOnce);
        assert.strictEqual(i2c1.bus().readBlock.firstCall.args.length, 4);
        assert.strictEqual(i2c1.bus().readBlock.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().readBlock.firstCall.args[1], 0xaa);
        assert.strictEqual(i2c1.bus().readBlock.firstCall.args[2], buffer);
        assert.strictEqual(typeof i2c1.bus().readBlock.firstCall.args[3], 'function');
        i2c1.bus().readBlock.restore();
        done();
      });
    });
  });

  it('readByte delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'readByte').callsFake(
        (addr, cmd, cb) => setImmediate(cb, null)
      );
      i2c1.readByte(0x55, 0xaa).then(_ => {
        assert(i2c1.bus().readByte.calledOnce);
        assert.strictEqual(i2c1.bus().readByte.firstCall.args.length, 3);
        assert.strictEqual(i2c1.bus().readByte.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().readByte.firstCall.args[1], 0xaa);
        assert.strictEqual(typeof i2c1.bus().readByte.firstCall.args[2], 'function');
        i2c1.bus().readByte.restore();
        done();
      });
    });
  });

  it('readI2cBlock delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'readI2cBlock').callsFake(
        (addr, cmd, length, buffer, cb) => setImmediate(cb, null)
      );
      const buffer = Buffer.alloc(6);
      i2c1.readI2cBlock(0x55, 0xaa, buffer.length, buffer).then(_ => {
        assert(i2c1.bus().readI2cBlock.calledOnce);
        assert.strictEqual(i2c1.bus().readI2cBlock.firstCall.args.length, 5);
        assert.strictEqual(i2c1.bus().readI2cBlock.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().readI2cBlock.firstCall.args[1], 0xaa);
        assert.strictEqual(i2c1.bus().readI2cBlock.firstCall.args[2], buffer.length);
        assert.strictEqual(i2c1.bus().readI2cBlock.firstCall.args[3], buffer);
        assert.strictEqual(typeof i2c1.bus().readI2cBlock.firstCall.args[4], 'function');
        i2c1.bus().readI2cBlock.restore();
        done();
      });
    });
  });

  it('readWord delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'readWord').callsFake(
        (addr, cmd, cb) => setImmediate(cb, null)
      );
      i2c1.readWord(0x55, 0xaa).then(_ => {
        assert(i2c1.bus().readWord.calledOnce);
        assert.strictEqual(i2c1.bus().readWord.firstCall.args.length, 3);
        assert.strictEqual(i2c1.bus().readWord.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().readWord.firstCall.args[1], 0xaa);
        assert.strictEqual(typeof i2c1.bus().readWord.firstCall.args[2], 'function');
        i2c1.bus().readWord.restore();
        done();
      });
    });
  });

  it('receiveByte delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'receiveByte').callsFake(
        (addr, cb) => setImmediate(cb, null)
      );
      i2c1.receiveByte(0x55).then(_ => {
        assert(i2c1.bus().receiveByte.calledOnce);
        assert.strictEqual(i2c1.bus().receiveByte.firstCall.args.length, 2);
        assert.strictEqual(i2c1.bus().receiveByte.firstCall.args[0], 0x55);
        assert.strictEqual(typeof i2c1.bus().receiveByte.firstCall.args[1], 'function');
        i2c1.bus().receiveByte.restore();
        done();
      });
    });
  });

  it('scan delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'scan').callsFake(
        (startAddr, endAddr, cb) => setImmediate(cb, null)
      );
      i2c1.scan(0x03, 0x77).then(_ => {
        assert(i2c1.bus().scan.calledOnce);
        assert.strictEqual(i2c1.bus().scan.firstCall.args.length, 3);
        assert.strictEqual(i2c1.bus().scan.firstCall.args[0], 0x03);
        assert.strictEqual(i2c1.bus().scan.firstCall.args[1], 0x77);
        assert.strictEqual(typeof i2c1.bus().scan.firstCall.args[2], 'function');
        i2c1.bus().scan.restore();
        done();
      });
    });
  });

  it('sendByte delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'sendByte').callsFake(
        (addr, byte, cb) => setImmediate(cb, null)
      );
      i2c1.sendByte(0x55, 0x12).then(_ => {
        assert(i2c1.bus().sendByte.calledOnce);
        assert.strictEqual(i2c1.bus().sendByte.firstCall.args.length, 3);
        assert.strictEqual(i2c1.bus().sendByte.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().sendByte.firstCall.args[1], 0x12);
        assert.strictEqual(typeof i2c1.bus().sendByte.firstCall.args[2], 'function');
        i2c1.bus().sendByte.restore();
        done();
      });
    });
  });

  it('writeBlock delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'writeBlock').callsFake(
        (addr, cmd, length, buffer, cb) => setImmediate(cb, null)
      );
      const buffer = Buffer.alloc(6);
      i2c1.writeBlock(0x55, 0xaa, buffer.length, buffer).then(_ => {
        assert(i2c1.bus().writeBlock.calledOnce);
        assert.strictEqual(i2c1.bus().writeBlock.firstCall.args.length, 5);
        assert.strictEqual(i2c1.bus().writeBlock.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().writeBlock.firstCall.args[1], 0xaa);
        assert.strictEqual(i2c1.bus().writeBlock.firstCall.args[2], buffer.length);
        assert.strictEqual(i2c1.bus().writeBlock.firstCall.args[3], buffer);
        assert.strictEqual(typeof i2c1.bus().writeBlock.firstCall.args[4], 'function');
        i2c1.bus().writeBlock.restore();
        done();
      });
    });
  });

  it('writeByte delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'writeByte').callsFake(
        (addr, cmd, byte, cb) => setImmediate(cb, null)
      );
      i2c1.writeByte(0x55, 0xaa, 0xcc).then(_ => {
        assert(i2c1.bus().writeByte.calledOnce);
        assert.strictEqual(i2c1.bus().writeByte.firstCall.args.length, 4);
        assert.strictEqual(i2c1.bus().writeByte.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().writeByte.firstCall.args[1], 0xaa);
        assert.strictEqual(i2c1.bus().writeByte.firstCall.args[2], 0xcc);
        assert.strictEqual(typeof i2c1.bus().writeByte.firstCall.args[3], 'function');
        i2c1.bus().writeByte.restore();
        done();
      });
    });
  });

  it('writeI2cBlock delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'writeI2cBlock').callsFake(
        (addr, cmd, length, buffer, cb) => setImmediate(cb, null)
      );
      const buffer = Buffer.alloc(6);
      i2c1.writeI2cBlock(0x55, 0xaa, buffer.length, buffer).then(_ => {
        assert(i2c1.bus().writeI2cBlock.calledOnce);
        assert.strictEqual(i2c1.bus().writeI2cBlock.firstCall.args.length, 5);
        assert.strictEqual(i2c1.bus().writeI2cBlock.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().writeI2cBlock.firstCall.args[1], 0xaa);
        assert.strictEqual(i2c1.bus().writeI2cBlock.firstCall.args[2], buffer.length);
        assert.strictEqual(i2c1.bus().writeI2cBlock.firstCall.args[3], buffer);
        assert.strictEqual(typeof i2c1.bus().writeI2cBlock.firstCall.args[4], 'function');
        i2c1.bus().writeI2cBlock.restore();
        done();
      });
    });
  });

  it('writeQuick delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'writeQuick').callsFake(
        (addr, bit, cb) => setImmediate(cb, null)
      );
      i2c1.writeQuick(0x55, 0x01).then(_ => {
        assert(i2c1.bus().writeQuick.calledOnce);
        assert.strictEqual(i2c1.bus().writeQuick.firstCall.args.length, 3);
        assert.strictEqual(i2c1.bus().writeQuick.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().writeQuick.firstCall.args[1], 0x01);
        assert.strictEqual(typeof i2c1.bus().writeQuick.firstCall.args[2], 'function');
        i2c1.bus().writeQuick.restore();
        done();
      });
    });
  });

  it('writeWord delegates', (done) => {
    i2c.openPromisified(1).
    then(i2c1 => {
      sinon.stub(i2c1.bus(), 'writeWord').callsFake(
        (addr, cmd, byte, cb) => setImmediate(cb, null)
      );
      i2c1.writeWord(0x55, 0xaa, 0xffff).then(_ => {
        assert(i2c1.bus().writeWord.calledOnce);
        assert.strictEqual(i2c1.bus().writeWord.firstCall.args.length, 4);
        assert.strictEqual(i2c1.bus().writeWord.firstCall.args[0], 0x55);
        assert.strictEqual(i2c1.bus().writeWord.firstCall.args[1], 0xaa);
        assert.strictEqual(i2c1.bus().writeWord.firstCall.args[2], 0xffff);
        assert.strictEqual(typeof i2c1.bus().writeWord.firstCall.args[3], 'function');
        i2c1.bus().writeWord.restore();
        done();
      });
    });
  });


  afterEach(() => {
    mockLinux.restore();
  });
});

