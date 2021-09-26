'use strict';

// Determine the bus numbers of the I2C busses available on the current
// machine and print those bus numbers to the screen.

const glob = require('glob');

const busNumbers = glob.sync('/dev/i2c-*').
  filter(fileName => fileName.match(/\/i2c-\d+$/) !== null).
  map(fileName => parseInt(fileName.match(/\d+$/)[0], 10));

console.log(busNumbers);

// Here glob is used synchronously but it can also be used asynchronously.
// busNumbers is an array of numbers.

