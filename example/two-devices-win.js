'use strict';

var I2C_CONTROLLER_NAME = 'I2C1'; // Specific to RPi2 with Windows 10 IoT Core

var i2c = require('i2c-bus'),
  i2c1;

var MCP9808_I2CADDR_DEFAULT = 0x18,
  MCP9808_REG_CONFIG = 0x01,
  MCP9808_REG_AMBIENT_TEMP = 0x05,
  MCP9808_REG_CONFIG_SHUTDOWN = 0x0100,
  SI1145_ADDR = 0x60,
  SI1145_REG_UVINDEX0 = 0x2C;

var BUFFER_SIZE = 2;

i2c1 = i2c.open(I2C_CONTROLLER_NAME, function (err) {
  if (err) throw err;

  (function readTemp() {
    let buffer = new Buffer(BUFFER_SIZE);
    i2c1.readI2cBlock(MCP9808_I2CADDR_DEFAULT, MCP9808_REG_AMBIENT_TEMP, BUFFER_SIZE, buffer, function (err, br, buffer) {
      if (err) throw err;
      // Print raw data. The code for conversion can be found in MCP9808-sync.js
      // (based on https://github.com/adafruit/Adafruit_MCP9808_Library)
      console.log('temp value: ' + buffer[0]);
      readTemp();
    });
  }());

  (function readUV() {
    let buffer = new Buffer(BUFFER_SIZE);
    i2c1.readI2cBlock(SI1145_ADDR, SI1145_REG_UVINDEX0, BUFFER_SIZE, buffer, function (err, br, buffer) {
      if (err) throw err;
      // Print raw data. The code for conversion can be found in SI1145-sync.js
      // (based on https://github.com/adafruit/Adafruit_SI1145_Library)
      console.log('uv value: ' + buffer[0]);
      readUV();
    });
  }());
});