'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const mockBindings = require('./mocks/bindings');
const mockLinux = require('./mocks/linux');
const mockI2c = require('./mocks/i2c.node');
const sinon = require("sinon");

mockRequire('bindings', mockBindings);
const i2c = require('../i2c-bus');


describe('scanSync', () => {
  let i2c1;

  beforeEach(() => {
    mockLinux.mockI2c1();

    i2c1 = i2c.openSync(1);

    const setUpStubs = () => {
      let currentAddr;

      sinon.stub(mockI2c, "setAddrSync").callsFake(
        (device, addr, forceAccess) => {
          currentAddr = addr;
        }
      );

      sinon.stub(mockI2c, "receiveByteSync").callsFake(
        (device) => {
          if (currentAddr >= 10 && currentAddr <= 20) {
            return 0x55;
          }

          throw new Error('No device at ' + currentAddr);
        }
      );
    };

    setUpStubs();
  });


  it('scans all addresses for devices', () => {
    const addresses = i2c1.scanSync();
    assert.deepEqual(addresses, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('scans single address for device', () => {
    const addresses = i2c1.scanSync(15);
    assert.deepEqual(addresses, [15]);
  });

  it('scans address range for devices', () => {
    const addresses = i2c1.scanSync(0, 15);
    assert.deepEqual(addresses, [10, 11, 12, 13, 14, 15]);
  });

  it('scans another address range for devices', () => {
    const addresses = i2c1.scanSync(12, 17);
    assert.deepEqual(addresses, [12, 13, 14, 15, 16, 17]);
  });


  afterEach(() => {
    mockI2c.setAddrSync.restore();
    mockI2c.receiveByteSync.restore();

    i2c1.closeSync();

    mockLinux.restore();
  });
});

