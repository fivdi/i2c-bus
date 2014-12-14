## i2c-bus

I2C serial computer bus access

## Installation

    $ npm install i2c-bus

## Example

Determine the temperature with a [DS1621](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS1621.html)
temperature sensor.

<img src="https://github.com/fivdi/i2c-bus/raw/master/example/ds1621_bb.png">

```js
var i2cbus = require('i2c-bus'),
  i2c1 = i2cbus.openSync(1);

var DS1621_ADDR = 0x48,
  CMD_ACCESS_CONFIG = 0xac,
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
  var temp;

  // Enter one shot mode
  i2c1.writeByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG, 0x01);

  // Wait while non volatile memory busy
  while (i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
  }

  // Start conversion
  i2c1.writeByteSync(DS1621_ADDR, CMD_START_CONVERT);

  // Wait for conversion to complete
  while ((i2c1.readByteDataSync(DS1621_ADDR, CMD_ACCESS_CONFIG) & 0x80) === 0) {
  }

  // Display temperature
  temp = i2c1.readWordDataSync(DS1621_ADDR, CMD_READ_TEMP);
  console.log('temp: ' + convertToTemp(temp));

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
  * [bus.readByte(addr, cb)](https://github.com/fivdi/i2c-bus#busreadbyteaddr-cb)
  * [bus.readByteSync(addr)](https://github.com/fivdi/i2c-bus#busreadbytesyncaddr)
  * [bus.readByteData(addr, cmd, cb)](https://github.com/fivdi/i2c-bus#busreadbytedataaddr-cmd-cb)
  * [bus.readByteDataSync(addr, cmd)](https://github.com/fivdi/i2c-bus#busreadbytedatasyncaddr-cmd)
  * [bus.readWordData(addr, cmd, cb)](https://github.com/fivdi/i2c-bus#busreadworddataaddr-cmd-cb)
  * [bus.readWordDataSync(addr, cmd)](https://github.com/fivdi/i2c-bus#busreadworddatasyncaddr-cmd)
  * [bus.readI2cBlockData(addr, cmd, length, buffer, cb)](https://github.com/fivdi/i2c-bus#busreadi2cblockdataaddr-cmd-length-buffer-cb)
  * [bus.readI2cBlockDataSync(addr, cmd, length, buffer)](https://github.com/fivdi/i2c-bus#busreadi2cblockdatasyncaddr-cmd-length-buffer)
  * [bus.writeByte(addr, val, cb)](https://github.com/fivdi/i2c-bus#buswritebyteaddr-val-cb)
  * [bus.writeByteSync(addr, val)](https://github.com/fivdi/i2c-bus#buswritebytesyncaddr-val)
  * [bus.writeByteData(addr, cmd, val, cb)](https://github.com/fivdi/i2c-bus#buswritebytedataaddr-cmd-val-cb)
  * [bus.writeByteDataSync(addr, cmd, val)](https://github.com/fivdi/i2c-bus#buswritebytedatasyncaddr-cmd-val)
  * [bus.writeWordData(addr, cmd, val, cb)](https://github.com/fivdi/i2c-bus#buswriteworddataaddr-cmd-val-cb)
  * [bus.writeWordDataSync(addr, cmd, val)](https://github.com/fivdi/i2c-bus#buswriteworddatasyncaddr-cmd-val)
  * [bus.writeI2cBlockData(addr, cmd, length, buffer, cb)](https://github.com/fivdi/i2c-bus#buswritei2cblockdataaddr-cmd-length-buffer-cb)
  * [bus.writeI2cBlockDataSync(addr, cmd, length, buffer)](https://github.com/fivdi/i2c-bus#buswritei2cblockdatasyncaddr-cmd-length-buffer)

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

### bus.readByte(addr, cb)
- addr - I2C device address
- cb - completion callback

Asynchronous receive byte. The callback gets two arguments (err, byte).

### bus.readByteSync(addr)
- addr - I2C device address

Synchronous receive byte. Returns the byte received.

### bus.readByteData(addr, cmd, cb)
- addr - I2C device address
- cmd - command code
- cb - completion callback

Asynchronous read byte. The callback gets two arguments (err, byte).

### bus.readByteDataSync(addr, cmd)
- addr - I2C device address
- cmd - command code

Synchronous read byte. Returns the byte read.

### bus.readWordData(addr, cmd, cb)
- addr - I2C device address
- cmd - command code
- cb - completion callback

Asynchronous read word. The callback gets two arguments (err, word).

### bus.readWordDataSync(addr, cmd)
- addr - I2C device address
- cmd - command code

Synchronous read word. Returns the word read.

### bus.readI2cBlockData(addr, cmd, length, buffer, cb)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to read (max 32)
- buffer - the buffer that the data will be written to (must conatin at least length bytes)
- cb - completion callback

Asynchronous I2C read write. The callback gets three arguments (err, bytesRead, buffer).

### bus.readI2cBlockDataSync(addr, cmd, length, buffer)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to read (max 32)
- buffer - the buffer that the data will be written to (must conatin at least length bytes)

Synchronous I2C block read. Returns the number of bytes read.

### bus.writeByte(addr, val, cb)
- addr - I2C device address
- val - data byte
- cb - completion callback

Asynchronous send byte. The callback gets one argument (err).

### bus.writeByteSync(addr, val)
- addr - I2C device address
- val - data byte

Synchronous send byte.

### bus.writeByteData(addr, cmd, val, cb)
- addr - I2C device address
- cmd - command code
- val - data byte
- cb - completion callback

Asynchronous write byte. The callback gets one argument (err).

### bus.writeByteDataSync(addr, cmd, val)
- addr - I2C device address
- cmd - command code
- val - data byte

Synchronous write byte.

### bus.writeWordData(addr, cmd, val, cb)
- addr - I2C device address
- cmd - command code
- val - data word
- cb - completion callback

Asynchronous write word. The callback gets one argument (err).

### bus.writeWordDataSync(addr, cmd, val)
- addr - I2C device address
- cmd - command code
- val - data word

Synchronous write word.

### bus.writeI2cBlockData(addr, cmd, length, buffer, cb)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to write (max 32)
- buffer - the buffer containing the data to write (must conatin at least length bytes)
- cb - completion callback

Asynchronous I2C block write. The callback gets one argument (err).

### bus.writeI2cBlockDataSync(addr, cmd, length, buffer)
- addr - I2C device address
- cmd - command code
- length - an integer specifying the number of bytes to write (max 32)
- buffer - the buffer containing the data to write (must conatin at least length bytes)

Synchronous I2C block write.

