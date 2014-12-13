'use strict';

var assert = require('assert'),
  i2cbus = require('../'),
  i2c1 = i2cbus.openSync(1);

var DS1621_ADDR = 0x48,
  CMD_ACCESS_CONFIG = 0xac,
  CMD_ACCESS_TL = 0xa2;

// Wait while non volatile memory busy
function waitForWrite() {
  var config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  while (config & 0x10) {
    config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  }
}

(function () {
  var config, config2, oldtl, newtl, newtl2, self;

  // Test writeByteDataSync & readByteDataSync
  // Enter one shot mode and verify that one shot mode has been entered
  self = i2c1.writeByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);
  assert.strictEqual(self, i2c1, 'expected writeByteDataSync to return this');
  waitForWrite();
  config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert.strictEqual(config & 0x1, 1, 'one shot mode not eneterd');

  // Test writeByteSync & readByteSync
  // Read config again and verify that 1st and 2nd read are identical
  self = i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert.strictEqual(self, i2c1, 'expected writeByteSync to return this');
  config2 = i2c1.readByteSync(DS1621_ADDR);
  assert.strictEqual(config, config2, '1st and 2nd config read differ');

  // Test writeWordDataSync & readWordDataSync
  // Change value of tl and verify that tl has been changed
  oldtl = i2c1.readWordDataSync(DS1621_ADDR, CMD_ACCESS_TL);
  newtl = (oldtl === 24 ? 23 : 24);
  self = i2c1.writeWordDataSync(DS1621_ADDR, CMD_ACCESS_TL, newtl);
  assert.strictEqual(self, i2c1, 'expected writeWordDataSync to return this');
  waitForWrite();
  newtl2 = i2c1.readWordDataSync(DS1621_ADDR, CMD_ACCESS_TL);
  assert.strictEqual(newtl, newtl2, 'unexpected tl');

  i2c1.closeSync();

  console.log('ok - sync');
}());

