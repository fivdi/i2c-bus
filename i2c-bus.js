'use strict';

var fs = require('fs'),
  i2c = require('bindings')('i2c.node');

var BUS_FILE_PREFIX = '/dev/i2c-',
  FIRST_SCAN_ADDR = 0x03,
  LAST_SCAN_ADDR = 0x77;

// Table 4.
// https://www.nxp.com/docs/en/user-guide/UM10204.pdf
const knownManufacturers = [
  { value: 0x000, name: 'NXP Semiconductors' },
  { value: 0x001, name: 'NXP Semiconductors (reserved)' },
  { value: 0x002, name: 'NXP Semiconductors (reserved)' },
  { value: 0x003, name: 'NXP Semiconductors (reserved)' },
  { value: 0x004, name: 'Ramtron International' },
  { value: 0x005, name: 'Analog Devices' },
  { value: 0x006, name: 'STMicroelectronics' },
  { value: 0x007, name: 'ON Semiconductor' },
  { value: 0x008, name: 'Sprintek Corporation' },
  { value: 0x009, name: 'ESPROS Photonics AG' },
  { value: 0x00a, name: 'Fujitsu Semiconductor' },
  { value: 0x00b, name: 'Flir' },
  { value: 0x00c, name: 'O\u2082Micro' },
  { value: 0x00d, name: 'Atmel' }
];

function parseId(id) {
  // Figure 20. UM10204
  const manufacturer = id >> 12 & 0x0fff; // high 12bit
  const product = id & 0x0fff; // low 12bit

  const known = knownManufacturers.find(man => man.value === manufacturer);
  const name = known !== undefined ? known.name : ('<0x' + manufacturer.toString(16) + '>');

  return {
    manufacturer: manufacturer,
    product: product,
    name: name
  };
}

function checkBusNumber(busNumber) {
  if (process.platform === 'linux' &&
      (!Number.isInteger(busNumber) || busNumber < 0)) {
    throw new Error('Invalid I2C bus number ' + busNumber);
  }
}

function checkAddress(addr) {
  if (!Number.isInteger(addr) || addr < 0  || addr > 0x7f) {
    throw new Error('Invalid I2C address ' + addr);
  }
}

function checkCommand(cmd) {
  if (!Number.isInteger(cmd) || cmd < 0  || cmd > 0xff) {
    throw new Error('Invalid I2C command ' + cmd);
  }
}

function checkCallback(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Invalid callback ' + cb);
  }
}

function checkBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer ' + buffer);
  }
}

function checkBufferAndLength(length, buffer, maxLength) {
  if (!Number.isInteger(length) ||
      length < 0 ||
      (maxLength !== undefined && length > maxLength)) {
    throw new Error('Invalid buffer length ' + length);
  }

  checkBuffer(buffer);

  if (buffer.length < length) {
    throw new Error('Buffer must contain at least ' + length + ' bytes');
  }
}

function checkByte(byte) {
  if (!Number.isInteger(byte) || byte < 0  || byte > 0xff) {
    throw new Error('Invalid byte ' + byte);
  }
}

function checkWord(word) {
  if (!Number.isInteger(word) || word < 0  || word > 0xffff) {
    throw new Error('Invalid word ' + word);
  }
}

function checkBit(bit) {
  if (!Number.isInteger(bit) || bit < 0  || bit > 1) {
    throw new Error('Invalid bit ' + bit);
  }
}

function Bus(busNumber, options) {
  if (!(this instanceof Bus)) {
    return new Bus(busNumber, options);
  }

  options = options || {};

  this._busNumber = busNumber;
  this._forceAccess = !!options.forceAccess || false;
  this._peripherals = [];
}

