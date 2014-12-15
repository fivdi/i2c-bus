'use strict';

var assert = require('assert'),
  i2c = require('../'),
  i2c1 = i2c.openSync(1);

var DS1621_ADDR = 0x48,
  CMD_ACCESS_CONFIG = 0xac,
  CMD_ACCESS_TL = 0xa2;

// Wait while non volatile memory busy
function waitForWrite() {
  while (i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }
}

// Test writeByteSync & readByteSync
// Enter one shot mode and verify that one shot mode has been entered
function readWriteByte() {
  var self,
    config;

  self = i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);
  assert.strictEqual(self, i2c1, 'expected writeByteSync to return this');
  waitForWrite();
  config = i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert.strictEqual(config & 0x1, 1, 'one shot mode not eneterd');
}

// Test sendByteSync & receiveByteSync
// Read config using different techniques and verify that 1st and 2nd read
// are identical
function sendReceiveByte() {
  var self,
    expectedConfig,
    config;

  expectedConfig = i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);

  self = i2c1.sendByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  assert.strictEqual(self, i2c1, 'expected sendByteSync to return this');
  config = i2c1.receiveByteSync(DS1621_ADDR);
  assert.strictEqual(config, expectedConfig, '1st and 2nd config read differ');
}

// Test writeWordSync & readWordSync
// Change value of tl and verify that tl has been changed
function readWriteWord() {
  var self,
    oldtl,
    tl,
    newtl;

  oldtl = i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
  tl = (oldtl === 24 ? 23 : 24);
  self = i2c1.writeWordSync(DS1621_ADDR, CMD_ACCESS_TL, tl);
  assert.strictEqual(self, i2c1, 'expected writeWordSync to return this');
  waitForWrite();
  newtl = i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
  assert.strictEqual(tl, newtl, 'unexpected tl');
}

// Test writeBytesSync & readBytesSync
// Change value of tl to 22 and verify that tl has been changed
function readWriteBytes() {
  var self,
    tlbuf = new Buffer(10),
    newtl = new Buffer(10),
    bytesRead;

  tlbuf.writeUInt16LE(22, 0);
  self = i2c1.writeBytesSync(DS1621_ADDR, CMD_ACCESS_TL, 2, tlbuf);
  assert.strictEqual(self, i2c1, 'expected writeBytesSync to return this');
  waitForWrite();

  bytesRead = i2c1.readBytesSync(DS1621_ADDR, CMD_ACCESS_TL, 2, newtl);
  assert.strictEqual(bytesRead, 2, 'expected readBytesSync to read 2 bytes');
  assert.strictEqual(newtl.readUInt16LE(0), 22, 'expected readBytesSync to read value 22');
}

(function () {
  readWriteByte();
  sendReceiveByte();
  readWriteWord();
  readWriteBytes();

  i2c1.closeSync();

  console.log('ok - sync');
}());

