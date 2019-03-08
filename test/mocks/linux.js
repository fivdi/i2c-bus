'use strict';

const mockFs = require('mock-fs');

module.exports = {
  mockI2c1: () => {
    mockFs({
      '/dev/i2c-1': ''
    });
  },

  restore: () => {
    mockFs.restore();
  }
};

