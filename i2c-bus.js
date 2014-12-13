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

Bus.prototype.readByte = function (addr, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readByteAsync(this.fd, cb);
  }.bind(this));
};

Bus.prototype.readByteSync = function (addr) {
  setAddrSync(this, addr);
  return i2c.readByteSync(this.fd);
};

Bus.prototype.readByteData = function (addr, cmd, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readByteDataAsync(this.fd, cmd, cb);
  }.bind(this));
};

Bus.prototype.readByteDataSync = function (addr, cmd) {
  setAddrSync(this, addr);
  return i2c.readByteDataSync(this.fd, cmd);
};

Bus.prototype.readWordData = function (addr, cmd, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.readWordDataAsync(this.fd, cmd, cb);
  }.bind(this));
};

Bus.prototype.readWordDataSync = function (addr, cmd) {
  setAddrSync(this, addr);
  return i2c.readWordDataSync(this.fd, cmd);
};

Bus.prototype.writeByte = function (addr, val, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeByteAsync(this.fd, val, cb);
  }.bind(this));
};

Bus.prototype.writeByteSync = function (addr, val) {
  setAddrSync(this, addr);
  i2c.writeByteSync(this.fd, val);
  return this;
};

Bus.prototype.writeByteData = function (addr, cmd, val, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeByteDataAsync(this.fd, cmd, val, cb);
  }.bind(this));
};

Bus.prototype.writeByteDataSync = function (addr, cmd, val) {
  setAddrSync(this, addr);
  i2c.writeByteDataSync(this.fd, cmd, val);
  return this;
};

Bus.prototype.writeWordData = function (addr, cmd, val, cb) {
  setAddr(this, addr, function (err) {
    if (err) {
      return cb(err);
    }

    i2c.writeWordDataAsync(this.fd, cmd, val, cb);
  }.bind(this));
};

Bus.prototype.writeWordDataSync = function (addr, cmd, val) {
  setAddrSync(this, addr);
  i2c.writeWordDataSync(this.fd, cmd, val);
  return this;
};

