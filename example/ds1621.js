'use strict';

var i2cbus = require('../'),
  i2c1;

var DS1621_ADDR = 0x48,
  ACCESS_CONFIG = 0xac,
  READ_TEMPERATURE = 0xaa,
  START_CONVERT = 0xee;

function readTemperature() {
  i2c1.readWordData(DS1621_ADDR, READ_TEMPERATURE, function (err, rawTemp) {
    var halfDegrees,
      temperature;

    if (err) {
      throw err;
    }

    halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15)
    if ((halfDegrees & 0x100) === 0) {
      temperature = halfDegrees / 2; // Temp +ve
    } else {
      temperature = -((~halfDegrees & 0xff) / 2); // Temp -ve
    }

    console.log(temperature);
  });
}

function startConvert() {
  i2c1.writeByteData(DS1621_ADDR, ACCESS_CONFIG, 0x0, function (err) {
    if (err) {
      throw err;
    }
    setTimeout(function () {
      i2c1.writeByte(DS1621_ADDR, START_CONVERT, function (err) {
        if (err) {
          throw err;
        }
        setInterval(readTemperature, 100);
      });
    }, 100);
  });
}

i2c1 = i2cbus.open(1, function (err) {
  if (err) {
    throw err;
  }
  startConvert();
});

