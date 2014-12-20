'use strict';

var i2c = require('../');

var DS1621_ADDR = 0x48,
  CMD_ACCESS_TL = 0xa2;

function useBusMoreThanMaxFdTimes() {
  var i2c1,
    i;

  // Assuming that less than 2000 files can be opened at the same time,
  // open and close /dev/i2c-1 2000 times to make sure it works and to ensure
  // that file descriptors are being freed.
  for (i = 1; i <= 2000; i += 1) {
    i2c1 = i2c.openSync(1);
    i2c1.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
    i2c1.closeSync();
  }
}

function useMultipleObjectsForSameBusConcurrently() {
  var buses = [],
    i;

  // Make sure many Bus objects can be opened and used for the same I2C bus at
  // the same time.
  for (i = 1; i <= 128; i += 1) {
    buses.push(i2c.openSync(1));
  }
  buses.forEach(function (bus) {
    bus.readWordSync(DS1621_ADDR, CMD_ACCESS_TL);
  });
  buses.forEach(function (bus) {
    bus.closeSync();
  });
}

(function () {
  useBusMoreThanMaxFdTimes();
  useMultipleObjectsForSameBusConcurrently();
  console.log('ok - sync-many-instances');
}());

