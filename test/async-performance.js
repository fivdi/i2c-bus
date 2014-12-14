'use strict';

var assert = require('assert'),
  i2c = require('../'),
  i2c1,
  iterations = 10000,
  time,
  readsPerSec;

var DS1621_ADDR = 0x48,
  CMD_ACCESS_TL = 0xa2;

function performanceTest(testRuns) {
  i2c1.readWordData(DS1621_ADDR, CMD_ACCESS_TL, function (err, word) {
    testRuns -= 1;
    if (testRuns === 0) {
      time = process.hrtime(time);
      readsPerSec = Math.floor(iterations / (time[0] + time[1] / 1E9));
      i2c1.closeSync();
      console.log('ok - async-performance - ' + readsPerSec + ' reads per second');
    } else {
      performanceTest(testRuns);
    }
  });
}

i2c1 = i2c.open(1, function (err) {
  time = process.hrtime();
  performanceTest(iterations);
});

