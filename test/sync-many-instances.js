'use strict';

var i2c = require('../');

var DS1621_ADDR = 0x48,
  CMD_ACCESS_TL = 0xa2;

(function () {
  var i2c1,
    i;

  for (i = 1; i <= 2000; i += 1) {
    i2c1 = i2c.openSync(1);
    i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
    i2c1.closeSync();
  }

  console.log('ok - sync-many-instances');
}());