function I2cFuncs(i2cFuncBits) {
  if (!(this instanceof I2cFuncs)) {
    return new I2cFuncs(i2cFuncBits);
  }

  this.i2c = i2cFuncBits & i2c.I2C_FUNC_I2C;
  this.tenBitAddr = i2cFuncBits & i2c.I2C_FUNC_10BIT_ADDR;
  this.protocolMangling = i2cFuncBits & i2c.I2C_FUNC_PROTOCOL_MANGLING;
  this.smbusPec = i2cFuncBits & i2c.I2C_FUNC_SMBUS_PEC;
  this.smbusBlockProcCall = i2cFuncBits & i2c.I2C_FUNC_SMBUS_BLOCK_PROC_CALL;
  this.smbusQuick = i2cFuncBits & i2c.I2C_FUNC_SMBUS_QUICK;
  this.smbusReceiveByte = i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_BYTE;
  this.smbusSendByte = i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_BYTE;
  this.smbusReadByte = i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_BYTE_DATA;
  this.smbusWriteByte = i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_BYTE_DATA;
  this.smbusReadWord = i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_WORD_DATA;
  this.smbusWriteWord = i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_WORD_DATA;
  this.smbusProcCall = i2cFuncBits & i2c.I2C_FUNC_SMBUS_PROC_CALL;
  this.smbusReadBlock = i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_BLOCK_DATA;
  this.smbusWriteBlock = i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_BLOCK_DATA;
  this.smbusReadI2cBlock = i2cFuncBits & i2c.I2C_FUNC_SMBUS_READ_I2C_BLOCK;
  this.smbusWriteI2cBlock = i2cFuncBits & i2c.I2C_FUNC_SMBUS_WRITE_I2C_BLOCK;
}

function open(busNumber, options, cb) {
  var bus;

  if (typeof options === 'function') {
    cb = options;
    options = undefined;
  }

  checkBusNumber(busNumber);
  checkCallback(cb);

  bus = new Bus(busNumber, options);

  setImmediate(cb, null);

  return bus;
}
module.exports.open = open;

function openSync(busNumber, options) {
  checkBusNumber(busNumber);

  return new Bus(busNumber, options);
}
module.exports.openSync = openSync;

function peripheral(bus, addr, cb) {
  var device = bus._peripherals[addr];

  if (device === undefined) {
    fs.open(BUS_FILE_PREFIX + bus._busNumber, 'r+', function (err, device) {
      if (err) {
        return cb(err);
      }

      bus._peripherals[addr] = device;

      i2c.setAddrAsync(device, addr, bus._forceAccess, function (err) {
        if (err) {
          return cb(err);
        }

        cb(null, device);
      });
    });
  } else {
    setImmediate(cb, null, device);
  }
}

function peripheralSync(bus, addr) {
  var peripheral = bus._peripherals[addr];

  if (peripheral === undefined) {
    peripheral = fs.openSync(BUS_FILE_PREFIX + bus._busNumber, 'r+');
    bus._peripherals[addr] = peripheral;
    i2c.setAddrSync(peripheral, addr, bus._forceAccess);
  }

  return peripheral;
}

Bus.prototype.close = function (cb) {
  var peripherals;

  checkCallback(cb);

  peripherals = this._peripherals.filter(function (peripheral) {
    return peripheral !== undefined;
  });

  (function close() {
    if (peripherals.length === 0) {
      return setImmediate(cb, null);
    }

    fs.close(peripherals.pop(), function (err) {
      if (err) {
        return cb(err);
      }
      close();
    });
  }());
};

Bus.prototype.closeSync = function () {
  this._peripherals.forEach(function (peripheral) {
    if (peripheral !== undefined) {
      fs.closeSync(peripheral);
    }
  });

  this._peripherals = [];
};

Bus.prototype.i2cFuncs = function (cb) {
  checkCallback(cb);

  if (!this.funcs) {
    peripheral(this, 0, function (err, device) {
      if (err) {
        return cb(err);
      }

      i2c.i2cFuncsAsync(device, function (err, i2cFuncBits) {
        if (err) {
          return cb(err);
        }
        this.funcs = Object.freeze(new I2cFuncs(i2cFuncBits));
        cb(null, this.funcs);
      });
    });
  } else {
    setImmediate(cb, null, this.funcs);
  }
};

