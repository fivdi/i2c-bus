0.8.0 / Dec 19 2014
===================

  * added a plain i2c performance test
  * added i2cFuncs and i2cFuncsSync
  * added an example that does the same as command 'i2cdetect -F 1'
  * renamed readBytes to readI2cBlock
  * renamed readBytesSync to readI2cBlockSync
  * renamed writeBytes to writeI2cBlock
  * renamed writeBytesSync to writeI2cBlockSync
  * added an example that scans a bus for devices like 'i2cdetect -y -r 1'

0.7.0 / Dec 16 2014
===================

  * faster compile
  * added plain i2cRead, i2cReadSync, i2cWrite, and i2cWriteSync methods

0.6.0 / Dec 15 2014
===================

  * use __u8, __u16, and __s32 where appropriate
  * added brute force memory leak tests
  * added performance tests
  * added an example using two devices on the same bus
  * renamed all public api methods

0.5.0 / Dec 14 2014
===================

  * added block operations

0.4.0 / Dec 13 2014
===================

  * check for valid arguments in addon methods
  * added sync and async tests

0.3.0 / Dec 13 2014
===================

  * improved example

0.2.0 / Dec 13 2014
===================

  * corrected initial release date
  * use callbacks rather than events for asychronous open method
  * documentation
  * return this in synchronous write methods
  * added close and closeSync methods
  * added example

0.1.0 / Dec 09 2014
===================

  * initial release

