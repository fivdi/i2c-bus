## i2c-bus

I2C serial computer bus access

## Installation

    $ npm install i2c-bus

## Example 1 - Determine Temperature

Determine the temperature with a [DS1621](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS1621.html)
temperature sensor.

<img src="https://github.com/fivdi/i2c-bus/raw/master/example/ds1621_bb.png">

```js
var i2c = require('i2c-bus'),
  i2c1 = i2c.openSync(1);

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

(function () {
  var rawTemp;

  // Enter one shot mode (this is a non volatile setting)
  i2c1.writeByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);

  // Wait while non volatile memory busy
  while (i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }

  // Start temperature conversion
  i2c1.sendByteSync(DS1621_ADDR, CMD_START_CONVERT);

  // Wait for temperature conversion to complete
  while ((i2c1.readByteSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x80) === 0) {
  }

  // Display temperature
  rawTemp = i2c1.readWordSync(DS1621_ADDR, CMD_READ_TEMP);
  console.log('temp: ' + rawTempToTemp(rawTemp));

  i2c1.closeSync();
}());
```

## Example 2 - One Bus Two Devices

This example shows how to access two devices on the same bus; a
[DS1621](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS1621.html)
temperature sensor and an
[Adafruit TSL2561 Digital Luminosity/Lux/Light Sensor](http://www.adafruit.com/products/439).

```js
var i2c = require('i2c-bus'),
  i2c1 = i2c.openSync(1);

var DS1621_ADDR = 0x48,
  DS1621_CMD_ACCESS_TH = 0xa1;

var TSL2561_ADDR = 0x39,
  TSL2561_CMD = 0x80,
  TSL2561_REG_ID = 0x0a;

(function () {
  var ds1621TempHigh = i2c1.readWordSync(DS1621_ADDR, DS1621_CMD_ACCESS_TH),
    tsl2561Id = i2c1.readByteSync(TSL2561_ADDR, TSL2561_CMD | TSL2561_REG_ID);

  console.log("ds1621TempHigh: " + ds1621TempHigh);
  console.log("tsl2561Id: " + tsl2561Id);

  i2c1.closeSync();
}());
```

## API

All methods have asynchronous and synchronous forms.

The asynchronous form always take a completion callback as its last argument.
The arguments passed to the completion callback depend on the method, but the
first argument is always reserved for an exception. If the operation was
completed successfully, then the first argument will be null or undefined.

When using the synchronous form any exceptions are immediately thrown. You can
use try/catch to handle exceptions or allow them to bubble up. 

### Methods

  * [open(busNumber, cb)](https://github.com/fivdi/i2c-bus#openbusnumber-cb)
  * [openSync(busNumber)](https://github.com/fivdi/i2c-bus#opensyncbusnumber)

### Class Bus

  * [bus.close(cb)](https://github.com/fivdi/i2c-bus#busclose-cb)
  * [bus.closeSync()](https://github.com/fivdi/i2c-bus#busclosesync)
  * [bus.receiveByte(addr, cb)](https://github.com/fivdi/i2c-bus#busreceivebyteaddr-cb)
  * [bus.receiveByteSync(addr)](https://github.com/fivdi/i2c-bus#busreceivebytesyncaddr)
  * [bus.readByte(addr, cmd, cb)](https://github.com/fivdi/i2c-bus#busreadbyteaddr-cmd-cb)
  * [bus.readByteSync(addr, cmd)](https://github.com/fivdi/i2c-bus#busreadbytesyncaddr-cmd)
  * [bus.readWord(addr, cmd, cb)](https://github.com/fivdi/i2c-bus#busreadwordaddr-cmd-cb)
  * [bus.readWordSync(addr, cmd)](https://github.com/fivdi/i2c-bus#busreadwordsyncaddr-cmd)
  * [bus.readBytes(addr, cmd, length, buffer, cb)](https://github.com/fivdi/i2c-bus#busreadbytesaddr-cmd-length-buffer-cb)
  * [bus.readBytesSync(addr, cmd, length, buffer)](https://github.com/fivdi/i2c-bus#busreadbytessyncaddr-cmd-length-buffer)
  * [bus.sendByte(addr, val, cb)](https://github.com/fivdi/i2c-bus#bussendbyteaddr-val-cb)
  * [bus.sendByteSync(addr, val)](https://github.com/fivdi/i2c-bus#bussendbytesyncaddr-val)
  * [bus.writeByte(addr, cmd, val, cb)](https://github.com/fivdi/i2c-bus#buswritebyteaddr-cmd-val-cb)
  * [bus.writeByteSync(addr, cmd, val)](https://github.com/fivdi/i2c-bus#buswritebytesyncaddr-cmd-val)
  * [bus.writeWord(addr, cmd, val, cb)](https://github.com/fivdi/i2c-bus#buswritewordaddr-cmd-val-cb)
  * [bus.writeWordSync(addr, cmd, val)](https://github.com/fivdi/i2c-bus#buswritewordsyncaddr-cmd-val)
  * [bus.writeBytes(addr, cmd, length, buffer, cb)](https://github.com/fivdi/i2c-bus#buswritebytesaddr-cmd-length-buffer-cb)
  * [bus.writeBytesSync(addr, cmd, length, buffer)](https://github.com/fivdi/i2c-bus#buswritebytessyncaddr-cmd-length-buffer)

### open(busNumber, cb)
- busNumber - the number of the I2C bus to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...
- cb - completion callback

Asynchronous open. Returns a new Bus object. The callback gets one argument (err).

### openSync(busNumber)
- busNumber - the number of the I2C bus to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...

Synchronous open. Returns a new Bus object.

### bus.close(cb)
- cb - completion callback

Asynchronous close. The callback gets one argument (err).

### bus.closeSync()

Synchronous close.

### bus.receiveByte(addr, cb)
- addr - I2C device address
- cb - completion callback

Asynchronous receive byte. The callback gets two arguments (err, byte).

### bus.receiveByteSync(addr)
- addr - I2C device address

Synchronous receive byte. Returns the byte received.

### bus.readByte(addr, cmd, cb)
- addr - I2C device address
- cmd - command code
- cb - completion callback

Asynchronous read byte. The callback gets two arguments (err, byte).

### bus.readByteSync(addr, cmd)
- addr - I2C device address
- cmd - command code

Synchronous read byte. Returns the byte read.

### bus.readWord(addr, cmd, cb)
- addr - I2C device address
- cmd - command code
- cb - completion callback

Asynchronous read word. The callback gets two arguments (err, word).

### bus.readWordSync(addr, cmd)
- addr - I2C device address
- cmd - command code

Synchronous read word. Returns the word read.

### bus.readBytes(addr, cmd, length, buffer, cb)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to read (max 32)
- buffer - the buffer that the data will be written to (must conatin at least length bytes)
- cb - completion callback

Asynchronous I2C read write. The callback gets three arguments (err, bytesRead, buffer).

### bus.readBytesSync(addr, cmd, length, buffer)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to read (max 32)
- buffer - the buffer that the data will be written to (must conatin at least length bytes)

Synchronous I2C block read. Returns the number of bytes read.

### bus.sendByte(addr, val, cb)
- addr - I2C device address
- val - data byte
- cb - completion callback

Asynchronous send byte. The callback gets one argument (err).

### bus.sendByteSync(addr, val)
- addr - I2C device address
- val - data byte

Synchronous send byte.

### bus.writeByte(addr, cmd, val, cb)
- addr - I2C device address
- cmd - command code
- val - data byte
- cb - completion callback

Asynchronous write byte. The callback gets one argument (err).

### bus.writeByteSync(addr, cmd, val)
- addr - I2C device address
- cmd - command code
- val - data byte

Synchronous write byte.

### bus.writeWord(addr, cmd, val, cb)
- addr - I2C device address
- cmd - command code
- val - data word
- cb - completion callback

Asynchronous write word. The callback gets one argument (err).

### bus.writeWordSync(addr, cmd, val)
- addr - I2C device address
- cmd - command code
- val - data word

Synchronous write word.

### bus.writeBytes(addr, cmd, length, buffer, cb)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to write (max 32)
- buffer - the buffer containing the data to write (must conatin at least length bytes)
- cb - completion callback

Asynchronous I2C block write. The callback gets one argument (err).

### bus.writeBytesSync(addr, cmd, length, buffer)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to write (max 32)
- buffer - the buffer containing the data to write (must conatin at least length bytes)

Synchronous I2C block write.

