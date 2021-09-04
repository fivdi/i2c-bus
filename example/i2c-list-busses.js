//i2c-bus doesn't have an API for this purpose. However, glob and regular expressions could be used to retrieve a list of I2C bus numbers. Something like this should do it:

const glob = require('glob');

const busNumbers = glob.sync('/dev/i2c-*').
  filter(fileName => fileName.match(/\/i2c-\d+$/) != null).
  map(fileName => parseInt(fileName.match(/\d+$/)[0], 10));

console.log(busNumbers);

// Here glob is used synchronously but it can also be used asynchronously. busNumbers is an array of numbers.
