'use strict';

module.exports = {
  i2cFuncsAsync: () => {console.log('in mock i2cFuncsAsync')},
  i2cFuncsSync: () => {console.log('in mock i2cFuncsSync')},
  deviceIdAsync: () => {console.log('in mock deviceIdAsync')},
  deviceIdSync: () => {console.log('in mock deviceIdSync')},
  readByteAsync: () => {console.log('in mock readByteAsync')},
  readByteSync: () => {console.log('in mock readByteSync')},
  readWordAsync: () => {console.log('in mock readWordAsync')},
  readWordSync: () => {console.log('in mock readWordSync')},
  readBlockAsync: () => {console.log('in mock readBlockAsync')},
  readBlockSync: () => {console.log('in mock readBlockSync')},
  readI2cBlockAsync: () => {console.log('in mock readI2cBlockAsync')},
  readI2cBlockSync: () => {console.log('in mock readI2cBlockSync')},
  receiveByteAsync: () => {console.log('in mock receiveByteAsync')},
  receiveByteSync: () => {console.log('in mock receiveByteSync')},
  sendByteAsync: () => {console.log('in mock sendByteAsync')},
  sendByteSync: () => {console.log('in mock sendByteSync')},
  setAddrAsync: () => {console.log('in mock setAddrAsync')},
  setAddrSync: () => {console.log('in mock setAddrSync')},
  writeByteAsync: () => {console.log('in mock writeByteAsync')},
  writeByteSync: () => {console.log('in mock writeByteSync')},
  writeWordAsync: () => {console.log('in mock writeWordAsync')},
  writeWordSync: () => {console.log('in mock writeWordSync')},
  writeBlockAsync: () => {console.log('in mock writeBlockAsync')},
  writeBlockSync: () => {console.log('in mock writeBlockSync')},
  writeI2cBlockAsync: () => {console.log('in mock writeI2cBlockAsync')},
  writeI2cBlockSync: () => {console.log('in mock writeI2cBlockSync')},
  writeQuickAsync: () => {console.log('in mock writeQuickAsync')},
  writeQuickSync: () => {console.log('in mock writeQuickSync')},
  I2C_FUNC_I2C: 1,
  I2C_FUNC_10BIT_ADDR: 2,
  I2C_FUNC_PROTOCOL_MANGLING: 4,
  I2C_FUNC_SMBUS_PEC: 8,
  I2C_FUNC_SMBUS_BLOCK_PROC_CALL: 32768,
  I2C_FUNC_SMBUS_QUICK: 65536,
  I2C_FUNC_SMBUS_READ_BYTE: 131072,
  I2C_FUNC_SMBUS_WRITE_BYTE: 262144,
  I2C_FUNC_SMBUS_READ_BYTE_DATA: 524288,
  I2C_FUNC_SMBUS_WRITE_BYTE_DATA: 1048576,
  I2C_FUNC_SMBUS_READ_WORD_DATA: 2097152,
  I2C_FUNC_SMBUS_WRITE_WORD_DATA: 4194304,
  I2C_FUNC_SMBUS_PROC_CALL: 8388608,
  I2C_FUNC_SMBUS_READ_BLOCK_DATA: 16777216,
  I2C_FUNC_SMBUS_WRITE_BLOCK_DATA: 33554432,
  I2C_FUNC_SMBUS_READ_I2C_BLOCK: 67108864,
  I2C_FUNC_SMBUS_WRITE_I2C_BLOCK: 134217728
};

