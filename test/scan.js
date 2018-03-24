'use strict';

var _ = require('lodash'),
  assert = require('assert'),
  bus = require('../').openSync(1);

var TSL2561_ADDR = 0x39,
  DS1621_ADDR = 0x48;

function scanSyncRange() {
  var devices = bus.scanSync(TSL2561_ADDR, DS1621_ADDR);

  assert(devices.length === 2, 'expected 2 devices');
  assert(
    devices[0] === TSL2561_ADDR,
    'expected device at address 0x' + TSL2561_ADDR.toString(16)
  );
  assert(
    devices[1] === DS1621_ADDR,
    'expected device at address 0x' + DS1621_ADDR.toString(16)
  );

  console.log('ok - scan');
}

function scanSyncForSingleDevice() {
  var devices = bus.scanSync(DS1621_ADDR);

  assert(devices.length === 1, 'expected 1 device');
  assert(
    devices[0] === DS1621_ADDR,
    'expected device at address 0x' + DS1621_ADDR.toString(16)
  );

  scanSyncRange();
}

function scanRange() {
  bus.scan(TSL2561_ADDR, DS1621_ADDR, function (err, devices) {
    assert(!err, 'can\'t scan range');
    assert(devices.length === 2, 'expected 2 devices');
    assert(
      devices[0] === TSL2561_ADDR,
      'expected device at address 0x' + TSL2561_ADDR.toString(16)
    );
    assert(
      devices[1] === DS1621_ADDR,
      'expected device at address 0x' + DS1621_ADDR.toString(16)
    );

    scanSyncForSingleDevice();
  });
}

function scanForSingleDevice() {
  bus.scan(DS1621_ADDR, function (err, devices) {
    assert(!err, 'can\'t scan for single device');
    assert(devices.length === 1, 'expected 1 device');
    assert(
      devices[0] === DS1621_ADDR,
      'expected device at address 0x' + DS1621_ADDR.toString(16)
    );

    scanRange();
  });
}

function scanDefaultRange() {
  var addresses = bus.scanSync();

  bus.scan(function (err, devices) {
    assert(!err, 'can\'t scan default range');
    assert(_.isEqual(addresses, devices), 'sync and async scan differ');

    scanForSingleDevice();
  });
};

scanDefaultRange();

