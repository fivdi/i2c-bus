'use strict';

const mockFs = require('mock-fs');
const fs = require('fs');

module.exports = {
  mockI2c1: () => {
    mockFs({
      '/dev/i2c-1': ''
    });
  },

  readI2c1: () => {
    return fs.readFileSync('/dev/i2c-1', { encoding: 'UTF-8' });
  },

  writeI2c1: (value) => {
    fs.writeFileSync('/dev/i2c-1', value);
  },

  restore: () => {
    mockFs.restore();
  }
};

