'use strict';

var i2c = require('bindings')('i2c.node');

// In this context:
// Bus = i2c controller object (https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2ccontroller.aspx)
// busNumber = name of i2c controller
function Bus(busNumber) {
  if (!(this instanceof Bus)) {
    return new Bus(busNumber);
  }

  this._controllerName = busNumber;
  this._peripherals = [];
}

// In this context:
// peripheral = i2c device object (https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2cdevice.aspx)
function peripheralSync(bus, addr) {
  var peripheral = bus._peripherals[addr];

  if (peripheral === undefined) {
    peripheral = new i2c.WinI2c();
    peripheral.getControllerSync(bus._controllerName);
    bus._peripherals[addr] = peripheral;
    peripheral.createDeviceSync(addr, 1, 0);
  }
  return peripheral;
}

function peripheral(bus, addr, cb) {
  var device = bus._peripherals[addr];
  if (device === undefined) {
    device = new i2c.WinI2c();
    device.getController(bus._controllerName, function (err) {
      if (err) {
        return cb(err);
      }

      bus._peripherals[addr] = device;

      device.createDevice(addr, 1, 0, function (err) {
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

Bus.prototype.close = function (cb) {
  var peripherals = this._peripherals.filter(function (peripheral) {
    return peripheral !== undefined;
  });

  (function close() {
    if (peripherals.length === 0) {
      return setImmediate(cb, null);
    }

    peripherals.pop().closeDevice(function (err) {
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
      peripheral.closeDeviceSync();
    }
  });
  this._peripherals = [];
};

Bus.prototype.i2cFuncs = function (cb) {
  throw new Error("Not implemented");
};

Bus.prototype.i2cFuncsSync = function () {
  throw new Error("Not implemented");
};

Bus.prototype.readByte = function (addr, cmd, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.readByteSync = function (addr, cmd) {
  throw new Error("Not implemented");
};

Bus.prototype.readWord = function (addr, cmd, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.readWordSync = function (addr, cmd) {
  throw new Error("Not implemented");
};

Bus.prototype.readBlock = function (addr, cmd, buffer, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.readBlockSync = function (addr, cmd, buffer) {
  throw new Error("Not implemented");
};

Bus.prototype.readI2cBlock = function (addr, cmd, length, buffer, cb) {
  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    device.writeReadPartial(cmd, length, buffer, cb);
  }.bind(this));
};

Bus.prototype.readI2cBlockSync = function (addr, cmd, length, buffer) {
  return peripheralSync(this, addr).writeReadPartialSync(cmd, length, buffer);
};

Bus.prototype.receiveByte = function (addr, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.receiveByteSync = function (addr) {
  throw new Error("Not implemented");
};

Bus.prototype.sendByte = function (addr, byte, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.sendByteSync = function (addr, byte) {
  throw new Error("Not implemented");
};

Bus.prototype.writeByte = function (addr, cmd, byte, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.writeByteSync = function (addr, cmd, byte) {
  throw new Error("Not implemented");
};

Bus.prototype.writeWord = function (addr, cmd, word, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.writeWordSync = function (addr, cmd, word) {
  throw new Error("Not implemented");
};

Bus.prototype.writeQuickSync = function (addr, bit) {
  throw new Error("Not implemented");
};

Bus.prototype.writeBlock = function (addr, cmd, length, buffer, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.writeBlockSync = function (addr, cmd, length, buffer) {
  throw new Error("Not implemented");
};

Bus.prototype.writeI2cBlock = function (addr, cmd, length, buffer, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.writeI2cBlockSync = function (addr, cmd, length, buffer) {
  throw new Error("Not implemented");
};

Bus.prototype.i2cRead = function (addr, length, buffer, cb) {
  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    device.readPartial(length, buffer, cb);
  }.bind(this));
};

Bus.prototype.i2cReadSync = function (addr, length, buffer) {
  return peripheralSync(this, addr).readPartialSync(length, buffer);
};

Bus.prototype.i2cWrite = function (addr, length, buffer, cb) {
  peripheral(this, addr, function (err, device) {
    if (err) {
      return cb(err);
    }

    device.writePartial(length, buffer, cb);
  }.bind(this));
};

Bus.prototype.i2cWriteSync = function (addr, length, buffer) {
  return peripheralSync(this, addr).writePartialSync(length, buffer);
};

Bus.prototype.scan = function (cb) {
  throw new Error("Not implemented");
};

Bus.prototype.scanSync = function () {
  throw new Error("Not implemented");
};

module.exports.Bus = Bus;
