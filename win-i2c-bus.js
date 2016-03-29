'use strict';

var i2c = require('bindings')('i2c.node');

// In this context:
// Bus = i2c controller object (https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2ccontroller.aspx)
// busNumber = name of i2c controller
function Bus(busNumber) {
  if (!(this instanceof Bus)) {
    return new Bus(busNumber);
  }

  this._busNumber = busNumber;
  this._peripherals = [];
}

// In this context:
// peripheral = i2c device object (https://msdn.microsoft.com/en-us/library/windows.devices.i2c.i2cdevice.aspx)
function peripheralSync(bus, addr) {
  var peripheral = bus._peripherals[addr];

  if (peripheral === undefined) {
    peripheral = new i2c.WinI2c();
    peripheral.openSync(bus._busNumber);
    peripheral.setDevice(addr);
    bus._peripherals[addr] = peripheral;
  }
  return peripheral;
}

Bus.prototype.close = function (cb) {
  throw new Error("Not implemented");
};

Bus.prototype.closeSync = function () {
  this._peripherals.forEach(function (peripheral) {
    if (peripheral !== undefined) {
      peripheral.closeSync();
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
  throw new Error("Not implemented");
};

Bus.prototype.readI2cBlockSync = function (addr, cmd, length, buffer) {
  return peripheralSync(this, addr).writeReadPartial(cmd, length, buffer);
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
  throw new Error("Not implemented");
};

Bus.prototype.i2cReadSync = function (addr, length, buffer) {
  return peripheralSync(this, addr).readPartial(length, buffer);
};

Bus.prototype.i2cWrite = function (addr, length, buffer, cb) {
  throw new Error("Not implemented");
};

Bus.prototype.i2cWriteSync = function (addr, length, buffer) {
  return peripheralSync(this, addr).writePartial(length, buffer);
};

Bus.prototype.scan = function (cb) {
  throw new Error("Not implemented");
};

Bus.prototype.scanSync = function () {
  throw new Error("Not implemented");
};

module.exports.Bus = Bus;