Bus.prototype.i2cFuncsSync = function () {
  if (!this.funcs) {
    this.funcs = Object.freeze(new I2cFuncs(i2c.i2cFuncsSync(peripheralSync(this, 0))));
  }

  return this.funcs;
};

Bus.prototype.readByte = function (addr, cmd, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.readByteAsync(device, cmd, cb);
  }.bind(this));
};

Bus.prototype.readByteSync = function (addr, cmd) {
  checkAddress(addr);
  checkCommand(cmd);

  return i2c.readByteSync(peripheralSync(this, addr), cmd);
};

Bus.prototype.readWord = function (addr, cmd, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.readWordAsync(device, cmd, cb);
  }.bind(this));
};

Bus.prototype.readWordSync = function (addr, cmd) {
  checkAddress(addr);
  checkCommand(cmd);

  return i2c.readWordSync(peripheralSync(this, addr), cmd);
};

// UNTESTED and undocumented due to lack of supporting hardware
Bus.prototype.readBlock = function (addr, cmd, buffer, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBuffer(buffer);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.readBlockAsync(device, cmd, buffer, cb);
  }.bind(this));
};

// UNTESTED and undocumented due to lack of supporting hardware
Bus.prototype.readBlockSync = function (addr, cmd, buffer) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBuffer(buffer);

  return i2c.readBlockSync(peripheralSync(this, addr), cmd, buffer);
};

Bus.prototype.readI2cBlock = function (addr, cmd, length, buffer, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBufferAndLength(length, buffer, 32);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.readI2cBlockAsync(device, cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.readI2cBlockSync = function (addr, cmd, length, buffer) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBufferAndLength(length, buffer, 32);

  return i2c.readI2cBlockSync(peripheralSync(this, addr), cmd, length, buffer);
};

Bus.prototype.receiveByte = function (addr, cb) {
  checkAddress(addr);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.receiveByteAsync(device, cb);
  }.bind(this));
};

Bus.prototype.receiveByteSync = function (addr) {
  checkAddress(addr);

  return i2c.receiveByteSync(peripheralSync(this, addr));
};

Bus.prototype.sendByte = function (addr, byte, cb) {
  checkAddress(addr);
  checkByte(byte);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.sendByteAsync(device, byte, cb);
  }.bind(this));
};

Bus.prototype.sendByteSync = function (addr, byte) {
  checkAddress(addr);
  checkByte(byte);

  i2c.sendByteSync(peripheralSync(this, addr), byte);

  return this;
};

Bus.prototype.writeByte = function (addr, cmd, byte, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkByte(byte);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.writeByteAsync(device, cmd, byte, cb);
  }.bind(this));
};

Bus.prototype.writeByteSync = function (addr, cmd, byte) {
  checkAddress(addr);
  checkCommand(cmd);
  checkByte(byte);

  i2c.writeByteSync(peripheralSync(this, addr), cmd, byte);

  return this;
};

Bus.prototype.writeWord = function (addr, cmd, word, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkWord(word);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.writeWordAsync(device, cmd, word, cb);
  }.bind(this));
};

Bus.prototype.writeWordSync = function (addr, cmd, word) {
  checkAddress(addr);
  checkCommand(cmd);
  checkWord(word);

  i2c.writeWordSync(peripheralSync(this, addr), cmd, word);

  return this;
};

Bus.prototype.writeQuick = function (addr, bit, cb) {
  checkAddress(addr);
  checkBit(bit);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.writeQuickAsync(device, bit, cb);
  }.bind(this));
};

Bus.prototype.writeQuickSync = function (addr, bit) {
  checkAddress(addr);
  checkBit(bit);

  i2c.writeQuickSync(peripheralSync(this, addr), bit);

  return this;
};

// UNTESTED and undocumented due to lack of supporting hardware
Bus.prototype.writeBlock = function (addr, cmd, length, buffer, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBufferAndLength(length, buffer);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.writeBlockAsync(device, cmd, length, buffer, cb);
  }.bind(this));
};

