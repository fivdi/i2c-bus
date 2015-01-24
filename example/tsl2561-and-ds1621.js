'use strict';

var i2c = require('../'),
  ds1621,
  tsl2561;

var DS1621_ADDR = 0x48,
  DS1621_CMD_ACCESS_TH = 0xa1;

var TSL2561_ADDR = 0x39,
  TSL2561_CMD = 0x80,
  TSL2561_REG_ID = 0x0a;

ds1621 = i2c.open(1, function (err) {
  if (err) throw err;
  (function read() {
    ds1621.readWord(DS1621_ADDR, DS1621_CMD_ACCESS_TH, function (err, tempHigh) {
      if (err) throw err;
      console.log(tempHigh);
      read();
    });
  }());
});

tsl2561 = i2c.open(1, function (err) {
  if (err) throw err;
  (function read() {
    tsl2561.readByte(TSL2561_ADDR, TSL2561_CMD | TSL2561_REG_ID, function (err, id) {
      if (err) throw err;
      console.log(id);
      read();
    });
  }());
});

