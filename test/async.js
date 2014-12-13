'use strict';

var assert = require('assert'),
  i2cbus = require('../'),
  i2c1;

var DS1621_ADDR = 0x48,
  CMD_ACCESS_CONFIG = 0xac,
  CMD_ACCESS_TL = 0xa2;

// Wait while non volatile memory busy
function waitForWrite(cb) {
  i2c1.readByteData(DS1621_ADDR, CMD_ACCESS_CONFIG, function (err, config) {
    assert(!err, 'can\'t read config to determine memory status');    
    if (config & 0x10) {
      return waitForWrite(cb);
    }
    cb();
  });
}

function readWriteByteData(cb) {
  // Test writeByteData & readByteData
  // Enter continuous mode and verify that continuous mode has been entered
  i2c1.writeByteData(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x0, function (err) {
    assert(!err, 'can\'t write byte data to config');
    waitForWrite(function () {
      i2c1.readByteData(DS1621_ADDR, CMD_ACCESS_CONFIG, function (err, config) {
        assert(!err, 'can\'t read byte data from config');
        assert.strictEqual(config & 0x1, 0, 'continuous mode not eneterd');
        cb(null, config);
      });
    });
  });
}

function readWriteByte(epectedConfig, cb) {
  // Test writeByte & readByte
  // Read config and verify that it's epectedConfig
  i2c1.writeByte(DS1621_ADDR, CMD_ACCESS_CONFIG, function (err) {
    assert(!err, 'can\'t write byte to config');
    i2c1.readByte(DS1621_ADDR, function (err, config) {
      assert(!err, 'can\'t read byte from config');
      assert.strictEqual(config, epectedConfig, '1st and 2nd config read differ');
      cb();
    });
  });
}

function readWriteWordData(cb) {
  // Test writeWordData & readWordData
  // Change value of tl and verify that tl has been changed
  i2c1.readWordData(DS1621_ADDR, CMD_ACCESS_TL, function (err, oldtl) {
    var newtl;

    assert(!err, 'can\'t read word data from tl');

    newtl = (oldtl === 24 ? 23 : 24);
    i2c1.writeWordData(DS1621_ADDR, CMD_ACCESS_TL, newtl, function (err) {
      assert(!err, 'can\'t write word data to tl');

      i2c1.readWordData(DS1621_ADDR, CMD_ACCESS_TL, function (err, newtl2) {
        assert(!err, 'can\'t read new word data from tl');
        assert.strictEqual(newtl, newtl2, 'unexpected');
        cb();
      });
    });
  });
}

function test() {
  readWriteByteData(function (err, config) {
    readWriteByte(config, function () {
      readWriteWordData(function () {
        i2c1.close(function () {
          console.log('ok - async');
        });
      });
    });
  });
}

i2c1 = i2cbus.open(1, function (err) {
  assert(!err, 'can\'t open i2c bus');
  test();
});

