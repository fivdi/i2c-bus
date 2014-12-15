'use strict';

var i2c = require('../'),
  i2c1 = i2c.openSync(1);

var DS1621_ADDR = 0x48,
  DS1621_CMD_ACCESS_TH = 0xa1;

var TSL2561_ADDR = 0x39,
  TSL2561_CMD = 0x80,
  TSL2561_REG_ID = 0x0a;

(function () {
  var ds1621TempHigh = i2c1.readWordSync(DS1621_ADDR, DS1621_CMD_ACCESS_TH),
    tsl2561Id = i2c1.readByteSync(TSL2561_ADDR, TSL2561_CMD | TSL2561_REG_ID);

  console.log("ds1621TempHigh: " + ds1621TempHigh);
  console.log("tsl2561Id: " + tsl2561Id);

  i2c1.closeSync();
}());