// UNTESTED and undocumented due to lack of supporting hardware
Bus.prototype.writeBlockSync = function (addr, cmd, length, buffer) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBufferAndLength(length, buffer);

  i2c.writeBlockSync(peripheralSync(this, addr), cmd, length, buffer);

  return this;
};

Bus.prototype.writeI2cBlock = function (addr, cmd, length, buffer, cb) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBufferAndLength(length, buffer, 32);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.writeI2cBlockAsync(device, cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.writeI2cBlockSync = function (addr, cmd, length, buffer) {
  checkAddress(addr);
  checkCommand(cmd);
  checkBufferAndLength(length, buffer, 32);

  i2c.writeI2cBlockSync(peripheralSync(this, addr), cmd, length, buffer);

  return this;
};

Bus.prototype.i2cRead = function (addr, length, buffer, cb) {
  checkAddress(addr);
  checkBufferAndLength(length, buffer);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    fs.read(device, buffer, 0, length, 0, cb);
  }.bind(this));
};

Bus.prototype.i2cReadSync = function (addr, length, buffer) {
  checkAddress(addr);
  checkBufferAndLength(length, buffer);

  return fs.readSync(peripheralSync(this, addr), buffer, 0, length, 0);
};

Bus.prototype.i2cWrite = function (addr, length, buffer, cb) {
  checkAddress(addr);
  checkBufferAndLength(length, buffer);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    fs.write(device, buffer, 0, length, 0, cb);
  }.bind(this));
};

Bus.prototype.i2cWriteSync = function (addr, length, buffer) {
  checkAddress(addr);
  checkBufferAndLength(length, buffer);

  return fs.writeSync(peripheralSync(this, addr), buffer, 0, length, 0);
};

Bus.prototype.scan = function (startAddr, endAddr, cb) {
  var scanBus,
    addresses = [];

  if (typeof startAddr === 'function') {
    cb = startAddr;
    startAddr = FIRST_SCAN_ADDR;
    endAddr = LAST_SCAN_ADDR;
  } else if (typeof endAddr === 'function') {
    cb = endAddr;
    endAddr = startAddr;
  }

  checkCallback(cb);
  checkAddress(startAddr);
  checkAddress(endAddr);

  scanBus = open(this._busNumber, {forceAccess: this._forceAccess}, function (err) {
    if (err) {
      return cb(err);
    }

    (function next(addr) {
      if (addr > endAddr) {
        return scanBus.close(function (err) {
          if (err) {
            return cb(err);
          }
          cb(null, addresses);
        });
      }

      scanBus.receiveByte(addr, function (err) {
        if (!err) {
          addresses.push(addr);
        }

        next(addr + 1);
      });
    }(startAddr));
  });
};

Bus.prototype.scanSync = function (startAddr, endAddr) {
  var scanBus = openSync(this._busNumber, {forceAccess: this._forceAccess}),
    addresses = [],
    addr;

  if (typeof startAddr === 'undefined') {
    startAddr = FIRST_SCAN_ADDR;
    endAddr = LAST_SCAN_ADDR;
  } else if (typeof endAddr === 'undefined') {
    endAddr = startAddr;
  }

  checkAddress(startAddr);
  checkAddress(endAddr);

  for (addr = startAddr; addr <= endAddr; addr += 1) {
    try {
      scanBus.receiveByteSync(addr);
      addresses.push(addr);
    } catch (ignore) {
    }
  }

  scanBus.closeSync();
  return addresses;
};

Bus.prototype.deviceId = function(addr, cb) {
  checkAddress(addr);
  checkCallback(cb);

  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    i2c.deviceIdAsync(device, addr, (err, id) => {
      if(err) { return cb(err); }

      cb(null, parseId(id));
    });
  }.bind(this));
}

Bus.prototype.deviceIdSync = function(addr) {
  checkAddress(addr);

  const mp = i2c.deviceIdSync(peripheralSync(this, addr), addr);
  return parseId(mp);
}

if ("win32" == process.platform) {
  Bus = require('./win-i2c-bus.js').Bus;
}

