// The code below is based on the Adafruit SI1145 library (https://github.com/adafruit/Adafruit_SI1145_Library)

var I2C_CONTROLLER_NAME = 'I2C1'; // Specific to RPi2 with Windows 10 IoT Core

var i2c = require('i2c-bus'),
  i2c1 = i2c.openSync(I2C_CONTROLLER_NAME);

// Commands
var SI1145_PARAM_SET = 0xA0,
  SI1145_PSALS_AUTO = 0x0F;

// Parameters
var SI1145_PARAM_I2CADDR = 0x00,
  SI1145_PARAM_CHLIST = 0x01,
  SI1145_PARAM_CHLIST_ENUV = 0x80,
  SI1145_PARAM_CHLIST_ENALSIR = 0x20,
  SI1145_PARAM_CHLIST_ENALSVIS = 0x10,
  SI1145_PARAM_CHLIST_ENPS1 = 0x01,
  SI1145_PARAM_PSLED12SEL = 0x02,
  SI1145_PARAM_PSLED12SEL_PS1LED1 = 0x01,
  SI1145_PARAM_PS1ADCMUX = 0x07,
  SI1145_PARAM_PSADCOUNTER = 0x0A,
  SI1145_PARAM_PSADCGAIN = 0x0B,
  SI1145_PARAM_PSADCMISC = 0x0C,
  SI1145_PARAM_PSADCMISC_RANGE = 0x20,
  SI1145_PARAM_PSADCMISC_PSMODE = 0x04,
  SI1145_PARAM_ALSIRADCMUX = 0x0E,
  SI1145_PARAM_ALSVISADCOUNTER = 0x10,
  SI1145_PARAM_ALSVISADCGAIN = 0x11,
  SI1145_PARAM_ALSVISADCMISC = 0x12,
  SI1145_PARAM_ALSVISADCMISC_VISRANGE = 0x20,
  SI1145_PARAM_ALSIRADCOUNTER = 0x1D,
  SI1145_PARAM_ALSIRADCGAIN = 0x1E,
  SI1145_PARAM_ALSIRADCMISC = 0x1F,
  SI1145_PARAM_ALSIRADCMISC_RANGE = 0x20,
  SI1145_PARAM_ADCCOUNTER_511CLK = 0x70,
  SI1145_PARAM_ADCMUX_SMALLIR = 0x00,
  SI1145_PARAM_ADCMUX_LARGEIR = 0x03;

// Registers
var SI1145_REG_PARTID = 0x00,
  SI1145_REG_INTCFG = 0x03,
  SI1145_REG_INTCFG_INTOE = 0x01,
  SI1145_REG_IRQEN = 0x04,
  SI1145_REG_IRQEN_ALSEVERYSAMPLE = 0x01,
  SI1145_REG_MEASRATE0 = 0x08,
  SI1145_REG_PSLED21 = 0x0F,
  SI1145_REG_UCOEFF0 = 0x13,
  SI1145_REG_UCOEFF1 = 0x14,
  SI1145_REG_UCOEFF2 = 0x15,
  SI1145_REG_UCOEFF3 = 0x16,
  SI1145_REG_PARAMWR = 0x17,
  SI1145_REG_COMMAND = 0x18,
  SI1145_REG_UVINDEX0 = 0x2C,
  SI1145_REG_PARAMRD = 0x2E,
  SI1145_ADDR = 0x60;


function writeParam(p, v) {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_PARAMWR, v]));
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_COMMAND, p | SI1145_PARAM_SET]));
  i2c1.readI2cBlockSync(SI1145_ADDR, SI1145_REG_PARAMRD, BUFFER_SIZE, buffer);
}

function begin() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);

  i2c1.readI2cBlockSync(SI1145_ADDR, SI1145_REG_PARTID, BUFFER_SIZE, buffer);
  if (buffer[0] != 0x45) {
    return false; // look for SI1145
  }

  // enable UVindex measurement coefficients!
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF0, 0x29]));
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF1, 0x89]));
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF2, 0x02]));
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF3, 0x00]));
  
  // enable UV sensor
  writeParam(SI1145_PARAM_CHLIST, SI1145_PARAM_CHLIST_ENUV |
  SI1145_PARAM_CHLIST_ENALSIR | SI1145_PARAM_CHLIST_ENALSVIS |
  SI1145_PARAM_CHLIST_ENPS1);

  // enable interrupt on every sample
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_INTCFG, SI1145_REG_INTCFG_INTOE]));
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_IRQEN, SI1145_REG_IRQEN_ALSEVERYSAMPLE]));

  // program LED current
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_PSLED21, 0x03])); // 20mA for LED 1 only
  writeParam(SI1145_PARAM_PS1ADCMUX, SI1145_PARAM_ADCMUX_LARGEIR);
  // prox sensor #1 uses LED #1
  writeParam(SI1145_PARAM_PSLED12SEL, SI1145_PARAM_PSLED12SEL_PS1LED1);
  // fastest clocks, clock div 1
  writeParam(SI1145_PARAM_PSADCGAIN, 0);
  // take 511 clocks to measure
  writeParam(SI1145_PARAM_PSADCOUNTER, SI1145_PARAM_ADCCOUNTER_511CLK);
  // in prox mode, high range
  writeParam(SI1145_PARAM_PSADCMISC, SI1145_PARAM_PSADCMISC_RANGE|
    SI1145_PARAM_PSADCMISC_PSMODE);

  writeParam(SI1145_PARAM_ALSIRADCMUX, SI1145_PARAM_ADCMUX_SMALLIR);  
  // fastest clocks, clock div 1
  writeParam(SI1145_PARAM_ALSIRADCGAIN, 0);
  // take 511 clocks to measure
  writeParam(SI1145_PARAM_ALSIRADCOUNTER, SI1145_PARAM_ADCCOUNTER_511CLK);
  // in high range mode
  writeParam(SI1145_PARAM_ALSIRADCMISC, SI1145_PARAM_ALSIRADCMISC_RANGE);

  // fastest clocks, clock div 1
  writeParam(SI1145_PARAM_ALSVISADCGAIN, 0);
  // take 511 clocks to measure
  writeParam(SI1145_PARAM_ALSVISADCOUNTER, SI1145_PARAM_ADCCOUNTER_511CLK);
  // in high range mode (not normal signal)
  writeParam(SI1145_PARAM_ALSVISADCMISC, SI1145_PARAM_ALSVISADCMISC_VISRANGE);

  // measurement rate for auto
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_MEASRATE0, 0xFF])); // 255 * 31.25uS = 8ms
  
  // auto run
  i2c1.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_COMMAND, SI1145_PSALS_AUTO]));

  return true;
}

function readUV() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c1.readI2cBlockSync(SI1145_ADDR, SI1145_REG_UVINDEX0, BUFFER_SIZE, buffer);
  return buffer[0];;
}

(function () {
  console.log("Adafruit SI1145 test");

  if(!begin()) {
    console.log("Didn't find SI1145");
    return;
  }

  var UVindex = readUV();
  // the index is multiplied by 100 so to get the
  // integer index, divide by 100!
  UVindex /= 100.0;  
  console.log("UV: " + UVindex);  

  i2c1.closeSync();
}());