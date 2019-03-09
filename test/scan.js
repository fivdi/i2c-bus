'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('scan', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    const setUpStubs = () => {
      let currentAddr;

      sinon.stub(mockI2c, "setAddrAsync").callsFake(
        (device, addr, forceAccess, cb) => {
          currentAddr = addr;
          setImmediate(cb, null);
        }
      );

      sinon.stub(mockI2c, "receiveByteAsync").callsFake(
        (device, cb) => {
          if (currentAddr >= 10 && currentAddr <= 20) {
            return setImmediate(cb, null, 0x55);
          }

          setImmediate(cb, new Error('No device at ' + currentAddr));
        }
      );
    };

    setUpStubs();
  });


  it('scans all addresses for devices', (done) => {
    i2c1.scan((err, addresses) => {
      assert.deepEqual(
        addresses, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      );

      done();
    });
  });

  it('scans single address for device', (done) => {
    i2c1.scan(15, (err, addresses) => {
      assert.deepEqual(addresses, [15]);

      done();
    });
  });

  it('scans address range for devices', (done) => {
    i2c1.scan(0, 15, (err, addresses) => {
      assert.deepEqual(addresses, [10, 11, 12, 13, 14, 15]);

      done();
    });
  });

  it('scans another address range for devices', (done) => {
    i2c1.scan(12, 17, (err, addresses) => {
      assert.deepEqual(addresses, [12, 13, 14, 15, 16, 17]);

      done();
    });
  });


  afterEach(() => {
    mockI2c.setAddrAsync.restore();
    mockI2c.receiveByteAsync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

