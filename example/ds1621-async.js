'use strict';

var i2c = require('../'),
  i2c1;

var DS1621_ADDR = 0x48,
  CMD_ACCESS_CONFIG = 0xac,
  CMD_READ_TEMP = 0xaa,
  CMD_START_CONVERT = 0xee;

function rawTempToTemp(rawTemp) {
  var halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

  if ((halfDegrees & 0x100) === 0) {
    return halfDegrees / 2; // Temp +ve
  }

  return -((~halfDegrees & 0xff) / 2); // Temp -ve
}

// Wait while non volatile memory busy
function whenMemoryReady(cb) {
  i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, function (err, config) {
    if (err) {
      return cb(err);
    }

    if (config & 0x10) {
      return whenMemoryReady(cb);
    }

    cb(null);
  });
}

// Enter one shot mode (this is a non volatile setting)
function startOneShotMode(cb) {
  i2c1.writeByte(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01, function (err) {
    if (err) {
      return cb(err);
    }

    whenMemoryReady(cb);
  });
}

// Wait for temperature conversion to complete
function whenConversionComplete(cb) {
  i2c1.readByte(DS1621_ADDR, CMD_ACCESS_CONFIG, function (err, config) {
    if (err) {
      return cb(err);
    }

    if ((config & 0x80) === 0) {
      return whenConversionComplete(cb);
    }

    cb(null);
  });
}

// Start temperature conversion
function startConversion(cb) {
  i2c1.sendByte(DS1621_ADDR, CMD_START_CONVERT, function (err) {
    if (err) {
      return cb(err);
    }

    whenConversionComplete(cb);
  });
}

function readTemperature(cb) {
  i2c1.readWord(DS1621_ADDR, CMD_READ_TEMP, function (err, rawTemp) {
    if (err) {
      return cb(err);
    }

    cb(null, rawTempToTemp(rawTemp));
  });
}

i2c1 = i2c.open(1, function () {
  startOneShotMode(function (err) {
    if (err) {
      throw err;
    }

    startConversion(function (err) {
      if (err) {
        throw err;
      }

      readTemperature(function (err, temp) {
        if (err) {
          throw err;
        }

        console.log('temp: ' + temp);

        i2c1.close();
      });
    });
  });
});

