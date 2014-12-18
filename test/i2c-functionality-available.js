'use strict';

var i2c = require('../'),
  i2c1 = i2c.openSync(1);

(function () {
  var i2cfuncs = i2c1.i2cFuncsSync();
  var platform = i2cfuncs.smbusQuick ? 'may have been tested on a pi' : 'may have been tested on a bb';

  i2c1.closeSync();

  console.log('ok - i2c-functionality-available - ' + platform);
}());

