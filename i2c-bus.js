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
    setImmediate(function () {
      cb(null);
    });
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

Bus.prototype.readBytes = function (addr, cmd, length, buffer, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readBytesAsync(this.fd, cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.readBytesSync = function (addr, cmd, length, buffer) {
  setAddrSync(this, addr);
  return i2c.readBytesSync(this.fd, cmd, length, buffer);
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

Bus.prototype.writeBytes = function (addr, cmd, length, buffer, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeBytesAsync(this.fd, cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.writeBytesSync = function (addr, cmd, length, buffer) {
  setAddrSync(this, addr);
  i2c.writeBytesSync(this.fd, cmd, length, buffer);
  return this;
};

