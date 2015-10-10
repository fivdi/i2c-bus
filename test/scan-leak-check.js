'use strict';

var _ = require('lodash'),
  assert = require('assert'),
  bus = require('../').openSync(1),
  count = 0;

(function next() {
  var addresses = bus.scanSync();

  bus.scan(function (err, devices) {
    assert(!err, 'can\'t scan for devices');
    assert(_.isEqual(addresses, devices), 'sync and async scan differ');

    count += 1;
    if (count % 10 === 0) {
      console.log(count);
    }

    next();
  });
}());

