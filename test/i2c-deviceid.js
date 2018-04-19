'use strict';

var i2c = require('../'),
  i2c1 = i2c.openSync(42);

(function () {
  const address = 0x50;

  i2c1.deviceId(address, (err, id) => {
    if(err) { console.log('error', err); }
    else console.log('id for address', '0x'+address.toString(16), id);

    i2c1.closeSync();
  });

}());

