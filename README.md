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

- open(busNumber, cb)
- openSync(busNumber)

- bus.readByte(addr, cb)
- bus.readByteSync(addr)
- bus.readByteData(addr, cmd, cb)
- bus.readByteDataSync(addr, cmd)
- bus.readWordData(addr, cmd, cb)
- bus.readWordDataSync(addr, cmd)
- bus.writeByte(addr, val, cb)
- bus.writeByteSync(addr, val)
- bus.writeByteData(addr, cmd, val, cb)
- bus.writeByteDataSync(addr, cmd, val)
- bus.writeWordData(addr, cmd, val, cb)
- bus.writeWordDataSync(addr, cmd, val)

### open(busNumber, cb)
- busNumber - the number of the I2C bus to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...
- cb - completion callback

Asynchronous open. Returns a new Bus object. The callback gets one argument (err).

### openSync(busNumber)
- busNumber - the number of the I2C bus to open, 0 for /dev/i2c-0, 1 for /dev/i2c-1, ...

Synchronous open. Returns a new Bus object.

### bus.readByte(addr, cb)
- addr - device address
- cb - completion callback

Asynchronous receive byte. The callback gets two arguments (err, byte).

### bus.readByteSync(addr)
- addr - device address

Synchronous receive byte. Returns the byte received.

