'use strict';

var _ = require('lodash'),
  assert = require('assert'),
  bus = require('../').openSync(1);

(function () {
  var addresses = bus.scanSync();

  bus.scan(function (err, devices) {
    assert(!err, 'can\'t scan for devices');
    assert(_.isEqual(addresses, devices), 'sync and async scan differ');
    console.log('ok - scan');
  });
}());

