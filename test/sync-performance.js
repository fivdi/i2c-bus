'use strict';

var assert = require('assert'),
  i2c = require('../'),
  i2c1 = i2c.openSync(1);

var DS1621_ADDR = 0x48,
  CMD_ACCESS_TL = 0xa2;

(function () {
  var time, reads, readsPerSec, tl;

  time = process.hrtime();

  for (reads = 1; reads <= 10000; reads += 1) {
    tl = i2c1.readWordDataSync(DS1621_ADDR, CMD_ACCESS_TL);
  }

  time = process.hrtime(time);
  readsPerSec = Math.floor(reads / (time[0] + time[1] / 1E9));

  i2c1.closeSync();

  console.log('ok - sync-performance - ' + readsPerSec + ' reads per second');
}());

