'use strict';

const i2cNode = require('./i2c.node');

module.exports = (binding) => {
  if (binding === 'i2c.node') {
    return i2cNode;
  }
};

