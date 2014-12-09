'use strict';

var i2cbus = require('../'),
  i2c1 = i2cbus.openSync(1);

var DS1621_ADDR = 0x48,
  CMD_ACCESS_CONFIG = 0xac,
  CMD_ACCESS_TH = 0xa1,
  CMD_ACCESS_TL = 0xa2,
  CMD_READ_TEMP = 0xaa,
  CMD_START_CONVERT = 0xee;

function convertToTemp(rawTemp) {
  var halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

  if ((halfDegrees & 0x100) === 0) {
    return halfDegrees / 2; // Temp +ve
  }

  return -((~halfDegrees & 0xff) / 2); // Temp -ve
}

(function () {
  var config, tl, th, temp;

  // Enter one shot mode
  i2c1.writeByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);

  // Wait while non volatile memory busy
  config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  while (config & 0x10) {
    console.log('non volatile memory busy... config: 0x' + config.toString(16));
    config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  }
  console.log('non volatile memory ready... config: 0x' + config.toString(16));

  // Start conversion
  i2c1.writeByteSync(DS1621_ADDR, CMD_START_CONVERT);

  // Wait for conversion to complete
  config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  while ((config & 0x80) === 0) {
    config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  }
  console.log('conversion complete... config: 0x' + config.toString(16));

  // Display temp
  temp = i2c1.readWordDataSync(DS1621_ADDR, CMD_READ_TEMP);
  console.log('temp: ' + convertToTemp(temp));

  // Display temp low
  tl = i2c1.readWordDataSync(DS1621_ADDR, CMD_ACCESS_TL);
  console.log('tl: ' + convertToTemp(tl));

  // Display temp high
  th = i2c1.readWordDataSync(DS1621_ADDR, CMD_ACCESS_TH);
  console.log('th: ' + convertToTemp(th));

  // Display config (using writeByteSync + readByteSync)
  i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  config = i2c1.readByteSync(DS1621_ADDR);
  console.log('config: 0x' + config.toString(16));

  // Display config (using readByteDataSync)
  config = i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG);
  console.log('config: 0x' + config.toString(16));
}());

