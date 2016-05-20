// The code below is based on the Adafruit MCP9808 library (https://github.com/adafruit/Adafruit_MCP9808_Library)

'use strict';

var I2C_CONTROLLER_NAME = 'I2C1'; // Specific to RPi2 with Windows 10 IoT Core

var async = require('async'),
  i2c = require('i2c-bus'),
  i2c1;

var MCP9808_I2CADDR_DEFAULT = 0x18,
  MCP9808_REG_CONFIG = 0x01,
  MCP9808_REG_AMBIENT_TEMP = 0x05,
  MCP9808_REG_CONFIG_SHUTDOWN = 0x0100;

var BUFFER_SIZE = 2;

function shutdown_wake(sw_ID, callback) {
  var conf_shutdown;
  const buffer = new Buffer(BUFFER_SIZE);

  async.series([
    function (cb) {
      i2c1.readI2cBlock(MCP9808_I2CADDR_DEFAULT, MCP9808_REG_CONFIG, BUFFER_SIZE, buffer, function (err, conf_register) {
        if (err) {
          throw err;
        }

        if (sw_ID == 1) {
          conf_shutdown = conf_register | MCP9808_REG_CONFIG_SHUTDOWN;
        }
        if (sw_ID == 0) {
          conf_shutdown = conf_register ^ MCP9808_REG_CONFIG_SHUTDOWN;
        }
        cb(null);
      });
    },
    function (cb) {
      i2c1.i2cWrite(MCP9808_I2CADDR_DEFAULT, 2, new Buffer([MCP9808_REG_CONFIG, conf_shutdown]), function (err, bytesWrittern) {
        if (err) {
          throw err;
        }

        cb(null);
      });
    },
  ], function (err) {
    if (err) {
      throw err;
    }

    callback(null);
  });
}

function readTempC(callback) {
  const buffer = new Buffer(BUFFER_SIZE);
  var t;
  var temp;

  async.series([
    function (cb) {
      i2c1.readI2cBlock(MCP9808_I2CADDR_DEFAULT, MCP9808_REG_AMBIENT_TEMP, BUFFER_SIZE, buffer, function (err, result) {
        if (err) {
          throw err;
        }

        t = result;
        cb(null);
      });
    },
    function (cb) {
      t = buffer[0];
      t <<= 8;
      t |= buffer[1];

      temp = t & 0x0FFF;
      temp /= 16.0;
      if (t & 0x1000) temp -= 256;
      cb(null, temp);
    },
  ], function (err, results) {
    if (err) {
      throw err;
    }

    callback(results[1]);
    return temp;
  });
}


(function () {
  var rawTemp;
  var c;

  async.series([
    function (cb) {
      i2c1 = i2c.open(I2C_CONTROLLER_NAME, cb);
    },
    function (cb) {
      console.log("wake up MCP9808.... ");
      shutdown_wake(0, function () {
        cb(null);
      });
    },
    function (cb) {
      readTempC(function (temp) {
        c = temp;
        cb(null);
      });
    },
    function (cb) {
      var f = c * 9.0 / 5.0 + 32;
      console.log("Temp: " + c + "*C");
      console.log("Temp: " + f + "*F");
      cb(null);
    },
    function (cb) {
      setTimeout(function () {
        console.log("Shutdown MCP9808.... ");
        shutdown_wake(1, function () {
          cb(null);
        });
      }, 250);
    },
    function (cb) {
      i2c1.close(cb);
    },
  ], function (err) {
    if (err) {
      throw err;
    }
  });
}());
