'use strict';

var fs = require('fs'),
  i2c = require('bindings')('i2c.node');

var DEVICE_PREFIX = '/dev/i2c-';

function Bus(busNumber) {
  if (!(this instanceof Bus)) {
    return new Bus(busNumber);
  }

  this.fd = -1;
  this.currAddr = -1;
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

module.exports.open = function (busNumber, cb) {
  var bus = new Bus(busNumber);
  fs.open(DEVICE_PREFIX + busNumber, 'r+', function (err, fd) {
    if (err) {
      return cb(err);
    }
    bus.fd = fd;
    cb(null);
  });
  return bus;
};

module.exports.openSync = function (busNumber) {
  var bus = new Bus(busNumber);
  bus.fd = fs.openSync(DEVICE_PREFIX + busNumber, 'r+');
  return bus;
};

function setAddr(bus, addr, cb) {
  if (bus.currAddr !== addr) {
    i2c.setAddrAsync(bus.fd, addr, function (err) {
      if (err) {
        return cb(err);
      }
      bus.currAddr = addr;
      cb(null);
    });
  } else {
    setImmediate(cb);
  }
}

function setAddrSync(bus, addr) {
  if (bus.currAddr !== addr) {
    i2c.setAddrSync(bus.fd, addr);
    bus.currAddr = addr;
  }
}

Bus.prototype.close = function (cb) {
  fs.close(this.fd, cb);
};

Bus.prototype.closeSync = function () {
  fs.closeSync(this.fd);
};

Bus.prototype.i2cFuncs = function (cb) {
  if (!this.funcs) {
    i2c.i2cFuncsAsync(this.fd, function (err, i2cFuncBits) {
      if (err) {
        return cb(err);
      }
      this.funcs = Object.freeze(new I2cFuncs(i2cFuncBits));
      cb(null, this.funcs);
    });
  } else {
    setImmediate(cb, null, this.funcs);
  }
};

Bus.prototype.i2cFuncsSync = function () {
  if (!this.funcs) {
    this.funcs = Object.freeze(new I2cFuncs(i2c.i2cFuncsSync(this.fd)));
  }

  return this.funcs;
};

Bus.prototype.readByte = function (addr, cmd, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readByteAsync(this.fd, cmd, cb);
  }.bind(this));
};

Bus.prototype.readByteSync = function (addr, cmd) {
  setAddrSync(this, addr);
  return i2c.readByteSync(this.fd, cmd);
};

Bus.prototype.readWord = function (addr, cmd, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readWordAsync(this.fd, cmd, cb);
  }.bind(this));
};

Bus.prototype.readWordSync = function (addr, cmd) {
  setAddrSync(this, addr);
  return i2c.readWordSync(this.fd, cmd);
};

Bus.prototype.readI2cBlock = function (addr, cmd, length, buffer, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readI2cBlockAsync(this.fd, cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.readI2cBlockSync = function (addr, cmd, length, buffer) {
  setAddrSync(this, addr);
  return i2c.readI2cBlockSync(this.fd, cmd, length, buffer);
};

Bus.prototype.receiveByte = function (addr, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.receiveByteAsync(this.fd, cb);
  }.bind(this));
};

Bus.prototype.receiveByteSync = function (addr) {
  setAddrSync(this, addr);
  return i2c.receiveByteSync(this.fd);
};

Bus.prototype.sendByte = function (addr, val, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.sendByteAsync(this.fd, val, cb);
  }.bind(this));
};

Bus.prototype.sendByteSync = function (addr, val) {
  setAddrSync(this, addr);
  i2c.sendByteSync(this.fd, val);
  return this;
};

Bus.prototype.writeByte = function (addr, cmd, val, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeByteAsync(this.fd, cmd, val, cb);
  }.bind(this));
};

Bus.prototype.writeByteSync = function (addr, cmd, val) {
  setAddrSync(this, addr);
  i2c.writeByteSync(this.fd, cmd, val);
  return this;
};

Bus.prototype.writeWord = function (addr, cmd, val, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeWordAsync(this.fd, cmd, val, cb);
  }.bind(this));
};

Bus.prototype.writeWordSync = function (addr, cmd, val) {
  setAddrSync(this, addr);
  i2c.writeWordSync(this.fd, cmd, val);
  return this;
};

Bus.prototype.writeI2cBlock = function (addr, cmd, length, buffer, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeI2cBlockAsync(this.fd, cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.writeI2cBlockSync = function (addr, cmd, length, buffer) {
  setAddrSync(this, addr);
  i2c.writeI2cBlockSync(this.fd, cmd, length, buffer);
  return this;
};

Bus.prototype.i2cRead = function (addr, length, buffer, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    fs.read(this.fd, buffer, 0, length, 0, cb);
  }.bind(this));
};

Bus.prototype.i2cReadSync = function (addr, length, buffer) {
  setAddrSync(this, addr);
  return fs.readSync(this.fd, buffer, 0, length, 0);
};

Bus.prototype.i2cWrite = function (addr, length, buffer, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    fs.write(this.fd, buffer, 0, length, 0, cb);
  }.bind(this));
};

Bus.prototype.i2cWriteSync = function (addr, length, buffer) {
  setAddrSync(this, addr);
  return fs.writeSync(this.fd, buffer, 0, length, 0);
};

