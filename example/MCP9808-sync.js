// The code below is based on the Adafruit MCP9808 library (https://github.com/adafruit/Adafruit_MCP9808_Library)

var I2C_CONTROLLER_NAME = 'I2C1'; // Specific to RPi2 with Windows 10 IoT Core

var i2c = require('i2c-bus'),
  i2c1 = i2c.openSync(I2C_CONTROLLER_NAME);

var MCP9808_I2CADDR_DEFAULT = 0x18,
  MCP9808_REG_CONFIG = 0x01,
  MCP9808_REG_AMBIENT_TEMP = 0x05,
  MCP9808_REG_CONFIG_SHUTDOWN = 0x0100;

var BUFFER_SIZE = 2;

function shutdown_wake(sw_ID) {
  var conf_shutdown;
  const buffer = new Buffer(BUFFER_SIZE);
  var conf_register = i2c1.readI2cBlockSync(MCP9808_I2CADDR_DEFAULT, MCP9808_REG_CONFIG, BUFFER_SIZE, buffer);
  if (sw_ID == 1) {
    conf_shutdown = conf_register | MCP9808_REG_CONFIG_SHUTDOWN;
    i2c1.i2cWriteSync(MCP9808_I2CADDR_DEFAULT, 2, new Buffer([MCP9808_REG_CONFIG, conf_shutdown]));
  }
  if (sw_ID == 0) {
    conf_shutdown = conf_register ^ MCP9808_REG_CONFIG_SHUTDOWN;
    i2c1.i2cWriteSync(MCP9808_I2CADDR_DEFAULT, 2, new Buffer([MCP9808_REG_CONFIG, conf_shutdown]));
  }
}

function readTempC() {
  const buffer = new Buffer(BUFFER_SIZE);
  
  var t = i2c1.readI2cBlockSync(MCP9808_I2CADDR_DEFAULT, MCP9808_REG_AMBIENT_TEMP, BUFFER_SIZE, buffer);
  t = buffer[0];
  t <<= 8;
  t |= buffer[1];
  
  var temp = t & 0x0FFF;
  temp /=  16.0;
  if (t & 0x1000) temp -= 256;

  return temp;
}

(function () {
  var rawTemp;

  console.log("wake up MCP9808.... ");
  shutdown_wake(0);

  var c = readTempC();
  var f = c * 9.0 / 5.0 + 32;
  console.log("Temp: " + c + "*C");
  console.log("Temp: " + f + "*F");

  setTimeout(function() {
    console.log("Shutdown MCP9808.... ");
    shutdown_wake(1);

    i2c1.closeSync();
  }, 250);
}());