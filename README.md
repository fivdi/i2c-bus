## i2c-bus

I2C serial computer bus access

## Installation

    $ npm install i2c-bus

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

  * [bus.readByte(addr, cb)](https://github.com/fivdi/i2c-bus#busreadbyteaddr-cb)
  * [bus.readByteSync(addr)](https://github.com/fivdi/i2c-bus#busreadbytesyncaddr)
  * bus.readByteData(addr, cmd, cb)
  * bus.readByteDataSync(addr, cmd)
  * bus.readWordData(addr, cmd, cb)
  * bus.readWordDataSync(addr, cmd)
  * bus.writeByte(addr, val, cb)
  * bus.writeByteSync(addr, val)
  * bus.writeByteData(addr, cmd, val, cb)
  * bus.writeByteDataSync(addr, cmd, val)
  * bus.writeWordData(addr, cmd, val, cb)
  * bus.writeWordDataSync(addr, cmd, val)

### open(busNumber, cb)
- busNumber - the number of the I2C bus to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...
- cb - completion callback

Asynchronous open. Returns a new Bus object. The callback gets one argument (err).

### openSync(busNumber)
- busNumber - the number of the I2C bus to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...

Synchronous open. Returns a new Bus object.

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

Synchronous write word. The callback gets one argument (err).

